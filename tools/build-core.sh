#!/bin/bash
# Build an EmulatorJS core (non-threaded, WebGL2 variant) from a libretro core source tree.
# Usage: build-core.sh <name> <srcdir> [extra make args...]
# Output: ~/ejs/out/<name>-wasm.data
name="$1"; src="$2"; shift 2
extra="$*"
# Windows PATH (inherited by WSL) contains a stray quote that breaks emsdk_env's eval
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
source ~/ejs/emsdk/emsdk_env.sh >/dev/null 2>&1
which emcc || { echo "emcc not found"; exit 1; }
set -e
RA=~/ejs/RetroArch
OUT=~/ejs/out
mkdir -p "$OUT" "$RA/../EmulatorJS/data/cores"

cd "$RA"
git checkout -q 6dd4353937ef48b6ec0bfbdbb15d1c5992d86927

echo "== core $name: make ($extra)"
cd "$src"
rm -f *.bc
emmake make clean >/dev/null 2>&1 || true
emmake make -j$(nproc) platform=emscripten $extra 2>&1 | tail -5
bc=$(ls *_emscripten.bc | head -1)
[ -n "$bc" ] || { echo "no .bc produced"; exit 1; }

echo "== link with RetroArch ($bc)"
cd "$RA/emulatorjs"
rm -f *.bc
cp "$src/$bc" "./${name}_libretro_emscripten.bc"
rm -f "$RA/../EmulatorJS/data/cores/${name}-wasm.data"
emmake ./build-emulatorjs.sh --clean > "$OUT/${name}-link.log" 2>&1 || { tail -30 "$OUT/${name}-link.log"; exit 1; }
rm -f *.bc

echo "== pack"
cd "$OUT"
rm -rf pack && mkdir pack && cd pack
printf '{"name":"%s","extensions":["smc","sfc","swc","fig","bs","st"],"options":{},"save":"srm","license":"license.txt"}' "$name" > core.json
printf '{\n    "minimumEJSVersion": "4.2.2",\n    "version": "2.0.2"\n}\n' > build.json
cp "$src/copyright" license.txt 2>/dev/null || cp "$src/LICENSE" license.txt 2>/dev/null || echo "see source" > license.txt
cp "$RA/../EmulatorJS/data/cores/${name}-wasm.data" "$OUT/${name}-wasm.data"
7z a -t7z "$OUT/${name}-wasm.data" core.json license.txt build.json >/dev/null
cd "$OUT" && 7z l "${name}-wasm.data" | tail -8
ls -la "$OUT/${name}-wasm.data"
