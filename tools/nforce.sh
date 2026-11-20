#!/bin/bash
# nforce.sh <slug> <from> <to> <res> <outdir> <extra-query>  -- forced-trait previews
slug=$1; from=$2; to=$3; res=$4; out=$5; extra=$6; mkdir -p $out
seq $from $to | xargs -P 8 -I{} bash -c 'h=0x$(echo -n "clyde-'$slug'-{}" | sha256sum | cut -c1-64); n=$(printf %02d {}); node /workspace/clyde/tools/nodeharness.js '$slug' "$h&'$extra'" '$res' /tmp/nf_$n.ppm > '$out'/$n.json && python3 -c "from PIL import Image; Image.open(\"/tmp/nf_$n.ppm\").save(\"'$out'/$n.png\")" && rm /tmp/nf_$n.ppm'
