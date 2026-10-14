# Samsung TV Apps

Personal Tizen web apps for Samsung TVs (developed on a Samsung Movingstyle), built with Tizen Studio 6.1 and the Samsung TV extensions.

| Folder | App | Notes |
|---|---|---|
| `app1/` | **ClockApp** (`ClockApp01.ClockApp`) | Clock over a looping video background. Add your own `icon.png` and `video/clip.mp4` (1080p H.264). |
| `snes/` | **SNES** (`SnesApp001.SnesApp`) | SNES emulator using [EmulatorJS](https://github.com/EmulatorJS/EmulatorJS) 4.2.3 and a custom-built **Snes9x 2005** core. Runs at a locked 60 fps at 1920x1080. Put your own ROM at `snes/roms/smw.zip`, or change `EJS_gameUrl` in `snes/index.html`. |
| `spike/` | **Spike** (`SpikeApp01.Spike`) | Capability test for WebAssembly, SharedArrayBuffer, WebGL2, Gamepad API and LAN access. |
| `snes-server/` | `serve.py` | Small CORS file server for the PC (port 8000). Used for debug beacons, and later for streaming ROMs. |
| `tools/` | `build-core.sh` | Builds a libretro core into an EmulatorJS `*-wasm.data` file (see below). |

Performance tuning history: [`snes-runs.md`](snes-runs.md).

## Build and install (Tizen CLI)

```bash
tizen build-web -out .buildResult -- snes
tizen package -t wgt -s <your-certificate-profile> -o out -- snes/.buildResult
sdb connect <tv-ip>:26101
tizen install -n out/SNES.wgt -t <device-name>
tizen run -p SnesApp001.SnesApp -t <device-name>
```

The TV must be in Developer Mode with your PC's IP set. The certificate profile must be a Samsung distributor certificate that includes your TV's DUID.

## Rebuilding the Snes9x 2005 core

The stock EmulatorJS `snes9x` core was too CPU-heavy for the TV (about 14 ms per frame). The lighter Snes9x 2005 core needs about 7.6 ms and runs at a solid 60 fps.

Build it in WSL Ubuntu (amd64):

1. Install `emsdk` 3.1.74 at `~/ejs/emsdk`.
2. Clone `https://github.com/EmulatorJS/RetroArch` (branch `next`) to `~/ejs/RetroArch`. The script pins commit `6dd43539`, which matches EmulatorJS 4.2.3.
3. Clone `https://github.com/libretro/snes9x2005` to `~/ejs/snes9x2005`. Optionally change `-O2` to `-O3` in its Makefile.
4. Run `bash tools/build-core.sh snes9x2005 ~/ejs/snes9x2005`.
5. Copy `~/ejs/out/snes9x2005-wasm.data` to `snes/data/cores/`.

## Licenses

- EmulatorJS (`snes/data/`) is GPL-3.0. See `snes/data/LICENSE-EmulatorJS.txt`.
- The Snes9x cores are under the Snes9x license (non-commercial). Each core's license text is inside its `.data` archive.
- No ROMs are included. Use only games you own.
