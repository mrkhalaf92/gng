/**
 * Threads Studio — Ilmu Solat
 * Fasa 1: sambungan Threads API, content bank, post sekarang, sync post + insights.
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
              'ThreadsID', 'Permalink', 'DipostPada', 'Catatan', 'Dikemaskini']
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

const STATUSES = ['Draf', 'Sedia', 'Dijadual', 'Diposting', 'Gagal'];

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
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'refreshToken')
    .forEach(t => ScriptApp.deleteTrigger(t));
  // Token long-lived tahan ~60 hari. Refresh setiap minggu supaya tak pernah tamat.
  ScriptApp.newTrigger('refreshToken').timeBased().everyWeeks(1).onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(3).create();
}

function seedContent_() {
  const sh = sheet_(SHEETS.CONTENT);
  if (sh.getLastRow() > 1) return; // dah ada data, jangan tindih
  const base = 'https://raw.githubusercontent.com/mrkhalaf92/gng/main/infografik-panel/';
  const panels = [
    ['1-angkat-tangan.png', 'Angkat tangan (takbiratul ihram)'],
    ['2-berdiri-tegak.png', 'Berdiri tegak'],
    ['3-rukuk.png', 'Rukuk'],
    ['4-itidal.png', "I'tidal"],
    ['5-sujud.png', 'Sujud'],
    ['6-duduk-antara-dua-sujud.png', 'Duduk antara dua sujud'],
    ['7-tahiyyat-akhir.png', 'Tahiyyat akhir'],
    ['8-salam.png', 'Salam']
  ];
  const now = new Date();
  const rows = panels.map((p, i) => [
    Utilities.getUuid(), 'Draf', p[1], 'Perbuatan dalam Solat ' + (i + 1) + '/8', '',
    base + p[0], '', '', '', '', 'Tulis kapsyen & semak dengan ustaz sebelum post', now
  ]);
  sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
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
    lastSync: p.LAST_SYNC || ''
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
    Catatan: limit_(item.Catatan, 500)
  };
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

/** Post satu item content bank ke Threads sekarang. */
function postNow(id) {
  const sh = sheet_(SHEETS.CONTENT);
  const h = SHEETS.CONTENT.headers;
  const r = findRow_(sh, id);
  if (r < 0) throw new Error('Item tak dijumpai');
  const row = sh.getRange(r, 1, 1, h.length).getValues()[0];
  const get = k => row[h.indexOf(k)];
  const set = (k, v) => sh.getRange(r, h.indexOf(k) + 1).setValue(v);

  if (get('Status') === 'Diposting') throw new Error('Item ini dah diposting');
  const text = String(get('Teks') || '').trim();
  const img = String(get('ImageURL') || '').trim();
  if (!text && !img) throw new Error('Teks kosong');

  try {
    const res = publish_(text, img);
    set('Status', 'Diposting');
    set('ThreadsID', res.id);
    set('Permalink', res.permalink || '');
    set('DipostPada', new Date());
    set('Catatan', '');
    log_('postNow', 'OK', res.id);
  } catch (e) {
    set('Status', 'Gagal');
    set('Catatan', sanitize_(String(e.message).slice(0, 300)));
    log_('postNow', 'GAGAL', e.message);
    throw e;
  }
  set('Dikemaskini', new Date());
  return listContent();
}

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
