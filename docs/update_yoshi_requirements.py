from docx import Document
from docx.shared import Pt
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from pathlib import Path
p=Path('docs');d=Document(p/'Yoshi_Objek_3D_dan_Transformasi_dengan_Foto.docx')
def source(f,n):
 ls=Path(f).read_text(encoding='utf-8-sig').splitlines();return f+' baris '+str(next(i+1 for i,l in enumerate(ls) if n in l))
def para(t):d.add_paragraph(t)
d.add_page_break();d.add_heading('Pemetaan ketentuan penilaian yang diberikan',1)
para('Bagian ini memakai daftar ketentuan terbaru dari pengguna. Pemenuhan teknis berikut didasarkan pada kode lokal yang diperiksa. Aesthetic merupakan penilaian visual; kode hanya memberikan bukti pendukung, bukan jaminan nilai atau kelancaran pada semua perangkat.')
rows=[
('3D Curve pada karakter','Ada','SaddleBezierArch pada pelana dan YoshiSmileLipBezier pada bibir. Keduanya dibuat dengan createBezierTube. Lidah tersembunyi tidak dipakai sebagai bukti.'),
('Object 1 bebas','Ellipsoid','YoshiBody atau YoshiBigSnout. Badan menggunakan radius 0.52, 0.66, 0.48.'),
('Object 2 bebas','Cylinder','YoshiNeck: radius 0.25 dan tinggi 0.34; Forearm juga cylinder.'),
('Object 3 quadric selain ellipsoid dan cylinder','Cone frustum','TailCone, TailUnderWhite, RedCrestCone dan UpperArm memakai kerucut terpotong. Permukaan sampingnya merupakan bagian quadric kerucut; tutupnya berupa cakram.'),
('Aesthetic','Bukti pendukung','Environment taman, warna karakter, normal permukaan, pencahayaan, bayangan, dan animasi berbasis waktu. Kualitas visual tetap perlu dinilai saat aplikasi berjalan.'),
('Translate','Ada','Posisi root berubah pada sumbu X dan Z melalui applyWalkMovement. Ketinggian Y disesuaikan agar kaki menyentuh tanah.'),
('Rotate','Ada','Rotasi arah Y root serta rotasi X bahu dan pangkal kaki pada mode combined.'),
('Scaling','Ada','BlinkEyelid.animScale berubah pada sumbu Y saat berkedip; bola mata tidak diskalakan.'),
('Rotate Arbitrary Axis','Ada','Root bergoyang terhadap [1, 0, 1] dengan sudut sin(4.5t) × 0.09 radian.'),
('Hierarchical Transformation','Ada','Matriks bahu diteruskan ke lengan bawah, telapak dan jari; matriks kaki diteruskan ke sepatu dan sol.')]
t=d.add_table(rows=1,cols=3);t.style='Table Grid'
for c,v in zip(t.rows[0].cells,['Ketentuan','Implementasi','Bukti pada Yoshi']):c.text=v
for row in rows:
 for c,v in zip(t.add_row().cells,row):
  c.text=v
  for pp in c.paragraphs:
   for r in pp.runs:r.font.size=Pt(9)
for c in t.rows[0].cells:
 sh=OxmlElement('w:shd');sh.set(qn('w:fill'),'DCE6F1');c._tc.get_or_add_tcPr().append(sh)
rep=OxmlElement('w:tblHeader');t.rows[0]._tr.get_or_add_trPr().append(rep)
d.add_page_break();d.add_heading('Bukti teknis untuk ketentuan tambahan',1)
d.add_heading('Curve yang benar benar terdapat pada karakter',2)
para('SaddleBezierArch menggunakan empat titik kontrol [−0.34, 0.06, 0], [−0.20, 0.39, 0.10], [0.20, 0.39, 0.10], [0.34, 0.06, 0]. Kurva ini dibuat menjadi tabung bermesh dan ditempelkan sebagai anak YoshiSaddle. Karena berada pada karakter, persyaratan lokasi curve terpenuhi secara struktur. YoshiSmileLipBezier menjadi bukti tambahan pada kepala. Sebagian detail dapat tertutup geometri dari sudut tertentu; foto keseluruhan tidak membuktikan semua kurva terlihat jelas.')
para('Sumber: '+source('characters/yoshi.js','const saddleArchCurve')+'; '+source('characters/yoshi.js','const smileCurveMesh')+'; '+source('js/primitives.js','createBezierTube:'))
d.add_heading('Mengapa cone frustum dapat dipakai untuk object 3',2)
para('Pada createConeFrustum, radius berubah linear sepanjang tinggi. Jika sumbu lokalnya Y, permukaan samping memenuhi x² + z² = (a y + b)². Setelah dikembangkan, persamaan ini berderajat dua sehingga merupakan bagian permukaan quadric kerucut. Pemotongan rentang Y menghasilkan frustum. TailCone memakai radius bawah 0.30, radius atas 0.02 dan tinggi 0.78. Radius yang berbeda membedakannya dari cylinder. Torus tidak dipakai sebagai bukti quadric.')
para('Sumber: '+source('characters/yoshi.js','const tailConeMesh')+'; '+source('js/primitives.js','createConeFrustum:'))
d.add_heading('Translate pada gerak melingkar',2)
para('Untuk Yoshi, angle = 0.45t − 4π/3. Posisi root diperbarui menjadi x = 2 cos(angle) dan z = centerZ + 2 sin(angle). Ini adalah translasi posisi pada lintasan melingkar. Rotasi arah karakter dihitung terpisah dengan rotation[1] = −angle. Jadi Translate dan Rotate mempunyai penerapan yang dapat ditunjuk secara terpisah dalam kode.')
para('Sumber: '+source('js/main.js','function applyWalkMovement'))
d.add_heading('Aesthetic dan kelancaran transformasi',2)
para('Mesh memiliki normal permukaan untuk pencahayaan. Gerakan sendi memakai fungsi sinus terhadap waktu, sedangkan renderLoop menjadwalkan frame melalui requestAnimationFrame dan menghitung selisih waktu dengan batas 0.05 detik. Fungsi ini mendukung perubahan pose yang bertahap. Akan tetapi frame rate tetap bergantung pada perangkat dan beban render, sehingga klaim selalu mulus atau stabil 60 FPS tidak dapat dibuat dari kode saja. Grounding melalui characterFootY mendukung kontak kaki dengan tanah saat bergerak.')
para('Sumber: '+source('js/main.js','const dt=')+'; '+source('js/main.js','function characterFootY')+'; '+source('js/primitives.js','cpuNormals:'))
para('Kesimpulan untuk penjelasan: gunakan ellipsoid sebagai Object 1, cylinder sebagai Object 2, dan cone frustum sebagai Object 3. Sebut curve pelana atau bibir sebagai 3D Curve. Untuk gerak, tunjuk translasi lintasan, rotasi sendi, scaling kelopak, goyangan sumbu diagonal, dan hubungan induk anak. Jangan menyebut torus sebagai quadric, lidah sebagai animasi aktif, atau Yoshi melompat pada mode default.')
d.save(p/'Yoshi_Ketentuan_Lengkap_dengan_Foto.docx')
print('Saved revised document with all 10 criteria and original model photos')
