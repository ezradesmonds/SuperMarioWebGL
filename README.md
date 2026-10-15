# Proyek Game 1 Grafika Komputer - Super Mario WebGL (Yoshi, Toad, Bowser Jr.)

Proyek ini dibuat menggunakan **100% Pure WebGL 1.0 (Tanpa Three.js)** dan memenuhi seluruh ketentuan Praktikum Grafika Komputer serta spesifikasi pada dokumen `Mario_UTSGrafkom_Deskripsi Bentuk.pdf`.

## Cara Menjalankan
1. Ekstrak seluruh isi file ZIP ini ke dalam satu folder.
2. Buka langsung file **`index.html`** menggunakan browser modern (Chrome, Edge, Brave, atau Firefox) — tidak memerlukan instalasi library eksternal atau web server karena seluruh script ditulis dalam Vanilla JavaScript murni.

## Pemenuhan Ketentuan Proyek & Karakter
### 1. Yoshi (`characters/yoshi.js`)
- **Ellipsoid**: Kepala, moncong bulat besar khas Yoshi, badan oval hijau, perut putih, mata besar menonjol, sepatu boots oranye, sol kuning, jari tangan, dan telur Yoshi polkadot hijau.
- **Cylinder**: Leher, lengan atas & lengan bawah, serta paha/kaki.
- **Quadric Object Non-Ellipsoid/Cylinder**:
  - **Cone / Frustum**: Ekor meruncing di bagian belakang dan 3 duri jambul merah di belakang kepala.
  - **Torus**: Cincin dasar putih pada saddle (pelana merah) dan cuff sepatu boots.
- **Curve (3D Cubic Bezier Curve Tube)**: Kurva senyum mulut, lengkungan arch pelana merah (saddle), dan garis kontur perut putih.
- **Transformasi Hierarkis & Animasi**: Badan (`YoshiBody`) menjadi *parent* utama bagi leher -> kepala -> moncong/mata/jambul, bahu -> lengan atas -> siku -> lengan bawah -> telapak tangan -> jari, pinggul -> kaki -> pergelangan -> sepatu, serta pangkal ekor -> ujung ekor.

### 2. Toad (`characters/toad.js`)
- **Ellipsoid**: Kepala bulat, Mushroom Cap besar beserta 5 bintik bulat merah, celana putih bulat, telapak tangan & jari, serta sepatu coklat.
- **Cylinder**: Lengan dan kaki.
- **Quadric Object Non-Ellipsoid/Cylinder**:
  - **Cone / Frustum (Truncated Cone)**: Torso/badan utama Toad dan rompi biru (vest).
  - **Torus**: Lipatan cincin bawah topi jamur (mushroom cap).
- **Curve (3D Cubic Bezier Curve Tube)**: Tepi lis emas pada rompi biru (kiri & kanan), garis senyum mulut, dan alur detail bawah mushroom cap.
- **Transformasi Hierarkis & Animasi**: Berjalan, melompat gembira, dan melambaikan kedua tangan dengan torso sebagai *parent* utama.

### 3. Bowser Jr. (`characters/bowserjr.js`)
- **Ellipsoid**: Kepala besar hijau, moncong krem besar, badan bulat kuning, perut plastron, bib/bandana putih, kepalan tangan, dan telapak kaki.
- **Cylinder**: Lengan, kaki, dan ikat rambut hitam.
- **Quadric Object Non-Ellipsoid/Cylinder**:
  - **Cone**: 2 tanduk kepala, 4 duri putih tajam pada cangkang hijau (shell spikes), gigi taring mulut, 6 kuku kaki tajam, stud duri pada gelang besi, dan ekor.
  - **Torus**: Tepi cincin putih cangkang Koopa, cincin dasar duri, dan gelang besi hitam.
- **Curve (3D Cubic Bezier Curve Tube)**: Alis merah tebal menyala, 3 helai rambut kuncir merah (ponytail), lukisan gigi/mulut merah pada bib/masker putih, garis segmen perut, dan senyum menyeringai.
- **Transformasi Hierarkis & Animasi**: Berjalan gagah, mengangkat tangan/menyerang (tinju), dan melompat dengan badan sebagai *parent* utama.
