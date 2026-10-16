/* frameXTV launcher: shows the site full screen with a small menu (touch or remote). */
(function () {
    'use strict';

    var SITE = 'https://www.framextv.xyz/';
    var MENU_MS = 4000;     // menu closes itself after this long
    var BOUNCE_MS = 10000;  // a second page load this soon after the first = the site blanked itself
    var LOAD_MS = 20000;    // no page load at all by now = blocked
    var HINT_MS = 6000;     // how long the "OK: menu" hint shows on remote-only TVs

    var KEY_LEFT = 37, KEY_UP = 38, KEY_RIGHT = 39, KEY_DOWN = 40, KEY_ENTER = 13, KEY_BACK = 10009;

    var frame = document.getElementById('site');
    var menu = document.getElementById('menu');
    var loads = 0;
    var firstLoad = 0;
    var menuTimer = 0;
    var buttons = Array.prototype.slice.call(document.querySelectorAll('#items button'));
    var focused = -1;       // index into buttons while the menu is driven by the remote

    // Remote-only TVs (no touchscreen) can't tap into the site, so keep key
    // focus here. Otherwise the iframe swallows every remote key.
    var remoteOnly = !(navigator.maxTouchPoints > 0);

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

    function setFocus(i) {
        focused = i;
        buttons.forEach(function (b, n) { b.className = n === i ? 'focus' : ''; });
    }

    function closeMenu() {
        menu.className = '';
        setFocus(-1);
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

    // Remote: OK / Up / Down opens the menu, Left / Right pick an item, OK runs
    // it, Back closes the menu or exits.
    document.addEventListener('keydown', function (e) {
        var k = e.keyCode;
        if (k === KEY_BACK) {
            if (menu.className) { closeMenu(); } else { exitApp(); }
            return;
        }
        if (!menu.className) {
            if (k === KEY_ENTER || k === KEY_UP || k === KEY_DOWN) {
                openMenu();
                setFocus(0);
                e.preventDefault();
            }
            return;
        }
        if (focused < 0) { setFocus(0); }
        if (k === KEY_LEFT) { setFocus(Math.max(0, focused - 1)); }
        else if (k === KEY_RIGHT) { setFocus(Math.min(buttons.length - 1, focused + 1)); }
        else if (k === KEY_ENTER) { e.preventDefault(); buttons[focused].click(); return; }
        else { return; }
        e.preventDefault();
        openMenu();                        // restart the auto-close timer
    });

    if (remoteOnly) {
        frame.tabIndex = -1;
        window.addEventListener('blur', function () {
            setTimeout(function () { window.focus(); }, 0);
        });
        var hint = document.getElementById('hint');
        hint.className = 'show';
        setTimeout(function () { hint.className = ''; }, HINT_MS);
    }

    home();
}());
