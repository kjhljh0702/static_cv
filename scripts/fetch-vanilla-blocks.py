"""Extract vanilla block textures and model definitions from Mojang's verified 1.20.1 client."""
from pathlib import Path
from urllib.request import urlopen
from zipfile import ZipFile
from io import BytesIO
import json,hashlib

def get(url):
 with urlopen(url,timeout=90) as response:return response.read()
manifest=json.loads(get('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json'))
version=next(v for v in manifest['versions'] if v['id']=='1.20.1')
metadata=json.loads(get(version['url']))
client=metadata['downloads']['client'];cache=Path('/tmp/minecraft-1.20.1-client.jar');raw=cache.read_bytes() if cache.exists() else get(client['url'])
assert hashlib.sha1(raw).hexdigest()==client['sha1']
cache.write_bytes(raw)
archive=ZipFile(BytesIO(raw));root=Path('minecraft/public/minecraft');records=[]
textures=['glowstone','cherry_planks','command_block_front','command_block_back','command_block_side','crafting_table_top','crafting_table_front','crafting_table_side','oak_planks','piston_side','piston_top','piston_bottom']
for name in textures:
 source=f'assets/minecraft/textures/block/{name}.png';data=archive.read(source);dest=f'blocks/{name}.png';(root/dest).write_bytes(data)
 records.append({'file':dest,'minecraft_asset':source,'sha256':hashlib.sha256(data).hexdigest()})
source='assets/minecraft/textures/entity/chest/normal.png';data=archive.read(source);(root/'blocks/chest.png').write_bytes(data);records.append({'file':'blocks/chest.png','minecraft_asset':source,'sha256':hashlib.sha256(data).hexdigest()})
models={}
queue=['command_block','crafting_table','piston','piston_inventory']
while queue:
 name=queue.pop()
 if name in models:continue
 source=f'assets/minecraft/models/block/{name}.json';model=json.loads(archive.read(source));models[name]=model
 if 'parent' in model:queue.append(model['parent'].split('/')[-1])
(root/'blocks/vanilla-models.json').write_text(json.dumps(models,indent=2)+'\n')
(root/'blocks/source-manifest.json').write_text(json.dumps({'version':'1.20.1','client_url':client['url'],'client_sha1':client['sha1'],'assets':records},indent=2)+'\n')
asset_index=json.loads(get(metadata['assetIndex']['url']))['objects']
verified=[]
for entry in json.loads((root/'source-manifest.json').read_text()):
 path=entry.get('minecraft_asset') or 'assets/minecraft/textures/'+entry['url'].split('/textures/')[1]
 override=asset_index.get('minecraft/'+path.removeprefix('assets/minecraft/'))
 if override:
  sha=override['hash'];source_url=f'https://resources.download.minecraft.net/{sha[:2]}/{sha}';data=get(source_url);assert hashlib.sha1(data).hexdigest()==sha
 else:source_url=client['url'];data=archive.read(path)
 (root/entry['file']).write_bytes(data)
 verified.append({'file':entry['file'],'url':source_url,'minecraft_asset':path,'sha256':hashlib.sha256(data).hexdigest()})
(root/'source-manifest.json').write_text(json.dumps(verified,indent=2)+'\n')
print('Extracted',len(records),'block textures and',len(verified),'existing textures from the official SHA-1-verified client.')
