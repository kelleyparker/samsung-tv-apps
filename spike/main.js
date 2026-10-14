(function () {
    var lines = [];
    function log(k, v) {
        var s = k + ': ' + v;
        lines.push(s);
        console.log('SPIKE ' + s);
        try {
            new Image().src = 'http://192.168.1.5:8000/log?m=' + encodeURIComponent(s) + '&t=' + Date.now();
        } catch (e) { /* ignore */ }
        document.getElementById('out').textContent = lines.join('\n');
    }

    log('userAgent', navigator.userAgent);
    log('screen', screen.width + 'x' + screen.height + ' dpr=' + window.devicePixelRatio);

    // Minimal valid wasm module: (module)
    var hasWasm = typeof WebAssembly === 'object';
    log('WebAssembly', hasWasm);
    if (hasWasm) {
        try {
            var bytes = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0]);
            log('wasm compile', WebAssembly.validate(bytes));
        } catch (e) {
            log('wasm compile', 'error ' + e);
        }
        try {
            // module using a threads-style shared memory
            var m = new WebAssembly.Memory({ initial: 1, maximum: 1, shared: true });
            log('wasm shared memory', m.buffer instanceof SharedArrayBuffer);
        } catch (e) {
            log('wasm shared memory', 'no (' + e.name + ')');
        }
    }
    log('SharedArrayBuffer', typeof SharedArrayBuffer);
    log('crossOriginIsolated', window.crossOriginIsolated);
    log('AudioContext', typeof (window.AudioContext || window.webkitAudioContext));
    log('AudioWorklet', typeof AudioWorkletNode);
    log('WebGL', (function () {
        try { return !!document.createElement('canvas').getContext('webgl'); } catch (e) { return false; }
    })());
    log('WebGL2', (function () {
        try { return !!document.createElement('canvas').getContext('webgl2'); } catch (e) { return false; }
    })());
    log('OffscreenCanvas', typeof OffscreenCanvas);
    log('IndexedDB', typeof indexedDB);
    log('fetch', typeof fetch);
    log('Gamepad API', typeof navigator.getGamepads);

    function listPads() {
        var pads = navigator.getGamepads ? navigator.getGamepads() : [];
        var n = 0, names = [];
        for (var i = 0; i < pads.length; i++) {
            if (pads[i]) { n++; names.push(pads[i].id); }
        }
        return n + ' connected ' + names.join(' | ');
    }
    window.addEventListener('gamepadconnected', function (e) {
        log('gamepadconnected', e.gamepad.id + ' buttons=' + e.gamepad.buttons.length + ' mapping=' + e.gamepad.mapping);
    });
    log('gamepads now', listPads());

    // Can we reach the PC over the LAN?
    fetch('http://192.168.1.5:8000/ping.txt').then(function (r) {
        return r.text();
    }).then(function (t) {
        log('LAN fetch PC', 'ok: ' + t.trim());
    }).catch(function (e) {
        log('LAN fetch PC', 'failed: ' + e);
    });

    document.addEventListener('keydown', function (e) {
        if (e.keyCode === 10009) {
            try { tizen.application.getCurrentApplication().exit(); } catch (x) { window.close(); }
        }
    });
})();
