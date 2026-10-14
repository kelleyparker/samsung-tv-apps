(function () {
    function exitApp() {
        try {
            tizen.application.getCurrentApplication().exit();
        } catch (e) {
            window.close();
        }
    }

    // 10009 = Samsung remote Back/Return
    document.addEventListener('keydown', function (e) {
        if (e.keyCode === 10009) {
            exitApp();
        }
    }, true);
})();
