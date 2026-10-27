/**
 * Sistem Feedback Program + Sijil Digital
 * Backend: Google Apps Script (bound kepada Google Sheet).
 *
 * Aliran: peserta buka link ?p=KODPROGRAM -> isi feedback -> server simpan
 * ke tab "Respon" -> server pulangkan data sijil -> browser lukis sijil
 * (nama + IC) dan peserta muat turun PDF / PNG.
 *
 * Nota keselamatan:
 * - Semua fungsi tanpa "_" di hujung boleh dipanggil dari browser melalui
 *   google.script.run. Fungsi admin dikawal dengan requireOwner_().
 * - JANGAN "Publish to Web" Sheet ini. Data IC hanya keluar melalui fungsi di bawah.
 */

// ====== TETAPAN - ubah ikut organisasi ======
const CONFIG = {
  ORG_NAME: 'GENG NGAJI GLOBAL',
  CERT_TITLE: 'SIJIL PENYERTAAN',
  SIGNATORY_NAME: 'NAMA PENANDATANGAN',
  SIGNATORY_TITLE: 'Pengarah Program',
  ID_PREFIX: 'GNG',
  RETENTION_MONTHS: 24,                    // data respon dipadam selepas tempoh ini
  RATE_LIMIT: { max: 6, windowSec: 600 },  // max 6 cubaan / 10 minit setiap IC
};

// Soalan penilaian skala 1-5. Ubah SEBELUM program bermula (lajur Sheet ikut senarai ini).
const SOALAN_RATING = [
  { id: 'q1', label: 'Isi kandungan program bermanfaat untuk saya' },
  { id: 'q2', label: 'Penceramah / fasilitator menyampaikan dengan jelas' },
  { id: 'q3', label: 'Pengurusan masa program' },
  { id: 'q4', label: 'Tempat dan kemudahan (atau kualiti siaran online)' },
  { id: 'q5', label: 'Secara keseluruhan, saya berpuas hati dengan program ini' },
];

// Soalan terbuka.
const SOALAN_TEKS = [
  { id: 't1', label: 'Apa yang paling bermanfaat dari program ini?', required: false },
  { id: 't2', label: 'Cadangan penambahbaikan', required: false },
];

const SHEET_PROGRAM = 'Program';
const SHEET_RESPON = 'Respon';
const PROGRAM_HEADERS = ['Kod', 'Nama Program', 'Tarikh', 'Tempat', 'Aktif'];
const BULAN = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai',
  'Ogos', 'September', 'Oktober', 'November', 'Disember'];

// ====== WEB APP ======

function doGet(e) {
  const p = (e && e.parameter) || {};
  let tpl;
  if (p.verify) {
    tpl = HtmlService.createTemplateFromFile('Verify');
    tpl.result = verifySijil_(String(p.verify));
  } else {
    tpl = HtmlService.createTemplateFromFile('Index');
    tpl.kod = /^[A-Za-z0-9_-]{1,30}$/.test(String(p.p || '')) ? String(p.p) : '';
  }
  return tpl.evaluate()
    .setTitle('Feedback & Sijil - ' + CONFIG.ORG_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Maklumat program + senarai soalan untuk borang. */
function getProgram(kod) {
  const prog = findProgram_(cleanKod_(kod));
  if (!prog) throw new Error('Program tidak dijumpai. Sila semak link yang diberi urusetia.');
  return {
    kod: prog.kod,
    nama: prog.nama,
    tarikh: prog.tarikh,
    tempat: prog.tempat,
    aktif: prog.aktif,
    org: CONFIG.ORG_NAME,
    soalanRating: SOALAN_RATING,
    soalanTeks: SOALAN_TEKS,
  };
}

/** Simpan feedback dan pulangkan data sijil. */
function submitFeedback(data) {
  data = data || {};
  const prog = findProgram_(cleanKod_(data.kod));
  if (!prog) throw new Error('Program tidak dijumpai.');
  if (!prog.aktif) throw new Error('Borang feedback untuk program ini telah ditutup.');

  const nama = cleanNama_(data.nama);
  const ic = cleanIC_(data.ic);
  if (data.consent !== true) {
    throw new Error('Sila tandakan persetujuan penggunaan data peribadi.');
  }
  rateLimit_('sub_' + prog.kod + '_' + ic);

  const rating = data.rating || {};
  const ratings = SOALAN_RATING.map(function (q) {
    const n = Number(rating[q.id]);
    if (!(Number.isInteger(n) && n >= 1 && n <= 5)) {
      throw new Error('Sila jawab semua soalan penilaian.');
    }
    return n;
  });
  const teksIn = data.teks || {};
  const teks = SOALAN_TEKS.map(function (q) {
    const s = String(teksIn[q.id] || '').trim().slice(0, 1000);
    if (q.required && !s) throw new Error('Sila jawab: ' + q.label);
    return sanitizeForSheet_(s);
  });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const existing = findRespon_(prog.kod, ic);
    if (existing) {
      // Dah pernah isi - keluarkan semula sijil yang sama, jangan simpan dua kali.
      if (normNama_(existing.nama) !== normNama_(nama)) {
        throw new Error('No. IC ini sudah didaftarkan untuk program ini dengan nama lain. Sila hubungi urusetia.');
      }
      return buildCert_(prog, existing.nama, ic, existing.id, true);
    }
    const id = newCertId_(prog.kod);
    getSheet_(SHEET_RESPON).appendRow(
      [new Date(), id, prog.kod, sanitizeForSheet_(nama), formatIC_(ic)]
        .concat(ratings, teks, ['YA'])
    );
    return buildCert_(prog, nama, ic, id, false);
  } finally {
    lock.releaseLock();
  }
}

/** Muat turun semula sijil bagi peserta yang sudah isi feedback. */
function ambilSijil(data) {
  data = data || {};
  const prog = findProgram_(cleanKod_(data.kod));
  if (!prog) throw new Error('Program tidak dijumpai.');
  const nama = cleanNama_(data.nama);
  const ic = cleanIC_(data.ic);
  rateLimit_('get_' + prog.kod + '_' + ic);

  const existing = findRespon_(prog.kod, ic);
  if (!existing || normNama_(existing.nama) !== normNama_(nama)) {
    throw new Error('Tiada rekod dengan nama dan No. IC ini. Pastikan ejaan nama sama seperti semasa isi borang.');
  }
  return buildCert_(prog, existing.nama, ic, existing.id, true);
}

// ====== FUNGSI ADMIN (jalankan dari editor Apps Script) ======

/** Jalankan SEKALI untuk sediakan tab Program dan Respon. */
function setupSheets() {
  requireOwner_();
  const ss = SpreadsheetApp.getActive();

  let prog = ss.getSheetByName(SHEET_PROGRAM);
  if (!prog) {
    prog = ss.insertSheet(SHEET_PROGRAM);
    prog.getRange(1, 1, 1, PROGRAM_HEADERS.length).setValues([PROGRAM_HEADERS]).setFontWeight('bold');
    prog.getRange(2, 1, 1, 5).setValues([['CONTOH01', 'Kuliah Contoh: Fiqh Solat Asas', new Date(), 'Masjid Contoh, Shah Alam', true]]);
    prog.getRange('E2:E200').insertCheckboxes();
    prog.getRange('C2:C200').setNumberFormat('dd/mm/yyyy');
    prog.setFrozenRows(1);
    prog.autoResizeColumns(1, 5);
  }

  let resp = ss.getSheetByName(SHEET_RESPON);
  if (!resp) {
    resp = ss.insertSheet(SHEET_RESPON);
    const headers = ['Timestamp', 'ID Sijil', 'Kod Program', 'Nama', 'No IC']
      .concat(SOALAN_RATING.map(function (q) { return q.label; }))
      .concat(SOALAN_TEKS.map(function (q) { return q.label; }))
      .concat(['Persetujuan PDPA']);
    resp.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    resp.getRange('E:E').setNumberFormat('@'); // IC kekal sebagai teks
    resp.setFrozenRows(1);
  }
  return 'Siap. Isi tab "Program", kemudian Deploy > New deployment > Web app.';
}

/** Padam respon lebih lama dari RETENTION_MONTHS (PDPA - prinsip penyimpanan). */
function padamDataLama() {
  requireOwner_();
  const sheet = getSheet_(SHEET_RESPON);
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - CONFIG.RETENTION_MONTHS);
  const times = sheet.getRange(2, 1, last - 1, 1).getValues();
  let padam = 0;
  for (let i = times.length - 1; i >= 0; i--) {
    const t = times[i][0];
    if (t instanceof Date && t < cutoff) {
      sheet.deleteRow(i + 2);
      padam++;
    }
  }
  return padam;
}

/** Pasang trigger bulanan untuk padamDataLama(). Jalankan sekali. */
function pasangTriggerRetention() {
  requireOwner_();
  ScriptApp.getProjectTriggers()
    .filter(function (t) { return t.getHandlerFunction() === 'padamDataLama'; })
    .forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('padamDataLama').timeBased().onMonthDay(1).atHour(3).create();
  return 'Trigger dipasang: 1hb setiap bulan, 3 pagi.';
}

// ====== HELPER (private) ======

function requireOwner_() {
  const active = Session.getActiveUser().getEmail();
  if (!active || active !== Session.getEffectiveUser().getEmail()) {
    throw new Error('Forbidden');
  }
}

function getSheet_(name) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sheet) throw new Error('Sistem belum disediakan (tab "' + name + '" tiada). Admin perlu jalankan setupSheets().');
  return sheet;
}

function findProgram_(kod) {
  if (!kod) return null;
  const sheet = getSheet_(SHEET_PROGRAM);
  const last = sheet.getLastRow();
  if (last < 2) return null;
  const rows = sheet.getRange(2, 1, last - 1, 5).getValues();
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (String(r[0]).trim().toUpperCase() === kod) {
      const aktifRaw = r[4];
      return {
        kod: kod,
        nama: String(r[1]).trim(),
        tarikh: formatTarikh_(r[2]),
        tempat: String(r[3]).trim(),
        aktif: aktifRaw === true || /^(ya|y|true|aktif)$/i.test(String(aktifRaw).trim()),
      };
    }
  }
  return null;
}

function findRespon_(kod, ic) {
  const sheet = getSheet_(SHEET_RESPON);
  const last = sheet.getLastRow();
  if (last < 2) return null;
  const rows = sheet.getRange(2, 2, last - 1, 4).getValues(); // ID, Kod, Nama, IC
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][1]) === kod && String(rows[i][3]).replace(/\D/g, '') === ic) {
      return { id: String(rows[i][0]), nama: String(rows[i][2]).replace(/^'/, '') };
    }
  }
  return null;
}

function verifySijil_(id) {
  id = id.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{5,60}$/.test(id)) return { valid: false, id: '' };
  const sheet = getSheet_(SHEET_RESPON);
  const last = sheet.getLastRow();
  if (last >= 2) {
    const rows = sheet.getRange(2, 2, last - 1, 4).getValues();
    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === id) {
        const prog = findProgram_(String(rows[i][1])) || { nama: rows[i][1], tarikh: '' };
        const ic = String(rows[i][3]).replace(/\D/g, '');
        return {
          valid: true,
          id: id,
          nama: String(rows[i][2]).replace(/^'/, ''),
          icMasked: 'XXXXXX-XX-' + ic.slice(-4),
          program: prog.nama,
          tarikh: prog.tarikh,
          org: CONFIG.ORG_NAME,
        };
      }
    }
  }
  return { valid: false, id: id };
}

function buildCert_(prog, nama, ic, id, reissued) {
  return {
    id: id,
    nama: nama,
    ic: formatIC_(ic),
    program: prog.nama,
    tarikh: prog.tarikh,
    tempat: prog.tempat,
    org: CONFIG.ORG_NAME,
    title: CONFIG.CERT_TITLE,
    signName: CONFIG.SIGNATORY_NAME,
    signTitle: CONFIG.SIGNATORY_TITLE,
    verifyUrl: ScriptApp.getService().getUrl() + '?verify=' + encodeURIComponent(id),
    reissued: reissued,
  };
}

function newCertId_(kod) {
  const rand = Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
  return CONFIG.ID_PREFIX + '-' + kod + '-' + rand;
}

function cleanKod_(kod) {
  const k = String(kod || '').trim().toUpperCase();
  return /^[A-Z0-9_-]{1,30}$/.test(k) ? k : '';
}

function cleanNama_(nama) {
  const s = String(nama || '').trim().replace(/\s+/g, ' ').toUpperCase();
  if (s.length < 3 || s.length > 80) throw new Error('Sila isi nama penuh (3-80 aksara).');
  // Mesti bermula dengan huruf: sekali gus halang formula injection (=, +, -, @).
  if (!/^[A-ZÀ-ɏ][A-ZÀ-ɏ .'@\/()-]*$/.test(s)) {
    throw new Error('Nama hanya boleh mengandungi huruf, ruang dan simbol . \' @ / - ( )');
  }
  return s;
}

function normNama_(nama) {
  return String(nama).toUpperCase().replace(/[^A-ZÀ-ɏ]/g, '');
}

function cleanIC_(ic) {
  const d = String(ic || '').replace(/[\s-]/g, '');
  const mm = Number(d.slice(2, 4));
  const dd = Number(d.slice(4, 6));
  if (!/^\d{12}$/.test(d) || mm < 1 || mm > 12 || dd < 1 || dd > 31) {
    throw new Error('No. IC tidak sah. Contoh format: 900101-14-5678');
  }
  return d;
}

function formatIC_(d) {
  return d.slice(0, 6) + '-' + d.slice(6, 8) + '-' + d.slice(8);
}

function formatTarikh_(v) {
  if (v instanceof Date) {
    const tz = Session.getScriptTimeZone();
    const d = Number(Utilities.formatDate(v, tz, 'd'));
    const m = Number(Utilities.formatDate(v, tz, 'M'));
    return d + ' ' + BULAN[m - 1] + ' ' + Utilities.formatDate(v, tz, 'yyyy');
  }
  return String(v || '').trim();
}

function sanitizeForSheet_(value) {
  const str = String(value == null ? '' : value);
  return /^[=+\-@]/.test(str) ? "'" + str : str;
}

function rateLimit_(key) {
  const cache = CacheService.getScriptCache();
  const count = Number(cache.get(key) || 0);
  if (count >= CONFIG.RATE_LIMIT.max) {
    throw new Error('Terlalu banyak percubaan. Sila cuba lagi selepas 10 minit.');
  }
  cache.put(key, String(count + 1), CONFIG.RATE_LIMIT.windowSec);
}
