# ROMs baked into the app

Put your own games here before building. They are packaged into the `.wgt` and loaded from `roms/`.

- SNES: `.sfc`, `.smc` or a `.zip` holding one of them. The default game is `smw.zip` (Super Mario World).
- NES: `.nes` (iNES). Switch the core to `fceumm` in `js/run.js`.

To play a different game, change `RUN_ROM` (and `RUN_GAME`) in `js/run.js`.

ROMs are git-ignored and never uploaded. Only use games you own.
