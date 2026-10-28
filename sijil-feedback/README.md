# Sistem Feedback Program + Sijil Digital

Peserta buka link, isi borang feedback, terus dapat sijil penyertaan (nama + No. IC) dalam bentuk PDF atau PNG. Setiap sijil ada QR code dan ID unik yang orang lain boleh imbas untuk sahkan sijil tu tulen.

Stack: Google Apps Script + Google Sheets. Tak perlu server dan tak ada kos bulanan.

## Aliran

1. Urusetia daftar program dalam tab **Program** (kod, nama, tarikh, tempat, aktif).
2. Kongsi link `URL_WEB_APP?program=KODPROGRAM` (contoh: dalam group WhatsApp selepas program).
3. Peserta isi nama, IC, jabatan/organisasi, telefon (pilihan), penilaian bahagian A-D, cadangan dan soalan refleksi, kemudian tanda persetujuan PDPA.
4. Server simpan jawapan ke tab **Respon**, dan sijil terus keluar di skrin.
5. Peserta yang dah isi boleh muat turun semula sijil guna nama + IC yang sama. Ini masih berfungsi walaupun borang dah ditutup.
6. Bila QR pada sijil diimbas, pengesahan keluar dengan IC yang disembunyikan sebahagian (`XXXXXX-XX-5678`).

## Setup (lebih kurang 10 minit)

1. Buat Google Sheet baru, contohnya "Feedback & Sijil GNG".
2. **Extensions > Apps Script**.
3. Salin fail-fail ini ke dalam projek:
   - `Code.gs` ganti kandungan fail `Code.gs` yang sedia ada
   - `Index.html`: **+ > HTML**, namakan `Index`
   - `Verify.html`: **+ > HTML**, namakan `Verify`
   - `appsscript.json`: Project Settings > tandakan "Show appsscript.json", kemudian ganti kandungannya
4. Dalam `Code.gs`, ubah `CONFIG` (nama penandatangan, jawatan dan sebagainya). Soalan dah ikut e-BORANG PENILAIAN PROGRAM - PESERTA yang sedia ada.
5. Pilih fungsi `setupSheets` dan tekan **Run**. Benarkan permission bila diminta. Tab Program dan Respon akan dicipta.
6. Pilih `pasangTriggerRetention` dan tekan **Run** (ini memadam data lama secara automatik setiap bulan).
7. **Deploy > New deployment > Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Salin URL web app. Link untuk peserta ialah `URL?program=CONTOH01`.

Bila kod diubah selepas ini: **Deploy > Manage deployments > Edit > Version: New version**. Cara ini mengekalkan URL yang sama, jadi QR pada sijil lama masih berfungsi.

## Tambah program baru

Tambah satu baris dalam tab Program:

| Kod | Nama Program | Tarikh | Tempat | Aktif | Soalan Refleksi (pilihan) | Template Sijil (pilihan) |
|---|---|---|---|---|---|---|
| MBJB1026 | Bengkel Pemerkasaan Integriti melalui Penghayatan Solat Sempurna | 28 & 29 Oktober 2026 | Amari Hotel, Johor Bahru | ☑ | Bagaimana pengamalan ilmu solat ... | https://drive.google.com/file/d/.../view |

- Kod: huruf, nombor, `-` atau `_` sahaja, maksimum 30 aksara.
- Tarikh boleh dalam format tarikh (akan dicetak "15 November 2026") atau teks bebas seperti "15-16 November 2026".
- Soalan Refleksi: soalan terbuka khusus untuk program tu. Biarkan kosong kalau tak perlu.
- Template Sijil: link gambar sijil dari Canva yang disimpan dalam Google Drive (lihat bahagian bawah). Kalau kosong, sistem guna design sijil default.
- Nyahtanda **Aktif** untuk tutup borang. Peserta yang dah isi masih boleh muat turun sijil.

## Guna design Canva sebagai sijil

Sistem cetak **nama, IC dan QR pengesahan** sahaja. Benda lain (logo, nama program, anjuran, tarikh, tempat, tandatangan) datang dari design Canva.

1. Dalam Canva, buat salinan design sijil program (contoh: "Sijil MBJB Okt 2026").
2. Edit nama program, anjuran, tarikh dan tempat ikut program baru.
3. **Padam teks nama dan IC contoh.** Biarkan ruang tu kosong.
4. Share > Download > **JPG**, kualiti tinggi. Saiz A4 portrait macam design sekarang.
5. Upload JPG tu ke Google Drive akaun yang sama dengan pemilik Apps Script. Tak perlu share kepada orang lain.
6. Klik kanan fail > Share > Copy link, dan paste dalam lajur **Template Sijil** tab Program.

Posisi nama dan IC ditetapkan dalam `CONFIG.TEMPLATE_LAYOUT` (`Code.gs`). Nilai sekarang diukur dari design MBJB Okt 2026: nama di 36% tinggi muka surat, IC di 40%, dan QR di bawah sebelah kiri tandatangan. Selagi design baru kekalkan susunan yang sama, tak perlu ubah apa-apa. Kalau susunan berubah, ubah nilai `y` (0 = atas, 1 = bawah) dan test dengan satu respon.

Font nama dan IC ialah **Cinzel** (Google Fonts), yang paling hampir dengan font dalam design Canva tu. Kalau nak sama 100%, tukar font teks nama dalam Canva kepada Cinzel juga.

## Ubah soalan

Soalan disusun dalam `BAHAGIAN` (A Kandungan, B Penyampaian, C Fasilitator, D Keseluruhan) dengan skala `SKALA` (CEMERLANG hingga AMAT TIDAK MEMUASKAN), sama macam borang Google Form lama. Jawapan disimpan sebagai label teks, jadi data boleh digabung dengan Sheet respon lama. Untuk ubah, edit `BAHAGIAN`, `SKALA` atau `SOALAN_TEKS` dalam `Code.gs`. Lajur dalam tab Respon ikut susunan soalan, jadi:
- Ubah soalan **sebelum** ada respon masuk, ATAU
- Kalau dah ada data, rename tab Respon lama (contoh "Respon 2026") dan jalankan `setupSheets` sekali lagi untuk cipta tab baru.

## Keselamatan & PDPA

- **Jangan "Publish to Web"** Sheet ini dan jangan share Sheet kepada orang yang tak perlu. Data IC hanya keluar melalui fungsi dalam Code.gs.
- Notis privasi dan checkbox persetujuan wajib ditanda sebelum borang boleh dihantar. Sistem kumpul nama, IC, jabatan/organisasi, telefon (pilihan) dan jawapan. Tiada emel atau alamat.
- Input divalidate di server: format IC 12 digit, nama hanya huruf, rating 1-5, dan teks dilindungi daripada formula injection.
- Satu IC hanya boleh ada satu rekod untuk setiap program. Kalau IC yang sama cuba isi dengan nama lain, sistem akan tolak.
- Rate limit: maksimum 6 cubaan setiap IC dalam 10 minit.
- Fungsi admin (`setupSheets`, `padamDataLama`) hanya boleh dijalankan oleh pemilik dari editor, bukan dari web app.
- Data respon dipadam automatik selepas 24 bulan (`RETENTION_MONTHS`). Selepas data dipadam, QR untuk sijil itu akan papar "tidak dijumpai".

Risiko yang tinggal: sesiapa yang tahu nama + IC seseorang boleh muat turun sijil orang tu. Untuk sijil penyertaan biasa, risiko ini kecil. Kalau sijil digunakan untuk tujuan rasmi (contohnya kredit CPD), pertimbangkan pengesahan tambahan seperti OTP emel.

## Had yang perlu tahu

- Hanya IC Malaysia (12 digit). Peserta warga asing dengan pasport belum disokong.
- Sijil dilukis di browser peserta. Ia perlukan internet untuk muat font dan library (jsDelivr, Google Fonts).
- Kuota Apps Script akaun Gmail percuma cukup untuk ratusan peserta sehari. Untuk program yang sangat besar (beribu peserta dalam masa singkat), test dulu.
