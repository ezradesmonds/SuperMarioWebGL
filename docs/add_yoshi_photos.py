from PIL import Image,ImageDraw,ImageFont
from docx import Document
from docx.shared import Inches,Pt
from pathlib import Path
p=Path('docs');font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',22)
def photo(src,out,labels):
 im=Image.open(p/src).convert('RGB');dr=ImageDraw.Draw(im)
 for text,xy,target in labels:
  x,y=xy;tx,ty=target;w=dr.textbbox((0,0),text,font=font)[2]
  edge=(x+w+8 if x<500 else x-8,y+15)
  dr.line([edge,(int((edge[0]+tx)/2),edge[1]),target],fill='#fff4bd',width=3)
  dr.ellipse((tx-5,ty-5,tx+5,ty+5),fill='#ffde55',outline='black')
  dr.rounded_rectangle((x-6,y-4,x+w+6,y+30),radius=5,fill='#ffffff')
  dr.text((x,y),text,font=font,fill='#122b24')
 im.save(p/out)
photo('yoshi-front.png','yoshi-front-labels.png',[
 ('Mata dan pupil  ellipsoid',(70,90),(620,153)),('Moncong  ellipsoid',(70,200),(655,245)),('Perut  ellipsoid',(70,330),(634,390)),('Lengan atas  cone frustum',(820,250),(723,365)),('Lengan bawah  cylinder',(820,350),(738,414)),('Telapak dan jari  ellipsoid',(820,440),(744,451)),('Paha  ellipsoid',(70,480),(595,477)),('Sepatu dan sol  ellipsoid',(820,550),(686,544))])
photo('yoshi-back.png','yoshi-back-labels.png',[
 ('Jambul  cone frustum',(810,110),(670,162)),('Pelana merah  dome',(810,280),(704,364)),('Pinggiran pelana  torus',(810,365),(664,395)),('Ekor  cone frustum',(810,470),(744,438)),('Badan  ellipsoid',(80,300),(616,380)),('Lengan atas  cone frustum',(80,380),(577,373)),('Lengan bawah  cylinder',(80,450),(566,423)),('Paha  ellipsoid',(80,530),(620,497))])
a=Image.open(p/'yoshi-front.png').crop((550,100,730,215)).resize((720,460))
b=Image.open(p/'yoshi-blink.png').crop((550,100,730,215)).resize((720,460))
im=Image.new('RGB',(1440,530),'white');im.paste(a,(0,60));im.paste(b,(720,60));dr=ImageDraw.Draw(im);dr.text((25,15),'Mata terbuka  t = 1 detik',font=font,fill='black');dr.text((745,15),'Kelopak menutup  t = 0.16 detik',font=font,fill='black');im.save(p/'yoshi-blink-comparison.png')
d=Document(p/'Yoshi_Objek_3D_dan_Transformasi.docx')
for title,img,paragraphs in [
 ('Foto model Yoshi dari depan','yoshi-front-labels.png',[
 'Gambar ini adalah hasil render mesh Yoshi asli dari proyek, bukan ilustrasi buatan. Garis menunjuk permukaan yang terlihat. Bagian kiri dan kanan dibentuk dari fungsi yang sama dengan parameter side berbeda.',
 'Lengan atas tampak menyempit di bahu karena createConeFrustum menggunakan radius 0.12 pada bawah dan 0.045 pada atas. Telapak berbentuk ellipsoid pipih dengan radius 0.14, 0.12 dan 0.08. Tiga jari utama dan satu ibu jari pada tiap tangan juga berupa ellipsoid.',
 'Hubungkan penanda ini dengan inventaris: moncong adalah YoshiBigSnout, perut YoshiBelly, lengan atas UpperArm, lengan bawah Forearm, telapak Hand, paha Thigh, sepatu OrangeBoot dan sol YellowSole.']),
 ('Foto model Yoshi dari belakang','yoshi-back-labels.png',[
 'Sudut belakang memperlihatkan bagian yang tertutup dari depan. Pelana merah adalah SaddleRedDome, pinggiran putih SaddleWhiteRim, tiga jambul RedCrestCone, dan ekor TailCone serta TailUnderWhite.',
 'Dome merupakan permukaan pelana. Torus membentuk cincin putih di tepinya. Ekor dan jambul memakai kerucut terpotong. Penanda pinggiran pelana tidak menunjuk kurva Bezier; kurva lengkungan pelana adalah mesh detail lain, SaddleBezierArch.',
 'Sudut pengambilan gambar diubah untuk memperlihatkan model. Ini bukan bukti bahwa Yoshi melakukan putaran animasi pada foto diam. Pembuktian gerakan tetap merujuk fungsi animasi yang dijelaskan dalam isi dokumen.']),
 ('Foto perbandingan scaling kelopak mata','yoshi-blink-comparison.png',[
 'Kedua gambar merupakan pembesaran hasil render model yang sama. Kiri diambil pada t = 1 detik dan kanan pada t = 0.16 detik. Pada t = 0.16, rumus closed menghasilkan 1 sehingga kelopak mencapai skala Y penuh.',
 'Yang diskalakan adalah node BlinkEyelid berbentuk ellipsoid patch, bukan EyeWhite atau Pupil. Saat terbuka kelopak tidak terlihat. Saat menutup permukaan hijau menutupi bagian depan mata.',
 'Foto diam membantu menunjukkan bagian yang berubah; bukti nilai transformasi terdapat pada animateBlink di js/sceneNode.js. Gerak rotate, arbitrary axis dan hierarki dijelaskan pada bagian transformasi dengan rujukan kode, bukan disimpulkan dari foto diam.'])]:
 d.add_page_break();d.add_heading(title,1);d.add_picture(str(p/img),width=Inches(6.3))
 for text in paragraphs:d.add_paragraph(text)
d.save(p/'Yoshi_Objek_3D_dan_Transformasi_dengan_Foto.docx')
print('DOCX with three illustrated pages saved')
