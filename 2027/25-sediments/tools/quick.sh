#!/bin/bash
# tools/quick.sh <run> <res> <N...> : render tokens of a run in parallel and tile them to /tmp/sed/grid.png
run=$1; res=$2; shift 2; mkdir -p /tmp/sed; files=()
for n in "$@"; do node tools/render.js histories/$run.json $n $res /tmp/sed/${run}_$n.png > /tmp/sed/${run}_$n.log 2>&1 & files+=(/tmp/sed/${run}_$n.png); done; wait
for n in "$@"; do python3 -c "import json;d=json.load(open('/tmp/sed/${run}_$n.json'));f=d['features'];print($n,f['Era'],'|',f['World Date'],'|',f['Surface'],'|',f['Remains In View'],'|',[(r['stage'],r['flesh'],r['age']) for r in d['sed']['remains']][:2])" 2>/dev/null || head -c 800 /tmp/sed/${run}_$n.log; done
python3 - "${files[@]}" <<'P'
import sys; from PIL import Image
ims=[Image.open(f) for f in sys.argv[1:]]; w,h=ims[0].size; c=min(3,len(ims)); r=(len(ims)+c-1)//c
S=Image.new('RGB',(c*w+(c-1)*6,r*h+(r-1)*6),'white')
for i,im in enumerate(ims): S.paste(im,((i%c)*(w+6),(i//c)*(h+6)))
S.save('/tmp/sed/grid.png')
P
