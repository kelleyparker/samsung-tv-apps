// Startup warm-up: on the TV the first ~20s after the core starts drop frames (the browser is still
// compiling/optimising the emulator), so run the game muted behind a loading screen for RUN_WARMUP
// seconds, then restart it from the beginning and reveal it.
(function () {
    var secs = window.RUN_WARMUP || 0;
    window.EMU_LIVE = !secs;
    if (!secs) { return; }
    window.EJS_volume = 0;
    var cover = document.createElement('div');
    // Not fully opaque, so the browser keeps drawing the game underneath (the warm-up must be real work)
    cover.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483646;' +
        'background:rgba(0,0,0,0.98);color:#fff;display:flex;align-items:center;justify-content:center;' +
        'font:bold 48px sans-serif;';
    cover.textContent = 'Loading ' + (window.EJS_gameName || '') + '...';
    document.body.appendChild(cover);
    window.EJS_onGameStart = function () {
        setTimeout(function () {
            var em = window.EJS_emulator;
            try { em.gameManager.restart(); } catch (e) { /* keep going without the restart */ }
            try { em.setVolume(0.5); } catch (e) { /* ignore */ }
            cover.parentNode.removeChild(cover);
            window.EMU_LIVE = true;
        }, secs * 1000);
    };
})();
