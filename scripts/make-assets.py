from PIL import Image, ImageDraw
from pathlib import Path
import random, math
root=Path('minecraft/public/minecraft'); random.seed(702)
def icon(name,draw):
 im=Image.new('RGBA',(16,16));d=ImageDraw.Draw(im);draw(d);im.save(root/'items'/f'{name}.png')
def book(d,color='#79503d'):
 d.polygon([(2,3),(6,1),(14,4),(14,13),(10,15),(2,12)],fill='#2e201b')
 d.polygon([(3,3),(6,2),(13,4),(10,6)],fill='#e8d9b1');d.polygon([(3,4),(10,7),(10,14),(3,11)],fill=color)
 d.polygon([(11,7),(13,5),(13,12),(11,14)],fill='#cab991');d.line([(4,5),(4,10)],fill='#b88b62');d.rectangle((6,8,8,9),fill='#e7c555')
icon('book',book);icon('enchanted-book',lambda d:book(d,'#713f96'))
def paper(d):
 d.polygon([(4,1),(12,1),(14,3),(12,14),(2,13)],fill='#454641');d.polygon([(4,2),(11,2),(13,4),(11,13),(3,12)],fill='#e7e2cb')
 for y in [5,7,9]:d.line((5,y,10,y),fill='#9c9d8d')
icon('paper',paper)
def compass(d):
 d.polygon([(5,1),(10,1),(14,5),(14,10),(10,14),(5,14),(1,10),(1,5)],fill='#343132');d.ellipse((2,2,13,13),fill='#b5b9b6');d.ellipse((4,4,11,11),fill='#292c30');d.polygon([(8,3),(9,8),(6,10)],fill='#e93b3b');d.polygon([(9,8),(6,10),(7,12)],fill='#f2f1e3')
icon('compass',compass)
def pick(d):
 d.line((3,13,11,5),fill='#2c2318',width=4);d.line((3,12,11,4),fill='#956132',width=2);d.polygon([(2,2),(10,1),(14,4),(14,8),(12,8),(10,4),(3,4)],fill='#30393b');d.line([(3,2),(10,2),(13,5),(13,7)],fill='#c6d0ce',width=2)
icon('pickaxe',pick)
def cube(d,top='#b88451',left='#785431',right='#573c29'):
 d.polygon([(1,4),(7,1),(14,4),(14,12),(8,15),(1,12)],fill='#28241f');d.polygon([(2,4),(7,2),(13,4),(8,7)],fill=top);d.polygon([(2,5),(7,8),(7,13),(2,11)],fill=left);d.polygon([(8,8),(13,5),(13,11),(8,13)],fill=right)
def command(d):
 cube(d,'#d9ae78','#b98556','#80553d');d.rectangle((3,7,5,10),fill='#614d44');d.point((4,8),fill='#d1c5ac');d.rectangle((9,7,11,10),fill='#c3baa4');d.point((10,8),fill='#b65548')
icon('command',command)
def craft(d):
 cube(d);d.line([(4,3),(10,5),(10,6)],fill='#3d271d');d.line([(9,3),(4,5)],fill='#3d271d');d.rectangle((3,7,4,11),fill='#d4ad6b');d.line((10,7,10,12),fill='#37281d')
icon('crafting',craft)
def chest(d):
 d.rectangle((1,4,14,13),fill='#322318');d.rectangle((2,5,13,12),fill='#a77430');d.rectangle((2,2,13,5),fill='#49301a');d.rectangle((3,3,12,4),fill='#c79a48');d.line((2,7,13,7),fill='#4e341c');d.rectangle((7,6,8,9),fill='#ddddbd')
icon('chest',chest)
def torch(d):
 d.rectangle((6,6,9,14),fill='#49321e');d.rectangle((7,6,8,13),fill='#997044');d.rectangle((5,3,10,7),fill='#8b1215');d.rectangle((6,2,9,5),fill='#f33431');d.rectangle((7,1,8,3),fill='#ffb154')
icon('redstone',torch)
def eye(d):
 d.polygon([(1,6),(5,2),(10,2),(14,6),(14,9),(10,13),(5,13),(1,9)],fill='#183b36');d.polygon([(2,6),(6,3),(10,3),(13,6),(13,9),(9,12),(5,11)],fill='#3e9b80');d.rectangle((6,4,9,11),fill='#19252c');d.rectangle((7,5,8,9),fill='#b9eb9e')
icon('eye',eye)
def piston(d):
 cube(d,'#b5aaa0','#777b76','#4c5554');d.polygon([(1,3),(7,0),(15,3),(15,6),(8,9),(1,6)],fill='#4e4130');d.polygon([(2,3),(7,1),(14,3),(8,6)],fill='#c1a376');d.line([(2,5),(8,8),(14,5)],fill='#b8bbb5')
icon('piston',piston)
def spy(d):
 d.line((3,13,12,3),fill='#342519',width=6);d.line((3,12,12,3),fill='#b98946',width=4);d.line((4,12,10,5),fill='#d3ac65',width=2);d.rectangle((10,1,14,5),fill='#574333');d.rectangle((11,1,13,3),fill='#73c5cf')
icon('spyglass',spy)
def diamond(d):
 d.polygon([(4,2),(11,2),(14,6),(8,14),(1,6)],fill='#164e51');d.polygon([(5,3),(10,3),(12,6),(8,12),(3,6)],fill='#48d5c7');d.line([(5,4),(4,6),(7,9)],fill='#b5fff0',width=1)
icon('diamond',diamond)
def helmet(d):
 d.polygon([(2,4),(4,1),(11,1),(14,4),(14,12),(10,12),(10,8),(5,8),(5,12),(2,12)],fill='#3b3e3d');d.polygon([(3,4),(5,2),(10,2),(13,4),(13,11),(11,11),(11,7),(4,7),(4,11),(3,11)],fill='#aeb9b6');d.line((5,3,10,3),fill='#e2e9e4')
icon('helmet',helmet)
def armor(d):
 d.polygon([(1,3),(5,1),(6,4),(9,4),(10,1),(14,3),(13,8),(11,7),(11,14),(4,14),(4,7),(2,8)],fill='#393f3f');d.polygon([(2,3),(4,2),(5,5),(10,5),(11,2),(13,3),(12,6),(10,6),(10,13),(5,13),(5,6),(3,6)],fill='#a9bbba')
icon('armor',armor)
icon('leggings',lambda d:(d.rectangle((3,1,12,14),fill='#3c4144'),d.rectangle((4,2,11,6),fill='#a8b6b9'),d.rectangle((4,6,6,13),fill='#a8b6b9'),d.rectangle((9,6,11,13),fill='#a8b6b9'),d.rectangle((7,7,8,14),fill=(0,0,0,0))))
icon('boots',lambda d:(d.rectangle((3,3,6,12),fill='#a8b6b9'),d.rectangle((9,3,12,12),fill='#a8b6b9'),d.rectangle((1,11,6,14),fill='#76898e'),d.rectangle((9,11,14,14),fill='#76898e')))
# Deterministic, original 64x64 modern Minecraft UV skin.
im=Image.new('RGBA',(64,64));d=ImageDraw.Draw(im)
for box,col in [((0,0,31,15),'#ba8966'),((16,16,39,31),'#283e76'),((40,16,55,31),'#283e76'),((0,16,15,31),'#303440'),((16,48,31,63),'#303440'),((32,48,47,63),'#283e76')]:d.rectangle(box,fill=col)
d.rectangle((0,0,31,7),fill='#242125');d.rectangle((0,8,7,15),fill='#292329');d.rectangle((16,8,31,15),fill='#292329')
d.rectangle((8,8,15,9),fill='#242125');d.rectangle((8,10,8,11),fill='#242125');d.rectangle((15,10,15,11),fill='#242125')
d.rectangle((9,11,10,12),fill='#272a32');d.rectangle((13,11,14,12),fill='#272a32');d.point((11,11),fill='#272a32');d.point((12,11),fill='#272a32');d.line((11,14,12,14),fill='#82563f')
# Cuffs, hands, shoes; sweater seams and undershirt.
for x,y in [(40,16),(32,48)]:d.rectangle((x,y+12,x+15,y+15),fill='#ba8966');d.rectangle((x+4,y+4,x+7,y+10),fill='#36508a')
d.rectangle((23,20,24,21),fill='#d9d9d0');d.line((24,22,24,30),fill='#1a2b55');d.rectangle((20,29,27,30),fill='#1c2d5d')
for x,y in [(0,16),(16,48)]:d.rectangle((x,y+14,x+15,y+15),fill='#191c24')
# Transparent outer head layer: a subtle dark hair rim.
d.rectangle((40,8,47,8),fill='#1b1920');d.rectangle((40,9,40,10),fill='#1b1920');d.rectangle((47,9,47,10),fill='#1b1920')
im.save(root/'skin'/'player.png')
# Original low-resolution voxel panorama. Flat polygons retain hard pixel edges.
W,H=640,360;im=Image.new('RGB',(W,H),'#86b2d6');d=ImageDraw.Draw(im)
for y in range(200):
 t=y/200;d.line((0,y,W,y),fill=(int(92+54*t),int(153+39*t),int(201+21*t)))
d.rectangle((477,38,502,63),fill='#fff4b6')
for x,y,w in [(36,50,93),(240,34,73),(390,87,102),(540,25,79)]:
 d.rectangle((x,y,x+w,y+12),fill='#e5edf0');d.rectangle((x+16,y-6,x+w-13,y+10),fill='#f1f5f4');d.rectangle((x+6,y+12,x+w-8,y+15),fill='#b5c9d7')
# Distant squared ridgelines.
for base,color in [(172,'#718f80'),(199,'#607f67')]:
 for x in range(0,W,16):
  peak=base-int(24*math.sin(x*.018)+13*math.cos(x*.042));d.rectangle((x,peak,x+16,H),fill=color)
# Isometric grass blocks, painter ordered by diagonal depth.
for depth in range(38):
 for gx in range(32):
  gz=depth-gx
  if not 0<=gz<25:continue
  x=320+(gx-gz)*22;y=131+(gx+gz)*8
  elevation=int((math.sin(gx*.39)+math.cos(gz*.43))*1.6)*6
  y-=elevation
  green=random.choice(['#6d9141','#719647','#62893d','#779d49'])
  d.polygon([(x,y),(x+22,y+8),(x,y+16),(x-22,y+8)],fill=green)
  d.polygon([(x-22,y+8),(x,y+16),(x,y+33),(x-22,y+25)],fill='#68503a')
  d.polygon([(x,y+16),(x+22,y+8),(x+22,y+25),(x,y+33)],fill='#503e2e')
  d.line([(x-22,y+9),(x,y+17),(x+22,y+9)],fill='#486d30',width=3)
  for _ in range(4):
   xx=x+random.randint(-10,10);yy=y+random.randint(5,10);d.point((xx,yy),fill='#8aa94c')
# Block trees.
for x,y,sz in [(70,177,1),(545,186,1),(151,277,1.5),(485,300,1.5)]:
 s=int(12*sz);d.rectangle((x-s//3,y-s*3,x+s//3,y+s),fill='#51402b');d.rectangle((x-s//3,y-s*3,x-s//6,y+s),fill='#796047')
 for ox,oy in [(-s,-s*3),(0,-s*4),(s,-s*3),(0,-s*2)]:
  d.rectangle((x+ox-s,y+oy-s,x+ox+s,y+oy+s),fill=random.choice(['#385e2e','#426b31','#4d7837']))
  for _ in range(15):
   xx=x+ox+random.randint(-s,s);yy=y+oy+random.randint(-s,s);d.rectangle((xx,yy,xx+2,yy+1),fill='#59813c')
im.save(root/'backgrounds'/'plains.png')
print('Created original 16px items, 64px skin, and voxel panorama.')
# Flat, readable character fallback for browsers without WebGL.
skin=Image.open(root/'skin'/'player.png');front=Image.new('RGBA',(16,32))
for crop,pos in [((8,8,16,16),(4,0)),((20,20,28,32),(4,8)),((44,20,48,32),(0,8)),((36,52,40,64),(12,8)),((4,20,8,32),(4,20)),((20,52,24,64),(8,20))]:front.paste(skin.crop(crop),pos)
front.save(root/'skin'/'player-front.png')
