# Threads Studio — Ilmu Solat

Webapp peribadi (Google Apps Script + Google Sheets) untuk pantau, jadual dan post ke Threads.

## Roadmap

| Fasa | Isi | Status |
|---|---|---|
| 1 | Sambungan Threads API, content bank, post sekarang, sync post + insights, dashboard asas | Siap |
| 2 | Auto-post ikut jadual (trigger setiap 15 minit), siri bersambung | Seterusnya |
| 3 | Analisis lanjut: topik/siri terbaik, waktu terbaik, trend mingguan | |
| 4 | Workflows: recycle post top, reminder, pipeline Draf → Semak ustaz → Sedia | |
| 5 | Engagement: inbox replies, template jawapan, balas terus dari app | |

## Setup (sekali sahaja, ~30 minit)

### A. Google Sheet + Apps Script

1. Buat Google Sheet baru, contoh nama `Threads Studio`.
2. Menu **Extensions → Apps Script**.
3. Padam isi `Code.gs`, tampal isi fail `Code.gs` dari folder ini.
4. **+ → HTML**, nama `Index`, tampal isi `Index.html`.
5. **Project Settings → tick "Show appsscript.json"**, tampal isi `appsscript.json`.
6. Pilih function `setup` di toolbar → **Run** → benarkan permission.
   Ini akan cipta tab `Content`, `Posts`, `Log`, isi 8 draf siri "Perbuatan dalam Solat", dan pasang trigger refresh token mingguan.
7. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Only myself**
   Salin URL web app tu, bookmark.

### B. Token Threads (percuma)

1. Pergi ke developers.facebook.com → **My Apps → Create App** → pilih use case **Access the Threads API**.
2. Dalam app: **Use cases → Customize** → pastikan permission `threads_basic`, `threads_content_publish`, `threads_manage_insights`, `threads_read_replies`, `threads_manage_replies` ditanda.
3. **App roles → Roles → Add People → Threads Tester** → masukkan username Threads anda.
4. Dalam app Threads (telefon): **Settings → Account → Website permissions → Invites** → terima jemputan.
5. Kembali ke Meta Developer: **Use cases → Settings → User Token Generator** → **Generate Access Token** untuk akaun anda.
   Token dari sini biasanya short-lived (1 jam). Tukar jadi long-lived (60 hari) guna Graph API Explorer atau URL:
   `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=APP_SECRET&access_token=SHORT_TOKEN`
6. Buka web app → tab **Tetapan** → tampal token → **Simpan & sahkan**.

> Nota: langkah dan nama menu Meta selalu berubah. Kalau tak jumpa, beritahu saya apa yang anda nampak di skrin.

### C. Gambar untuk post

Threads perlukan gambar dari URL awam (https). Draf siri 1–8 guna link `raw.githubusercontent.com` ke folder `infografik-panel`.
Ini hanya berfungsi kalau repo **public** dan fail dah ada di branch `main`. Kalau repo private, upload gambar ke tempat awam lain (contoh Google Drive tak sesuai sebab link bukan direct image).

## Keselamatan

- Web app hanya boleh dibuka oleh akaun Google anda (Only myself).
- Token Threads dalam **Script Properties**, bukan dalam Sheet/HTML.
- **Jangan** guna "File → Share → Publish to web" untuk Sheet ini.
- Input disanitize sebelum ditulis ke Sheet (elak formula injection); UI guna `textContent` (elak XSS).
- Data replies orang lain (Fasa 5) ialah data peribadi; simpan yang perlu sahaja.

## Struktur Sheet

- **Content** — content bank: ID, Status (Draf/Sedia/Dijadual/Diposting/Gagal), Topik, Siri, Teks, ImageURL, Jadual, ThreadsID, Permalink, DipostPada, Catatan, Dikemaskini
- **Posts** — snapshot post dari Threads + insights (views, likes, replies, reposts, quotes, shares, engagement rate)
- **Log** — rekod setiap tindakan & ralat
