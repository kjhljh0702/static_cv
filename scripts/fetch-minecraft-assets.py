"""Fetch specific Java 1.20.1 assets from the public Minecraft asset mirror.
The artwork remains copyright Mojang/Microsoft; see ASSET-LICENSES.md.
"""
from pathlib import Path
from urllib.request import urlopen
from concurrent.futures import ThreadPoolExecutor
import hashlib,json
base='https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.1/assets/minecraft/textures/'
root=Path('minecraft/public/minecraft'); assets={}
items={'book':'book','enchanted-book':'enchanted_book','paper':'paper','compass':'compass_16','pickaxe':'iron_pickaxe','diamond-pickaxe':'diamond_pickaxe','gold-pickaxe':'golden_pickaxe','axe':'iron_axe','spyglass':'spyglass','eye':'ender_eye','redstone':'redstone','repeater':'repeater','comparator':'comparator','diamond':'diamond','helmet':'iron_helmet','armor':'iron_chestplate','leggings':'iron_leggings','boots':'iron_boots','writable-book':'writable_book','written-book':'written_book','map':'map','name-tag':'name_tag','feather':'feather','amethyst':'amethyst_shard','emerald':'emerald','quartz':'quartz','blaze':'blaze_powder','pearl':'ender_pearl','clock':'clock_16','ingot':'iron_ingot','gold':'gold_ingot','bucket':'bucket','slime':'slime_ball','prismarine':'prismarine_crystals','nether-star':'nether_star','flint':'flint','string':'string','bow':'bow','crossbow':'crossbow_standby','lead':'lead','shears':'shears','honey':'honey_bottle','bottle':'experience_bottle'}
for name,file in items.items():assets[f'items/{name}.png']=f'item/{file}.png'
for name,path in {'inventory':'container/inventory','chest':'container/generic_54','crafting':'container/crafting_table','book':'book','widgets':'widgets','icons':'icons'}.items():assets[f'gui/{name}.png']=f'gui/{path}.png'
assets['backgrounds/panorama.png']='gui/title/background/panorama_0.png'
for i in range(12):assets[f'particles/cherry_{i}.png']=f'particle/cherry_{i}.png'
for name in ['cherry_leaves','cherry_log','grass_block_top','dirt']:
 assets[f'blocks/{name}.png']=f'block/{name}.png'
assets['skin/steve.png']='entity/player/wide/steve.png'
def fetch(entry):
 dest,src=entry;url=base+src
 with urlopen(url,timeout=30) as r:data=r.read()
 assert data.startswith(b'\x89PNG'),src
 p=root/dest;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
 return {'file':dest,'url':url,'sha256':hashlib.sha256(data).hexdigest()}
with ThreadPoolExecutor(max_workers=6) as pool:manifest=list(pool.map(fetch,assets.items()))
(root/'source-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Downloaded',len(manifest),'verified PNG assets.')
