# Threads Studio — Ilmu Solat

Webapp peribadi (Google Apps Script + Google Sheets) untuk pantau, jadual dan post ke Threads.

## Roadmap

| Fasa | Isi | Status |
|---|---|---|
| 1 | Sambungan Threads API, content bank, post sekarang, sync post + insights, dashboard asas | Siap |
| 2 | 3 slot sehari, auto-isi jadual, auto-post, kalendar 7 hari, mode uji, pelan content 14 hari | Siap |
| 3 | Analisis lanjut: topik/siri terbaik, waktu terbaik, trend mingguan | |
| 4 | Workflows: recycle post top, reminder, pipeline Draf → Semak ustaz → Sedia | |
| 5 | Engagement: inbox replies, template jawapan, balas terus dari app | |

## Setup (sekali sahaja, ~30 minit)

### A. Google Sheet + Apps Script

1. Buat Google Sheet baru, contoh nama `Threads Studio`.
2. Menu **Extensions → Apps Script**.
3. Padam isi `Code.gs`, tampal isi fail `Code.gs` dari folder ini.
4. **+ → Script**, nama `Seed`, tampal isi `Seed.gs`.
5. **+ → HTML**, nama `Index`, tampal isi `Index.html`.
6. **Project Settings → tick "Show appsscript.json"**, tampal isi `appsscript.json`.
7. Pilih function `setup` di toolbar → **Run** → benarkan permission.
   Ini akan cipta tab `Content`, `Posts`, `Log`, isi 42 draf (pelan 14 hari), dan pasang 3 trigger: refresh token mingguan, penjadual setiap 10 minit, auto-isi slot setiap malam.
8. **Deploy → New deployment → Web app**
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

## Cara guna harian (Fasa 2)

Slot: **Pagi 09:00 (Ringan)** · **Tengahari 13:00 (Sederhana)** · **Malam 21:00 (Berat)**

1. **Tulis kapsyen** — Content Bank, tapis ikut slot, buka item, baca Brief, tulis Teks.
2. **Semak ustaz** — lafaz doa, status hadith, hukum.
3. **Tukar status ke "Sedia"** — hanya item Sedia akan dijadual. Draf tak akan terpost.
4. **Auto-isi** — setiap tengah malam app isi slot kosong 7 hari ke depan ikut susunan baris. Boleh tekan "Isi slot kosong" di tab Jadual.
5. **Auto-post** — setiap 10 minit app post item yang dah sampai masa (0–10 minit lewat dari slot).
   Kalau lewat lebih 2 jam (contoh trigger mati), item dipulangkan ke "Sedia".

**Mode uji** hidup secara default: jadual berjalan, item ditanda "Uji", tiada apa dihantar ke Threads.
Tutup mode uji di tab Jadual bila token dah disambung.

Nak tukar masa slot: edit `SLOTS` di bahagian atas `Code.gs`.

## Keselamatan

- Web app hanya boleh dibuka oleh akaun Google anda (Only myself).
- Token Threads dalam **Script Properties**, bukan dalam Sheet/HTML.
- **Jangan** guna "File → Share → Publish to web" untuk Sheet ini.
- Input disanitize sebelum ditulis ke Sheet (elak formula injection); UI guna `textContent` (elak XSS).
- Data replies orang lain (Fasa 5) ialah data peribadi; simpan yang perlu sahaja.

## Struktur Sheet

- **Content** — content bank: ID, Status (Draf/Sedia/Dijadual/Diposting/Uji/Gagal), Topik, Siri, Teks, ImageURL, Jadual, ThreadsID, Permalink, DipostPada, Catatan, Dikemaskini, Slot, Tahap, Brief
- **Posts** — snapshot post dari Threads + insights (views, likes, replies, reposts, quotes, shares, engagement rate)
- **Log** — rekod setiap tindakan & ralat
