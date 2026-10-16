// Price store and live trade feed (Finnhub WebSocket).
// Every price change goes through S.feed.tick(), which marks the symbol dirty;
// views.js repaints dirty symbols a few times per second.
S.feed = (function () {
    var U = S.util;
    var quotes = {};     // sym -> {price, prevClose, open, high, low, t}
    var d1 = {};         // sym -> {day, bars: {bucketMinute: {o,h,l,c,v}}}
    var dirty = {};
    var subs = {};
    var ws = null;
    var backoff = 2000;
    var state = { up: false };

    function q(sym) {
        return quotes[sym] || (quotes[sym] = { price: null, prevClose: null, open: null, high: null, low: null, t: 0 });
    }

    function setQuote(sym, r) {
        if (!r || !r.c) { return; }
        var o = q(sym);
        o.price = r.c;
        o.prevClose = r.pc;
        o.open = r.o;
        o.high = r.h;
        o.low = r.l;
        o.t = r.t ? r.t * 1000 : Date.now();
        dirty[sym] = 1;
    }

    function setBars(sym, ser) {
        if (!ser || !ser.pts) { return; }
        var cur = d1[sym];
        var bars = {};
        ser.pts.forEach(function (p) {
            bars[p.x] = { o: p.o, h: p.h, l: p.l, c: p.c, v: p.v };
        });
        // Keep live buckets newer than the fetched history.
        if (cur && cur.day === ser.day) {
            Object.keys(cur.bars).forEach(function (k) {
                if (!bars[k]) { bars[k] = cur.bars[k]; }
            });
        }
        d1[sym] = { day: ser.day, bars: bars };
        dirty[sym] = 1;
    }

    function tick(sym, price, vol, t) {
        var o = q(sym);
        o.price = price;
        if (o.high === null || price > o.high) { o.high = price; }
        if (o.low === null || price < o.low) { o.low = price; }
        o.t = t;
        dirty[sym] = 1;

        var e = U.et(t);
        if (e.min < 0 || e.min >= 390) { return; }
        var day = d1[sym];
        if (!day || day.day !== e.day) {
            day = d1[sym] = { day: e.day, bars: {} };
        }
        var k = Math.floor(e.min / 5) * 5;
        var b = day.bars[k];
        if (!b) {
            b = day.bars[k] = { o: price, h: price, l: price, c: price, v: 0 };
        }
        b.c = price;
        if (price > b.h) { b.h = price; }
        if (price < b.l) { b.l = price; }
        b.v += vol || 0;
    }

    // Today's bars, oldest first, as [{x,o,h,l,c,v}]
    function bars(sym) {
        var day = d1[sym];
        if (!day) { return []; }
        return Object.keys(day.bars).map(Number).sort(function (a, b) { return a - b; }).map(function (k) {
            var b = day.bars[k];
            return { x: k, o: b.o, h: b.h, l: b.l, c: b.c, v: b.v };
        });
    }

    function volume(sym) {
        return bars(sym).reduce(function (s, b) { return s + b.v; }, 0);
    }

    function takeDirty() {
        var d = dirty;
        dirty = {};
        return d;
    }

    // ---- WebSocket ----
    function send(o) {
        if (ws && ws.readyState === 1) { ws.send(JSON.stringify(o)); }
    }

    function subscribe(list) {
        list.forEach(function (sym) {
            if (subs[sym]) { return; }
            if (Object.keys(subs).length >= 50) { return; }   // free-tier cap
            subs[sym] = 1;
            send({ type: 'subscribe', symbol: sym });
        });
    }

    function connect() {
        if (!CONFIG.FINNHUB_KEY) { return; }
        try {
            ws = new WebSocket('wss://ws.finnhub.io?token=' + encodeURIComponent(CONFIG.FINNHUB_KEY));
        } catch (e) {
            retry();
            return;
        }
        ws.onopen = function () {
            state.up = true;
            backoff = 2000;
            Object.keys(subs).forEach(function (sym) { send({ type: 'subscribe', symbol: sym }); });
        };
        ws.onmessage = function (ev) {
            var m;
            try { m = JSON.parse(ev.data); } catch (e) { return; }
            if (m.type !== 'trade' || !m.data) { return; }
            m.data.forEach(function (tr) { tick(tr.s, tr.p, tr.v, tr.t); });
        };
        ws.onclose = function () {
            state.up = false;
            retry();
        };
        ws.onerror = function () {
            try { ws.close(); } catch (e) { /* ignore */ }
        };
    }

    function retry() {
        state.up = false;
        setTimeout(connect, backoff);
        backoff = Math.min(backoff * 2, 60000);
    }

    return {
        q: q, setQuote: setQuote, setBars: setBars, tick: tick, bars: bars, volume: volume,
        takeDirty: takeDirty, subscribe: subscribe, connect: connect, state: state
    };
})();
