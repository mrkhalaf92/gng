/**
 * Kempen "Dah Lama Solat, Pernah Semak?": Siri 1 (hari 1-10, 30 post) + Siri 2 Lanjutan (hari 11-18, 24 post).
 * Sumber: ebook Geng Ngaji Global, Edisi Pertama Nov 2026 (mazhab Syafie, rujukan Mughni al-Muhtaj).
 * Hala tuju: Bengkel Usolli, Sabtu 28/11/2026.
 *
 * Aliran slot:
 *   Pagi      = kuiz Betul/Salah (jawapan esok pagi) + bacaan ringkas
 *   Tengahari = kesalahan lazim
 *   Malam     = perkara wajib, sunat & kaedah (lebih berat)
 *
 * Format: [hari, slot, topik, teks]. Teks maksimum 500 aksara (had Threads).
 */
const KEMPEN_SIRI = 'Semak Solat';

const KEMPEN = [
  // ---------------- HARI 1 ----------------
  [1, 'Pagi', 'Kuiz 1: Sujud tanpa niat', `Kuiz pagi. Jawab Betul atau Salah dekat reply.

Sujud tetap sah walaupun badan turun ke lantai bukan dengan niat untuk sujud.

Jangan google dulu. Jawapan esok pagi, waktu yang sama.`],
  [1, 'Tengahari', '181 daripada 2,500', `Kami dah semak bacaan Al-Fatihah lebih 2,500 orang dewasa.

Yang lulus pada cubaan pertama? 181 orang. Kurang 1 dalam 10.

Mereka bukan orang yang tak solat. Ramai dah jaga solat sejak kecil. Cuma tak pernah ada orang semak semula.

Kalau bacaan yang kita ulang 17 kali sehari pun boleh tersalah tanpa sedar, pergerakan solat macam mana pula?

10 hari ni kita semak 3 bahagian: sujud, duduk antara dua sujud dan tertib.`],
  [1, 'Malam', 'Dua jenis kesalahan: wajib & sunat', `Sebelum semak solat, kena tahu dulu ada dua jenis kesalahan.

WAJIB: menjejaskan sah solat. Contohnya perut jari kaki tak sentuh lantai masa sujud, tinggal rukun, buat rukun bukan pada tempatnya, tak tomakninah.

SUNAT: solat tetap sah tapi kurang sempurna. Contohnya tinggal bacaan dalam sujud, tak duduk iftirasy. Tinggal sunat ab'adh atau hai'ah hukumnya makruh.

Jadi betulkan yang WAJIB dulu, baru sempurnakan yang SUNAT.`],

  // ---------------- HARI 2 ----------------
  [2, 'Pagi', 'Jawapan 1 + Kuiz 2: Jari kaki', `Jawapan kuiz semalam: SALAH.

Sujud wajib ada qasad, maksudnya turun memang untuk sujud. Kalau turun sebab tujuan lain atau tanpa tujuan, sujud tak sah.

Kuiz hari ni, Betul atau Salah:
Jari kaki yang terangkat ketika sujud tidak menjejaskan sujud.

Reply jawapan anda. Esok pagi kita bongkar.`],
  [2, 'Tengahari', '3 kesalahan wajib dalam sujud', `3 kesalahan sujud yang boleh jejaskan sah solat:

1. Hidung je yang kena lantai, dahi langsung tak sentuh tempat sujud.
2. Terus bangun sebaik dahi cecah lantai. Tak berhenti langsung, jadi tiada tomakninah.
3. Jari kaki terangkat atau kaki dilunjurkan sampai perut jari kaki tak sentuh lantai (menurut pendapat Imam An-Nawawi).

Kita sujud 34 kali sehari dalam solat fardu. Satu tabiat salah, berulang 34 kali sehari.`],
  [2, 'Malam', '3 perkara wajib sujud & dua pendapat', `Sujud ada 3 perkara WAJIB:
1. Letak anggota sujud.
2. Tomakninah. Semua anggota berhenti serentak, sekadar tiga saat.
3. Qasad. Turun memang untuk sujud.

Pasal anggota sujud ada dua pendapat. Sebahagian ulama kata cukup sebahagian dahi menyentuh dan punggung lebih tinggi dari kepala. Salah satu pendapat Imam An-Nawawi: letak ketujuh-tujuh anggota.

Masyarakat Malaysia umumnya pegang pendapat An-Nawawi. Jadi ketujuh-tujuhnya wajib menyentuh.`],

  // ---------------- HARI 3 ----------------
  [3, 'Pagi', 'Jawapan 2 + Kuiz 3: Rukun ke berapa', `Jawapan kuiz semalam: SALAH.

Menurut pendapat Imam An-Nawawi, jari kaki terangkat bermakna dua daripada tujuh anggota sujud tak menyentuh lantai.

Kuiz hari ni, Betul atau Salah:
Duduk antara dua sujud ialah rukun solat.

Reply B atau S.`],
  [3, 'Tengahari', 'Dahi tertutup telekung & ketayap', `Yang pakai telekung, ketayap atau songkok, yang ni untuk kita.

Letak sebahagian dahi je dengan sengaja tanpa uzur, contohnya dahi separuh tertutup telekung atau ketayap, hukumnya MAKRUH. Begitu juga tak letak hidung tanpa uzur.

Amalan mudah sebelum solat. Wanita: tarik telekung sikit ke atas. Lelaki: pastikan ketayap atau songkok tak tutup dahi. Biar seluruh dahi terbuka.`],
  [3, 'Malam', 'Tujuh anggota sujud', `Tujuh anggota sujud dan kadar yang memadai:

1. Dahi: sebahagian dahi
2-3. Tapak tangan kanan dan kiri: sebahagian perut tapak tangan
4-5. Lutut kanan dan kiri: sebahagian lutut
6-7. Jari kaki kanan dan kiri: sebahagian perut jari kaki

Perhati nombor 6 dan 7. Yang mesti sentuh lantai ialah perut jari kaki, bahagian bawahnya. Bukan belakang jari, bukan hujung kuku.

Sunatnya, letak semua perut jari kaki dan halakan hujung jari ke kiblat.`],

  // ---------------- HARI 4 ----------------
  [4, 'Pagi', 'Jawapan 3 + Kuiz 4: Kepala terangkat', `Jawapan kuiz semalam: BETUL.

Duduk antara dua sujud ialah rukun ke-8 solat.

Kuiz hari ni, Betul atau Salah:
Selagi kepala dah terangkat dari lantai, duduk antara dua sujud dah sempurna.

Yang ni ramai tersilap. Reply jawapan anda.`],
  [4, 'Tengahari', 'Sujud sah belum tentu sempurna', `Sujud yang sah belum tentu sujud yang sempurna. 3 perkara sunat yang ramai terlepas:

1. Dahi sekadar mencecah, kepala tak diberatkan ke tempat sujud.
2. Lengan dihampar rata di lantai. Sepatutnya siku diangkat, lelaki dan wanita.
3. Tapak tangan jauh ke depan kepala atau jari terbuka luas. Sunatnya tapak tangan setentang bahu, jari rapat, dihalakan ke kiblat.

Solat tetap sah, tapi pahala sunat tu kita tinggalkan.`],
  [4, 'Malam', 'Cara turun sujud yang sunat', `Cara turun sujud yang sunat:

1. Bertakbir masa mula turun, panjangkan sampai ke sujud.
2. Letak dua lutut dulu.
3. Kemudian dua tapak tangan.
4. Kemudian dahi dan hidung serentak. Dahi rukun, hidung sunat.

Dalam sujud: dua kaki dijarakkan sekadar sejengkal, hujung jari kaki ke kiblat. Lelaki jauhkan siku dari rusuk dan perut dari paha. Wanita rapatkan anggota.

Baca tasbih sujud tiga kali.`],

  // ---------------- HARI 5 ----------------
  [5, 'Pagi', 'Jawapan 4 + Kuiz 5: Terlupa sujud', `Jawapan kuiz semalam: SALAH.

Kepala terangkat belum cukup. Mesti benar-benar duduk dan tenang seketika.

Kuiz hari ni, Betul atau Salah:
Kalau terlupa satu sujud dan teringat masa dah berdiri di rakaat berikutnya, memadai sujud sahwi di hujung solat.

Fikir betul-betul. Reply B atau S.`],
  [5, 'Tengahari', 'Rukun yang paling mudah hilang', `Duduk antara dua sujud cuma beberapa saat. Sebab pendek, inilah rukun yang paling mudah hilang.

Dua kesalahan wajib yang paling lazim:

1. Kepala terangkat dari sujud pertama, terus turun sujud kedua. Nampak macam duduk, tapi tak berhenti langsung.
2. Separuh bangkit. Badan masih membongkok, belum duduk, terus sujud semula.

Kita buat rukun ni 17 kali sehari. Kalau tomakninah hilang sebab tabiat, ia berulang 17 kali sehari.`],
  [5, 'Malam', 'Duduk antara dua sujud: 3 wajib', `Duduk antara dua sujud ialah rukun ke-8. Tiga perkara WAJIB:

1. Duduk. Apa cara pun duduk, memadai untuk sah.
2. Tomakninah. Berhenti seketika sampai semua anggota tenang.
3. Bangkit memang untuk rukun ni, tiada tujuan lain.

Berapa lama tomakninah? Ukuran mudah: sempat sebut "subhanallah" sekali lepas badan betul-betul duduk.

Kalau kepala masih naik masa anda dah mula turun semula, tomakninah belum berlaku.`],

  // ---------------- HARI 6 ----------------
  [6, 'Pagi', 'Jawapan 5 + Kuiz 6: Ragu selepas salam', `Jawapan kuiz semalam: SALAH.

Bila teringat tertinggal sujud sebelum sampai ke sujud rakaat berikutnya, wajib segera turun dan buat sujud yang tertinggal. Sujud sahwi sahaja tak memadai.

Kuiz terakhir, Betul atau Salah:
Keraguan tentang rukun yang datang selepas salam tidak perlu dilayan.

Reply B atau S.`],
  [6, 'Tengahari', 'Duduk terlalu lama pun salah', `Kesalahan duduk antara dua sujud yang jarang orang sebut: terlalu lama.

Ia rukun pendek. Sengaja berlama-lama melebihi kadarnya pun satu kesalahan. Baca doanya sekali dengan tenang, kemudian sujud.

Dua lagi kesalahan pada perkara sunat:
1. Duduk atas dua tumit yang ditegakkan atau melunjurkan kaki tanpa uzur. Sunatnya duduk iftirasy.
2. Angkat tangan masa takbir bangkit dari sujud. Tangan tak diangkat di sini.`],
  [6, 'Malam', 'Duduk iftirasy & tips kaki kanan', `Duduk iftirasy: duduk atas buku lali kaki kiri yang dilintangkan, kaki kanan ditegakkan dengan perut jari kaki ke kiblat.

Ada yang kata tak mampu lipat jari kaki kanan. Sebenarnya lipatan tu dah berlaku masa sujud.

Tips ustaz kami: kekalkan kaki kanan dari sujud, jangan alih. Bila bangkit untuk duduk, kaki kiri sahaja yang bergerak dan dilintangkan.

Tapak tangan atas peha hampir dengan lutut, jari rapat dan dihalakan ke kiblat.`],

  // ---------------- HARI 7 ----------------
  [7, 'Pagi', 'Jawapan 6 + tasbih sujud', `Jawapan kuiz semalam: BETUL.

Ragu selepas salam tak menjejaskan solat dan tak perlu dilayan. Kalau ragu masa masih dalam solat, rukun tu dianggap belum dibuat. Kembali dan buat.

Berapa markah anda untuk 6 kuiz ni? Kongsi dekat reply.

Bacaan dalam sujud, tiga kali:
Subhana rabbiyal a'la wa bihamdih.
Maha Suci Tuhanku Yang Maha Tinggi, dan dengan memuji-Nya.`],
  [7, 'Tengahari', 'Makmum takbir sambil turun rukuk', `Kesalahan tertib yang selalu jadi masa solat berjemaah: makmum terlewat, terus bertakbir sambil turun rukuk.

Takbiratul ihram mesti dilafaz dalam keadaan berdiri. Takbir yang habis masa badan dah membongkok tak sah sebagai takbiratul ihram.

Sama dengan Al-Fatihah. Jangan mula sebelum habis takbir, dan jangan habiskan sambil turun rukuk. Al-Fatihah dibaca dalam keadaan berdiri.`],
  [7, 'Malam', 'Tertib: rukun yang mengikat semua', `Tertib ialah rukun ke-13. Tiada gerakan, tiada bacaan sendiri, tapi dia yang ikat 12 rukun lain.

Yang WAJIB:
1. Setiap rukun ikut susunan. Rukuk sebelum sujud, tahiyat akhir sebelum salam.
2. Niat hadir bersama takbiratul ihram.
3. Al-Fatihah dibaca masa berdiri.
4. Selawat dibaca lepas tahiyat, dalam keadaan duduk.
5. Rukun pendek tak dipanjangkan.

Sengaja buat rukun perbuatan sebelum tempatnya, contoh sujud sebelum rukuk, solat batal.`],

  // ---------------- HARI 8 ----------------
  [8, 'Pagi', 'Saat paling dekat dengan Allah', `"Saat paling dekat seorang hamba dengan Tuhannya ialah ketika dia sujud." (Hadis riwayat Muslim)

Kita sujud 34 kali sehari dalam solat fardu. 34 peluang untuk paling dekat dengan Allah.

Hari ni cuba berhenti sekejap dalam setiap sujud. Rasa ketujuh-tujuh anggota menyentuh lantai.`],
  [8, 'Tengahari', 'Salam awal, was-was & ulang rukun', `Tiga lagi kesalahan berkaitan tertib:

1. Bagi salam sebelum habis baca selawat.
2. Terus salam bila teringat tertinggal rukun, tanpa kembali sempurnakan.
3. Layan was-was dengan ulang rukun yang dah pasti dibuat.

Yang ketiga ramai tak sedar. Kalau dah pasti buat, jangan ulang. Kalau betul-betul ragu masa dalam solat, anggap belum buat dan kembali buat. Ragu selepas salam, tak perlu dilayan.`],
  [8, 'Malam', 'Terlupa satu rukun: satu soalan', `Terlupa satu rukun. Tanya satu soalan: dah sampai ke rukun yang SAMA dalam rakaat berikutnya?

BELUM: kembali segera, buat rukun yang tertinggal, teruskan dari situ.

SUDAH: rukun tu ganti yang tertinggal. Perbuatan di antaranya tak dikira. Tambah satu rakaat di hujung.

Kedua-duanya sunat sujud sahwi sebelum salam.

Kaedah ni untuk solat bersendirian. Makmum ada hukum berbeza, tanya guru.`],

  // ---------------- HARI 9 ----------------
  [9, 'Pagi', 'Doa lapan permintaan', `Doa duduk antara dua sujud. Lapan permintaan dalam beberapa saat:

Rabbighfirli, warhamni, wajburni, warfa'ni, warzuqni, wahdini, wa 'afini, wa'fu 'anni.

Wahai Tuhanku, ampunilah aku, rahmatilah aku, cukupkanlah kekuranganku, angkatlah darjatku, berilah aku rezeki, berilah aku petunjuk, sihatkanlah aku, dan maafkanlah aku.

Bila faham maknanya, kita tak tergesa-gesa lagi. Tomakninah datang sendiri.`],
  [9, 'Tengahari', 'Rakam solat dari sisi', `Satu cara mudah tengok solat sendiri dengan jujur: rakam.

Letak telefon di sisi sejadah, bukan depan, supaya nampak seluruh badan dari tepi. Rakam solat sunat dua rakaat. Tonton semula.

Ramai terkejut tengok betapa laju mereka bangun dari sujud. Atau macam mana kaki mereka sebenarnya masa sujud.

Rakaman tu untuk anda je. Lepas tengok, boleh padam.`],
  [9, 'Malam', 'Contoh kes terlupa rukun', `Contoh kes terlupa rukun (solat bersendirian):

1. Terlupa sujud kedua rakaat pertama, teringat masa berdiri rakaat kedua. Turun segera, duduk antara dua sujud, sujud, teruskan.

2. Sama, tapi teringat masa sujud rakaat kedua. Sujud ni lengkapkan rakaat pertama. Tambah satu rakaat di hujung.

3. Terbaca selawat sebelum tahiyat. Solat tak batal, tapi selawat tak dikira. Baca tahiyat, ulang selawat.

Sunat sujud sahwi sebelum salam.`],

  // ---------------- HARI 10 ----------------
  [10, 'Pagi', 'Kad saku 3 semakan', `Kad saku 3 semakan. Screenshot dan simpan.

SUJUD: 7 anggota sentuh lantai (pendapat An-Nawawi). Tomakninah 3 saat. Turun memang untuk sujud.

DUDUK ANTARA DUA SUJUD: benar-benar duduk. Tenang sekadar "subhanallah". Doa lapan permintaan. Baru sujud kedua.

TERTIB: ikut susunan 13 rukun. Terlupa rukun, buat segera atau tambah satu rakaat di hujung. Sujud sahwi sebelum salam.`],
  [10, 'Tengahari', 'Segan nak tanya pasal solat', `Ramai orang dewasa segan nak tanya pasal solat. Takut dianggap jahil. Takut kena tanya "kenapa baru sekarang?"

Bertanya tentang ibadah tak pernah memalukan.

Kata seorang peserta bengkel kami: "Kami assume kami pandai. Assume kami dah tahu."

Solat kita belajar masa sekolah rendah. Gajet pun kita update selalu. Solat, bila kali terakhir disemak?`],
  [10, 'Malam', 'Bengkel Usolli 28/11', `3 rukun dah kita semak: sujud, duduk antara dua sujud, tertib. Ada 10 lagi, termasuk Al-Fatihah, takbir, rukuk dan tahiyat.

Yang tu tak cukup belajar dari post. Kena ada guru yang tengok gerakan dan dengar bacaan.

Bengkel Usolli: Bimbingan Asas Solat Sempurna
Sabtu 28/11/2026, 8.30 pagi hingga 4.30 petang
Surau Al-Amirin, Sek. 4, Bandar Baru Bangi
RM125 (asal RM250), bersemuka sahaja

WhatsApp Ustaz Sufyan: 014-7423401`],
  // =====================================================================
  // SIRI 2 (Hari 11-18): isi ebook yang belum digunakan. Evergreen, tiada tarikh.
  // =====================================================================

  // ---------------- HARI 11 ----------------
  [11, 'Pagi', 'Kata peserta: Betul tak betul solat kita?', `"Betul tak betul solat kita, kalau kita tak belajar?"

Soalan seorang peserta Picnic Ngaji kami, Mac 2023.

Soalan ringkas, tapi berat. Solat kita ambil masa sekolah rendah. Lepas tu jarang ada siapa semak semula.

Bila kali terakhir solat anda disemak oleh guru secara langsung?`],
  [11, 'Tengahari', 'Tabiat: kekuatan & kelemahan', `Cuba ingat macam mana kita belajar solat. Tengok ibu atau ayah, ikut di belakang, belajar sikit di sekolah agama. Beberapa tahun kemudian, solat jadi gerakan yang kita buat tanpa fikir.

Itu kekuatan amalan berulang: ia jadi tabiat.

Itu juga kelemahannya. Kesalahan kecil yang kita belajar masa kecil ikut jadi tabiat, lalu kita bawa sepanjang hayat tanpa sedar.

Perkara yang kita buat setiap hari ialah perkara yang paling jarang kita periksa.`],
  [11, 'Malam', '13 rukun solat ikut susunan', `13 rukun solat ikut susunan dalam mazhab Syafie:

1. Niat
2. Takbiratul ihram
3. Berdiri (bagi yang mampu)
4. Membaca Al-Fatihah
5. Rukuk
6. I'tidal
7. Sujud dua kali
8. Duduk antara dua sujud
9. Duduk tahiyat akhir
10. Bacaan tahiyat akhir
11. Selawat ke atas Nabi
12. Salam pertama
13. Tertib

Sesetengah kitab kira tomakninah sebagai rukun berasingan, jadi bilangannya lebih dari 13. Isinya tetap sama.

Boleh sebut semua tanpa tengok?`],

  // ---------------- HARI 12 ----------------
  [12, 'Pagi', 'Amalan pertama yang dihisab', `Para ulama selalu ingatkan, solat ialah amalan pertama yang akan dihisab pada hari akhirat. Kalau solat seseorang baik, baiklah amalan yang lain.

Peringatan ni bukan untuk menakutkan. Ia untuk letak keutamaan.

Banyak benda dalam hidup kita dah upgrade. Solat kita pula masih gred yang sama?`],
  [12, 'Tengahari', 'Kenapa sujud, duduk & tertib', `Kenapa kami pilih sujud, duduk antara dua sujud dan tertib untuk disemak dulu?

Sujud: dibuat 34 kali sehari dalam solat fardu. Kesalahan dahi dan kaki sangat lazim.

Duduk antara dua sujud: rukun pendek, sebab tu paling kerap hilang tomakninah.

Tertib: rukun yang ikat semua rukun lain. Bila tertib terganggu, ramai tak tahu cara betulkan.

Ketiga-tiganya juga paling banyak ditanya dalam platform Geng Ngaji Global.`],
  [12, 'Malam', 'Bacaan di tempat salah & melambatkan', `Dua kaedah tertib yang ramai tak tahu:

1. Rukun bacaan (selain salam) yang dibaca bukan pada tempatnya tak batalkan solat, tapi tak dikira sebagai rukun. Ia mesti diulang di tempat yang sepatutnya.

2. Bila dah teringat tertinggal satu rukun, wajib buat dengan segera. Sengaja melambatkannya selepas teringat boleh membatalkan solat.

Jadi bila teringat, jangan tangguh. Terus betulkan.`],

  // ---------------- HARI 13 ----------------
  [13, 'Pagi', 'Kata peserta: kurang tepat', `"Selama ni perbuatan solat kita tu kurang tepat."

Kata seorang peserta bengkel solat kami, Okt 2026.

Ramai yang dah lama solat menyangka sujud mereka dah betul. Bila ustaz tengok, baru nampak.

Gerakan yang kita sangka betul hanya nampak salahnya bila ada orang yang memerhati.`],
  [13, 'Tengahari', 'Semak diri: sujud', `Semak diri: SUJUD. Jawab dengan jujur, paling baik lepas tengok rakaman solat sendiri.

1. Dahi sentuh tempat sujud, seluruh dahi diletak (tak separuh tertutup telekung atau ketayap)?
2. Perut jari kedua-dua kaki sentuh lantai sepanjang sujud?
3. Turun memang dengan niat untuk sujud?
4. Punggung lebih tinggi dari kepala, ketujuh-tujuh anggota sentuh lantai?
5. Semua anggota berhenti serentak sekadar tiga saat?
6. Siku terangkat dari lantai?

Berapa "ya" anda?`],
  [13, 'Malam', 'Kes: tertinggal sujud dalam Zohor', `Kes: solat Zohor. Masa duduk tahiyat akhir, anda teringat tertinggal satu sujud pada rakaat ketiga.

Anda dah lepas sujud rakaat keempat. Maksudnya dah sampai rukun yang sama dalam rakaat berikutnya.

Jadi rakaat keempat lengkapkan rakaat ketiga. Bangun, sempurnakan satu rakaat lagi, kemudian tahiyat akhir dan salam.

Sunat sujud sahwi sebelum salam.

Kaedah ni untuk solat bersendirian. Makmum ada hukum berbeza, tanya guru.`],

  // ---------------- HARI 14 ----------------
  [14, 'Pagi', 'Satu semakan sehari', `Nak semak solat tapi tak tahu mula dari mana?

Satu semakan sehari dah memadai. Baca selepas Subuh atau Isyak, kemudian amalkan dalam solat hari itu juga.

Empat langkah:
1. Baca satu semakan.
2. Rakam solat dari sisi.
3. Banding dengan rajah, isi kad semak.
4. Yang belum pasti, bawa kepada guru.

Lebih kurang 10 minit sehari.`],
  [14, 'Tengahari', 'Semak diri: duduk antara dua sujud', `Semak diri: DUDUK ANTARA DUA SUJUD.

1. Badan benar-benar duduk tegak sebelum sujud kedua?
2. Berhenti seketika dalam keadaan duduk sampai anggota tenang?
3. Kaki kanan tegak, perut jari kaki menghala kiblat?
4. Tapak tangan atas peha, hampir dengan lutut?
5. Baca doa duduk antara dua sujud dan faham maksudnya?

Amalan hari ni: baca doa lapan permintaan dengan perlahan, satu permintaan satu nafas.`],
  [14, 'Malam', 'Ragu dalam solat: kaedahnya', `Ragu sama ada dah buat satu rukun atau belum. Apa hukumnya?

Masih dalam solat: rukun yang diragui dianggap belum dibuat. Kembali dan buat.

Dah salam: keraguan tu tak menjejaskan solat dan tak perlu dilayan.

Butiran terlupa rukun bergantung pada bila ia disedari, dan sama ada anda imam, makmum atau solat bersendirian. Kaedah di atas untuk solat bersendirian. Makmum yang terlupa rukun ada hukum berbeza, tanyakan kepada guru.`],

  // ---------------- HARI 15 ----------------
  [15, 'Pagi', 'Kata peserta: seorang demi seorang', `"Ustaz tu akan kaji setiap bacaan kami, seorang demi seorang."
Peserta Bengkel Usolli, Apr 2026

"Saya dapat kesedaran daripada kesilapan yang banyak saya lakukan."
Peserta Bengkel Usolli, Feb 2026

Belajar dari buku dan post ialah permulaan. Disemak oleh guru, itu yang betulkan.`],
  [15, 'Tengahari', 'Semak diri: tertib', `Semak diri: TERTIB.

1. Boleh sebut 13 rukun solat ikut susunan?
2. Habis lafaz takbiratul ihram dalam keadaan berdiri, termasuk masa jadi makmum yang terlewat?
3. Baca Al-Fatihah sepenuhnya masa berdiri, sebelum mula rukuk?
4. Tahu apa nak buat bila teringat tertinggal satu rukun?
5. Tak layan keraguan selepas salam?

Amalan hari ni: dalam setiap solat, ambil sejenak untuk beri tumpuan pada setiap rukun. Ia perlahankan solat.`],
  [15, 'Malam', 'Sunat duduk antara dua sujud', `Perkara SUNAT dalam duduk antara dua sujud:

1. Bertakbir masa bangkit dari sujud, tanpa angkat tangan.
2. Duduk iftirasy: atas kaki kiri yang dihampar, kaki kanan ditegakkan, perut jari kaki ke kiblat.
3. Dua tapak tangan atas peha hampir ke lutut, hujung jari selari lutut, jari rapat dan dihalakan ke kiblat.
4. Baca doa duduk antara dua sujud.

Yang wajib hanya tiga: duduk, tomakninah, bangkit memang untuk rukun ini. Yang sunat ni menyempurnakannya.`],

  // ---------------- HARI 16 ----------------
  [16, 'Pagi', 'Tonton: kaki yang sujud', `Kaki yang sujud pun ada ilmunya.

Video ni dah ditonton lebih 100 ribu kali. Ustaz tunjuk bahagian kaki mana yang sebenarnya sujud.

https://www.tiktok.com/@gengngajiglobal/video/7336473662880517394

Tengok, kemudian semak kaki anda dalam solat seterusnya.`],
  [16, 'Tengahari', 'Sunat tapak tangan masa sujud', `Tiga sunat tapak tangan masa sujud yang ramai tak perasan:

1. Tekan tapak tangan ke lantai supaya seluruh tapak tangan dan bawah jari lekat.
2. Jangan alas tapak tangan dengan kain yang dipakai.
3. Tapak tangan setentang bahu, jari rapat dan dihalakan ke kiblat.

Satu lagi: untuk memberatkan kepala masa sujud, tak perlu tekan hujung jari kaki ke lantai.`],
  [16, 'Malam', 'Kad Semak Berskor', `Kad Semak Berskor. Tanda yang jelas betul dalam rakaman solat anda. Tak jelas? Tulis "BP".

SUJUD
1. Seluruh dahi sentuh tempat sujud
2. Perut jari kedua-dua kaki sentuh lantai
3. Seluruh tapak tangan sentuh lantai, jari rapat
4. Berhenti seketika dalam setiap sujud

DUDUK
5. Benar-benar duduk tegak sebelum sujud kedua
6. Berhenti dan tenang seketika
7. Baca doanya dan faham maksud

TERTIB
8. Boleh sebut 13 rukun ikut susunan
9. Tahu cara bila tertinggal rukun
10. Tak layan ragu selepas salam`],

  // ---------------- HARI 17 ----------------
  [17, 'Pagi', 'Tonton: makna doa duduk antara dua sujud', `Hampir 180 ribu orang dah tonton video ni. Ustaz kami terangkan doa duduk antara dua sujud, satu permintaan demi satu.

"Rabbi, ighfirli." Wahai Tuhanku, ampunkan dosaku.

https://www.tiktok.com/@gengngajiglobal/video/7431106122578185490

Lapan permintaan dalam satu duduk yang singkat. Bila faham, kita tak tergesa-gesa lagi.`],
  [17, 'Tengahari', 'Bacaan sunat di tempat yang salah', `Doa iftitah selepas takbir. Tasbih masa rukuk dan sujud. Doa duduk antara dua sujud masa duduk.

Setiap bacaan sunat ada tempatnya.

Kalau terbaca di tempat yang salah, solat tak batal. Tapi pahala sunat tu tak diperoleh di tempat tersebut.

Jadi bukan sekadar baca. Baca di tempat yang betul.`],
  [17, 'Malam', 'Cara baca skor kad semak', `Dah isi Kad Semak Berskor? Ini cara baca skor anda:

10/10: ulang semakan selepas tujuh hari, dan ajak seorang ahli keluarga semak bersama.
7-9: ulang bahagian yang belum ditanda.
6 ke bawah: semak bersama guru.

Apa pun skor, perkara "belum pasti" jangan diteka. Bawa kepada guru.

Kad ni alat semakan kendiri, bukan pengesahan sah solat oleh guru.`],

  // ---------------- HARI 18 ----------------
  [18, 'Pagi', 'Tonton: cara sujud sahwi', `Lebih 200 ribu tontonan. Ustaz kami terangkan cara-cara sujud sahwi.

https://www.tiktok.com/@gengngajiglobal/video/7102241112298966299

Sujud sahwi ni banyak kaitan dengan tertib. Bila terlupa satu rukun dan dah betulkan, disunatkan sujud sahwi sebelum salam.`],
  [18, 'Tengahari', 'Al-Fatihah perlu didengar guru', `Ada bahagian solat yang memang tak boleh belajar dari buku atau post semata-mata.

Bacaan Al-Fatihah, contohnya, mesti didengar dan disemak oleh guru.

Begitu juga takbir, rukuk dan tahiyat. Guru perlu tengok gerakan dan dengar bacaan anda.

Walaupun dah lama solat, ada lagi yang perlu dibetulkan. Seorang peserta kelas kami cakap: "Walaupun kita dah lama melakukan solat... dia membetulkan lagi bacaan kita."`],
  [18, 'Malam', 'Tiga semakan selesai, sepuluh lagi', `Tiga semakan dah selesai: sujud yang kita ulang 34 kali sehari, duduk antara dua sujud yang paling mudah hilang tomakninahnya, dan tertib yang ikat semua rukun.

Satu rukun yang dibaiki hari ini dibawa ke setiap solat selepasnya.

Sepuluh rukun lagi menunggu. Itu yang kami bimbing secara bersemuka dalam kelas dan bengkel Geng Ngaji Global, supaya guru boleh tengok gerakan dan dengar bacaan anda.

Nak tahu kelas berikutnya? Reply "KELAS".`]
];

function kempenRows_(h, now) {
  return KEMPEN.map(k => {
    const o = {
      ID: Utilities.getUuid(), Status: 'Draf', Topik: k[2], Siri: (k[0] <= 10 ? KEMPEN_SIRI : KEMPEN_SIRI + ' Lanjutan') + ' · Hari ' + k[0] + (k[0] <= 10 ? '/10' : '/18'),
      Teks: k[3], ImageURL: '', Catatan: 'Dari ebook. Semak, kemudian tukar ke Sedia', Dikemaskini: now,
      Slot: k[1], Tahap: slotDef_(k[1]).tahap, Brief: 'Sumber: ebook "Dah Lama Solat, Pernah Semak?" (GNG, Nov 2026)'
    };
    return h.map(key => key in o ? o[key] : '');
  });
}
