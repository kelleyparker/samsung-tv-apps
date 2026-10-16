// Shared helpers: number formatting, US Eastern time, localStorage cache.
var S = window.S || {};
window.S = S;

S.util = (function () {
    var etFmt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York', hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short'
    });

    // Eastern-time parts for an epoch ms value.
    function et(ms) {
        var o = {};
        etFmt.formatToParts(new Date(ms === undefined ? Date.now() : ms)).forEach(function (p) {
            o[p.type] = p.value;
        });
        var h = +o.hour % 24;
        return {
            day: o.year + '-' + o.month + '-' + o.day,
            h: h, m: +o.minute, s: +o.second,
            wd: o.weekday,
            // minutes since 9:30 ET (the 1D chart's x axis)
            min: h * 60 + +o.minute + (+o.second) / 60 - 570
        };
    }

    // "2026-10-15 10:25:00" (exchange time) -> minutes since 9:30
    function tdMin(dt) {
        var t = dt.split(' ')[1] || '00:00:00';
        var a = t.split(':');
        return +a[0] * 60 + +a[1] - 570;
    }

    function num(v, d) {
        if (v === null || v === undefined || isNaN(v)) { return '--'; }
        d = d === undefined ? 2 : d;
        return (+v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
    }

    function big(v, d) {
        if (v === null || v === undefined || isNaN(v)) { return '--'; }
        var a = Math.abs(v);
        d = d === undefined ? 2 : d;
        if (a >= 1e12) { return (v / 1e12).toFixed(d) + 'T'; }
        if (a >= 1e9) { return (v / 1e9).toFixed(d) + 'B'; }
        if (a >= 1e6) { return (v / 1e6).toFixed(d ? 1 : 0) + 'M'; }
        if (a >= 1e3) { return (v / 1e3).toFixed(d ? 1 : 0) + 'K'; }
        return String(Math.round(v));
    }

    function signed(v, d) {
        if (v === null || v === undefined || isNaN(v)) { return '--'; }
        return (v >= 0 ? '+' : '-') + num(Math.abs(v), d);
    }

    function cls(v) {
        return v > 0 ? 'up' : v < 0 ? 'down' : 'flat';
    }

    function ago(ms) {
        var s = Math.max(0, (Date.now() - ms) / 1000);
        if (s < 60) { return 'just now'; }
        if (s < 3600) { var m = Math.floor(s / 60); return m + (m === 1 ? ' minute ago' : ' minutes ago'); }
        if (s < 86400) { var h = Math.floor(s / 3600); return h + (h === 1 ? ' hour ago' : ' hours ago'); }
        var d = Math.floor(s / 86400);
        return d + (d === 1 ? ' day ago' : ' days ago');
    }

    function shortAgo(ms) {
        var s = Math.max(0, (Date.now() - ms) / 1000);
        if (s < 3600) { return Math.max(1, Math.floor(s / 60)) + 'm ago'; }
        if (s < 86400) { return Math.floor(s / 3600) + 'h ago'; }
        return Math.floor(s / 86400) + 'd ago';
    }

    function asOf(ms) {
        var d = new Date(ms);
        var date = d.toLocaleDateString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', year: 'numeric' });
        var time = d.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' });
        return 'As of ' + date + '  ' + time + ' ET';
    }

    function ymd(ms) {
        var d = new Date(ms);
        return d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + d.getUTCDate()).slice(-2);
    }

    // localStorage cache. Every access is guarded: storage may be unavailable.
    function cacheGet(key, maxAgeMs) {
        try {
            var raw = localStorage.getItem('stk:' + key);
            if (!raw) { return null; }
            var o = JSON.parse(raw);
            if (maxAgeMs && Date.now() - o.t > maxAgeMs) { return null; }
            if (!maxAgeMs && o.day !== et().day) { return null; }
            return o.v;
        } catch (e) {
            return null;
        }
    }

    function cacheSet(key, v) {
        try {
            localStorage.setItem('stk:' + key, JSON.stringify({ t: Date.now(), day: et().day, v: v }));
        } catch (e) {
            // Quota full: drop our old entries and give up for this one.
            try {
                Object.keys(localStorage).forEach(function (k) {
                    if (k.indexOf('stk:') === 0) { localStorage.removeItem(k); }
                });
            } catch (e2) { /* ignore */ }
        }
    }

    function el(id) { return document.getElementById(id); }

    function esc(s) {
        return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    return {
        et: et, tdMin: tdMin, num: num, big: big, signed: signed, cls: cls,
        ago: ago, shortAgo: shortAgo, asOf: asOf, ymd: ymd,
        cacheGet: cacheGet, cacheSet: cacheSet, el: el, esc: esc
    };
})();
