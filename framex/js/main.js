/* frameXTV launcher: shows the site full screen with a small touch menu. */
(function () {
    'use strict';

    var SITE = 'https://www.framextv.xyz/';
    var MENU_MS = 4000;     // menu closes itself after this long
    var BOUNCE_MS = 10000;  // a second page load this soon after the first = the site blanked itself
    var LOAD_MS = 20000;    // no page load at all by now = blocked

    var frame = document.getElementById('site');
    var menu = document.getElementById('menu');
    var loads = 0;
    var firstLoad = 0;
    var menuTimer = 0;

    function exitApp() {
        try {
            tizen.application.getCurrentApplication().exit();
        } catch (e) {
            window.close();
        }
    }

    // Hand the whole webview to the site. Touch works natively there, but this
    // menu is gone and the remote Back key exits the app.
    function goDirect() {
        location.replace(SITE);
    }

    function home() {
        loads = 0;
        frame.src = SITE;
    }

    function closeMenu() {
        menu.className = '';
    }

    function openMenu() {
        menu.className = 'open';
        clearTimeout(menuTimer);
        menuTimer = setTimeout(closeMenu, MENU_MS);
    }

    // The page is cross-origin, so we can't look inside it. The site is a
    // single-page app, so normal browsing never fires another load event; its
    // anti-devtools code does (it navigates to about:blank).
    frame.addEventListener('load', function () {
        loads += 1;
        if (loads === 1) {
            firstLoad = Date.now();
        } else if (Date.now() - firstLoad < BOUNCE_MS) {
            goDirect();
        }
    });

    setTimeout(function () {
        if (!loads) { goDirect(); }
    }, LOAD_MS);

    document.getElementById('handle').addEventListener('click', function () {
        if (menu.className) { closeMenu(); } else { openMenu(); }
    });

    document.getElementById('items').addEventListener('click', function (e) {
        var act = e.target.getAttribute('data-act');
        closeMenu();
        if (act === 'home') { home(); }
        else if (act === 'reload') { loads = 0; frame.src = frame.src; }
        else if (act === 'direct') { goDirect(); }
        else if (act === 'exit') { exitApp(); }
    });

    document.addEventListener('keydown', function (e) {
        if (e.keyCode === 10009) {         // Back: close the menu, else exit
            if (menu.className) { closeMenu(); } else { exitApp(); }
        }
    });

    home();
}());
