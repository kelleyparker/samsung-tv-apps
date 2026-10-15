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

    // Game-frame counter: RetroArch uploads each new emulated frame to a WebGL texture, so counting
    // texture uploads between display refreshes shows what the player sees. 1 per refresh = smooth,
    // 0 = the previous frame repeats (stutter), 2+ = frames were skipped.
    var uploads = 0;
    ['WebGLRenderingContext', 'WebGL2RenderingContext'].forEach(function (cls) {
        var proto = window[cls] && window[cls].prototype;
        if (!proto) { return; }
        ['texSubImage2D', 'texImage2D'].forEach(function (fn) {
            var orig = proto[fn];
            proto[fn] = function () { uploads++; return orig.apply(this, arguments); };
        });
    });
    // Audio probe: RetroArch's OpenAL driver (Emscripten) plays each small buffer as an AudioBufferSourceNode.
    // Per 2s: seconds of audio scheduled per real second (should be ~1.00), gaps where a buffer started
    // late (underrun = audible stutter), and how fast the AudioContext clock runs vs real time.
    var aud = { ctx: null, sched: 0, nodes: 0, late: 0, lastEnd: 0, t0: 0, c0: 0 };
    if (window.AudioBufferSourceNode) {
        var origStart = AudioBufferSourceNode.prototype.start;
        AudioBufferSourceNode.prototype.start = function (when) {
            try {
                var ctx = this.context, w = when || ctx.currentTime, d = this.buffer ? this.buffer.duration : 0;
                if (!aud.ctx) { aud.ctx = ctx; aud.t0 = performance.now(); aud.c0 = ctx.currentTime; }
                aud.sched += d; aud.nodes++;
                if (aud.lastEnd && w > aud.lastEnd + 0.002) { aud.late++; }
                aud.lastEnd = Math.max(aud.lastEnd, w + d);
            } catch (e) { /* ignore */ }
            return origStart.apply(this, arguments);
        };
    }
    var audSends = 0;
    setInterval(function () {
        if (!aud.ctx || audSends++ > 300) { return; }
        var now = performance.now(), c = aud.ctx.currentTime;
        var realS = (now - aud.t0) / 1000, ctxS = c - aud.c0;
        new Image().src = HOST + encodeURIComponent('[aud] rate=' + aud.ctx.sampleRate + ' state=' + aud.ctx.state +
            ' sched/s=' + (realS ? aud.sched / realS : 0).toFixed(3) + ' clock=' + (realS ? ctxS / realS : 0).toFixed(3) +
            ' nodes=' + aud.nodes + ' gaps=' + aud.late + ' ahead=' + ((aud.lastEnd - c) * 1000).toFixed(0) + 'ms, ' +
            (window.RUN_ID || '?')) + '&t=' + Date.now();
        aud.sched = 0; aud.nodes = 0; aud.late = 0; aud.t0 = now; aud.c0 = c;
    }, 2000);

    // Gamepad diagnostics: what the TV reports for each controller, plus (only when DBG_PADLOG is set)
    // every raw button/axis change, read before js/gamepad.js remaps anything. Reported as [pad].
    var padSends = 0, padPrev = {};
    var rawPads = navigator.getGamepads ? navigator.getGamepads.bind(navigator) : null;
    function padSend(msg) {
        if (padSends++ > 1500) { return; }
        new Image().src = HOST + encodeURIComponent('[pad] ' + msg + ', ' + (window.RUN_ID || '?')) + '&t=' + Date.now();
    }
    window.addEventListener('gamepadconnected', function (e) {
        var p = e.gamepad;
        padSend('connected #' + p.index + ' id="' + p.id + '" mapping=' + (p.mapping || 'none') +
            ' buttons=' + p.buttons.length + ' axes=' + p.axes.length);
    });
    window.addEventListener('gamepaddisconnected', function (e) { padSend('disconnected #' + e.gamepad.index); });
    function pollPads() {
        var pads = rawPads ? rawPads() : [];
        for (var i = 0; i < pads.length; i++) {
            var p = pads[i];
            if (!p) { continue; }
            for (var b = 0; b < p.buttons.length; b++) {
                var k = p.index + 'b' + b, on = p.buttons[b].pressed;
                if (on !== !!padPrev[k]) {
                    padPrev[k] = on;
                    padSend('#' + p.index + ' button ' + b + (on ? ' down' : ' up') + ' value=' + p.buttons[b].value.toFixed(2));
                }
            }
            for (var a = 0; a < p.axes.length; a++) {
                var v = p.axes[a], q = v > 0.5 ? 1 : (v < -0.5 ? -1 : 0), ka = p.index + 'a' + a;
                if (q !== (padPrev[ka] || 0)) { padPrev[ka] = q; padSend('#' + p.index + ' axis ' + a + ' -> ' + v.toFixed(2)); }
            }
        }
    }

    // Shared with main.js for the on-screen panel
    window.EMU_STATS = { emuFps: 0, repeats: 0, skips: 0, rafFps: 0, worst: 0 };

    // Frame-rate monitor: rAF rate, worst frame gap, and game frames per refresh, reported every 2s
    var frames = 0, last = performance.now(), worst = 0, prev = last, sends = 0;
    var emuFrames = 0, repeats = 0, skips = 0, started = false;
    function raf(now) {
        frames++;
        if (window.DBG_PADLOG) { try { pollPads(); } catch (e) { /* ignore */ } }
        var gap = now - prev; prev = now;
        if (gap > worst) { worst = gap; }
        var u = uploads; uploads = 0;
        if (u > 0) { started = true; }
        if (started) {
            emuFrames += u;
            if (u === 0) { repeats++; } else if (u > 1) { skips += u - 1; }
        }
        if (now - last >= 2000) {
            var secs = (now - last) / 1000;
            var s = window.EMU_STATS;
            s.rafFps = frames / secs; s.worst = worst;
            s.emuFps = emuFrames / secs; s.repeats = repeats; s.skips = skips;
            if (sends < 300) {
                sends++;
                var line = '[fps] ' + s.rafFps.toFixed(1) + ' rAF/s, worst gap ' + worst.toFixed(0) + 'ms';
                var cvs = document.querySelector('canvas');
                if (cvs) { line += ', canvas ' + cvs.width + 'x' + cvs.height; }
                line += ', emu ' + s.emuFps.toFixed(1) + ' fps, repeats ' + repeats + ', skips ' + skips;
                if (window.EMU_LIVE === false) { line += ', cover'; }   // still behind the warm-up screen
                line += ', ' + (window.RUN_ID || 'Run ?');
                new Image().src = HOST + encodeURIComponent(line) + '&t=' + Date.now();
            }
            frames = 0; worst = 0; last = now; emuFrames = 0; repeats = 0; skips = 0;
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
            ' tuned=' + !!(window.EJS_GameManager && window.EJS_GameManager.prototype.__tuned) +
            ' touch=' + (navigator.maxTouchPoints || 0) + (('ontouchstart' in window) ? '+events' : ''));
    }, 15000);
})();
