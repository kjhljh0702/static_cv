"""Fetch original 1.20.1 recordings from Mojang's content-addressed asset CDN."""
from pathlib import Path
from urllib.request import urlopen
import json,hashlib

def get(url):
 with urlopen(url,timeout=30) as r:return r.read()
manifest=json.loads(get('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json'))
version=next(v for v in manifest['versions'] if v['id']=='1.20.1')
metadata=json.loads(get(version['url']))
index=json.loads(get(metadata['assetIndex']['url']))['objects']
events={'click':'random/click_stereo','open':'block/chest/open','close':'block/chest/close1','page':'item/book/open_flip1','book-close':'item/book/close_put1','advance':'ui/toast/challenge_complete'}
root=Path('minecraft/public/minecraft/sounds');root.mkdir(parents=True,exist_ok=True)
records=[]
for name,path in events.items():
 asset=index['minecraft/sounds/'+path+'.ogg'];sha=asset['hash'];url=f'https://resources.download.minecraft.net/{sha[:2]}/{sha}'
 data=get(url);assert hashlib.sha1(data).hexdigest()==sha
 (root/(name+'.ogg')).write_bytes(data)
 records.append({'file':name+'.ogg','minecraft_asset':'minecraft/sounds/'+path+'.ogg','url':url,'sha1':sha,'sha256':hashlib.sha256(data).hexdigest()})
(root/'source-manifest.json').write_text(json.dumps(records,indent=2)+'\n')
print('Verified and downloaded',len(records),'original Minecraft sound recordings.')
