/**
 * Threads Studio — Ilmu Solat
 * Fasa 1: sambungan Threads API, content bank, post sekarang, sync post + insights.
 * Fasa 2: 3 slot sehari (Pagi/Tengahari/Malam), auto-isi jadual, auto-post, kalendar, mode uji.
 *
 * Keselamatan:
 * - Web app deploy "Execute as: Me" + "Who has access: Only myself" (Google yang buat login).
 * - Access token Threads disimpan dalam Script Properties, BUKAN dalam Sheet atau HTML.
 * - Jangan sesekali "Publish to Web" Sheet ini.
 */

const API_BASE = 'https://graph.threads.net/v1.0';
const MAX_CHARS = 500;

const SHEETS = {
  CONTENT: {
    name: 'Content',
    headers: ['ID', 'Status', 'Topik', 'Siri', 'Teks', 'ImageURL', 'Jadual',
              'ThreadsID', 'Permalink', 'DipostPada', 'Catatan', 'Dikemaskini',
              'Slot', 'Tahap', 'Brief']
  },
  POSTS: {
    name: 'Posts',
    headers: ['ThreadsID', 'Tarikh', 'Teks', 'Jenis', 'Permalink', 'Views', 'Likes',
              'Replies', 'Reposts', 'Quotes', 'Shares', 'EngRate', 'DisyncPada']
  },
  LOG: {
    name: 'Log',
    headers: ['Masa', 'Aksi', 'Status', 'Mesej']
  }
};

const STATUSES = ['Draf', 'Sedia', 'Dijadual', 'Diposting', 'Uji', 'Gagal'];

/** 3 slot sehari. Tukar masa di sini jika perlu (waktu Malaysia). */
const SLOTS = [
  { name: 'Pagi',      hour: 9,  minute: 0, tahap: 'Ringan' },
  { name: 'Tengahari', hour: 13, minute: 0, tahap: 'Sederhana' },
  { name: 'Malam',     hour: 21, minute: 0, tahap: 'Berat' }
];
const SCHEDULE_DAYS = 7;       // auto-isi jadual untuk 7 hari ke depan
const LATE_LIMIT_MIN = 120;    // lewat lebih 2 jam = terlepas slot, pulangkan ke "Sedia"
const TZ = 'Asia/Kuala_Lumpur';

function slotDef_(name) {
  return SLOTS.find(s => s.name === name) || SLOTS[0];
}

/* =========================================================
 * WEB APP
 * ======================================================= */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Threads Studio — Ilmu Solat')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/* =========================================================
 * SETUP (jalankan sekali dari editor)
 * ======================================================= */

function setup() {
  const ss = SpreadsheetApp.getActive();
  Object.values(SHEETS).forEach(def => {
    let sh = ss.getSheetByName(def.name);
    if (!sh) sh = ss.insertSheet(def.name);
    sh.getRange(1, 1, 1, def.headers.length).setValues([def.headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  });
  seedContent_();
  installTriggers_();
  log_('setup', 'OK', 'Sheet & trigger siap');
  return 'Setup siap';
}

function installTriggers_() {
  const handlers = ['refreshToken', 'runScheduler', 'autoScheduleDaily'];
  ScriptApp.getProjectTriggers()
    .filter(t => handlers.includes(t.getHandlerFunction()))
    .forEach(t => ScriptApp.deleteTrigger(t));
  // Token long-lived tahan ~60 hari. Refresh setiap minggu supaya tak pernah tamat.
  ScriptApp.newTrigger('refreshToken').timeBased().everyWeeks(1).onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(3).create();
  // Semak jadual setiap 10 minit (post akan keluar 0-10 minit selepas masa slot).
  ScriptApp.newTrigger('runScheduler').timeBased().everyMinutes(10).create();
  // Isi slot kosong untuk 7 hari ke depan, setiap malam.
  ScriptApp.newTrigger('autoScheduleDaily').timeBased().everyDays(1).atHour(0).create();
}

/* =========================================================
 * TETAPAN & SAMBUNGAN
 * ======================================================= */

/** Simpan token dan sahkan dengan panggil /me. */
function saveToken(token) {
  token = String(token || '').trim();
  if (!/^[A-Za-z0-9_\-|.]{20,}$/.test(token)) throw new Error('Format token tak sah');
  const me = apiGet_('/me', { fields: 'id,username' }, token);
  const props = PropertiesService.getScriptProperties();
  props.setProperties({
    THREADS_TOKEN: token,
    THREADS_USER_ID: me.id,
    THREADS_USERNAME: me.username,
    TOKEN_SAVED_AT: new Date().toISOString()
  });
  log_('saveToken', 'OK', '@' + me.username);
  return getStatus();
}

function getStatus() {
  const p = PropertiesService.getScriptProperties().getProperties();
  return {
    connected: !!p.THREADS_TOKEN,
    username: p.THREADS_USERNAME || '',
    tokenSavedAt: p.TOKEN_SAVED_AT || '',
    lastSync: p.LAST_SYNC || '',
    dryRun: p.DRY_RUN !== 'false',   // default: mode uji HIDUP sehingga ditutup
    slots: SLOTS.map(s => ({ name: s.name, time: pad_(s.hour) + ':' + pad_(s.minute), tahap: s.tahap }))
  };
}

/** Panjangkan token long-lived (dipanggil trigger mingguan). */
function refreshToken() {
  const token = token_();
  const res = fetchJson_(API_BASE.replace('/v1.0', '') + '/refresh_access_token?' +
    qs_({ grant_type: 'th_refresh_token', access_token: token }), { method: 'get' });
  PropertiesService.getScriptProperties().setProperties({
    THREADS_TOKEN: res.access_token,
    TOKEN_SAVED_AT: new Date().toISOString()
  });
  log_('refreshToken', 'OK', 'Tamat dalam ' + Math.round((res.expires_in || 0) / 86400) + ' hari');
  return getStatus();
}

/* =========================================================
 * CONTENT BANK
 * ======================================================= */

function listContent() {
  return readObjects_(SHEETS.CONTENT).map(o => {
    o.Jadual = fmtDateIso_(o.Jadual);
    o.DipostPada = fmtDateIso_(o.DipostPada);
    o.Dikemaskini = fmtDateIso_(o.Dikemaskini);
    return o;
  });
}

function saveContent(item) {
  const clean = {
    Status: STATUSES.includes(item.Status) ? item.Status : 'Draf',
    Topik: limit_(item.Topik, 200),
    Siri: limit_(item.Siri, 100),
    Teks: limit_(item.Teks, MAX_CHARS),
    ImageURL: String(item.ImageURL || '').trim(),
    Jadual: item.Jadual ? new Date(item.Jadual) : '',
    Catatan: limit_(item.Catatan, 500),
    Slot: SLOTS.some(x => x.name === item.Slot) ? item.Slot : '',
    Brief: limit_(item.Brief, 1000)
  };
  clean.Tahap = clean.Slot ? slotDef_(clean.Slot).tahap : '';
  if (clean.Status === 'Dijadual' && !clean.Jadual) throw new Error('Status "Dijadual" perlukan tarikh jadual');
  if (clean.ImageURL && !/^https:\/\/\S+$/.test(clean.ImageURL)) throw new Error('ImageURL mesti bermula https://');
  if (clean.Jadual && isNaN(clean.Jadual.getTime())) throw new Error('Tarikh jadual tak sah');

  const sh = sheet_(SHEETS.CONTENT);
  const h = SHEETS.CONTENT.headers;
  const rowIdx = item.ID ? findRow_(sh, item.ID) : -1;
  const now = new Date();

  if (rowIdx > 0) {
    const current = sh.getRange(rowIdx, 1, 1, h.length).getValues()[0];
    h.forEach((key, i) => { if (key in clean) current[i] = sanitize_(clean[key]); });
    current[h.indexOf('Dikemaskini')] = now;
    sh.getRange(rowIdx, 1, 1, h.length).setValues([current]);
  } else {
    const row = h.map(key => {
      if (key === 'ID') return Utilities.getUuid();
      if (key === 'Dikemaskini') return now;
      return key in clean ? sanitize_(clean[key]) : '';
    });
    sh.appendRow(row);
  }
  return listContent();
}

function deleteContent(id) {
  const sh = sheet_(SHEETS.CONTENT);
  const r = findRow_(sh, id);
  if (r > 0) sh.deleteRow(r);
  return listContent();
}

/** Post satu item content bank ke Threads sekarang (butang manual). */
function postNow(id) {
  const sh = sheet_(SHEETS.CONTENT);
  const r = findRow_(sh, id);
  if (r < 0) throw new Error('Item tak dijumpai');
  const res = postRow_(sh, r, false);
  if (!res.ok) throw new Error(res.error);
  return listContent();
}

/**
 * Post satu baris. dryRun = true: tak hantar ke Threads, cuma tanda "Uji".
 * Pulangkan { ok, error }.
 */
function postRow_(sh, r, dryRun) {
  const h = SHEETS.CONTENT.headers;
  const row = sh.getRange(r, 1, 1, h.length).getValues()[0];
  const get = k => row[h.indexOf(k)];
  const set = (k, v) => sh.getRange(r, h.indexOf(k) + 1).setValue(v);

  if (get('Status') === 'Diposting') return { ok: false, error: 'Item ini dah diposting' };
  const text = String(get('Teks') || '').trim();
  const img = String(get('ImageURL') || '').trim();
  if (!text && !img) {
    set('Status', 'Gagal'); set('Catatan', 'Teks kosong');
    return { ok: false, error: 'Teks kosong' };
  }

  if (dryRun) {
    set('Status', 'Uji');
    set('DipostPada', new Date());
    set('Catatan', 'Mode uji: tak dihantar ke Threads');
    set('Dikemaskini', new Date());
    log_('post(uji)', 'OK', get('Topik'));
    return { ok: true };
  }

  try {
    const res = publish_(text, img);
    set('Status', 'Diposting');
    set('ThreadsID', res.id);
    set('Permalink', res.permalink || '');
    set('DipostPada', new Date());
    set('Catatan', '');
    set('Dikemaskini', new Date());
    log_('post', 'OK', res.id);
    return { ok: true };
  } catch (e) {
    set('Status', 'Gagal');
    set('Catatan', sanitize_(String(e.message).slice(0, 300)));
    set('Dikemaskini', new Date());
    log_('post', 'GAGAL', e.message);
    return { ok: false, error: e.message };
  }
}

/* =========================================================
 * FASA 2 — PENJADUAL
 * ======================================================= */

/** Trigger setiap 10 minit: post item "Dijadual" yang dah sampai masa. */
function runScheduler() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return; // run sebelum ini masih berjalan
  try {
    const sh = sheet_(SHEETS.CONTENT);
    const h = SHEETS.CONTENT.headers;
    const last = sh.getLastRow();
    if (last < 2) return;
    const data = sh.getRange(2, 1, last - 1, h.length).getValues();
    const iS = h.indexOf('Status'), iJ = h.indexOf('Jadual');
    const now = Date.now();
    const dryRun = getStatus().dryRun;
    let posted = 0;

    for (let i = 0; i < data.length && posted < 3; i++) {
      const jadual = data[i][iJ];
      if (data[i][iS] !== 'Dijadual' || !(jadual instanceof Date) || jadual.getTime() > now) continue;
      const r = i + 2;
      const lateMin = (now - jadual.getTime()) / 60000;
      if (lateMin > LATE_LIMIT_MIN) {
        // Terlepas slot (contoh: trigger mati). Pulangkan supaya auto-isi letak semula.
        sh.getRange(r, iS + 1).setValue('Sedia');
        sh.getRange(r, iJ + 1).setValue('');
        sh.getRange(r, h.indexOf('Catatan') + 1).setValue('Terlepas slot, dipulangkan ke Sedia');
        log_('scheduler', 'TERLEPAS', data[i][h.indexOf('Topik')]);
        continue;
      }
      postRow_(sh, r, dryRun);
      posted++;
    }
  } finally {
    lock.releaseLock();
  }
}

function autoScheduleDaily() { autoSchedule(SCHEDULE_DAYS); }

/**
 * Isi slot kosong untuk N hari ke depan dengan item "Sedia" yang sepadan slotnya.
 * Ikut susunan baris dalam Sheet (atas dahulu). Hanya item "Sedia" — Draf tak akan dijadual.
 */
function autoSchedule(days) {
  days = Math.min(Math.max(Number(days) || SCHEDULE_DAYS, 1), 30);
  const sh = sheet_(SHEETS.CONTENT);
  const h = SHEETS.CONTENT.headers;
  const last = sh.getLastRow();
  if (last < 2) return getCalendar(days);
  const data = sh.getRange(2, 1, last - 1, h.length).getValues();
  const iS = h.indexOf('Status'), iJ = h.indexOf('Jadual'), iSlot = h.indexOf('Slot');

  // Slot yang dah terisi
  const taken = {};
  data.forEach(r => {
    if ((r[iS] === 'Dijadual' || r[iS] === 'Diposting' || r[iS] === 'Uji') && r[iJ] instanceof Date) {
      taken[slotKey_(r[iJ])] = true;
    }
  });

  // Barisan item Sedia ikut slot
  const queue = {};
  SLOTS.forEach(s => queue[s.name] = []);
  data.forEach((r, i) => { if (r[iS] === 'Sedia' && queue[r[iSlot]]) queue[r[iSlot]].push(i); });

  const now = new Date();
  let filled = 0;
  for (let d = 0; d < days; d++) {
    SLOTS.forEach(s => {
      const when = slotDate_(now, d, s);
      if (when.getTime() <= now.getTime() + 5 * 60000) return; // slot dah lepas / terlalu dekat
      if (taken[slotKey_(when)] || !queue[s.name].length) return;
      const i = queue[s.name].shift();
      data[i][iS] = 'Dijadual';
      data[i][iJ] = when;
      taken[slotKey_(when)] = true;
      sh.getRange(i + 2, iS + 1).setValue('Dijadual');
      sh.getRange(i + 2, iJ + 1).setValue(when);
      filled++;
    });
  }
  log_('autoSchedule', 'OK', filled + ' slot diisi');
  return getCalendar(days);
}

/** Batalkan jadual satu item (pulang ke Sedia). */
function unschedule(id) {
  const sh = sheet_(SHEETS.CONTENT);
  const h = SHEETS.CONTENT.headers;
  const r = findRow_(sh, id);
  if (r < 0) throw new Error('Item tak dijumpai');
  if (sh.getRange(r, h.indexOf('Status') + 1).getValue() !== 'Dijadual') throw new Error('Item tak dijadual');
  sh.getRange(r, h.indexOf('Status') + 1).setValue('Sedia');
  sh.getRange(r, h.indexOf('Jadual') + 1).setValue('');
  return getCalendar(SCHEDULE_DAYS);
}

/** Grid kalendar: hari x slot. */
function getCalendar(days) {
  days = Math.min(Math.max(Number(days) || SCHEDULE_DAYS, 1), 30);
  const items = readObjects_(SHEETS.CONTENT);
  const bySlot = {};
  items.forEach(o => {
    if (o.Jadual instanceof Date && ['Dijadual', 'Diposting', 'Uji', 'Gagal'].includes(o.Status)) {
      bySlot[slotKey_(o.Jadual)] = o;
    }
  });
  const now = new Date();
  const out = [];
  for (let d = 0; d < days; d++) {
    const date = slotDate_(now, d, SLOTS[0]);
    out.push({
      date: date.toISOString(),
      slots: SLOTS.map(s => {
        const when = slotDate_(now, d, s);
        const o = bySlot[slotKey_(when)];
        return {
          slot: s.name, tahap: s.tahap, when: when.toISOString(), past: when.getTime() < now.getTime(),
          item: o ? { ID: o.ID, Topik: o.Topik, Status: o.Status, Teks: String(o.Teks || '').slice(0, 100), Permalink: o.Permalink } : null
        };
      })
    });
  }
  const ready = {};
  SLOTS.forEach(s => ready[s.name] = items.filter(o => o.Status === 'Sedia' && o.Slot === s.name).length);
  return { days: out, ready: ready, status: getStatus() };
}

function setDryRun(on) {
  PropertiesService.getScriptProperties().setProperty('DRY_RUN', on ? 'true' : 'false');
  log_('setDryRun', 'OK', on ? 'Mode uji HIDUP' : 'Mode uji TUTUP — post sebenar');
  return getStatus();
}

/** Tarikh slot untuk hari ke-d dari hari ini (zon masa script = Asia/Kuala_Lumpur). */
function slotDate_(base, d, slot) {
  const ymd = Utilities.formatDate(base, TZ, 'yyyy-MM-dd').split('-').map(Number);
  return new Date(ymd[0], ymd[1] - 1, ymd[2] + d, slot.hour, slot.minute, 0, 0);
}

function slotKey_(date) { return Utilities.formatDate(date, TZ, 'yyyy-MM-dd HH:mm'); }

function pad_(n) { return String(n).padStart(2, '0'); }

/* =========================================================
 * THREADS API — PUBLISH
 * ======================================================= */

function publish_(text, imageUrl) {
  const userId = userId_();
  const params = imageUrl
    ? { media_type: 'IMAGE', image_url: imageUrl, text: text }
    : { media_type: 'TEXT', text: text };
  const container = apiPost_('/' + userId + '/threads', params);

  // Media perlu masa diproses. Semak status sehingga FINISHED (maks ~60s).
  if (imageUrl) waitForContainer_(container.id);
  else Utilities.sleep(2000);

  const pub = apiPost_('/' + userId + '/threads_publish', { creation_id: container.id });
  let permalink = '';
  try { permalink = apiGet_('/' + pub.id, { fields: 'permalink' }).permalink || ''; } catch (e) {}
  return { id: pub.id, permalink: permalink };
}

function waitForContainer_(id) {
  for (let i = 0; i < 12; i++) {
    Utilities.sleep(5000);
    const s = apiGet_('/' + id, { fields: 'status,error_message' });
    if (s.status === 'FINISHED') return;
    if (s.status === 'ERROR' || s.status === 'EXPIRED') throw new Error('Media gagal: ' + (s.error_message || s.status));
  }
  throw new Error('Media ambil masa terlalu lama, cuba lagi');
}

/* =========================================================
 * THREADS API — SYNC & INSIGHTS
 * ======================================================= */

function syncPosts() {
  const posts = [];
  let url = API_BASE + '/me/threads?' + qs_({
    fields: 'id,text,timestamp,permalink,media_type,is_quote_post',
    limit: 50,
    access_token: token_()
  });
  for (let page = 0; page < 4 && url; page++) {   // maks 200 post terkini
    const res = fetchJson_(url, { method: 'get' });
    (res.data || []).forEach(p => posts.push(p));
    url = res.paging && res.paging.next;
  }

  const now = new Date();
  const rows = posts
    .filter(p => p.media_type !== 'REPOST_FACADE')
    .map(p => {
      const m = mediaInsights_(p.id);
      const eng = m.views ? (m.likes + m.replies + m.reposts + m.quotes) / m.views : 0;
      return [p.id, new Date(p.timestamp), sanitize_(p.text || ''), p.media_type, p.permalink || '',
              m.views, m.likes, m.replies, m.reposts, m.quotes, m.shares, eng, now];
    });

  const sh = sheet_(SHEETS.POSTS);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, SHEETS.POSTS.headers.length).clearContent();
  if (rows.length) sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);

  PropertiesService.getScriptProperties().setProperty('LAST_SYNC', now.toISOString());
  log_('syncPosts', 'OK', rows.length + ' post');
  return getDashboard();
}

function mediaInsights_(id) {
  const out = { views: 0, likes: 0, replies: 0, reposts: 0, quotes: 0, shares: 0 };
  let res;
  try {
    res = apiGet_('/' + id + '/insights', { metric: 'views,likes,replies,reposts,quotes,shares' });
  } catch (e) {
    try { res = apiGet_('/' + id + '/insights', { metric: 'views,likes,replies,reposts,quotes' }); }
    catch (e2) { return out; }
  }
  (res.data || []).forEach(d => {
    const v = d.total_value ? d.total_value.value : (d.values && d.values[0] ? d.values[0].value : 0);
    out[d.name] = Number(v) || 0;
  });
  return out;
}

function getDashboard() {
  const posts = readObjects_(SHEETS.POSTS);
  const sum = k => posts.reduce((a, p) => a + (Number(p[k]) || 0), 0);
  const totalViews = sum('Views');
  const totalEng = sum('Likes') + sum('Replies') + sum('Reposts') + sum('Quotes');

  let followers = null;
  try {
    const r = apiGet_('/' + userId_() + '/threads_insights', { metric: 'followers_count' });
    const d = (r.data || [])[0];
    followers = d ? (d.total_value ? d.total_value.value : null) : null;
  } catch (e) {}

  const top = posts.slice()
    .sort((a, b) => (Number(b.Views) || 0) - (Number(a.Views) || 0))
    .slice(0, 10)
    .map(p => ({
      tarikh: fmtDateIso_(p.Tarikh), teks: String(p.Teks || '').slice(0, 140),
      permalink: p.Permalink, views: Number(p.Views) || 0, likes: Number(p.Likes) || 0,
      replies: Number(p.Replies) || 0, reposts: Number(p.Reposts) || 0,
      eng: Number(p.EngRate) || 0
    }));

  const content = readObjects_(SHEETS.CONTENT);
  const byStatus = {};
  STATUSES.forEach(s => byStatus[s] = 0);
  content.forEach(c => { byStatus[c.Status] = (byStatus[c.Status] || 0) + 1; });

  return {
    status: getStatus(),
    followers: followers,
    totalPosts: posts.length,
    totalViews: totalViews,
    avgViews: posts.length ? Math.round(totalViews / posts.length) : 0,
    engRate: totalViews ? totalEng / totalViews : 0,
    top: top,
    contentByStatus: byStatus
  };
}

/* =========================================================
 * HELPER — HTTP
 * ======================================================= */

function apiGet_(path, params, tokenOverride) {
  params = Object.assign({}, params, { access_token: tokenOverride || token_() });
  return fetchJson_(API_BASE + path + '?' + qs_(params), { method: 'get' });
}

function apiPost_(path, params) {
  params = Object.assign({}, params, { access_token: token_() });
  return fetchJson_(API_BASE + path, { method: 'post', payload: params });
}

function fetchJson_(url, opts) {
  opts.muteHttpExceptions = true;
  const res = UrlFetchApp.fetch(url, opts);
  const code = res.getResponseCode();
  let body;
  try { body = JSON.parse(res.getContentText()); } catch (e) { body = {}; }
  if (code >= 400 || body.error) {
    const msg = body.error ? body.error.message : ('HTTP ' + code);
    throw new Error('Threads API: ' + msg);
  }
  return body;
}

function qs_(obj) {
  return Object.keys(obj)
    .filter(k => obj[k] !== undefined && obj[k] !== '')
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]))
    .join('&');
}

function token_() {
  const t = PropertiesService.getScriptProperties().getProperty('THREADS_TOKEN');
  if (!t) throw new Error('Belum sambung Threads. Masukkan token di tab Tetapan.');
  return t;
}

function userId_() {
  const id = PropertiesService.getScriptProperties().getProperty('THREADS_USER_ID');
  if (!id) throw new Error('User ID tiada. Simpan semula token di tab Tetapan.');
  return id;
}

/* =========================================================
 * HELPER — SHEET
 * ======================================================= */

function sheet_(def) {
  const sh = SpreadsheetApp.getActive().getSheetByName(def.name);
  if (!sh) throw new Error('Sheet "' + def.name + '" tiada. Jalankan setup() dahulu.');
  return sh;
}

function readObjects_(def) {
  const sh = sheet_(def);
  const last = sh.getLastRow();
  if (last < 2) return [];
  const values = sh.getRange(2, 1, last - 1, def.headers.length).getValues();
  return values.filter(r => r[0] !== '').map(r => {
    const o = {};
    def.headers.forEach((h, i) => o[h] = r[i]);
    return o;
  });
}

function findRow_(sh, id) {
  const last = sh.getLastRow();
  if (last < 2) return -1;
  const ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) if (ids[i][0] === id) return i + 2;
  return -1;
}

/** Elak formula injection bila tulis ke Sheet. */
function sanitize_(v) {
  if (v instanceof Date || typeof v === 'number') return v;
  const s = String(v == null ? '' : v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function limit_(v, n) { return String(v == null ? '' : v).trim().slice(0, n); }

function fmtDateIso_(d) {
  return d instanceof Date && !isNaN(d) ? d.toISOString() : (d || '');
}

function log_(aksi, status, mesej) {
  try {
    const sh = SpreadsheetApp.getActive().getSheetByName(SHEETS.LOG.name);
    if (sh) sh.appendRow([new Date(), aksi, status, sanitize_(String(mesej).slice(0, 500))]);
  } catch (e) {}
}
