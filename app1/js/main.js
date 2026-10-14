(function () {
    var timeEl = document.getElementById('time');
    var dateEl = document.getElementById('date');
    var keyEl = document.getElementById('key');
    var video = document.getElementById('bg');

    function pad(n) {
        return n < 10 ? '0' + n : String(n);
    }

    function tick() {
        var now = new Date();
        timeEl.textContent = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
        dateEl.textContent = now.toLocaleDateString(undefined, {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    function exitApp() {
        try {
            tizen.application.getCurrentApplication().exit();
        } catch (e) {
            // Not running on a TV (e.g. desktop browser)
            window.close();
        }
    }

    function togglePlay() {
        if (video.paused) {
            video.play();
            keyEl.textContent = 'Playing';
        } else {
            video.pause();
            keyEl.textContent = 'Paused';
        }
    }

    document.addEventListener('keydown', function (e) {
        // 10009 = Samsung remote Back/Return
        if (e.keyCode === 10009) {
            exitApp();
        } else if (e.keyCode === 13 || e.keyCode === 10252) {
            // Enter / Play-Pause
            togglePlay();
        }
    });

    // Autoplay can be blocked until first input; fall back to muted playback
    var p = video.play();
    if (p && p.catch) {
        p.catch(function () {
            video.muted = true;
            video.play();
        });
    }

    tick();
    setInterval(tick, 1000);
})();
