// Demo data with the same interface as S.live. Used when no API keys are set,
// or with ?demo=1 in the URL. Prices are made up; nothing is fetched.
S.demo = (function () {
    var U = S.util;

    var BASE = {
        AAPL: [178.42, 176.11, 'Apple Inc.', 'Technology', 2.78e12],
        MSFT: [512.17, 509.73, 'Microsoft Corp.', 'Technology', 3.81e12],
        GOOGL: [141.36, 139.80, 'Alphabet Inc.', 'Media', 1.74e12],
        AMZN: [138.21, 138.61, 'Amazon.com Inc.', 'Retail', 1.45e12],
        NVDA: [448.27, 439.27, 'NVIDIA Corp.', 'Semiconductors', 4.10e12],
        TSLA: [262.14, 265.27, 'Tesla Inc.', 'Automobiles', 0.84e12],
        META: [323.18, 321.06, 'Meta Platforms Inc.', 'Media', 0.82e12],
        NFLX: [614.38, 609.66, 'Netflix Inc.', 'Media', 0.26e12],
        SPY: [584.21, 581.78, 'SPDR S&P 500 ETF', 'ETF', null],
        QQQ: [510.64, 507.49, 'Invesco QQQ Trust', 'ETF', null],
        DIA: [422.85, 423.80, 'SPDR Dow Jones ETF', 'ETF', null],
        IWM: [221.56, 219.69, 'iShares Russell 2000 ETF', 'ETF', null],
        VIXY: [16.32, 17.06, 'ProShares VIX Short-Term ETF', 'ETF', null]
    };

    function base(sym) {
        if (!BASE[sym]) {
            var h = 0;
            for (var i = 0; i < sym.length; i++) { h = h * 31 + sym.charCodeAt(i); }
            var p = 40 + (h % 400);
            BASE[sym] = [p, p * (1 - ((h % 7) - 3) / 300), sym + ' Corp.', 'Technology', 5e10 + (h % 50) * 1e10];
        }
        return BASE[sym];
    }

    // Small seeded RNG so a symbol's demo day looks the same on every reload.
    function rng(seed) {
        var s = 0;
        for (var i = 0; i < seed.length; i++) { s = (s * 33 + seed.charCodeAt(i)) >>> 0; }
        return function () {
            s = (s * 1664525 + 1013904223) >>> 0;
            return s / 4294967296;
        };
    }

    function sessionMinute() {
        var e = U.et();
        var weekend = e.wd === 'Sat' || e.wd === 'Sun';
        if (weekend || e.min >= 390) { return 390; }
        return Math.max(0, e.min);
    }

    // Random walk from prev close toward the base price.
    function walk(sym, n, start, end, vol, seedTag) {
        var r = rng(sym + seedTag);
        var pts = [];
        var p = start;
        for (var i = 0; i < n; i++) {
            var pull = (end - p) / Math.max(1, n - i);
            p += pull + (r() - 0.5) * vol * start;
            pts.push(p);
        }
        if (n) { pts[n - 1] = end; }
        return pts;
    }

    var state = {};   // sym -> live demo quote

    function quote(sym) {
        var b = base(sym);
        if (!state[sym]) {
            state[sym] = { c: b[0], pc: b[1], o: b[1] * 1.0015, h: Math.max(b[0], b[1]) * 1.004, l: Math.min(b[0], b[1]) * 0.996 };
        }
        var q = state[sym];
        return Promise.resolve({ c: q.c, pc: q.pc, o: q.o, h: q.h, l: q.l, d: q.c - q.pc, dp: (q.c - q.pc) / q.pc * 100, t: Date.now() / 1000 });
    }

    function profile(sym) {
        var b = base(sym);
        var etf = b[3] === 'ETF';
        return Promise.resolve({
            name: b[2], exchange: etf ? 'NYSE ARCA' : 'NASDAQ', industry: b[3], logo: '',
            country: 'US', currency: 'USD', ipo: '1990-01-01', weburl: 'https://example.com',
            marketCap: b[4], shares: b[4] ? b[4] / b[0] : null
        });
    }

    function metrics(sym) {
        var b = base(sym);
        var r = rng(sym + 'm');
        return Promise.resolve({
            hi52: b[0] * (1.08 + r() * 0.2), lo52: b[0] * (0.62 + r() * 0.2), chg52: (r() - 0.3) * 60,
            pe: 18 + r() * 30, eps: b[0] / (18 + r() * 30), beta: 0.8 + r() * 0.9,
            roe: r() * 120, de: r() * 2.5, div: r() > 0.3 ? b[0] * 0.0055 : null, divYield: r() > 0.3 ? 0.55 : null,
            avg10: 2e7 + r() * 6e7, avg3m: 2e7 + r() * 6e7,
            revGrowth: (r() - 0.2) * 30, epsGrowth: (r() - 0.25) * 40, grossMargin: 30 + r() * 45,
            opMargin: 10 + r() * 30, netMargin: 5 + r() * 25, roa: 3 + r() * 25, pb: 2 + r() * 40,
            ps: 2 + r() * 12, currentRatio: 0.8 + r() * 2, fcfShare: b[0] * (0.02 + r() * 0.04),
            bookShare: b[0] * (0.05 + r() * 0.3), revShare: b[0] * (0.1 + r() * 0.3)
        });
    }

    function earnings() {
        return Promise.resolve(U.ymd(Date.now() + 15 * 86400000));
    }

    function recs(sym) {
        var r = rng(sym + 'r');
        var out = [];
        for (var m = 0; m < 4; m++) {
            var d = new Date();
            d.setUTCDate(1);
            d.setUTCMonth(d.getUTCMonth() - m);
            out.push({
                period: U.ymd(+d),
                strongBuy: Math.round(8 + r() * 14), buy: Math.round(6 + r() * 10), hold: Math.round(3 + r() * 8),
                sell: Math.round(r() * 3), strongSell: Math.round(r() * 2)
            });
        }
        return Promise.resolve(out);
    }

    function earningsHistory(sym) {
        var r = rng(sym + 'e');
        var eps = base(sym)[0] / 120;
        var d = new Date();
        var q = Math.floor(d.getUTCMonth() / 3);
        var y = d.getUTCFullYear();
        var out = [];
        for (var i = 0; i < 4; i++) {
            q -= 1;
            if (q < 1) { q += 4; y -= 1; }
            var est = eps * (1 - i * 0.04);
            var act = est * (0.94 + r() * 0.16);
            out.push({ label: 'Q' + q + ' ' + y, actual: act, estimate: est, surprise: (act - est) / est * 100 });
        }
        return Promise.resolve(out);
    }

    function peers(sym) {
        var list = CONFIG.WATCHLIST.filter(function (s) { return s !== sym; });
        // one non-watchlist peer, to exercise tapping a stock outside the rotation
        return Promise.resolve([sym].concat(list.slice(0, 3), ['AVGO']));
    }

    function companyNews(sym) {
        var b = base(sym);
        var topics = ['shares move as investors weigh the quarter ahead', 'analysts revisit price targets after recent run',
            'options traders position ahead of earnings', 'volume picks up as sector rotates', 'management to present at industry conference',
            'stock added to several large-cap watchlists'];
        return Promise.resolve(topics.map(function (t, i) {
            return {
                headline: 'Demo headline: ' + b[2] + ' ' + t,
                summary: 'This is placeholder text shown in demo mode. Add your Finnhub key in js/config.js to see real company news here, with the full summary of each story.',
                image: '', source: 'Demo Wire', time: Date.now() - (36 + i * 95) * 60000
            };
        }));
    }

    function generalNews() {
        return Promise.resolve([
            { headline: 'Demo mode: add your Finnhub and Twelve Data keys in js/config.js for live market news', source: 'Demo Wire', time: Date.now() - 2 * 60000 },
            { headline: 'Prices on this screen are generated and move randomly while in demo mode', source: 'Demo Wire', time: Date.now() - 9 * 60000 }
        ]);
    }

    function marketStatus() {
        var e = U.et();
        var weekend = e.wd === 'Sat' || e.wd === 'Sun';
        var open = !weekend && e.min >= 0 && e.min < 390;
        var pre = !weekend && e.min >= -330 && e.min < 0;
        var post = !weekend && e.min >= 390 && e.min < 630;
        return Promise.resolve({ isOpen: open, session: open ? 'regular' : pre ? 'pre-market' : post ? 'post-market' : null });
    }

    function series(sym, range) {
        var b = base(sym);
        var q = state[sym] || { c: b[0], pc: b[1] };
        var pts = [];
        var i, n, prices;
        if (range === '1D') {
            n = Math.floor(sessionMinute() / 5) + 1;
            prices = walk(sym, n, q.pc, q.c, 0.0022, U.et().day);
            var r = rng(sym + 'v');
            for (i = 0; i < n; i++) {
                var prev = i ? prices[i - 1] : q.pc;
                var v = (1 + 2.5 * Math.exp(-i / 6) + 1.5 * Math.exp(-(77 - i) / 5)) * (0.5 + r()) * 3e5;
                pts.push({ x: i * 5, o: prev, h: Math.max(prev, prices[i]), l: Math.min(prev, prices[i]), c: prices[i], v: v });
            }
            return Promise.resolve({ day: U.et().day, pts: pts });
        }
        n = { '5D': 65, '1M': 22, '3M': 66, '6M': 130, 'YTD': 200, '1Y': 252, '5Y': 261, 'MAX': 300 }[range];
        var drift = { '5D': 0.98, '1M': 0.95, '3M': 0.9, '6M': 0.85, 'YTD': 0.8, '1Y': 0.75, '5Y': 0.35, 'MAX': 0.05 }[range];
        prices = walk(sym, n, q.c * drift, q.c, 0.018, range);
        // Step back from today: 30-min bars (13/day), trading days, weeks or months.
        var stepDays = range === '5Y' ? 7 : range === 'MAX' ? 30 : 1;
        var t = Date.now();
        var dts = [];
        for (i = n - 1; i >= 0; i--) {
            var dt = new Date(t);
            if (range === '5D') {
                dt = new Date(t - Math.floor((n - 1 - i) / 13) * 86400000);
            } else {
                t -= stepDays * 86400000;
                while (stepDays === 1 && (new Date(t).getUTCDay() % 6 === 0)) { t -= 86400000; }
            }
            dts[i] = U.ymd(+dt) + ' 16:00:00';
        }
        for (i = 0; i < n; i++) {
            pts.push({ dt: dts[i], o: prices[i], h: prices[i], l: prices[i], c: prices[i], v: 4e7 * (0.5 + Math.random()) });
        }
        return Promise.resolve({ pts: pts });
    }

    // Fake trades for every symbol, a few per second, while the "market" is open.
    function startTicks(symbols) {
        setInterval(function () {
            symbols().forEach(function (sym) {
                if (Math.random() > 0.35) { return; }
                quote(sym);
                var q = state[sym];
                var nudge = (Math.random() - 0.5) * q.c * 0.0009 + (base(sym)[0] - q.c) * 0.01;
                q.c = Math.max(0.01, q.c + nudge);
                q.h = Math.max(q.h, q.c);
                q.l = Math.min(q.l, q.c);
                S.feed.tick(sym, q.c, Math.round(50 + Math.random() * 900), Date.now());
            });
        }, 400);
    }

    return {
        quote: quote, profile: profile, metrics: metrics, earnings: earnings,
        recs: recs, earningsHistory: earningsHistory, peers: peers, companyNews: companyNews, generalNews: generalNews,
        marketStatus: marketStatus, series: series, startTicks: startTicks
    };
})();
