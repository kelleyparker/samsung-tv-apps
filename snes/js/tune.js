// Injects per-build RetroArch settings (window.RUN_RACFG, from js/run.js) into the
// retroarch.cfg that EmulatorJS generates, replacing any existing value for the same key.
(function () {
    var extra = window.RUN_RACFG || {};
    if (!Object.keys(extra).length) { return; }
    var timer = setInterval(function () {
        var GM = window.EJS_GameManager;
        if (!GM || !GM.prototype || GM.prototype.__tuned) { return; }
        clearInterval(timer);
        var orig = GM.prototype.getRetroArchCfg;
        GM.prototype.getRetroArchCfg = function () {
            var cfg = orig.apply(this, arguments);
            Object.keys(extra).forEach(function (k) {
                cfg = cfg.replace(new RegExp('^' + k + ' = .*\\n', 'm'), '');
                var v = extra[k];
                cfg += k + ' = ' + (typeof v === 'string' ? '"' + v + '"' : v) + '\n';
            });
            return cfg;
        };
        GM.prototype.__tuned = true;
    }, 20);
})();
