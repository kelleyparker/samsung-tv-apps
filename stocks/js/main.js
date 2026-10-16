// Boot, auto-rotation, refresh timers and remote keys.
(function () {
    var U = S.util;
    var F = S.feed;
    var V = S.views;

    S.isDemo = /[?&]demo=1/.test(location.search) || !CONFIG.FINNHUB_KEY || !CONFIG.TWELVEDATA_KEY;
    // Test overrides: ?rotate=10&pause=5 (seconds)
    var qr = /[?&]rotate=(\d+)/.exec(location.search);
    var qp = /[?&]pause=(\d+)/.exec(location.search);
    if (qr) { CONFIG.ROTATE_SEC = +qr[1]; }
    if (qp) { CONFIG.PAUSE_SEC = +qp[1]; }
    var api = S.isDemo ? S.demo : S.live;

    var WL = CONFIG.WATCHLIST.slice();
    var IDX = CONFIG.INDICES.map(function (i) { return i.sym; });
    var details = {};          // sym -> {profile, metrics, earnings, recs, peers, news}
    var hist = {};             // 'range:sym' -> series (non-1D)
    var cur = 0;               // index into WL
    var range = '1D';
    var market = null;
    var breaking = [];
    var breakingAt = 0;
    var rotateTimer = null;
    var lastChart = 0;
    var temp = null;           // a tapped stock outside the watchlist
    var pausedUntil = 0;       // touch pauses rotation until this time
    var wasPaused = false;
    var PAUSE_MS = (CONFIG.PAUSE_SEC || 120) * 1000;

    function sym() { return temp || WL[cur]; }

    S.isPaused = function () { return Date.now() < pausedUntil; };

    // ---- Scale the 1920x1080 stage to the window (TVs are already 1920x1080) ----
    function scale() {
        var k = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
        var st = U.el('screen');
        st.style.transform = 'scale(' + k + ')';
        st.style.left = Math.max(0, (window.innerWidth - 1920 * k) / 2) + 'px';
    }
    window.addEventListener('resize', scale);
    scale();

    function log(e) {
        if (window.console) { console.warn('[stocks]', e && e.message ? e.message : e); }
    }

    function freshQuote(s, urgent, maxAge) {
        if (Date.now() - (F.q(s).fetched || 0) < (maxAge || 0)) { return Promise.resolve(); }
        return api.quote(s, urgent).then(function (r) {
            F.setQuote(s, r);
            F.q(s).fetched = Date.now();
        }).catch(log);
    }

    function load1D(s, urgent, force) {
        return api.series(s, '1D', { urgent: urgent, marketOpen: market && market.isOpen, force: force }).then(function (ser) {
            F.setBars(s, ser);
        }).catch(log);
    }

    // Everything the featured panels need for one stock. Cached in memory and
    // (for the slow-moving parts) in localStorage by S.live.
    function loadDetails(s, urgent) {
        var d = details[s] || (details[s] = {});
        if (d.loading && Date.now() - d.loadedAt < 10 * 60 * 1000) { return d.loading; }
        d.loadedAt = Date.now();
        function keep(k) { return function (v) { d[k] = v; }; }
        d.loading = Promise.all([
            freshQuote(s, urgent),
            api.profile(s, urgent).then(keep('profile')).catch(log),
            api.metrics(s, urgent).then(keep('metrics')).catch(log),
            api.earnings(s, urgent).then(keep('earnings')).catch(log),
            api.recs(s, urgent).then(keep('recs')).catch(log),
            api.earningsHistory(s, urgent).then(keep('earnHist')).catch(log),
            api.companyNews(s, urgent).then(keep('news')).catch(log),
            api.peers(s, urgent).then(function (p) {
                p = [s].concat(p.filter(function (x) { return x !== s; })).slice(0, 5);
                d.peers = p;
                F.subscribe(p);
                return Promise.all(p.map(function (x) { return x === s ? null : freshQuote(x, false, 5 * 60 * 1000); }));
            }).catch(log)
        ]);
        return d.loading;
    }

    function loadHist(s, r) {
        var key = r + ':' + s;
        if (r === '1D' || hist[key]) { return Promise.resolve(); }
        return api.series(s, r, { urgent: true }).then(function (h) { hist[key] = h; }).catch(function (e) {
            hist[key] = { pts: [], error: e.message };
        });
    }

    // ---- Featured stock ----
    function paintFeatured() {
        var s = sym();
        var d = details[s] || {};
        V.renderFeaturedId(s, d);
        V.renderFeaturedPrice(s, d);
        V.renderRanges(range);
        paintChart();
        V.renderNews(d.news);
        V.renderRecs(d.recs);
        V.renderPeers(s, d.peers || [s]);
        V.renderPanel(s, d, true);
    }

    function paintChart() {
        var s = sym();
        var h = hist[range + ':' + s];
        var msg = h && h.error ? 'Chart unavailable: ' + h.error : null;
        V.renderChart(s, range, h, msg);
        lastChart = Date.now();
    }

    var FADED = ['featured', 'mid', 'bottom'];

    // show(i): watchlist entry i. show(cur, 'AVGO'): a stock outside the watchlist.
    function show(i, tempSym) {
        temp = tempSym || null;
        cur = (i + WL.length) % WL.length;
        var s = sym();
        if (temp) { F.subscribe([s]); }
        FADED.forEach(function (id) { U.el(id).classList.add('out'); });
        Promise.all([loadDetails(s, true), load1D(s, true), loadHist(s, range)]).then(function () {
            if (sym() !== s) { return; }
            paintFeatured();
            FADED.forEach(function (id) { U.el(id).classList.remove('out'); });
        });
        // Safety: never leave the panels hidden if a request hangs.
        setTimeout(function () {
            if (sym() !== s) { return; }
            paintFeatured();
            FADED.forEach(function (id) { U.el(id).classList.remove('out'); });
        }, 8000);
        scheduleRotate();
    }

    function scheduleRotate() {
        clearTimeout(rotateTimer);
        var ms = CONFIG.ROTATE_SEC * 1000;
        rotateTimer = setTimeout(function due() {
            // Touched recently: wait until the pause runs out, then rotate.
            var wait = pausedUntil - Date.now();
            if (wait > 0) {
                rotateTimer = setTimeout(due, wait + 50);
                return;
            }
            show(cur + 1);
        }, ms);
        // Prefetch the next stock ~10 s early so the switch is instant.
        setTimeout(function () {
            var next = WL[(cur + 1) % WL.length];
            loadDetails(next, false);
            if (range !== '1D') { loadHist(next, range); }
        }, Math.max(0, ms - 10000));
    }

    // ---- Repaint loop: only what changed ----
    function repaint() {
        var dirty = F.takeDirty();
        var s = sym();
        Object.keys(dirty).forEach(function (k) {
            if (IDX.indexOf(k) >= 0) { V.renderIndex(k); }
            V.updateTape(k);
            V.updatePeer(k);
        });
        if (dirty[s]) {
            V.renderFeaturedPrice(s, details[s] || {});
            if (Date.now() - lastChart > 1000) { paintChart(); }
        }
        var p = S.isPaused();
        if (p !== wasPaused) {
            wasPaused = p;
            V.renderStatus();
        }
    }

    // ---- Market status + news ----
    function refreshStatus() {
        return api.marketStatus().then(function (m) {
            market = m;
            V.renderStatus(m);
        }).catch(log);
    }

    function refreshBreaking() {
        return api.generalNews().then(function (list) {
            breaking = list.slice(0, 10);
            breakingAt = 0;
            V.renderBreaking(breaking[0]);
        }).catch(log);
    }

    function rotateBreaking() {
        if (!breaking.length) { return; }
        breakingAt = (breakingAt + 1) % breaking.length;
        V.renderBreaking(breaking[breakingAt]);
    }

    // ---- Remote control ----
    function exitApp() {
        try {
            tizen.application.getCurrentApplication().exit();
        } catch (e) {
            window.close();
        }
    }

    function setRange(r) {
        if (V.RANGE_KEYS.indexOf(r) < 0) { return; }
        range = r;
        V.renderRanges(range);
        var s = sym();
        if (range !== '1D' && !hist[range + ':' + s]) {
            V.renderChart(s, range, null, 'Loading chart…');
        } else {
            paintChart();
        }
        loadHist(s, range).then(function () { if (sym() === s) { paintChart(); } });
    }

    function interact() {
        pausedUntil = Date.now() + PAUSE_MS;
        if (!wasPaused) {
            wasPaused = true;
            V.renderStatus();
        }
    }

    // Tapped a competitor or ticker symbol.
    function featureSym(s) {
        if (s === sym()) { return; }
        var i = WL.indexOf(s);
        if (i >= 0) { show(i); } else { show(cur, s); }
    }

    document.addEventListener('keydown', function (e) {
        var k = e.keyCode;
        if (k === 10009) {                 // Back: close the pop-up, else exit
            if (V.modalOpen()) { V.hideModal(); } else { exitApp(); }
            return;
        }
        if (V.modalOpen()) {
            V.hideModal();
            return;
        }
        if (k === 39 || k === 37) {        // Right / Left: chart range
            interact();
            var ri = V.RANGE_KEYS.indexOf(range) + (k === 39 ? 1 : -1);
            setRange(V.RANGE_KEYS[(ri + V.RANGE_KEYS.length) % V.RANGE_KEYS.length]);
        } else if (k === 40 || k === 38) { // Down / Up: next / previous stock
            interact();
            show(cur + (k === 40 ? 1 : -1));
        }
    });

    // ---- Touch: taps arrive as clicks, so one delegated handler covers the screen ----
    function closest(node, sel) {
        while (node && node.nodeType === 1) {
            if (node.matches(sel)) { return node; }
            node = node.parentNode;
        }
        return null;
    }

    document.addEventListener('click', function (e) {
        var t = e.target;
        var hit;
        if (V.modalOpen()) {
            V.hideModal();
            return;
        }
        interact();
        var d = details[sym()] || {};
        if ((hit = closest(t, '[data-range]'))) {
            setRange(hit.getAttribute('data-range'));
        } else if ((hit = closest(t, '[data-tab]'))) {
            V.setTab(hit.getAttribute('data-tab'));
            V.renderPanel(sym(), d, true);
        } else if ((hit = closest(t, '[data-news]'))) {
            V.showModal((d.news || [])[+hit.getAttribute('data-news')]);
        } else if ((hit = closest(t, '[data-sym], [data-s]'))) {
            featureSym(hit.getAttribute('data-sym') || hit.getAttribute('data-s'));
        } else if (closest(t, '#news-panel')) {
            V.showModal((d.news || [])[0]);
        } else if (closest(t, '#breaking')) {
            V.showModal(breaking[breakingAt]);
        }
    });

    // Swipe the chart left/right for the next/previous stock.
    var swipe = null;
    var chartPanel = U.el('chart-panel');
    chartPanel.addEventListener('touchstart', function (e) {
        var p = e.changedTouches[0];
        swipe = { x: p.clientX, y: p.clientY };
    }, { passive: true });
    chartPanel.addEventListener('touchend', function (e) {
        if (!swipe) { return; }
        var p = e.changedTouches[0];
        // The stage is scaled on non-TV screens; measure in stage pixels.
        var k = chartPanel.getBoundingClientRect().width / chartPanel.offsetWidth || 1;
        var dx = (p.clientX - swipe.x) / k;
        var dy = (p.clientY - swipe.y) / k;
        swipe = null;
        if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy)) {
            show(cur + (dx < 0 ? 1 : -1));
        }
    }, { passive: true });
    document.addEventListener('touchstart', interact, { passive: true });

    function keepAwake() {
        try {
            webapis.appcommon.setScreenSaver(webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_OFF);
        } catch (e) { /* not on a TV */ }
    }

    // ---- Boot ----
    function boot() {
        keepAwake();
        V.buildIndices();
        V.buildTape(WL);
        V.renderRanges(range);

        var all = IDX.concat(WL);
        F.subscribe(all);
        if (S.isDemo) {
            api.startTicks(function () {
                var set = {};
                all.concat((details[sym()] || {}).peers || []).forEach(function (x) { set[x] = 1; });
                return Object.keys(set);
            });
        } else {
            F.connect();
        }

        refreshStatus().then(function () {
            show(0);
            // Quotes first (fast), then chart history for indices/watchlist (slow queue).
            all.forEach(function (s) { if (s !== sym()) { freshQuote(s); } });
            all.forEach(function (s) { if (s !== sym()) { load1D(s); } });
        });
        refreshBreaking();

        setInterval(repaint, 250);
        setInterval(rotateBreaking, 20000);
        setInterval(refreshBreaking, 5 * 60 * 1000);
        setInterval(refreshStatus, 5 * 60 * 1000);
        setInterval(keepAwake, 10 * 60 * 1000);

        // Featured quote every 60 s; everything else every 5 min. The WebSocket
        // keeps prices live in between, this catches open/high/low/prev close.
        setInterval(function () { freshQuote(sym(), true); }, 60 * 1000);
        setInterval(function () { all.forEach(function (s) { freshQuote(s, false, 4 * 60 * 1000); }); }, 5 * 60 * 1000);

        // While the market is open, re-sync 1D history hourly (fills any gaps
        // from WebSocket drops). Cached, so this only calls out once an hour.
        setInterval(function () {
            if (market && market.isOpen) { all.forEach(function (s) { load1D(s); }); }
        }, 15 * 60 * 1000);

        // Refresh relative times ("3 minutes ago") and drop stale memory caches daily.
        var day = U.et().day;
        setInterval(function () {
            var d = details[sym()];
            if (d) {
                V.renderNews(d.news);
                V.renderPanel(sym(), d, true);
            }
            if (breaking.length) { V.renderBreaking(breaking[breakingAt]); }
            if (U.et().day !== day) {
                day = U.et().day;
                details = {};
                hist = {};
            }
        }, 60 * 1000);

        // Company news is cached 15 min in S.live; reload it for the featured stock.
        setInterval(function () {
            var s = sym();
            var d = details[s];
            api.companyNews(s).then(function (n) {
                if (d) { d.news = n; }
                if (sym() === s) {
                    V.renderNews(n);
                    V.renderPanel(s, d || {}, true);
                }
            }).catch(log);
        }, 15 * 60 * 1000);
    }

    boot();
})();
