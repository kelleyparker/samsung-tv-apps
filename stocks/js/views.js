// DOM rendering for each screen region.
S.views = (function () {
    var U = S.util;
    var F = S.feed;
    var el = U.el;
    var esc = U.esc;

    function chg(sym) {
        var o = F.q(sym);
        if (o.price === null || !o.prevClose) { return { d: null, p: null }; }
        var d = o.price - o.prevClose;
        return { d: d, p: d / o.prevClose * 100 };
    }

    function arrow(v) {
        return v > 0 ? '▲ ' : v < 0 ? '▼ ' : '';
    }

    // ---------- 1. Index bar ----------
    function buildIndices() {
        el('indices').innerHTML = CONFIG.INDICES.map(function (ix) {
            return '<div class="idx" id="ix-' + ix.sym + '">' +
                '<div class="idx-name">' + esc(ix.name) + '</div>' +
                '<div class="idx-px">--</div>' +
                '<div class="idx-chg"><span></span><span></span></div>' +
                '<canvas></canvas></div>';
        }).join('');
    }

    function renderIndex(sym) {
        var card = el('ix-' + sym);
        if (!card) { return; }
        var o = F.q(sym);
        var c = chg(sym);
        card.className = 'idx ' + U.cls(c.d);
        card.querySelector('.idx-px').textContent = U.num(o.price);
        var s = card.querySelectorAll('.idx-chg span');
        s[0].textContent = c.d === null ? '' : arrow(c.d) + U.signed(c.d);
        s[1].textContent = c.p === null ? '' : U.signed(c.p) + '%';
        card.querySelector('.idx-chg').className = 'idx-chg ' + U.cls(c.d);
        var bars = F.bars(sym);
        S.chart.spark(card.querySelector('canvas'), bars.map(function (b) { return b.c; }), o.prevClose || (bars[0] && bars[0].o));
    }

    // ---------- 2. Featured header ----------
    function renderFeaturedId(sym, d) {
        var p = d.profile || {};
        el('f-sym').textContent = sym;
        el('f-name').textContent = p.name || '';
        el('f-meta').textContent = [p.exchange, p.industry].filter(Boolean).join(' · ');
        var logo = el('f-logo');
        if (p.logo) {
            logo.style.backgroundImage = 'url("' + p.logo + '")';
            logo.textContent = '';
        } else {
            logo.style.backgroundImage = 'none';
            logo.textContent = sym.charAt(0);
        }
    }

    function stat(k, v, cls) {
        return '<div class="stat"><div class="stat-k">' + k + '</div><div class="stat-v ' + (cls || '') + '">' + v + '</div></div>';
    }

    function renderFeaturedPrice(sym, d) {
        var o = F.q(sym);
        var c = chg(sym);
        var m = d.metrics || {};
        var p = d.profile || {};
        el('f-price').textContent = U.num(o.price);
        el('f-chg').textContent = c.d === null ? '' : U.signed(c.d);
        el('f-pct').textContent = c.p === null ? '' : '(' + U.signed(c.p) + '%)';
        el('f-chg').parentNode.className = 'f-chg ' + U.cls(c.d);
        el('f-asof').textContent = o.t ? U.asOf(o.t) : '';
        var vol = F.volume(sym);
        el('f-stats').innerHTML =
            stat('Open', U.num(o.open)) +
            stat('High', U.num(o.high), 'up') +
            stat('Low', U.num(o.low), 'down') +
            stat('Prev Close', U.num(o.prevClose)) +
            stat('Volume', vol ? U.big(vol) : '--') +
            stat('Avg Vol (3M)', U.big(m.avg3m)) +
            stat('Market Cap', U.big(marketCap(sym, p)));
        renderPanel(sym, d, false);
    }

    function marketCap(sym, p) {
        var o = F.q(sym);
        return p.shares && o.price ? p.shares * o.price : p.marketCap;
    }

    // ---------- 4. Quote panel ----------
    function row(k, v, cls, range) {
        var r = '';
        if (range) {
            var pct = Math.max(0, Math.min(100, range * 100));
            r = '<div class="range"><i style="left:' + pct + '%"></i></div>';
        }
        return '<div class="q-row' + (r ? ' has-range' : '') + '"><span class="k">' + k + '</span><span class="v ' + (cls || '') + '">' + v + '</span>' + r + '</div>';
    }

    function pos(v, lo, hi) {
        if (v === null || lo === null || hi === null || hi <= lo) { return 0.5; }
        return (v - lo) / (hi - lo);
    }

    function fmtDate(s) {
        if (!s) { return '--'; }
        var d = new Date(s + 'T12:00:00Z');
        return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric', timeZone: 'UTC' });
    }

    function renderQuote(sym, d) {
        var o = F.q(sym);
        var m = d.metrics || {};
        var p = d.profile || {};
        var div = m.div ? U.num(m.div) + (m.divYield ? ' (' + U.num(m.divYield) + '%)' : '') : '--';
        el('q-grid').innerHTML =
            '<div class="q-col">' +
            row('10-Day Avg Vol', U.big(m.avg10)) +
            row('52W Change', m.chg52 === null || m.chg52 === undefined ? '--' : U.signed(m.chg52) + '%', U.cls(m.chg52)) +
            row('Day Range', U.num(o.low) + ' – ' + U.num(o.high), '', pos(o.price, o.low, o.high) || 0.001) +
            row('52 Week Range', U.num(m.lo52) + ' – ' + U.num(m.hi52), '', pos(o.price, m.lo52, m.hi52) || 0.001) +
            row('P/E (TTM)', U.num(m.pe)) +
            row('EPS (TTM)', U.num(m.eps)) +
            row('Dividend (Ann.)', div) +
            row('Div Yield (TTM)', m.divYield ? U.num(m.divYield) + '%' : '--') +
            '</div><div class="q-col">' +
            row('Market Cap', U.big(marketCap(sym, p))) +
            row('Shares Outstanding', U.big(p.shares, 1)) +
            row('Beta', U.num(m.beta)) +
            row('52W High', U.num(m.hi52)) +
            row('52W Low', U.num(m.lo52)) +
            row('ROE', m.roe === null || m.roe === undefined ? '--' : U.num(m.roe, 1) + '%') +
            row('Debt to Equity', U.num(m.de)) +
            row('Next Earnings', fmtDate(d.earnings)) +
            '</div>';
    }

    // ---------- 4b. Other tabs ----------
    var TABS = ['Quote', 'Company', 'News', 'Financials', 'Analysis'];
    var tab = 'Quote';

    function setTab(t) {
        if (TABS.indexOf(t) >= 0) { tab = t; }
    }

    function pct(v, d) {
        return v === null || v === undefined ? '--' : U.num(v, d === undefined ? 1 : d) + '%';
    }

    function renderCompany(sym, d) {
        var p = d.profile || {};
        el('q-grid').innerHTML =
            '<div class="q-col">' +
            row('Name', esc(p.name || sym)) +
            row('Exchange', esc(p.exchange || '--')) +
            row('Industry', esc(p.industry || '--')) +
            row('Country', esc(p.country || '--')) +
            row('Currency', esc(p.currency || '--')) +
            '</div><div class="q-col">' +
            row('IPO Date', fmtDate(p.ipo)) +
            row('Market Cap', U.big(marketCap(sym, p))) +
            row('Shares Outstanding', U.big(p.shares, 1)) +
            row('Next Earnings', fmtDate(d.earnings)) +
            row('Website', esc((p.weburl || '--').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))) +
            '</div>';
    }

    function renderNewsList(d) {
        var list = (d.news || []).slice(0, 6);
        if (!list.length) { el('q-grid').innerHTML = '<div class="q-empty">No recent news</div>'; return; }
        el('q-grid').innerHTML = '<div class="nl">' + list.map(function (n, i) {
            return '<div class="nl-item" data-news="' + i + '"><div class="nl-head">' + esc(n.headline) + '</div>' +
                '<div class="nl-meta">' + U.ago(n.time) + '  ·  ' + esc(n.source || '') + '</div></div>';
        }).join('') + '</div>';
    }

    function renderFinancials(d) {
        var m = d.metrics || {};
        el('q-grid').innerHTML =
            '<div class="q-col">' +
            row('Revenue Growth (YoY)', m.revGrowth === null || m.revGrowth === undefined ? '--' : U.signed(m.revGrowth, 1) + '%', U.cls(m.revGrowth)) +
            row('EPS Growth (YoY)', m.epsGrowth === null || m.epsGrowth === undefined ? '--' : U.signed(m.epsGrowth, 1) + '%', U.cls(m.epsGrowth)) +
            row('Gross Margin', pct(m.grossMargin)) +
            row('Operating Margin', pct(m.opMargin)) +
            row('Net Margin', pct(m.netMargin)) +
            row('Return on Assets', pct(m.roa)) +
            '</div><div class="q-col">' +
            row('Price / Book', U.num(m.pb)) +
            row('Price / Sales', U.num(m.ps)) +
            row('Current Ratio', U.num(m.currentRatio)) +
            row('FCF / Share', U.num(m.fcfShare)) +
            row('Book Value / Share', U.num(m.bookShare)) +
            row('Revenue / Share', U.num(m.revShare)) +
            '</div>';
    }

    var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function renderAnalysis(d) {
        var trend = (d.recs || []).slice(0, 4);
        var html = '<div class="an"><div class="an-title">Analyst Trend</div>';
        if (!trend.length) { html += '<div class="q-empty">No ratings</div>'; }
        trend.forEach(function (r) {
            var total = RECS.reduce(function (s, x) { return s + (r[x[1]] || 0); }, 0) || 1;
            var mo = r.period ? MON[+r.period.split('-')[1] - 1] + ' ' + r.period.slice(2, 4) : '';
            html += '<div class="an-row"><span class="an-k">' + mo + '</span><span class="stack">' +
                RECS.map(function (x) {
                    return '<i style="width:' + ((r[x[1]] || 0) / total * 100) + '%;background:' + x[2] + '"></i>';
                }).join('') + '</span><span class="an-n">' + total + '</span></div>';
        });
        html += '<div class="an-title">Earnings (EPS)</div>' +
            '<div class="eh eh-h"><span>Quarter</span><span>Estimate</span><span>Actual</span><span>Surprise</span></div>';
        var eh = d.earnHist || [];
        if (!eh.length) { html += '<div class="q-empty">No earnings history</div>'; }
        eh.forEach(function (e) {
            var cls = e.actual === null || e.estimate === null ? 'flat' : e.actual >= e.estimate ? 'up' : 'down';
            html += '<div class="eh"><span>' + esc(e.label) + '</span><span>' + U.num(e.estimate) + '</span><span class="' + cls + '">' +
                U.num(e.actual) + '</span><span class="' + cls + '">' + (e.surprise === null || e.surprise === undefined ? '--' : U.signed(e.surprise, 1) + '%') + '</span></div>';
        });
        el('q-grid').innerHTML = html + '</div>';
    }

    // full=false: called on every price tick, so only price-driven tabs repaint.
    function renderPanel(sym, d, full) {
        var tabs = document.querySelectorAll('#quote-panel .tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].className = 'tab' + (tabs[i].getAttribute('data-tab') === tab ? ' on' : '');
        }
        if (!full && tab !== 'Quote' && tab !== 'Company') { return; }
        if (tab === 'Quote') { renderQuote(sym, d); } else if (tab === 'Company') { renderCompany(sym, d); } else if (tab === 'News') { renderNewsList(d); } else if (tab === 'Financials') { renderFinancials(d); } else { renderAnalysis(d); }
    }

    // ---------- News pop-up ----------
    function showModal(n) {
        if (!n) { return; }
        el('m-head').textContent = n.headline || '';
        el('m-sum').textContent = n.summary || '';
        el('m-meta').textContent = U.ago(n.time) + '  ·  ' + (n.source || '');
        el('m-img').style.backgroundImage = n.image ? 'url("' + n.image + '")' : 'none';
        el('m-img').style.display = n.image ? '' : 'none';
        el('modal').className = 'modal on';
    }

    function hideModal() {
        el('modal').className = 'modal';
    }

    function modalOpen() {
        return el('modal').className.indexOf('on') >= 0;
    }

    // ---------- 3. Chart ----------
    var RANGE_KEYS = ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'MAX'];

    function renderRanges(active) {
        el('ranges').innerHTML = RANGE_KEYS.map(function (r) {
            return '<span class="pill' + (r === active ? ' on' : '') + '" data-range="' + r + '">' + r + '</span>';
        }).join('');
    }

    function renderChart(sym, range, hist, message) {
        var o = F.q(sym);
        if (range === '1D') {
            S.chart.main(el('chart'), { pts: F.bars(sym), intraday: true, base: o.prevClose, range: range, message: message });
        } else {
            var pts = hist ? hist.pts.slice() : [];
            // keep the last point live
            if (pts.length && o.price !== null) {
                var last = pts[pts.length - 1];
                pts[pts.length - 1] = { dt: last.dt, o: last.o, h: Math.max(last.h, o.price), l: Math.min(last.l, o.price), c: o.price, v: last.v };
            }
            S.chart.main(el('chart'), { pts: pts, intraday: false, range: range, message: message });
        }
    }

    var lastStatus = null;

    function renderStatus(ms) {
        if (ms === undefined) { ms = lastStatus; } else { lastStatus = ms; }
        var s = el('status');
        if (!ms) { s.className = 'status'; s.innerHTML = ''; return; }
        var label = ms.isOpen ? 'Market Open' : ms.session === 'pre-market' ? 'Pre-Market' :
            ms.session === 'post-market' ? 'After Hours' : 'Market Closed';
        s.className = 'status ' + (ms.isOpen ? 'open' : ms.session ? 'ext' : '');
        s.innerHTML = '<b></b>' + label + (S.isDemo ? ' · DEMO DATA' : '') + (S.isPaused && S.isPaused() ? '<span class="paused">❚❚ Paused</span>' : '');
    }

    // ---------- 5. Bottom row ----------
    function renderNews(list) {
        var n = list && list[0];
        el('n-head').textContent = n ? n.headline : 'No recent news';
        el('n-sum').textContent = n ? (n.summary || '') : '';
        el('n-meta').textContent = n ? U.ago(n.time) + '  ·  ' + (n.source || '') : '';
        el('n-img').style.backgroundImage = n && n.image ? 'url("' + n.image + '")' : 'none';
    }

    var RECS = [
        ['Strong Buy', 'strongBuy', '#22c55e'],
        ['Buy', 'buy', '#22c55e'],
        ['Hold', 'hold', '#f5a524'],
        ['Sell', 'sell', '#f87171'],
        ['Strong Sell', 'strongSell', '#ef4444']
    ];

    function renderRecs(r) {
        if (r && r.length !== undefined) { r = r[0]; }   // full history: newest month first
        if (!r) { el('recs').innerHTML = '<div class="rec"><span class="k">No ratings</span></div>'; return; }
        var max = Math.max(1, r.strongBuy, r.buy, r.hold, r.sell, r.strongSell);
        el('recs').innerHTML = RECS.map(function (x) {
            var v = r[x[1]] || 0;
            return '<div class="rec"><span class="k">' + x[0] + '</span><span class="bar"><i style="width:' +
                (v / max * 100) + '%;background:' + x[2] + '"></i></span><span class="n">' + v + '</span></div>';
        }).join('');
    }

    var peerList = [];
    var peerOn = '';

    function renderPeers(sym, list) {
        peerList = list || [];
        peerOn = sym;
        el('peers').innerHTML = peerList.map(function (s) {
            return '<div class="peer' + (s === sym ? ' on' : '') + '" id="pr-' + s + '" data-sym="' + s + '"><span class="s">' + esc(s) +
                '</span><span class="p"></span><span class="c"></span></div>';
        }).join('');
        peerList.forEach(updatePeer);
    }

    function updatePeer(sym) {
        var r = el('pr-' + sym);
        if (!r) { return; }
        var c = chg(sym);
        r.querySelector('.p').textContent = U.num(F.q(sym).price);
        var ce = r.querySelector('.c');
        ce.textContent = c.p === null ? '' : U.signed(c.p) + '%';
        ce.className = 'c ' + U.cls(c.p);
    }

    // ---------- 6. Breaking news ----------
    function renderBreaking(n) {
        el('b-head').textContent = n ? n.headline : '';
        el('b-meta').textContent = n ? U.shortAgo(n.time) + '  ·  ' + (n.source || '') : '';
    }

    // ---------- 7. Ticker tape ----------
    function buildTape(list) {
        var one = list.map(function (s) {
            return '<span class="tk" data-s="' + s + '"><span class="s">' + esc(s) + '</span><span class="p">--</span><span class="c"></span></span>';
        }).join('');
        var track = el('tape-track');
        track.innerHTML = one + one;
        // ~110 px per second regardless of list length
        setTimeout(function () {
            track.style.animationDuration = Math.max(20, track.scrollWidth / 2 / 110) + 's';
        }, 0);
    }

    function updateTape(sym) {
        var items = el('tape-track').querySelectorAll('.tk[data-s="' + sym + '"]');
        if (!items.length) { return; }
        var c = chg(sym);
        for (var i = 0; i < items.length; i++) {
            items[i].querySelector('.p').textContent = U.num(F.q(sym).price);
            var ce = items[i].querySelector('.c');
            ce.textContent = c.p === null ? '' : U.signed(c.p) + '%';
            ce.className = 'c ' + U.cls(c.p);
        }
    }

    return {
        buildIndices: buildIndices, renderIndex: renderIndex,
        renderFeaturedId: renderFeaturedId, renderFeaturedPrice: renderFeaturedPrice,
        renderRanges: renderRanges, renderChart: renderChart, renderStatus: renderStatus,
        renderNews: renderNews, renderRecs: renderRecs, renderPeers: renderPeers, updatePeer: updatePeer,
        renderBreaking: renderBreaking, buildTape: buildTape, updateTape: updateTape,
        setTab: setTab, renderPanel: renderPanel, showModal: showModal, hideModal: hideModal, modalOpen: modalOpen,
        RANGE_KEYS: RANGE_KEYS
    };
})();
