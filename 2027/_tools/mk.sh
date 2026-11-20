#!/bin/bash
# mk.sh <projectDir> : src/art.js = _lib/px.js + src/main.js
d=$1; cat /workspace/clyde/2027/_lib/px.js $d/src/main.js > $d/src/art.js
