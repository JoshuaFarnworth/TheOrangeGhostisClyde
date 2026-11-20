#!/bin/bash
# nids.sh <slug> <res> <outdir> <ids...> -- parallel node renders of specific sample ids
slug=$1; res=$2; out=$3; shift 3; mkdir -p $out
printf "%s\n" "$@" | xargs -P 8 -I{} bash -c 'h=0x$(echo -n "clyde-'$slug'-{}" | sha256sum | cut -c1-64); n=$(printf %02d {}); node /workspace/clyde/tools/nodeharness.js '$slug' $h '$res' /tmp/ni_$n.ppm > '$out'/$n.json && python3 -c "from PIL import Image; Image.open(\"/tmp/ni_$n.ppm\").save(\"'$out'/$n.png\")" && rm /tmp/ni_$n.ppm'
