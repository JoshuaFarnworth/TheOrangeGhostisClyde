#!/bin/bash
# after `node tools/build.js twenty-nanometres-v3`: add the Old Standard TT OFL 1.1 notice to every export
set -e; cd "$(dirname "$0")/dist"; L=../OFL-OldStandardTT.txt
NOTE='<!-- Twenty Nanometres by Clyde. Contains glyph outlines from Old Standard TT, Copyright 2011 The Old Standard Project Authors, used under the SIL Open Font License 1.1 (OFL-OldStandardTT.txt). -->'
for f in aleatory/twenty-nanometres-v3.html verse/index.html fxhash/index.html highlight/index.html; do
  grep -q 'SIL Open Font License 1.1 (OFL' "$f" || sed -i "0,/<html[^>]*>/s//&\n$NOTE/" "$f"; grep -q 'SIL Open Font License 1.1 (OFL' "$f"; done
for d in aleatory fxhash highlight verse; do cp $L $d/; done
python3 - <<'PY'
import zipfile, os
sets={'aleatory':['twenty-nanometres-v3.html'],'fxhash':['index.html','index.js','fxhash.min.js'],'highlight':['index.html','index.js','hl-gen.js'],'verse':['index.html']}
for d,fs in sets.items():
    z=zipfile.ZipFile('twenty-nanometres-v3-%s.zip'%d,'w',zipfile.ZIP_DEFLATED)
    for f in fs+['OFL-OldStandardTT.txt']: z.write(os.path.join(d,f),f)
    z.close(); print(d, zipfile.ZipFile('twenty-nanometres-v3-%s.zip'%d).namelist())
PY
