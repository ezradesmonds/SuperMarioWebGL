# Mushroom Kingdom — trailer 90 detik

Preview: http://localhost:3000/MushroomKingdom
1280 × 720, 30 fps, 2700 frame. Musik instrumental original. Tanpa credits/kelas sesuai permintaan.

## Menjalankan

Dari folder ini: `npm run dev`.
Ekspor ketika diperlukan: `npm run render`.
Setelah mengubah model atau animasi web: `npm run sync-world`, lalu refresh preview.

## Cerita

0–14: dunia taman dan Toad yang tenang.
14–24: Bowser Jr. mengejar Toad di lintasan melingkar.
24–38: close-up api Bowser Jr. dan lompatan Toad.
38–45: pengejaran berlanjut.
45–52: Yoshi datang.
52–60: Toad di depan, Bowser Jr. mengejar, Yoshi mengikuti Bowser Jr.
60–68: Yoshi menyerang Bowser Jr. menggunakan animasi lidah asli.
68–82: pengejaran berbalik dan petualangan bersama.
82–90: judul penutup dan tiga karakter di platform.

## Kesesuaian dengan web

`public/world/js` dan `public/world/characters` merupakan salinan utuh file web saat pembuatan trailer.
`film.js` mengatur kamera, pemeran yang terlihat, dan posisi panggung; gerakan sendi tetap memanggil `animate(t, 'combined' | 'action' | 'idle')` asli.
Jalan melingkar memakai `applyWalkMovement` asli, radius 2 dan kecepatan 0.45 rad/detik.
Saat berjalan kaki berada di tanah; saat idle di platform. Environment tidak dianimasikan.

Empat requirement terlihat lewat adegan, bukan tulisan teknis:
- Rotate: lintasan melingkar dan perubahan arah karakter.
- Scaling: kedipan kelopak mata, terlihat jelas pada close-up Toad (sekitar detik 9 dan 12).
- Rotate Arbitrary Axis: sway diagonal asli selama berjalan melingkar.
- Hierarchical Transformation: ayunan lengan, gerakan kaki, kepala dan aksi karakter mengikuti scene graph asli.

Trailer bersifat promosi dengan storyline dan teks cerita singkat, bukan penjelasan pengerjaan.
Sphere/ellipsoid tidak diklaim sebagai dua shape berbeda. Tidak ada anggota kelompok atau kelas di credits sesuai instruksi terakhir.

`out/poster.png` dan `out/checks` adalah gambar pemeriksaan, bukan hasil ekspor video penuh.
