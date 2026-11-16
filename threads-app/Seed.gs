/**
 * Pelan content 14 hari (42 post) — 3 slot sehari.
 *   Pagi 09:00     Ringan     : doa & zikir selepas solat (jarang diamalkan)
 *   Tengahari 13:00 Sederhana : kesalahan lazim dalam solat
 *   Malam 21:00    Berat      : fiqh solat lebih mendalam
 *
 * PENTING: Brief = sudut + rujukan untuk DISEMAK. Bukan teks final.
 * Semua lafaz doa, status hadith dan hukum mesti disemak ustaz sebelum status ditukar ke "Sedia".
 * Fokus mazhab Syafi'i (konteks Malaysia).
 */

const IMG_BASE = 'https://raw.githubusercontent.com/mrkhalaf92/gng/main/infografik-panel/';

const SEED_PAGI = [
  ['Istighfar 3x & "Allahumma antas salam"', 'Zikir pertama selepas salam. Ramai terus bangun. Rujukan: Sahih Muslim (hadith Thawban).'],
  ['Doa minta bantuan untuk zikir, syukur & ibadah', '"Allahumma a\'inni \'ala dzikrika wa syukrika wa husni \'ibadatik". Pesan Nabi kepada Mu\'adh supaya jangan tinggal. Rujukan: Sunan Abu Dawud, an-Nasa\'i.'],
  ['Ayat Kursi selepas solat fardhu', 'Kelebihan membaca Ayat Kursi selepas setiap solat fardhu. Rujukan: an-Nasa\'i (as-Sunan al-Kubra), hadith Abu Umamah. Semak status hadith.'],
  ['Tasbih 33, Tahmid 33, Takbir 33 + penutup', 'Ramai berhenti pada 99. Lafaz penutup "La ilaha illallah wahdahu..." genapkan 100. Rujukan: Sahih Muslim (Abu Hurairah).'],
  ['"Allahumma la mani\'a lima a\'thaita"', 'Zikir selepas solat yang Nabi baca. Makna: tiada yang boleh halang apa yang Allah beri. Rujukan: Sahih al-Bukhari & Muslim (al-Mughirah).'],
  ['Al-Mu\'awwidzat selepas setiap solat', 'Al-Ikhlas, Al-Falaq, An-Nas selepas solat — bukan hanya sebelum tidur. Rujukan: Sunan Abu Dawud (\'Uqbah bin \'Amir).'],
  ['Doa berlindung dari sifat pengecut & bakhil', 'Doa yang Sa\'d bin Abi Waqqas ajar anak-anaknya, dibaca di hujung solat. Rujukan: Sahih al-Bukhari.'],
  ['Doa selepas Subuh: ilmu, rezeki, amal', '"Allahumma inni as\'aluka \'ilman nafi\'an, wa rizqan thayyiban, wa \'amalan mutaqabbalan". Rujukan: Sunan Ibn Majah (Ummu Salamah).'],
  ['4 perkara dimohon perlindungan sebelum salam', 'Azab Jahannam, azab kubur, fitnah hidup & mati, fitnah Dajjal. Rujukan: Sahih Muslim (Abu Hurairah).'],
  ['Doa Ali sebelum salam', '"Allahummaghfirli ma qaddamtu wa ma akhkhartu..." Rujukan: Sahih Muslim (Ali bin Abi Talib).'],
  ['"Rabbi qini \'adzabaka"', 'Doa ringkas yang al-Bara\' dengar Nabi baca selepas solat. Rujukan: Sahih Muslim.'],
  ['Doa Abu Bakar: "Allahumma inni zhalamtu nafsi"', 'Nabi ajar Abu Bakar untuk dibaca dalam solat. Rujukan: Sahih al-Bukhari & Muslim.'],
  ['Tahlil 10x selepas Subuh & Maghrib', '"La ilaha illallah wahdahu... yuhyi wa yumit..." 10 kali. Rujukan: Sunan at-Tirmidhi. Semak status hadith.'],
  ['"Allahumma ajirni minan nar" 7x', 'Selepas Subuh & Maghrib. Rujukan: Sunan Abu Dawud. Status hadith dipertikai sebahagian ulama — wajib semak sebelum post.']
];

const SEED_TENGAHARI = [
  ['Takbiratul ihram: lafaz yang tak didengar sendiri', 'Mazhab Syafi\'i: bacaan rukun qauli perlu sekurang-kurangnya didengar diri sendiri. Plus cara angkat tangan.', '1-angkat-tangan.png'],
  ['Berdiri: mata melilau', 'Pandangan ke tempat sujud. Kaitkan dengan khusyuk.', '2-berdiri-tegak.png'],
  ['Rukuk tanpa tamakninah', 'Rukuk "patuk ayam". Tamakninah = rukun. Belakang rata.', '3-rukuk.png'],
  ['I\'tidal yang tak sempurna', 'Terus turun sujud sebelum tegak & tenang. I\'tidal ialah rukun.', '4-itidal.png'],
  ['Sujud: 7 anggota tak cecah', 'Hujung jari kaki terangkat, dahi berlapik songkok/tudung. Semak syarat dahi terdedah dalam mazhab Syafi\'i.', '5-sujud.png'],
  ['Duduk antara dua sujud terlalu laju', 'Tamakninah & doa "Rabbighfirli...". Ramai sekadar singgah.', '6-duduk-antara-dua-sujud.png'],
  ['Tahiyyat akhir: tertinggal selawat', 'Selawat ke atas Nabi dalam tahiyyat akhir ialah rukun dalam mazhab Syafi\'i.', '7-tahiyyat-akhir.png'],
  ['Salam: berpaling sebelum habis lafaz', 'Salam pertama rukun. Lafaz minimum yang sah.', '8-salam.png'],
  ['Mendahului imam', 'Bergerak sebelum imam. Beza mendahului, serentak dan mengikut. Implikasi kepada solat.', ''],
  ['Al-Fatihah terlalu laju', '14 sabdu dalam Al-Fatihah. Hilang sabdu boleh menjejaskan bacaan. Semak dengan guru tajwid.', ''],
  ['Saf tak lurus & tak rapat', 'Saranan meluruskan saf. Celah saf. Saf perempuan.', ''],
  ['Aurat terdedah ketika sujud', 'Baju terangkat di belakang, telekung nipis, kaki terdedah (perempuan).', ''],
  ['Banyak bergerak dalam solat', 'Pergerakan berturut-turut yang membatalkan (pandangan Syafi\'i: 3 gerakan besar berturut). Main telefon/jam.', ''],
  ['Masbuq: salah cara tambah rakaat', 'Bila dikira dapat rakaat (dapat rukuk bersama imam). Cara sambung selepas imam salam.', '']
];

const SEED_MALAM = [
  ['Syarat wajib vs syarat sah solat', 'Beza dua kategori syarat. Senarai ringkas + contoh kes.'],
  ['Perkara yang membatalkan solat', 'Senarai dalam mazhab Syafi\'i, dengan contoh situasi harian.'],
  ['Sujud sahwi: bila & bagaimana', 'Sebab-sebab sujud sahwi, kedudukan sebelum salam (Syafi\'i), kes terlupa tahiyyat awal.'],
  ['Jamak & qasar: syarat musafir', 'Jarak 2 marhalah, niat, tempoh. Anggaran jarak berbeza ikut fatwa negeri — rujuk jabatan mufti.'],
  ['Qada solat yang tertinggal', 'Hukum, cara qada, susunan, solat yang ditinggal bertahun.'],
  ['Solat dalam kenderaan & kapal terbang', 'Menghadap kiblat, berdiri, solat hormat waktu & keperluan ulang.'],
  ['Khusyuk: syarat sah atau kesempurnaan?', 'Pandangan ulama, praktikal untuk tingkatkan khusyuk.'],
  ['Niat: lafaz "usolli" vs niat dalam hati', 'Tempat niat, hukum melafaz dalam mazhab Syafi\'i, isu was-was.'],
  ['Makmum baca Al-Fatihah?', 'Perbezaan mazhab. Pegangan Syafi\'i dalam solat jahar & sirr.'],
  ['Solat berjemaah: hukum & 27 darjat', 'Hukum dalam mazhab Syafi\'i, kelebihan, uzur meninggalkan jemaah.'],
  ['Waktu solat & waktu tahrim', 'Waktu-waktu dilarang solat sunat mutlak & pengecualian.'],
  ['Hukum meninggalkan solat', 'Perbahasan ulama tentang orang yang meninggalkan solat. Nada mengajak, bukan menghukum.'],
  ['Solat orang sakit', 'Duduk, baring, isyarat. Tayammum. Solat di hospital.'],
  ['Teringat ada najis selepas solat', 'Sah atau perlu ulang? Pandangan mazhab Syafi\'i & kes terlupa.']
];

function seedContent_() {
  const sh = sheet_(SHEETS.CONTENT);
  if (sh.getLastRow() > 1) return; // dah ada data, jangan tindih
  const h = SHEETS.CONTENT.headers;
  const now = new Date();
  const rows = [];
  for (let d = 0; d < 14; d++) {
    rows.push(makeSeedRow_(h, now, 'Pagi', SEED_PAGI[d][0], 'Doa & Zikir Selepas Solat', SEED_PAGI[d][1], ''));
    rows.push(makeSeedRow_(h, now, 'Tengahari', SEED_TENGAHARI[d][0], 'Kesalahan Lazim ' + (d + 1) + '/14',
      SEED_TENGAHARI[d][1], SEED_TENGAHARI[d][2] ? IMG_BASE + SEED_TENGAHARI[d][2] : ''));
    rows.push(makeSeedRow_(h, now, 'Malam', SEED_MALAM[d][0], 'Fiqh Solat', SEED_MALAM[d][1], ''));
  }
  sh.getRange(2, 1, rows.length, h.length).setValues(rows);
}

function makeSeedRow_(h, now, slot, topik, siri, brief, img) {
  const o = {
    ID: Utilities.getUuid(), Status: 'Draf', Topik: topik, Siri: siri, Teks: '', ImageURL: img,
    Catatan: 'Tulis kapsyen & semak ustaz', Dikemaskini: now,
    Slot: slot, Tahap: slotDef_(slot).tahap, Brief: brief
  };
  return h.map(k => k in o ? o[k] : '');
}
