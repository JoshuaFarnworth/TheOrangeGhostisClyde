#!/bin/bash
# tools/mk.sh : src/art.js = _lib/px.js + src/world.js + src/fauna.js + src/main.js ; prints sha256
d=$(cd "$(dirname "$0")/.." && pwd)
cat /workspace/clyde/2027/_lib/px.js $d/src/world.js $d/src/fauna.js $d/src/main.js > $d/src/art.js && sha256sum $d/src/art.js
