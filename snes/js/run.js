// Build settings. The test harness rewrites this file for each run; these are the tested defaults.
// For NES, set RUN_CORE = 'fceumm', RUN_OPTS = {"webgl2Enabled":"enabled"}, RUN_ROM = 'roms/<game>.nes'.
window.RUN_ID = 'default';
window.RUN_NOTE = 'Tested defaults (see snes-runs.md)';
window.FPS_OVERLAY = true;      // small fps panel in the corner
window.DBG_CONSOLE = false;     // true = also send console output to serve.py
window.DBG_PADLOG = false;      // true = send every controller button/axis change to serve.py
window.RUN_THREADS = false;     // the threaded core was slower on the TV
window.RUN_OPTS = {"webgl2Enabled":"enabled","snes9x_2005_frameskip":"manual","snes9x_2005_frameskip_threshold":"15"};
window.RUN_RACFG = {"audio_latency":256};
window.RUN_NOEMU = false;
window.DBG_COST = false;
window.RUN_HIDE_UI = false;
window.RUN_CORE = 'snes9x2005';
window.RUN_ROM = 'roms/smw.zip';
window.RUN_GAME = 'Super Mario World';
window.RUN_WARMUP = 20;         // seconds behind the loading cover while the TV settles
