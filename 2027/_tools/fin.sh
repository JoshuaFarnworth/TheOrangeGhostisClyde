#!/bin/bash
# fin.sh <projectDir> <title> <round> <hero ids...> : samples/r<round> (12 @400) + contact-sheet-r<round>.png + dist build + heroes @1600
d=$1; t=$2; r=$3; shift 3; T=/workspace/clyde/2027/_tools
rm -rf $d/samples/r$r; bash $T/batch.sh $d 1 12 400 $d/samples/r$r && python3 $T/sheet.py $d/samples/r$r $d/contact-sheet-r$r.png 4 300 && node $T/build.js $d "$t" && [ $# -gt 0 ] && node $T/hero.js $d 1600 "$@" | cut -c1-160
