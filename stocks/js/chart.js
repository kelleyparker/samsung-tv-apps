// Canvas charts: the main price/volume chart and the small sparklines.
S.chart = (function () {
    var U = S.util;
    var UP = '#22c55e';
    var DOWN = '#ef4444';
    var GRID = '#15233a';
    var AXIS = '#93a3bd';
    var FONT = '"SamsungOne", "Segoe UI", Roboto, Arial, sans-serif';

    function fit(cv) {
        var r = window.devicePixelRatio || 1;
        var w = cv.clientWidth;
        var h = cv.clientHeight;
        if (cv.width !== Math.round(w * r) || cv.height !== Math.round(h * r)) {
            cv.width = Math.round(w * r);
            cv.height = Math.round(h * r);
        }
        var ctx = cv.getContext('2d');
        ctx.setTransform(r, 0, 0, r, 0, 0);
        ctx.clearRect(0, 0, w, h);
        return { ctx: ctx, w: w, h: h };
    }

    function niceStep(range, count) {
        var raw = range / count;
        var mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
        var n = raw / mag;
        return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag;
    }

    function rgba(hex, a) {
        var n = parseInt(hex.slice(1), 16);
        return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
    }

    // Line split at `base`: green above, red below, with a matching gradient fill.
    function splitLine(ctx, xy, baseY, top, bottom, left, right, width) {
        function path() {
            ctx.beginPath();
            xy.forEach(function (p, i) { if (i) { ctx.lineTo(p[0], p[1]); } else { ctx.moveTo(p[0], p[1]); } });
        }
        [[UP, top, baseY], [DOWN, baseY, bottom]].forEach(function (z) {
            if (z[2] <= z[1]) { return; }
            ctx.save();
            ctx.beginPath();
            ctx.rect(left, z[1], right - left, z[2] - z[1]);
            ctx.clip();

            path();
            ctx.lineTo(xy[xy.length - 1][0], baseY);
            ctx.lineTo(xy[0][0], baseY);
            ctx.closePath();
            var g = ctx.createLinearGradient(0, z[0] === UP ? top : bottom, 0, baseY);
            g.addColorStop(0, rgba(z[0], 0.42));
            g.addColorStop(1, rgba(z[0], 0.04));
            ctx.fillStyle = g;
            ctx.fill();

            path();
            ctx.strokeStyle = z[0];
            ctx.lineWidth = width;
            ctx.lineJoin = 'round';
            ctx.stroke();
            ctx.restore();
        });
    }

    var TIME_LABELS = [];
    for (var m = 0; m <= 390; m += 30) {
        var hh = 9 + Math.floor((m + 30) / 60);
        var mm = (m + 30) % 60;
        TIME_LABELS.push([m, (hh > 12 ? hh - 12 : hh) + ':' + (mm ? '30' : '00') + (hh >= 12 ? ' PM' : ' AM')]);
    }

    var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function dateLabel(dt, range) {
        var a = dt.split(/[- :]/);
        if (range === '5Y' || range === 'MAX') { return a[0]; }
        if (range === '1Y' || range === 'YTD' || range === '6M') { return MON[+a[1] - 1] + (a[1] === '01' ? ' ' + a[0] : ''); }
        return MON[+a[1] - 1] + ' ' + +a[2];
    }

    // opts: {pts, intraday, range, base, price}
    function main(cv, opts) {
        var f = fit(cv);
        var ctx = f.ctx;
        var pts = opts.pts || [];
        var L = 4, R = f.w - 84, T = 12;
        var B = f.h - 34;               // x-axis baseline
        var priceB = T + (B - T) * 0.72;
        var volT = priceB + 36;

        ctx.font = '19px ' + FONT;
        ctx.textBaseline = 'middle';

        if (!pts.length) {
            ctx.fillStyle = AXIS;
            ctx.textAlign = 'center';
            ctx.fillText(opts.message || 'Loading chartâ€¦', (L + R) / 2, (T + B) / 2);
            return;
        }

        var n = opts.intraday ? 390 : Math.max(1, pts.length - 1);
        function X(i) { return L + (R - L) * (opts.intraday ? pts[i].x : i) / n; }

        // Price scale
        var base = opts.base;
        var lo = Infinity, hi = -Infinity;
        pts.forEach(function (p) { lo = Math.min(lo, p.l, p.c); hi = Math.max(hi, p.h, p.c); });
        if (base) { lo = Math.min(lo, base); hi = Math.max(hi, base); }
        var pad = (hi - lo) * 0.08 || hi * 0.01;
        lo -= pad; hi += pad;
        var step = niceStep(hi - lo, 5);
        function Y(v) { return priceB - (v - lo) / (hi - lo) * (priceB - T); }

        // Grid + price labels
        ctx.strokeStyle = GRID;
        ctx.lineWidth = 1;
        ctx.fillStyle = AXIS;
        ctx.textAlign = 'left';
        var dec = step < 1 ? 2 : step < 10 ? 2 : 0;
        for (var v = Math.ceil(lo / step) * step; v <= hi; v += step) {
            var y = Math.round(Y(v)) + 0.5;
            ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
            ctx.fillText(U.num(v, dec), R + 12, y);
        }

        // X labels + vertical grid
        var xl = [];
        if (opts.intraday) {
            xl = TIME_LABELS.map(function (t) { return [L + (R - L) * t[0] / 390, t[1]]; });
        } else {
            var cnt = 6;
            for (var k = 0; k < cnt; k++) {
                var i = Math.round(k * (pts.length - 1) / (cnt - 1));
                xl.push([X(i), dateLabel(pts[i].dt, opts.range)]);
            }
        }
        ctx.font = '17px ' + FONT;
        var lastEnd = -Infinity;
        xl.forEach(function (t, j) {
            var x = Math.round(t[0]) + 0.5;
            ctx.beginPath(); ctx.moveTo(x, T); ctx.lineTo(x, B); ctx.stroke();
            // Centre labels, clamp the ends inside the plot, skip any that would overlap.
            var w = ctx.measureText(t[1]).width;
            var left = Math.max(L, Math.min(t[0] - w / 2, (j === xl.length - 1 && !opts.intraday ? R : f.w) - w));
            if (left < lastEnd + 10) { return; }
            ctx.textAlign = 'left';
            ctx.fillText(t[1], left, B + 18);
            lastEnd = left + w;
        });
        ctx.font = '19px ' + FONT;
        // plot frame lines
        ctx.strokeStyle = '#22324e';
        ctx.beginPath(); ctx.moveTo(L, priceB + 0.5); ctx.lineTo(R, priceB + 0.5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(R + 0.5, T); ctx.lineTo(R + 0.5, B); ctx.stroke();

        // Price line
        var refBase = base || pts[0].c;
        var xy = pts.map(function (p, i) { return [X(i), Y(p.c)]; });
        if (opts.intraday && pts[0].x > 0) { xy.unshift([L, Y(pts[0].o)]); }
        splitLine(ctx, xy, Y(refBase), T, priceB, L, R, 2.5);

        // Baseline (prev close)
        var by = Math.round(Y(refBase)) + 0.5;
        ctx.save();
        ctx.setLineDash([7, 6]);
        ctx.strokeStyle = '#e5ecf6';
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(L, by); ctx.lineTo(R, by); ctx.stroke();
        ctx.restore();
        ctx.fillStyle = '#e5ecf6';
        ctx.textAlign = 'right';
        ctx.fillText(opts.intraday ? 'Prev Close' : 'Start', R - 10, by - 30);
        ctx.fillText(U.num(refBase), R - 10, by - 10);

        // Live dot + price tag
        var last = xy[xy.length - 1];
        var lastP = pts[pts.length - 1].c;
        var col = lastP >= refBase ? UP : DOWN;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(last[0], last[1], 4, 0, Math.PI * 2); ctx.fill();
        var tagY = Math.max(T + 12, Math.min(priceB - 12, last[1]));
        ctx.fillStyle = col;
        roundRect(ctx, R + 2, tagY - 15, 80, 30, 4);
        ctx.fill();
        ctx.fillStyle = '#04120a';
        ctx.font = '600 19px ' + FONT;
        ctx.textAlign = 'center';
        ctx.fillText(U.num(lastP), R + 42, tagY + 1);

        // Volume
        var vmax = 0;
        pts.forEach(function (p) { vmax = Math.max(vmax, p.v); });
        ctx.font = '19px ' + FONT;
        ctx.textAlign = 'left';
        ctx.fillStyle = '#e5ecf6';
        ctx.fillText('Volume  ' + U.big(pts[pts.length - 1].v), L + 6, volT - 16);
        if (vmax > 0) {
            // One scale label: the largest round number under the tallest bar.
            var vstep = niceStep(vmax, 1);
            var vlab = Math.floor(vmax / vstep) * vstep || vstep;
            ctx.fillStyle = AXIS;
            ctx.fillText(U.big(vlab, 0), R + 12, B - (B - volT) * vlab / vmax);
            var bw = Math.max(1.5, (R - L) / (opts.intraday ? 78 : pts.length) - 2);
            pts.forEach(function (p, i) {
                var h = (B - volT) * p.v / vmax;
                ctx.fillStyle = p.c >= p.o ? rgba(UP, 0.85) : rgba(DOWN, 0.85);
                var x = opts.intraday ? L + (R - L) * (p.x + 2.5) / 390 : X(i);
                ctx.fillRect(x - bw / 2, B - h, bw, h);
            });
        }
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    // Sparkline: values oldest first, coloured by close vs `base`.
    function spark(cv, values, base, intradayX) {
        var f = fit(cv);
        var ctx = f.ctx;
        if (values.length < 2) { return; }
        var lo = Infinity, hi = -Infinity;
        values.forEach(function (v) { lo = Math.min(lo, v); hi = Math.max(hi, v); });
        var pad = (hi - lo) * 0.1 || 1;
        lo -= pad; hi += pad;
        var last = values[values.length - 1];
        var col = last >= base ? UP : DOWN;
        var xy = values.map(function (v, i) {
            var xi = intradayX ? intradayX[i] / 390 : i / (values.length - 1);
            return [2 + (f.w - 4) * xi, f.h - 2 - (v - lo) / (hi - lo) * (f.h - 4)];
        });
        ctx.beginPath();
        xy.forEach(function (p, i) { if (i) { ctx.lineTo(p[0], p[1]); } else { ctx.moveTo(p[0], p[1]); } });
        ctx.lineTo(xy[xy.length - 1][0], f.h);
        ctx.lineTo(xy[0][0], f.h);
        ctx.closePath();
        var g = ctx.createLinearGradient(0, 0, 0, f.h);
        g.addColorStop(0, rgba(col, 0.38));
        g.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g;
        ctx.fill();
        ctx.beginPath();
        xy.forEach(function (p, i) { if (i) { ctx.lineTo(p[0], p[1]); } else { ctx.moveTo(p[0], p[1]); } });
        ctx.strokeStyle = col;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.stroke();
    }

    return { main: main, spark: spark };
})();
