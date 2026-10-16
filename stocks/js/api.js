// Live data clients: Finnhub (quotes, company data, news) and Twelve Data
// (chart history). Both run behind rate-limited queues and a daily cache,
// because every TV shares the same free-tier keys.
S.live = (function () {
    var U = S.util;
    var FH = 'https://finnhub.io/api/v1';
    var TD = 'https://api.twelvedata.com';
    var DAY = 24 * 3600 * 1000;

    // Runs async jobs one at a time, at least `spacing` ms apart.
    // Urgent jobs (the featured stock) jump to the front.
    function queue(spacing) {
        var jobs = [];
        var busy = false;
        var last = 0;
        function pump() {
            if (busy || !jobs.length) { return; }
            busy = true;
            setTimeout(function () {
                var job = jobs.shift();
                last = Date.now();
                busy = false;
                job.fn().then(job.res, job.rej);
                pump();
            }, Math.max(0, last + spacing - Date.now()));
        }
        return function (fn, urgent) {
            return new Promise(function (res, rej) {
                var job = { fn: fn, res: res, rej: rej };
                if (urgent) { jobs.unshift(job); } else { jobs.push(job); }
                pump();
            });
        };
    }

    var fhQ = queue(1100);   // Finnhub: 60 calls/min
    var tdQ = queue(7700);   // Twelve Data: 8 calls/min
    S.calls = { fh: 0, td: 0 };

    function qs(o) {
        return Object.keys(o).map(function (k) {
            return encodeURIComponent(k) + '=' + encodeURIComponent(o[k]);
        }).join('&');
    }

    function getJSON(url) {
        return fetch(url).then(function (r) {
            if (r.status === 429) { throw new Error('rate limited'); }
            if (!r.ok) { throw new Error('HTTP ' + r.status); }
            return r.json();
        });
    }

    function fh(path, params, urgent) {
        params = params || {};
        params.token = CONFIG.FINNHUB_KEY;
        return fhQ(function () {
            S.calls.fh++;
            return getJSON(FH + path + '?' + qs(params));
        }, urgent);
    }

    // Finnhub call with a daily (or maxAge) localStorage cache in front.
    function fhCached(key, path, params, maxAge, urgent) {
        var hit = U.cacheGet(key, maxAge);
        if (hit !== null) { return Promise.resolve(hit); }
        return fh(path, params, urgent).then(function (v) {
            U.cacheSet(key, v);
            return v;
        });
    }

    function quote(sym, urgent) {
        return fh('/quote', { symbol: sym }, urgent);
    }

    function profile(sym, urgent) {
        return fhCached('prof:' + sym, '/stock/profile2', { symbol: sym }, 0, urgent).then(function (p) {
            return {
                name: p.name || sym,
                exchange: (p.exchange || '').replace(/ NATIONAL MARKET| GLOBAL SELECT| STOCK EXCHANGE|, INC\.?/gi, '').trim(),
                industry: p.finnhubIndustry || '',
                logo: p.logo || '',
                country: p.country || '',
                currency: p.currency || '',
                ipo: p.ipo || '',
                weburl: p.weburl || '',
                marketCap: p.marketCapitalization ? p.marketCapitalization * 1e6 : null,
                shares: p.shareOutstanding ? p.shareOutstanding * 1e6 : null
            };
        });
    }

    function metrics(sym, urgent) {
        return fhCached('met:' + sym, '/stock/metric', { symbol: sym, metric: 'all' }, 0, urgent).then(function (r) {
            var m = r.metric || {};
            function pick() {
                for (var i = 0; i < arguments.length; i++) {
                    if (m[arguments[i]] !== undefined && m[arguments[i]] !== null) { return m[arguments[i]]; }
                }
                return null;
            }
            var avg10 = pick('10DayAverageTradingVolume');
            var avg3m = pick('3MonthAverageTradingVolume');
            return {
                hi52: pick('52WeekHigh'),
                lo52: pick('52WeekLow'),
                chg52: pick('52WeekPriceReturnDaily'),
                pe: pick('peTTM', 'peBasicExclExtraTTM', 'peExclExtraTTM'),
                eps: pick('epsTTM', 'epsBasicExclExtraItemsTTM', 'epsExclExtraItemsTTM'),
                beta: pick('beta'),
                roe: pick('roeTTM', 'roeRfy'),
                de: pick('totalDebt/totalEquityQuarterly', 'totalDebt/totalEquityAnnual'),
                div: pick('dividendPerShareAnnual', 'dividendPerShareTTM'),
                divYield: pick('currentDividendYieldTTM', 'dividendYieldIndicatedAnnual'),
                // Finnhub reports these in millions of shares
                avg10: avg10 === null ? null : avg10 * 1e6,
                avg3m: avg3m === null ? null : avg3m * 1e6,
                revGrowth: pick('revenueGrowthTTMYoy'),
                epsGrowth: pick('epsGrowthTTMYoy'),
                grossMargin: pick('grossMarginTTM', 'grossMarginAnnual'),
                opMargin: pick('operatingMarginTTM', 'operatingMarginAnnual'),
                netMargin: pick('netProfitMarginTTM', 'netProfitMarginAnnual'),
                roa: pick('roaTTM', 'roaRfy'),
                pb: pick('pbQuarterly', 'pbAnnual'),
                ps: pick('psTTM', 'psAnnual'),
                currentRatio: pick('currentRatioQuarterly', 'currentRatioAnnual'),
                fcfShare: pick('freeCashFlowPerShareTTM', 'cashFlowPerShareTTM'),
                bookShare: pick('bookValuePerShareQuarterly', 'bookValuePerShareAnnual'),
                revShare: pick('revenuePerShareTTM', 'revenuePerShareAnnual')
            };
        });
    }

    function earnings(sym, urgent) {
        var now = Date.now();
        return fhCached('earn:' + sym, '/calendar/earnings',
            { symbol: sym, from: U.ymd(now), to: U.ymd(now + 120 * DAY) }, 0, urgent).then(function (r) {
            var list = (r.earningsCalendar || []).map(function (e) { return e.date; }).sort();
            return list[0] || null;
        });
    }

    function recs(sym, urgent) {
        return fhCached('rec:' + sym, '/stock/recommendation', { symbol: sym }, 0, urgent).then(function (r) {
            // newest month first
            return r && r.length ? r : null;
        });
    }

    // Last 4 quarters of reported EPS vs estimate, newest first.
    function earningsHistory(sym, urgent) {
        return fhCached('eh:' + sym, '/stock/earnings', { symbol: sym }, 0, urgent).then(function (r) {
            return (r || []).slice(0, 4).map(function (e) {
                return { label: 'Q' + e.quarter + ' ' + e.year, actual: e.actual, estimate: e.estimate, surprise: e.surprisePercent };
            });
        });
    }

    function peers(sym, urgent) {
        return fhCached('peer:' + sym, '/stock/peers', { symbol: sym }, 0, urgent).then(function (r) {
            return (r || []).filter(function (s) { return /^[A-Z.]+$/.test(s); });
        });
    }

    function normNews(list) {
        return (list || []).map(function (n) {
            return { headline: n.headline, summary: n.summary, image: n.image, source: n.source, time: n.datetime * 1000 };
        }).filter(function (n) { return n.headline; }).sort(function (a, b) { return b.time - a.time; });
    }

    function companyNews(sym, urgent) {
        var now = Date.now();
        return fhCached('news:' + sym, '/company-news',
            { symbol: sym, from: U.ymd(now - 3 * DAY), to: U.ymd(now) }, 15 * 60 * 1000, urgent).then(normNews);
    }

    function generalNews() {
        return fhCached('gnews', '/news', { category: 'general' }, 5 * 60 * 1000).then(normNews);
    }

    function marketStatus() {
        return fh('/stock/market-status', { exchange: 'US' }).then(function (r) {
            return { isOpen: !!r.isOpen, session: r.session || null };
        });
    }

    // Chart history. Each range maps to a Twelve Data interval and size.
    var RANGES = {
        '1D': { interval: '5min', outputsize: 90 },
        '5D': { interval: '30min', outputsize: 70 },
        '1M': { interval: '1day', outputsize: 22 },
        '3M': { interval: '1day', outputsize: 66 },
        '6M': { interval: '1day', outputsize: 130 },
        'YTD': { interval: '1day', ytd: true },
        '1Y': { interval: '1day', outputsize: 252 },
        '5Y': { interval: '1week', outputsize: 261 },
        'MAX': { interval: '1month', outputsize: 600 }
    };

    function series(sym, range, opts) {
        opts = opts || {};
        var key = 'ser:' + range + ':' + sym;
        // 1D refreshes hourly while the market runs; history is good for the day.
        var maxAge = range === '1D' ? (opts.marketOpen ? 60 * 60 * 1000 : 12 * 3600 * 1000) : 0;
        var hit = U.cacheGet(key, maxAge);
        if (hit !== null && !opts.force) { return Promise.resolve(hit); }

        var r = RANGES[range];
        var p = { symbol: sym, interval: r.interval, apikey: CONFIG.TWELVEDATA_KEY, timezone: 'America/New_York' };
        if (r.ytd) { p.start_date = new Date().getFullYear() + '-01-01'; } else { p.outputsize = r.outputsize; }

        return tdQ(function () {
            S.calls.td++;
            return getJSON(TD + '/time_series?' + qs(p));
        }, opts.urgent).then(function (res) {
            if (res.status !== 'ok' || !res.values) { throw new Error(res.message || 'no data'); }
            var pts = res.values.slice().reverse().map(function (v) {
                return { dt: v.datetime, o: +v.open, h: +v.high, l: +v.low, c: +v.close, v: +(v.volume || 0) };
            });
            if (range === '1D') {
                var day = pts[pts.length - 1].dt.split(' ')[0];
                pts = pts.filter(function (pt) { return pt.dt.indexOf(day) === 0; });
                pts.forEach(function (pt) { pt.x = U.tdMin(pt.dt); });
                pts = pts.filter(function (pt) { return pt.x >= 0 && pt.x < 390; });
                res = { day: day, pts: pts };
            } else {
                res = { pts: pts };
            }
            U.cacheSet(key, res);
            return res;
        });
    }

    return {
        quote: quote, profile: profile, metrics: metrics, earnings: earnings,
        recs: recs, earningsHistory: earningsHistory, peers: peers, companyNews: companyNews, generalNews: generalNews,
        marketStatus: marketStatus, series: series, RANGES: RANGES
    };
})();
