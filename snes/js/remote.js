// Debug remote control (only when RUN_REMOTE is set): the TV polls serve.py for commands, presses
// player 1 buttons frame by frame, pauses, and uploads screenshots and save states back to the PC.
// Load before data/loader.js so the WebGL canvas keeps its last frame readable for screenshots.
(function () {
    if (!window.RUN_REMOTE) { return; }
    var HOST = 'http://192.168.1.5:' + (window.RUN_REMOTE_PORT || 8001);
    var BTN = { B: 0, Y: 1, SELECT: 2, START: 3, UP: 4, DOWN: 5, LEFT: 6, RIGHT: 7, A: 8, X: 9, L: 10, R: 11 };

    var nativeGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, attrs) {
        if (/webgl/.test(type)) { attrs = attrs || {}; attrs.preserveDrawingBuffer = true; }
        return nativeGetContext.call(this, type, attrs);
    };

    var lastId = 0, queue = [], busy = false, held = {}, states = {}, paused = false;
    function gm() { var em = window.EJS_emulator; return em && em.started ? em.gameManager : null; }
    function frame() { try { return gm().getFrameNum(); } catch (e) { return -1; } }
    function up(name, body) {
        return fetch(HOST + '/up?name=' + encodeURIComponent(name),
            { method: 'POST', body: body, headers: { 'Content-Type': 'text/plain' } });
    }
    function hold(list) {
        var want = {};
        (list || []).forEach(function (b) { want[String(b).toUpperCase()] = true; });
        Object.keys(BTN).forEach(function (b) {
            if (!!want[b] !== !!held[b]) { gm().simulateInput(0, BTN[b], want[b] ? 1 : 0); held[b] = !!want[b]; }
        });
    }
    function setPaused(p) { gm().toggleMainLoop(p ? 0 : 1); paused = p; }
    function nextTick() { return new Promise(function (r) { requestAnimationFrame(function () { r(); }); }); }

    // Hold each segment's buttons for n frames, then release everything and pause
    async function run(seq) {
        setPaused(false);
        for (var i = 0; i < seq.length; i++) {
            hold(seq[i].b);
            var end = frame() + (seq[i].n || 1);
            while (frame() < end) { await nextTick(); }
        }
        hold([]);
        setPaused(true);
    }

    // Screenshot of the 4:3 game area, scaled to 512x384
    function shot(name) {
        var src = document.querySelector('#game canvas');
        var c = document.createElement('canvas');
        c.width = 512; c.height = 384;
        var h = src.height, w = Math.min(src.width, Math.round(h * 4 / 3)), x = Math.round((src.width - w) / 2);
        c.getContext('2d').drawImage(src, x, 0, w, h, 0, 0, 512, 384);
        return new Promise(function (r) { c.toBlob(function (b) { up(name, b).then(r, r); }, 'image/png'); });
    }

    async function exec(c) {
        var res = { id: c.id, op: c.op, ok: true };
        try {
            if (c.op === 'pause') { setPaused(true); }
            else if (c.op === 'play') { setPaused(false); }
            else if (c.op === 'run') { await run(c.seq || []); }
            else if (c.op === 'reset') { gm().restart(); }
            else if (c.op === 'save') { states[c.slot || 'a'] = gm().getState(); }
            else if (c.op === 'load') { gm().loadState(states[c.slot || 'a']); }
            if (c.op === 'load' || c.op === 'reset') { await run([{ n: 1 }]); }   // let the change reach the screen
            if (c.shot) { await shot('s-' + c.id + '.png'); res.shot = 's-' + c.id + '.png'; }
            if (c.state) { await up('st-' + c.id + '.bin', new Blob([gm().getState()])); res.state = 'st-' + c.id + '.bin'; }
        } catch (e) { res.ok = false; res.err = String(e && e.message || e); }
        res.frame = frame(); res.paused = paused;
        await up('r-' + c.id + '.json', JSON.stringify(res));
    }

    async function pump() {
        if (busy || !queue.length || !gm()) { return; }
        busy = true;
        try { while (queue.length) { await exec(queue.shift()); } } finally { busy = false; }
    }
    var synced = false;
    setInterval(function () {
        fetch(HOST + '/cmd?after=' + lastId).then(function (r) { return r.json(); }).then(function (list) {
            // Skip commands queued before this launch
            list.forEach(function (c) { if (c.id > lastId) { lastId = c.id; if (synced) { queue.push(c); } } });
            if (!synced) { synced = true; up('hello.json', JSON.stringify({ lastId: lastId, t: Date.now() })); }
            pump();
        }).catch(function () { /* PC not reachable; try again */ });
    }, 250);
})();
