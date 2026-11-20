# zip_review.py : /workspace/clyde/review/clyde-2027-slate-24.zip (PLAN, READMEs, contact sheets, heroes, src, dist, tools)
import zipfile, os, glob, hashlib
ROOT='/workspace/clyde/2027'; OUT='/workspace/clyde/review/clyde-2027-slate-24.zip'; os.makedirs(os.path.dirname(OUT), exist_ok=True)
files=['PLAN.md']+[os.path.relpath(f,ROOT) for f in glob.glob(ROOT+'/_lib/*')+glob.glob(ROOT+'/_tools/*')]
for d in sorted(glob.glob(ROOT+'/[0-9][0-9]-*')):
    for pat in ['README.md','contact-sheet-*.png','forced-*.png','heroes/*.png','src/main.js','src/art.js','dist/aleatory/*.html']:
        files+= [os.path.relpath(f,ROOT) for f in sorted(glob.glob(os.path.join(d,pat)))]
man=[]
with zipfile.ZipFile(OUT+'.tmp','w',zipfile.ZIP_DEFLATED) as z:
    for f in files:
        p=os.path.join(ROOT,f); z.write(p,'clyde-2027/'+f); man.append(hashlib.sha256(open(p,'rb').read()).hexdigest()+'  '+f)
    z.writestr('clyde-2027/MANIFEST.sha256','\n'.join(man)+'\n')
os.replace(OUT+'.tmp',OUT); print(OUT, len(files), 'files', os.path.getsize(OUT)//1024, 'KB')
