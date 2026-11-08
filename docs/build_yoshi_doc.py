from docx import Document
from docx.shared import Inches,Pt,RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import json,collections,hashlib
from pathlib import Path
root=Path.cwd(); d=Document(); sec=d.sections[0];sec.top_margin=sec.bottom_margin=Inches(.7)
for name in ['Normal','Title','Heading 1','Heading 2']:
 st=d.styles[name];st.font.name='Calibri';st.font.color.rgb=RGBColor(0,0,0)
d.styles['Normal'].font.size=Pt(10)
d.styles['Normal'].paragraph_format.space_after=Pt(6)
def p(s):d.add_paragraph(s)
def h(s):d.add_heading(s,1)
def ref(file,needle):
 lines=(root/file).read_text(encoding='utf-8-sig').splitlines();return f'{file} baris '+str(next(i+1 for i,x in enumerate(lines) if needle in x))
def evidence(file,needle):p('Sumber: '+ref(file,needle))
d.add_heading('Objek 3D dan Transformasi Yoshi',0)
p('Dokumentasi implementasi aktual proyek SuperMarioWebGL untuk bahan penjelasan dan presentasi. Pemeriksaan dilakukan terhadap kode lokal, bukan berdasarkan komentar lama atau kemiripan visual saja. Empat transformasi tersedia pada Yoshi: rotasi, scaling kelopak mata, rotasi sumbu sembarang, dan transformasi hierarkis.')
p('Ruang lingkup: characters/yoshi.js, js/sceneNode.js, js/main.js, dan js/primitives.js. Kode aplikasi tidak diubah dalam penyusunan dokumen ini. Nomor baris merujuk versi saat dokumen dibuat.')
h('Bentuk yang benar benar digunakan')
p('Model dibuat dari mesh prosedural. Ellipsoid membentuk badan, perut, kepala, moncong, pipi, mulut, dagu, mata, tangan, jari, paha dan sepatu. Cylinder membentuk leher dan lengan bawah serta bagian kaki. Lengan atas memakai cone frustum yang mengecil ke arah bahu. Ekor dan tiga jambul juga memakai cone frustum. Torus dipakai pada pinggiran pelana dan cuff sepatu. Dome membentuk pelana merah. Tabung kurva Bezier membentuk detail lengkungan pelana dan garis senyum.')
p('Kelopak mata merupakan ellipsoid patch, yaitu bagian permukaan ellipsoid, bukan lingkaran datar. Dua kelopak dibuat oleh addBlinkEyelid. Sphere dan ellipsoid diperlakukan sebagai satu keluarga bentuk sesuai ketentuan yang diberikan.')
p('Koreksi istilah: torus bukan permukaan quadric secara matematis. Jangan mengklaim torus memenuhi kategori quadric. Cone frustum memiliki permukaan samping berbentuk kerucut terpotong; radius ujung ekor dan jambul masih lebih besar dari nol, sehingga bukan kerucut dengan ujung tepat nol.')
p('Lidah Bezier dan ujung lidah masih dibentuk dalam kode, tetapi TonguePivot.visible = false membuat seluruh cabangnya tidak dirender. Lidah tidak boleh diklaim sebagai gerakan atau detail yang terlihat saat ini. Tidak ada pembuatan telur maupun kurva kontur perut pada implementasi Yoshi yang diperiksa, meskipun komentar awal menyebutnya.')
evidence('characters/yoshi.js','const upperArmMesh');evidence('characters/yoshi.js','tonguePivot.visible = false')
d.add_page_break();h('Empat ketentuan transformasi')
d.add_heading('Rotate',2)
p('Rotasi sendi terlihat pada bahu, pangkal kaki, pergelangan kaki dan ekor. Pada mode gabungan, swing = sin(4.5t). Bahu kiri berotasi X sebesar 0.65 × swing dan bahu kanan −0.65 × swing. Pangkal kaki kiri −0.75 × swing, kanan 0.75 × swing. Semua sudut dinyatakan dalam radian dan ditambahkan ke rotasi dasar.')
p('Rotasi arah seluruh Yoshi juga diterapkan melalui rotation[1] = −angle supaya menghadap arah singgung lintasan. Posisi melingkar sendiri dihitung menggunakan translasi X dan Z; jadi gerak orbit tidak boleh dijelaskan sebagai rotasi posisi melalui matriks orbit jika kode tidak melakukan itu.')
evidence('characters/yoshi.js','// Swing opposite arms');evidence('js/main.js','character.rotation[1] = -angle')
d.add_heading('Scaling',2)
p('Scaling dinamis diterapkan pada kelopak, bukan bola mata. animateBlink menghitung phase = t % 3. Selama 0.32 detik pertama setiap siklus, closed = sin(π × phase / 0.32)². Skala kelopak menjadi [1, max(0.001, closed), 1]. Saat tidak berkedip, kelopak disembunyikan. Offset geometri mempertahankan pivot di bagian atas sehingga permukaannya memanjang menutup mata.')
evidence('js/sceneNode.js','function addBlinkEyelid');evidence('js/sceneNode.js','function animateBlink')
d.add_heading('Rotate Arbitrary Axis',2)
p('applyWalkMovement mengatur animAxis = [1, 0, 1] dan animAxisAngle = sin(4.5t) × 0.09. Akibatnya seluruh Yoshi bergoyang kecil pada sumbu diagonal XZ. SceneNode.draw memanggil Mat4.rotateAxis untuk menerapkan rotasi tersebut. Ini berbeda dari ayunan bahu yang memakai sumbu X biasa.')
evidence('js/main.js','character.animAxis =');evidence('js/sceneNode.js','localMatrix = Mat4.rotateAxis')
d.add_heading('Hierarchical Transformation',2)
p('SceneNode menyimpan hubungan induk dan anak. Matriks lokal induk diteruskan ke child.draw. Karena itu rotasi bahu menggerakkan seluruh lengan sampai jari, dan rotasi pangkal kaki membawa kaki serta sepatu. Transformasi geomScale, geomOffset dan geomRot hanya memengaruhi mesh node itu sendiri; matriks geometri tersebut tidak diteruskan ke anak.')
evidence('js/sceneNode.js','child.draw(gl, shader, localMatrix')
d.add_page_break();h('Cara gerakan default bekerja')
p('Di main.js animMode bernilai walk, tetapi poseMode yang dikirim ke animate adalah combined. Dalam Yoshi, combined dialihkan ke cabang action, lalu gerakan kaki dan ayunan tangan ditambahkan. Karena itu cabang mode walk murni yang mengandung bounce badan tidak sama dengan pose default yang tampil di web.')
evidence('js/main.js',"const poseMode = animMode === 'walk'")
p('Urutan pengejaran adalah Toad, Bowser Jr., Yoshi. Untuk Yoshi, followerIndex = 2, sehingga angle = 0.45t − 4π/3. Posisi X = 2 cos(angle), Z = centerZ + 2 sin(angle). Radius lintasan adalah 2 unit, laju sudut 0.45 radian per detik, sehingga satu putaran sekitar 13.96 detik. Ketika environment aktif, centerZ berasal dari environmentNode.walkCenterZ.')
evidence('js/main.js','function applyWalkMovement');evidence('js/main.js','const chaseOrder =')
p('Pada mode gabungan, Yoshi tidak melompat. Ketinggian disesuaikan dengan characterFootY agar sol menyentuh permukaan tanah. Saat idle di environment, permukaan yang dipakai adalah surfaceY platform. Gerak badan naik turun pada cabang walk murni tidak boleh diklaim sebagai lompatan default Yoshi.')
p('Lidah selalu disembunyikan dan tongueExtend bernilai nol. Akibatnya head.animRot pada cabang action menjadi [0, 0, 0]. Ekor pada cabang ini memakai rotasi dasar animasi X 0.15 dan ayunan Y sin(10t) × 0.45. Kepala tetap ikut transformasi induk dan goyangan root, tetapi tidak memiliki gerakan menjulurkan lidah.')
p('Mode idle masih memiliki gerak bernapas kecil pada badan, gerak leher, bahu, dan ekor. Mode walk murni masih tersimpan di kode dengan bounce badan serta gerak leher dan kepala, tetapi tidak digunakan oleh pilihan jalan default saat ini.')
h('Contoh hierarki yang ada')
for s in ['YoshiRoot → YoshiBody → YoshiNeckPivot → YoshiHead → EyeSocket → EyeWhite → BlinkEyelid', 'YoshiBody → LeftShoulder → UpperArm → Elbow → Forearm → Hand → Finger atau Thumb', 'YoshiBody → LeftHip → LegCylinder → Ankle → OrangeBoot → YellowSole', 'YoshiBody → YoshiSaddle → SaddleRedDome / SaddleWhiteRim / SaddleBezierArch', 'YoshiBody → TailPivot → TailCone / TailUnderWhite']:
 p(s)
p('Sisi kanan dibuat melalui fungsi yang sama dengan parameter side = 1; sisi kiri side = −1. Pivot seperti bahu dan pergelangan tidak memiliki mesh sendiri.')
d.add_page_break();h('Inventaris seluruh bagian mesh')
p('Hasil penelusuran scene graph menghasilkan 56 node bermesh, termasuk dua kelopak dan dua mesh lidah yang tersembunyi. Jumlah node bukan jumlah jenis bentuk dan bukan jumlah mesh unik karena beberapa node berbagi mesh. Daftar berikut mengelompokkan node dengan nama dan pembuat geometri yang sama.')
rows=json.loads((root/'docs/yoshi-inventory.json').read_text());groups=collections.Counter((x['name'],x['kind']) for x in rows)
t=d.add_table(rows=1, cols=3);t.style='Table Grid'
for c,s in zip(t.rows[0].cells,['Nama node pada kode','Geometri pembentuk','Jumlah']):c.text=s
for (name,kind),count in groups.items():
 cells=t.add_row().cells
 for c,s in zip(cells,[name,kind.replace('create',''),str(count)]):c.text=s
 for c in cells:
  for pp in c.paragraphs:
   for r in pp.runs:r.font.size=Pt(9)
for c in t.rows[0].cells:
 pr=c._tc.get_or_add_tcPr();sh=OxmlElement('w:shd');sh.set(qn('w:fill'),'DCE6F1');pr.append(sh)
trpr=t.rows[0]._tr.get_or_add_trPr();repeat=OxmlElement('w:tblHeader');trpr.append(repeat)
p('Sumber inventaris: pemanggilan createYoshi dengan fungsi geometri dicatat, kemudian seluruh node anak ditelusuri. BlinkEyelid hanya terlihat saat berkedip; YoshiBezierTongue dan TongueTip tidak terlihat karena induknya disembunyikan.')
h('Bukti sumber untuk penjelasan')
for file in ['characters/yoshi.js','js/sceneNode.js','js/main.js','js/primitives.js']:
 data=(root/file).read_bytes();p(file+' — SHA256 '+hashlib.sha256(data).hexdigest())
p('Dokumen ini menjelaskan implementasi, bukan memastikan nilai penilaian dosen. Ketentuan video promosi, storyline dan pencantuman kelas merupakan ketentuan video; bukan sifat geometri Yoshi. Tidak ada jumlah minimum bentuk atau kurva tambahan yang diasumsikan karena tidak tercantum dalam permintaan yang tersedia.')
d.save(root/'docs/Yoshi_Objek_3D_dan_Transformasi.docx')
