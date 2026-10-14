// Temporary: ship console output / errors to the PC server (D:\Samsung_TV_Apps\snes-server\serve.py)
// because the TV's dlog is unavailable. Remove before final use.
(function () {
    var HOST = 'http://192.168.1.5:8000/log?m=';
    var n = 0;
    function send(msg) {
        try {
            if (n++ > 400) { return; }
            new Image().src = HOST + encodeURIComponent(String(msg).slice(0, 600)) + '&t=' + Date.now();
        } catch (e) { /* ignore */ }
    }
    (window.DBG_CONSOLE === false ? [] : ['log', 'info', 'warn', 'error']).forEach(function (lvl) {
        var orig = console[lvl];
        console[lvl] = function () {
            try { send('[' + lvl + '] ' + Array.prototype.slice.call(arguments).join(' ')); } catch (e) { /* ignore */ }
            if (orig) { orig.apply(console, arguments); }
        };
    });
    window.addEventListener('error', function (e) {
        send('[onerror] ' + e.message + ' @ ' + (e.filename || '') + ':' + e.lineno);
    });
    window.addEventListener('unhandledrejection', function (e) {
        send('[unhandledrejection] ' + (e.reason && e.reason.message ? e.reason.message : e.reason));
    });
    send('debug hook up; ua=' + navigator.userAgent);

    // Per-callback cost: wrap requestAnimationFrame so every rAF callback (the emulator's frame) is timed.
    // Also count main-thread long tasks (>50ms). Reported every 2s as [cost].
    var costs = [], longTasks = 0, longMs = 0, costSends = 0;
    var nativeRaf = window.requestAnimationFrame.bind(window);
    if (window.DBG_COST !== false) window.requestAnimationFrame = function (cb) {
        return nativeRaf(function (ts) {
            var t0 = performance.now();
            try { cb(ts); } finally { costs.push(performance.now() - t0); }
        });
    };
    try {
        new PerformanceObserver(function (list) {
            list.getEntries().forEach(function (e) { longTasks++; longMs += e.duration; });
        }).observe({ entryTypes: ['longtask'] });
    } catch (e) { /* not supported */ }
    setInterval(function () {
        if (costSends++ > 300 || !costs.length) { costs = []; return; }
        var a = costs.slice().sort(function (x, y) { return x - y; });
        var pick = function (p) { return a[Math.min(a.length - 1, Math.floor(p * a.length))].toFixed(1); };
        var slow = a.filter(function (v) { return v > 12; }).length;
        new Image().src = HOST + encodeURIComponent('[cost] n=' + a.length + ' p50=' + pick(0.5) + ' p95=' + pick(0.95) +
            ' max=' + a[a.length - 1].toFixed(1) + ' over12ms=' + slow + ' longtasks=' + longTasks + ' longms=' + longMs.toFixed(0) +
            ', ' + (window.RUN_ID || '?')) + '&t=' + Date.now();
        costs = []; longTasks = 0; longMs = 0;
    }, 2000);

    // Frame-rate monitor: rAF rate, worst frame gap, and long main-thread stalls, reported every 2s
    var frames = 0, last = performance.now(), worst = 0, prev = last, sends = 0;
    function raf(now) {
        frames++;
        var gap = now - prev; prev = now;
        if (gap > worst) { worst = gap; }
        if (now - last >= 2000 && sends < 300) {
            sends++;
            var line = '[fps] ' + (frames * 1000 / (now - last)).toFixed(1) + ' rAF/s, worst gap ' + worst.toFixed(0) + 'ms';
            var cvs = document.querySelector('canvas');
            if (cvs) { line += ', canvas ' + cvs.width + 'x' + cvs.height; }
            line += ', ' + (window.RUN_ID || 'Run ?');
            new Image().src = HOST + encodeURIComponent(line) + '&t=' + Date.now();
            frames = 0; worst = 0; last = now;
        }
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Report which core file and settings this build actually used
    setTimeout(function () {
        var cores = performance.getEntriesByType('resource')
            .map(function (r) { return r.name.split('/').pop(); })
            .filter(function (n) { return /wasm\.data$/.test(n); });
        var em = window.EJS_emulator;
        if (!cores.length && em) {
            cores.push((window.EJS_core || 'snes9x') + (em.config && em.config.threads ? '-thread' : '') +
                (em.supportsWebgl2 && em.webgl2Enabled ? '' : '-legacy') + '-wasm.data');
        }
        send('[cfg] ' + (window.RUN_ID || '?') + ' core=' + (cores.join(',') || 'unknown') +
            ' threads=' + (window.RUN_THREADS !== false) + ' opts=' + JSON.stringify(window.RUN_OPTS || {}) +
            ' ra=' + JSON.stringify(window.RUN_RACFG || {}) +
            ' tuned=' + !!(window.EJS_GameManager && window.EJS_GameManager.prototype.__tuned));
    }, 15000);
})();
