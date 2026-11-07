# Mushroom Kingdom — trailer

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
