#!/bin/bash
# tools/batch.sh <outdir> <res> <jobs> <run:N>... : render to disk, log each file as it lands
out=$1; res=$2; J=$3; shift 3; mkdir -p $out
for spec in "$@"; do run=${spec%%:*}; n=${spec##*:}
  ( node tools/render.js histories/$run.json $n $res $out/${run}_$n.png > $out/${run}_$n.log 2>&1 && echo "- $(date '+%H:%M') rendered $out/${run}_$n.png" >> LOG.md && rm -f $out/${run}_$n.log ) &
  while [ $(jobs -r | wc -l) -ge $J ]; do sleep 1; done
done; wait
