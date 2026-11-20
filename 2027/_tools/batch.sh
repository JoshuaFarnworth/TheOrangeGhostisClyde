#!/bin/bash
# batch.sh <projectDir> <from> <to> <res> <outdir> [extra-qs]  : parallel renders, hash = sha256("clyde-<slug>-<i>")
d=$1; from=$2; to=$3; res=$4; out=$5; extra=$6; slug=$(basename $d | cut -d- -f2-); mkdir -p $out
bash /workspace/clyde/2027/_tools/mk.sh $d
seq $from $to | xargs -P 8 -I{} bash -c 'h=0x$(echo -n "clyde-'$slug'-{}" | sha256sum | cut -c1-64); n=$(printf %02d {}); q=$h; [ -n "'$extra'" ] && q="$h&'$extra'"; node /workspace/clyde/2027/_tools/nh.js '$d' "$q" '$res' /tmp/b27_'$slug'_$n.ppm > '$out'/$n.json && python3 -c "from PIL import Image; Image.open(\"/tmp/b27_'$slug'_$n.ppm\").save(\"'$out'/$n.png\")" && rm /tmp/b27_'$slug'_$n.ppm'
