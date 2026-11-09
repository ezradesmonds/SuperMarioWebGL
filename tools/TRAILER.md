# Mushroom Kingdom — trailer

## Animasi karakter dengan kamera bebas

Di halaman utama, **Z** mengaktifkan koreografi sekitar 110 detik berdasarkan urutan adegan `assets/videos/mushroom-kingdom-trailer.mp4`. Animasi diatur oleh `js/character-film.js`, menggunakan karakter dan environment proyek secara langsung. Karakter hanya ditampilkan saat hadir dalam adegannya, tanpa teks, audio, atau kamera otomatis. Kontrol orbit, pan, dan zoom tetap aktif. Adegan berulang setelah selesai; **Z** mematikannya dan mengembalikan mode tampilan sebelumnya beserta visibilitas semua karakter.

| Waktu | Karakter yang tampil |
|---|---|
| 0–15 dtk | Toad |
| 15–34 dtk | Toad dan Bowser Jr. |
| 34–110 dtk | Ketiga karakter; Toad tetap tampil saat Yoshi keluar dari pipe |

Pada pergantian adegan, posisi dan pose dihitung dari waktu animasi saat itu sehingga karakter muncul sesuai adegan, termasuk ketika timeline berulang.

Urutan Yoshi berlangsung tanpa memindahkan karakter mendadak:

- Detik 34–36: Yoshi keluar dari mulut pipe pada platform utama sambil membesar dari skala 0,04 menjadi 1.
- Detik 36–40: Yoshi melompat dari pipe dan bergabung ke lintasan pengejaran. Kurva Hermite menyambungkan posisi serta kecepatan saat mendarat; Bowser Jr. tetap mengejar sepanjang kemunculan Yoshi.
- Detik 64–68: Yoshi berubah menjadi telur di posisi larinya, lalu mempercepat gerak sepanjang lintasan sampai menyentuh punggung Bowser Jr.
- Detik 68–70: Bowser Jr. jatuh ke posisi duduk dengan kaki ke depan dan cangkang menopang badan di lantai. Telur Yoshi memantul mundur ke posisi lintasannya sebelum menyusul, lalu kembali ke bentuk tubuhnya setelah mendarat.
- Detik 70,5–72,5: Bowser Jr. berdiri kembali secara bertahap melalui rotasi pinggul, telapak, torso, dan lengan.
- Detik 75–80: ketiganya menyambung gerak ke lintasan bersama. Mulai detik 80, ketiganya berjalan mengelilingi platform dengan kecepatan lebih santai dan jarak terjaga.

## Studio video terpisah

Trailer 36 detik, 1280 × 720, dibuat langsung dari scene dan model asli WebGL proyek.
Tidak ada credits atau nama kelas pada versi ini.

## Alur cerita

| Waktu | Adegan |
|---|---|
| 0–4 dtk | Pembuka Mushroom Kingdom, hari yang tenang |
| 4–12 dtk | Toad berlari melingkar, dikejar Bowser Jr. |
| 12–16 dtk | Bowser Jr. menyemburkan bola api; Toad menghindar dengan melompat |
| 16–20 dtk | Yoshi datang menolong |
| 20–25 dtk | Yoshi menyerang dengan lidah; Bowser Jr. terpental miring |
| 25–29 dtk | Bowser Jr. kabur; Toad merayakan keselamatannya |
| 29–33 dtk | Yoshi dan Toad bersama dalam golden hour |
| 33–36 dtk | Judul penutup dan ajakan bermain |

Rotasi anggota tubuh, scaling kedipan kelopak, rotasi sumbu diagonal ketika Bowser Jr.
terkena serangan, dan transformasi hierarkis diperlihatkan lewat adegan, tanpa teks
penjelasan teknis di dalam video. Lingkungan tetap statis. Musik disintesis secara
lokal melalui Web Audio, tanpa aset musik eksternal.

## Putar atau ekspor ulang

1. Dari folder proyek, jalankan `node tools/trailer-server.cjs`.
2. Buka `http://127.0.0.1:8765/trailer.html`.
3. Klik **Putar trailer** untuk pratinjau atau **Ekspor video** untuk merekam 36 detik.
4. Ekspor utama menggunakan WebCodecs dan menghasilkan `output/Mushroom-Kingdom-Trailer.webm`,
   864 frame pada 24 fps. Tautan unduh juga muncul setelah ekspor.
5. Buka `http://127.0.0.1:8765/output/preview.html` untuk memutar hasil dan membuat versi MP4.
6. Setelah konversi MP4 selesai, jalankan `node tools/finalize-mp4.cjs` untuk
   memperbarui metadata durasi semua fragmen. Video final yang disertakan sudah difinalisasi.

Ekspor WebCodecs merender frame secara berurutan agar frame tidak hilang ketika
rendering membutuhkan waktu lebih lama daripada durasi film. Konversi MP4 berjalan
dari video final, bukan merekam ulang scene WebGL. Pertahankan tab aktif saat konversi MP4. Antarmuka browser
dan tombol studio tidak masuk video. Halaman interaktif utama tetap `index.html`.
