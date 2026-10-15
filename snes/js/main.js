(function () {
    function exitApp() {
        try {
            tizen.application.getCurrentApplication().exit();
        } catch (e) {
            window.close();
        }
    }

    // 10009 = Samsung remote Back/Return
    document.addEventListener('keydown', function (e) {
        if (e.keyCode === 10009) {
            exitApp();
        }
    }, true);

    // Debug overlay (top-left). Line 1: browser refresh rate, worst gap, canvas resolution.
    // Line 2: game frames actually drawn per second, plus repeated/skipped frames (from js/debug.js, 2s window).
    // Line 3: build label from js/run.js.
    if (window.FPS_OVERLAY === false) { return; }
    var panel = document.createElement('div');
    panel.style.cssText = 'position:fixed;top:12px;left:16px;z-index:2147483647;' +
        'padding:6px 12px;border-radius:6px;background:rgba(0,0,0,0.6);' +
        'font:bold 28px/1.3 monospace;color:#0f0;pointer-events:none;';
    var fpsLine = document.createElement('div');
    var emuLine = document.createElement('div');
    var runLine = document.createElement('div');
    runLine.style.color = '#fff';
    runLine.textContent = (window.RUN_ID || 'Run ?') + (window.RUN_NOTE ? '  ' + window.RUN_NOTE : '');
    fpsLine.textContent = 'FPS --';
    emuLine.textContent = 'GAME --';
    panel.appendChild(fpsLine);
    panel.appendChild(emuLine);
    panel.appendChild(runLine);
    document.body.appendChild(panel);

    function colour(ok, warn) { return ok ? '#0f0' : (warn ? '#ff0' : '#f33'); }
    var frames = 0, worst = 0, last = performance.now(), prev = last;
    function loop(now) {
        frames++;
        var gap = now - prev;
        prev = now;
        if (gap > worst) { worst = gap; }
        var elapsed = now - last;
        if (elapsed >= 500) {
            var fps = frames * 1000 / elapsed;
            var cvs = document.querySelector('#game canvas');
            var res = cvs ? cvs.width + 'x' + cvs.height : '--';
            fpsLine.textContent = 'FPS ' + fps.toFixed(0) + '  (max gap ' + worst.toFixed(0) + 'ms)   ' + res;
            fpsLine.style.color = colour(fps >= 55, fps >= 40);
            var s = window.EMU_STATS;
            if (s && s.emuFps > 0) {
                var bad = s.repeats + s.skips;
                emuLine.textContent = 'GAME ' + s.emuFps.toFixed(1) + ' fps  repeats ' + s.repeats + '  skips ' + s.skips + '  (2s)';
                emuLine.style.color = colour(bad === 0, bad <= 3);
            }
            frames = 0;
            worst = 0;
            last = now;
        }
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
})();
