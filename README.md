# Samsung TV Apps

Personal Tizen web apps for Samsung TVs (developed on a Samsung Movingstyle), built with Tizen Studio 6.1 and the Samsung TV extensions.

| Folder | App | Notes |
|---|---|---|
| `app1/` | **ClockApp** (`ClockApp01.ClockApp`) | Clock over a looping video background. Add your own `icon.png` and `video/clip.mp4` (1080p H.264). |
| `snes/` | **SNES** (`SnesApp001.SnesApp`) | SNES and NES emulator using [EmulatorJS](https://github.com/EmulatorJS/EmulatorJS) 4.2.3, a custom-built **Snes9x 2005** core and the stock **FCEUmm** NES core. Runs at about 59.9 fps at 1920x1080 (results below). Xbox Wireless Controller supported. Put your own ROMs in `snes/roms/` (see its README). |
| `spike/` | **Spike** (`SpikeApp01.Spike`) | Capability test for WebAssembly, SharedArrayBuffer, WebGL2, Gamepad API and LAN access. |
| `snes-server/` | `serve.py` | Small CORS file server for the PC (port 8000). Used for debug beacons, and later for streaming ROMs. |
| `tools/` | `build-core.sh` | Builds a libretro core into an EmulatorJS `*-wasm.data` file (see below). |

Performance tuning history: [`snes-runs.md`](snes-runs.md).

## SNES app: results on the Movingstyle (UN27LSM7FAXXZA)

1920x1080, about 2½ minutes of play per game. "Drops" are display refreshes that missed their 16.7 ms slot. Audio gaps are audible underruns.

| Game | Chip / mapper | fps | Drops/min | Hitch-free 2 s windows | Audio gaps/min |
|---|---|---|---|---|---|
| Zelda: A Link to the Past | - | 59.95 | 3 | 90% | 0 |
| Yoshi's Island | Super FX 2 | 59.96 | 2 | 92% | 0 |
| Super Mario Kart | DSP-1 | 59.91 | 5-6 | 87% | 0 |
| Super Mario World | - | 59.86 | 9 | 88% | 1 |
| Super Mario RPG | SA-1 | 59.90 | 6 | 85% | 0 |
| Mega Man X2 | Cx4 | 59.92 | 5 | 83% | 2 |
| Star Fox | Super FX | 59.56 (game 58.4) | 26 | 77% | 12 |
| NES: Bomberman | NROM | 59.96 | 2 | 92% | 0 |
| NES: Blaster Master | MMC1 | 59.89 | 6 | 82% | 0 |
| NES: 1943 | UxROM | 59.91 | 6 | 82% | 0 |
| NES: Alpha Mission | CNROM | 59.88 | 7 | 76% | 0 |
| NES: Battletoads | AxROM | 59.88 | 8 | 79% | 2 |

Star Fox is the only game with noticeable stutter. Snes9x 2005 runs each Super FX job to completion in one go, so heavy 3D scenes spike the frame time.

### Settings, and why

All set in `snes/js/run.js`:

- **Snes9x 2005 core, no threads, WebGL2.** The stock `snes9x` core needed about 14 ms per frame, and the threaded build was slower on the TV.
- **`audio_latency` 256 ms.** Shorter buffers underran and stalled the game loop.
- **Frameskip `manual` at 15%.** Skips a frame only when the audio buffer gets low. `auto` skipped about a third of all frames.
- **20 s loading cover** (`js/warmup.js`). The first seconds after launch stutter while the TV settles, so the game runs behind a cover screen and restarts when the cover lifts.

### NES

The stock EmulatorJS FCEUmm core is in `snes/data/cores/fceumm-wasm.data`. To play an NES game, set `RUN_CORE = 'fceumm'`, `RUN_OPTS = {"webgl2Enabled":"enabled"}` and `RUN_ROM = 'roms/<game>.nes'` in `snes/js/run.js`.

### Controllers

`snes/js/gamepad.js` maps a standard gamepad by button position, like a real SNES pad. Tested with an Xbox Wireless Controller (Series X|S, `045e:0b13`) paired to the TV over Bluetooth.

| Xbox | SNES | NES |
|---|---|---|
| A (bottom) | B | B |
| B (right) | A | A |
| X (left) | Y | - |
| Y (top) | X | - |
| LB / RB | L / R | - |
| View / Menu | Select / Start | Select / Start |
| D-pad or left stick | D-pad | D-pad |

### Remote control (debug)

`snes/js/remote.js` lets the PC drive the game. It's off unless `RUN_REMOTE = true` is set in `snes/js/run.js`. When on:

- The TV polls `serve.py` (port `RUN_REMOTE_PORT`) for commands: `run` (hold buttons for a number of frames, then pause), `pause`, `play`, `save`/`load` (in-memory save states), `reset`.
- It uploads screenshots and save states to `snes-server/remote/`.
- Queue commands with `POST /cmd` and a JSON body, for example `{"op":"run","seq":[{"n":30,"b":["RIGHT","Y"]}],"shot":true}`.

### ROM folders

ROMs are git-ignored, and only the empty folders are in the repo:

- `snes/roms/` holds games packaged into the app. The default is `smw.zip`.
- `snes-server/roms/` holds games served from the PC by `serve.py`, for a future game picker.

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

The stock EmulatorJS `snes9x` core was too CPU-heavy for the TV (about 14 ms per frame). The lighter Snes9x 2005 core needs about 7.6 ms for most games, which leaves headroom in the 16.7 ms frame budget.

Build it in WSL Ubuntu (amd64):

1. Install `emsdk` 3.1.74 at `~/ejs/emsdk`.
2. Clone `https://github.com/EmulatorJS/RetroArch` (branch `next`) to `~/ejs/RetroArch`. The script pins commit `6dd43539`, which matches EmulatorJS 4.2.3.
3. Clone `https://github.com/libretro/snes9x2005` to `~/ejs/snes9x2005`. Optionally change `-O2` to `-O3` in its Makefile.
4. Run `bash tools/build-core.sh snes9x2005 ~/ejs/snes9x2005`.
5. Copy `~/ejs/out/snes9x2005-wasm.data` to `snes/data/cores/`.

## Licenses

- The original code in this repo is MIT-licensed. See [`LICENSE`](LICENSE).
- EmulatorJS (`snes/data/`) is GPL-3.0. See `snes/data/LICENSE-EmulatorJS.txt`.
- The Snes9x cores are under the Snes9x license (non-commercial). Each core's license text is inside its `.data` archive.
- The FCEUmm core is GPL-2.0. Its license text is inside `fceumm-wasm.data`.
- No ROMs are included. Use only games you own.
