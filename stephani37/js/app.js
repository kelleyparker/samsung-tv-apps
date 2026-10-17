/* Baby Girl's 37th - app logic. ES5 on purpose for older Tizen TVs. */
(function () {
  'use strict';

  var P = window.PARTY;
  function $(id) { return document.getElementById(id); }

  var stage = $('stage');
  var audio = $('theme');
  var intro = $('screen-intro');

  var state = { screen: null, focus: 0, gate: false, timers: [], fadeTimer: null, badgeTimer: null, musicOk: true };

  var K = {
    LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13,
    BACK: 10009, ESC: 27, BACKSPACE: 8,
    PLAYPAUSE: 10252, PLAY: 415, PAUSE: 19, M: 77
  };

  /* ---------- layout: scale the 1920x1080 stage to any window ---------- */
  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = 'translate(-50%, -50%) scale(' + s + ') translateZ(0)';
  }

  /* ---------- Tizen remote keys ---------- */
  function registerKeys() {
    if (!(window.tizen && tizen.tvinputdevice)) return;
    ['MediaPlayPause', 'MediaPlay', 'MediaPause', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue'].forEach(function (k) {
      try { tizen.tvinputdevice.registerKey(k); } catch (e) { /* key not on this remote */ }
    });
  }

  /* ---------- particle FX (confetti + sparkles) ---------- */
  var FX = (function () {
    var c = $('fx'), ctx = c.getContext('2d');
    var RES = c.width / 1920;          // canvas renders at half res; CSS scales it up
    var parts = [], ambient = false, last = 0, dirty = false;
    var colors = ['#ff2fb4', '#ffd34d', '#35e0ff', '#ffffff', '#b15cff'];
    function r(a, b) { return a + Math.random() * (b - a); }
    function color() { return colors[(Math.random() * colors.length) | 0]; }

    function confetti(x, y, vx, vy) {
      parts.push({ t: 0, x: x, y: y, vx: vx, vy: vy, w: r(14, 26), h: r(8, 14), a: r(0, 6.28), va: r(-0.25, 0.25), c: color() });
    }
    function burst(x, y, n) {
      for (var i = 0; i < n; i++) { var ang = r(0, 6.28), sp = r(8, 28); confetti(x, y, Math.cos(ang) * sp, Math.sin(ang) * sp - 10); }
    }
    function cannons() {
      for (var i = 0; i < 40; i++) {
        confetti(0, 1080, r(10, 30), r(-40, -22));
        confetti(1920, 1080, -r(10, 30), r(-40, -22));
      }
    }
    function sparkle(x, y, n) {
      for (var i = 0; i < n; i++) parts.push({ t: 1, x: x + r(-500, 500), y: y + r(-180, 180), vx: r(-1, 1), vy: r(-1, 1), life: 1, s: r(5, 11), c: color() });
    }

    function tick(now) {
      window.requestAnimationFrame(tick);
      if (!parts.length && !ambient && !dirty) return;

      var dt = last ? Math.min(2, (now - last) / 16.667) : 1;
      last = now;

      if (ambient && parts.length < 35 && Math.random() < 0.2 * dt) {
        confetti(r(0, 1920), -20, r(-0.8, 0.8), r(2, 4.5));
      }

      if (!parts.length && !dirty) return;

      ctx.clearRect(0, 0, c.width, c.height);
      dirty = parts.length > 0;

      var drag = 1 - 0.015 * dt;
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        if (p.t === 0) {
          p.vx *= drag; p.vy += 0.45 * dt; if (p.vy > 5) p.vy = 5;
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.y > 1110 || p.x < -40 || p.x > 1960) { parts.splice(i, 1); continue; }
          ctx.fillStyle = p.c;
          ctx.fillRect((p.x * RES) | 0, (p.y * RES) | 0, (p.w * RES) | 0, (p.h * RES) | 0);
        } else {
          p.life -= 0.03 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.life <= 0) { parts.splice(i, 1); continue; }
          var s = (p.s * p.life * RES) | 0;
          if (s < 1) s = 1;
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.c;
          ctx.fillRect((p.x * RES - s / 2) | 0, (p.y * RES - s / 2) | 0, s, s);
          ctx.globalAlpha = 1;
        }
      }
    }

    return {
      start: function () { window.requestAnimationFrame(tick); },
      burst: burst, cannons: cannons, sparkle: sparkle,
      setAmbient: function (on) { ambient = on; },
      clear: function () { parts.length = 0; }
    };
  })();

  /* ---------- helpers ---------- */
  function at(ms, fn) { state.timers.push(setTimeout(fn, ms)); }
  function clearTimers() { state.timers.forEach(clearTimeout); state.timers = []; }

  function retrigger(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
  function flash(color) { var f = $('flash'); f.style.background = color; retrigger(f, 'go'); }
  function shake() { retrigger(intro, 'shake'); }

  function badge(text) {
    var b = $('badge'); b.textContent = text; b.classList.add('show');
    clearTimeout(state.badgeTimer);
    state.badgeTimer = setTimeout(function () { b.classList.remove('show'); }, 2500);
  }

  function show(name) {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) screens[i].classList.toggle('active', screens[i].id === 'screen-' + name);
    state.screen = name;
  }

  /* ---------- music ---------- */
  function fadeTo(target, ms, onDone) {
    clearInterval(state.fadeTimer);
    var start = audio.volume, steps = Math.max(1, (ms / 50) | 0), i = 0;
    state.fadeTimer = setInterval(function () {
      i++;
      audio.volume = Math.max(0, Math.min(1, start + (target - start) * (i / steps)));
      if (i >= steps) { clearInterval(state.fadeTimer); if (onDone) onDone(); }
    }, 50);
  }

  function seekToStart() {
    var t = P.music.startAt || 0;
    if (audio.readyState >= 1) { try { audio.currentTime = t; } catch (e) { } }
    else audio.addEventListener('loadedmetadata', function once() {
      audio.removeEventListener('loadedmetadata', once);
      try { audio.currentTime = t; } catch (e) { }
    });
  }

  function safePlay() {
    var p;
    try { p = audio.play(); } catch (e) { return; }
    if (p && p.catch) p.catch(function () { });
  }

  function restartMusic() {
    if (!state.musicOk) return;
    seekToStart();
    fadeTo(P.music.introVolume, 300);
    safePlay();
  }

  function toggleMute() {
    audio.muted = !audio.muted;
    badge(audio.muted ? 'Music muted' : 'Music on');
  }

  /* ---------- intro / entrance ---------- */
  function playIntro() {
    clearTimers();
    show('intro');
    FX.clear(); FX.setAmbient(false);
    retrigger(intro, 'play');
    restartMusic();

    at(600,  function () { flash('#35e0ff'); });
    at(1400, function () { flash('#ff2fb4'); shake(); FX.burst(960, 420, 110); });
    at(2400, function () { flash('#ffd34d'); shake(); FX.cannons(); });
    at(3300, function () { FX.sparkle(960, 820, 60); });
    at(4200, function () { FX.setAmbient(true); });
  }

  /* ---------- start gate (only if the browser blocks autoplay) ---------- */
  function openGate() { state.gate = true; $('start-gate').classList.remove('hidden'); }
  function closeGateAndStart() {
    state.gate = false; $('start-gate').classList.add('hidden');
    playIntro();
  }

  /* ---------- home hub ---------- */
  function buildHome() {
    $('home-title').textContent = P.intro.name + ' ' + P.intro.number + P.intro.suffix.toUpperCase();
    var html = '';
    P.modules.forEach(function (m, i) {
      html += '<div class="tile" data-i="' + i + '">' +
                '<div class="n">' + (i + 1) + '</div>' +
                '<div class="tile-info">' +
                  '<h2>' + m.title + '</h2>' +
                  '<p>' + m.blurb + '</p>' +
                '</div>' +
              '</div>';
    });
    $('tiles').innerHTML = html;

    // Build static party timeline card
    var tl = P.timeline || [];
    var tlHtml = '';
    tl.forEach(function (item) {
      tlHtml += '<div class="timeline-row">' +
                  '<div class="timeline-time">' + item.time + '</div>' +
                  '<div class="timeline-event">' + item.event + '</div>' +
                '</div>';
    });
    $('timeline-list').innerHTML = tlHtml;
  }

  function setFocus(i) {
    var n = P.modules.length;
    state.focus = (i + n) % n;
    var tiles = document.querySelectorAll('.tile');
    for (var j = 0; j < tiles.length; j++) tiles[j].classList.toggle('focused', j === state.focus);
  }

  function goHome() {
    clearTimers();
    FX.setAmbient(false);
    show('home');
    setFocus(state.focus);
    FX.burst(960, 540, 60);
    if (P.music.keepPlayingOnHome) fadeTo(P.music.homeVolume, 1500);
    else fadeTo(0, 1500, function () { audio.pause(); });
  }

  var galleryFocus = 0;
  var lightboxIndex = 0;
  var isLightboxOpen = false;

  function getPhotoSrc(p) { return typeof p === 'object' && p ? p.src : p; }
  function getPhotoDate(p) { return typeof p === 'object' && p && p.date ? p.date : ''; }
  function getPhotoThumb(p) {
    var src = getPhotoSrc(p);
    if (!src) return '';
    var idx = src.lastIndexOf('/');
    if (idx !== -1) {
      return src.substring(0, idx) + '/thumbs/' + src.substring(idx + 1);
    }
    return src;
  }

  /* ---------- photo gallery module ---------- */
  function buildGallery() {
    var photos = P.photos || [];
    var html = '';
    photos.forEach(function (p, i) {
      var thumb = getPhotoThumb(p);
      var date = getPhotoDate(p);
      html += '<div class="gallery-item" data-idx="' + i + '" style="background-image:url(\'' + thumb + '\');">' +
                (date ? '<div class="gallery-date-badge">' + date + '</div>' : '') +
              '</div>';
    });
    $('gallery-grid').innerHTML = html;
  }

  function setGalleryFocus(i) {
    var photos = P.photos || [];
    if (!photos.length) return;
    galleryFocus = (i + photos.length) % photos.length;
    var items = document.querySelectorAll('.gallery-item');
    for (var j = 0; j < items.length; j++) items[j].classList.toggle('focused', j === galleryFocus);
    var cur = photos[galleryFocus];
    var date = getPhotoDate(cur);
    $('gallery-counter').textContent = (galleryFocus + 1) + ' / ' + photos.length + (date ? ' • ' + date : '');

    var targetItem = items[galleryFocus];
    if (targetItem && targetItem.scrollIntoView) {
      targetItem.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }
  }

  function openGallery() {
    buildGallery();
    show('gallery');
    setGalleryFocus(0);
    var grid = $('gallery-grid');
    if (grid) grid.scrollTop = 0;
  }

  function openLightbox(i) {
    var photos = P.photos || [];
    if (!photos.length) return;
    lightboxIndex = (i + photos.length) % photos.length;
    isLightboxOpen = true;
    var cur = photos[lightboxIndex];
    var src = getPhotoSrc(cur);
    var date = getPhotoDate(cur);
    $('lightbox-img').style.backgroundImage = 'url("' + src + '")';
    $('lightbox-caption').innerHTML = (date ? '<span style="color:#fff;">' + date + '</span> &bull; ' : '') + 'Photo ' + (lightboxIndex + 1) + ' of ' + photos.length;
    $('photo-lightbox').classList.remove('hidden');
  }

  function closeLightbox() {
    isLightboxOpen = false;
    $('photo-lightbox').classList.add('hidden');
  }

  function nextLightbox(step) {
    var photos = P.photos || [];
    openLightbox(lightboxIndex + step);
    setGalleryFocus(lightboxIndex);
  }

  function openModule(i) {
    setFocus(i);
    var mod = P.modules[state.focus];
    if (mod.id === 'gallery') {
      openGallery();
    } else if (mod.id === 'quiz') {
      openQuiz();
    } else {
      $('m-title').textContent = mod.title;
      show('module');
    }
  }

  /* ---------- Stephani Trivia Quiz Module ---------- */
  var quizState = {
    qIndex: 0,
    optFocus: 0,
    score: 0,
    answered: false,
    showingResults: false,
    resultBtnFocus: 0 // 0: retry, 1: exit
  };

  var OPT_LETTERS = ['A', 'B', 'C', 'D'];

  function openQuiz() {
    quizState.qIndex = 0;
    quizState.optFocus = 0;
    quizState.score = 0;
    quizState.answered = false;
    quizState.showingResults = false;
    quizState.resultBtnFocus = 0;
    show('quiz');
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    var questions = P.quiz || [];
    if (quizState.qIndex >= questions.length) {
      showQuizResults();
      return;
    }

    quizState.answered = false;
    quizState.optFocus = 0;
    $('quiz-question-box').classList.remove('hidden');
    $('quiz-feedback-box').classList.add('hidden');
    $('quiz-results-box').classList.add('hidden');
    $('quiz-progress').textContent = 'QUESTION ' + (quizState.qIndex + 1) + ' / ' + questions.length;
    $('quiz-hint').innerHTML = '&#9664; &#9650; &#9654; &#9660; select answer &nbsp;&middot;&nbsp; OK confirm &nbsp;&middot;&nbsp; BACK return to menu';

    var cur = questions[quizState.qIndex];
    $('quiz-question-text').textContent = cur.question;

    var html = '';
    cur.options.forEach(function (opt, idx) {
      html += '<div class="quiz-option" data-idx="' + idx + '">' +
                '<span class="quiz-option-letter">' + OPT_LETTERS[idx] + '</span>' +
                '<span class="quiz-option-text">' + opt + '</span>' +
              '</div>';
    });
    $('quiz-options-grid').innerHTML = html;
    setQuizOptionFocus(0);
  }

  function setQuizOptionFocus(idx) {
    var cur = (P.quiz || [])[quizState.qIndex];
    if (!cur) return;
    var count = cur.options.length;
    quizState.optFocus = (idx + count) % count;

    var opts = document.querySelectorAll('.quiz-option');
    for (var i = 0; i < opts.length; i++) {
      opts[i].classList.toggle('focused', i === quizState.optFocus);
    }
  }

  function submitQuizAnswer() {
    if (quizState.answered) {
      // Advance to next question
      quizState.qIndex++;
      renderQuizQuestion();
      return;
    }

    var questions = P.quiz || [];
    var cur = questions[quizState.qIndex];
    if (!cur) return;

    quizState.answered = true;
    var isCorrect = (quizState.optFocus === cur.correctIndex);
    if (isCorrect) quizState.score++;

    var opts = document.querySelectorAll('.quiz-option');
    for (var i = 0; i < opts.length; i++) {
      opts[i].classList.remove('focused');
      if (i === cur.correctIndex) opts[i].classList.add('correct');
      if (i === quizState.optFocus && !isCorrect) opts[i].classList.add('wrong');
    }

    var feedback = $('quiz-feedback-box');
    var msg = $('quiz-feedback-msg');
    feedback.classList.remove('hidden');

    if (isCorrect) {
      msg.textContent = '🎉 CORRECT!';
      msg.style.color = '#39ff14';
      feedback.style.borderColor = '#39ff14';
      FX.burst(960, 540, 45);
    } else {
      msg.textContent = '❌ NOT QUITE! (Correct: ' + OPT_LETTERS[cur.correctIndex] + ' - ' + cur.options[cur.correctIndex] + ')';
      msg.style.color = '#ff3366';
      feedback.style.borderColor = '#ff3366';
      shake();
    }
    $('quiz-hint').innerHTML = 'Press OK or &#9654; to continue to the next question &nbsp;&middot;&nbsp; BACK return to menu';
  }

  function showQuizResults() {
    quizState.showingResults = true;
    $('quiz-question-box').classList.add('hidden');
    $('quiz-feedback-box').classList.add('hidden');
    $('quiz-results-box').classList.remove('hidden');

    var questions = P.quiz || [];
    var total = questions.length;
    var score = quizState.score;

    $('quiz-progress').textContent = 'QUIZ COMPLETE';
    $('quiz-results-score').textContent = score + ' / ' + total;

    var title = $('quiz-results-title');
    var desc = $('quiz-results-desc');

    if (score === total) {
      title.textContent = '🌟 PERFECT SCORE! 🌟';
      desc.textContent = "You truly know Stephani inside and out! Certified Birthday VIP!";
      FX.cannons();
      FX.sparkle(960, 540, 80);
    } else if (score >= total - 1) {
      title.textContent = '👏 FANTASTIC JOB! 👏';
      desc.textContent = "Almost perfect! You definitely know Baby Girl!";
      FX.burst(960, 540, 60);
    } else if (score >= 2) {
      title.textContent = '🥂 GOOD EFFORT! 🥂';
      desc.textContent = "Not bad! Time to grab a drink and ask Stephani some questions!";
      FX.burst(960, 540, 30);
    } else {
      title.textContent = '🎂 TIME TO CELEBRATE! 🎂';
      desc.textContent = "Go give Stephani a birthday hug and learn more about her!";
    }

    setQuizResultBtnFocus(0);
    $('quiz-hint').innerHTML = '&#9664; &#9654; choose &nbsp;&middot;&nbsp; OK confirm &nbsp;&middot;&nbsp; BACK return to menu';
  }

  function setQuizResultBtnFocus(idx) {
    quizState.resultBtnFocus = (idx + 2) % 2;
    var retryBtn = $('quiz-retry-btn');
    var exitBtn = $('quiz-exit-btn');
    if (retryBtn) retryBtn.classList.toggle('focused', quizState.resultBtnFocus === 0);
    if (exitBtn) exitBtn.classList.toggle('focused', quizState.resultBtnFocus === 1);
  }

  function executeQuizResultBtn() {
    if (quizState.resultBtnFocus === 0) {
      openQuiz();
    } else {
      goHome();
    }
  }

  function startClock() {
    function tickClock() { $('clock').textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
    tickClock(); setInterval(tickClock, 1000);
  }

  /* ---------- input ---------- */
  function isBack(k) { return k === K.BACK || k === K.ESC || k === K.BACKSPACE; }

  document.addEventListener('keydown', function (e) {
    var k = e.keyCode;
    if (state.gate) { e.preventDefault(); closeGateAndStart(); return; }
    if (k === K.PLAYPAUSE || k === K.PLAY || k === K.PAUSE || k === K.M) { e.preventDefault(); toggleMute(); return; }
    if (isBack(k)) e.preventDefault(); // never let BACK exit the app mid-party

    if (isLightboxOpen) {
      if (k === K.LEFT || k === K.UP) nextLightbox(-1);
      else if (k === K.RIGHT || k === K.DOWN) nextLightbox(1);
      else if (k === K.ENTER || isBack(k)) closeLightbox();
      return;
    }

    if (state.screen === 'intro') {
      if (k === K.ENTER) goHome();
      else if (isBack(k)) playIntro();
    } else if (state.screen === 'home') {
      if (k === K.UP || k === K.LEFT) setFocus(state.focus - 1);
      else if (k === K.DOWN || k === K.RIGHT) setFocus(state.focus + 1);
      else if (k === K.ENTER) openModule(state.focus);
      else if (isBack(k) || k === 48) playIntro();                 // BACK or 0 = replay entrance
      else if (k >= 49 && k < 49 + P.modules.length) openModule(k - 49); // 1..n jump
    } else if (state.screen === 'quiz') {
      if (quizState.showingResults) {
        if (k === K.LEFT || k === K.UP) setQuizResultBtnFocus(quizState.resultBtnFocus - 1);
        else if (k === K.RIGHT || k === K.DOWN) setQuizResultBtnFocus(quizState.resultBtnFocus + 1);
        else if (k === K.ENTER) executeQuizResultBtn();
        else if (isBack(k)) goHome();
      } else if (quizState.answered) {
        if (k === K.ENTER || k === K.RIGHT || k === K.DOWN) submitQuizAnswer();
        else if (isBack(k)) goHome();
      } else {
        // Grid navigation (2x2):
        // 0: A (top-left)    1: B (top-right)
        // 2: C (bottom-left) 3: D (bottom-right)
        if (k === K.LEFT) {
          if (quizState.optFocus % 2 === 1) setQuizOptionFocus(quizState.optFocus - 1);
        } else if (k === K.RIGHT) {
          if (quizState.optFocus % 2 === 0) setQuizOptionFocus(quizState.optFocus + 1);
        } else if (k === K.UP) {
          if (quizState.optFocus >= 2) setQuizOptionFocus(quizState.optFocus - 2);
        } else if (k === K.DOWN) {
          if (quizState.optFocus < 2) setQuizOptionFocus(quizState.optFocus + 2);
        } else if (k === K.ENTER) {
          submitQuizAnswer();
        } else if (isBack(k)) {
          goHome();
        }
      }
    } else if (state.screen === 'gallery') {
      if (k === K.LEFT) setGalleryFocus(galleryFocus - 1);
      else if (k === K.RIGHT) setGalleryFocus(galleryFocus + 1);
      else if (k === K.UP) setGalleryFocus(galleryFocus - 4);     // 4 columns grid
      else if (k === K.DOWN) setGalleryFocus(galleryFocus + 4);
      else if (k === K.ENTER) openLightbox(galleryFocus);
      else if (isBack(k)) goHome();
    } else if (state.screen === 'module') {
      if (isBack(k)) goHome();
    }
  });

  /* ---------- ambient photo slideshow ---------- */
  var Slideshow = (function () {
    var photos = P.photos || [];
    var cfg = P.photoSlideshow || { intervalMs: 8000, opacity: 0.28 };
    var slideA = $('slide-a');
    var slideB = $('slide-b');
    var activeSlot = 0; // 0: slideA active, 1: slideB active
    var currentIndex = -1;
    var timer = null;
    var pans = ['pan-1', 'pan-2', 'pan-3'];

    function pickNextIndex() {
      if (photos.length <= 1) return 0;
      var next;
      do {
        next = Math.floor(Math.random() * photos.length);
      } while (next === currentIndex);
      return next;
    }

    var menuPhoto = $('menu-photo');

    function transition() {
      if (!photos || photos.length === 0) return;
      currentIndex = pickNextIndex();
      var cur = photos[currentIndex];
      var nextImg = getPhotoSrc(cur);
      var curDate = getPhotoDate(cur);
      var panCls = pans[Math.floor(Math.random() * pans.length)];

      function doSwap() {
        incoming.className = 'slide ' + panCls;
        incoming.style.backgroundImage = 'url("' + nextImg + '")';
        incoming.style.opacity = cfg.opacity || 0.28;
        outgoing.style.opacity = '0';

        if (menuPhoto) {
          menuPhoto.style.opacity = '0.3';
          setTimeout(function () {
            menuPhoto.style.backgroundImage = 'url("' + nextImg + '")';
            menuPhoto.style.opacity = '1';
            var cap = document.querySelector('.menu-photo-caption');
            if (cap) {
              cap.textContent = curDate ? 'BIRTHDAY GIRL • ' + curDate.toUpperCase() : 'BIRTHDAY GIRL • 37 YEARS OF AMAZING';
            }
          }, 300);
        }
        activeSlot = activeSlot === 0 ? 1 : 0;
      }

      // Pre-decode / cache image in memory before triggering transition
      var preloader = new Image();
      preloader.onload = function () { doSwap(); };
      preloader.onerror = function () { doSwap(); };
      preloader.src = nextImg;
    }

    // Preload all gallery images in background after boot
    function preloadAll() {
      if (!photos) return;
      var i = 0;
      function next() {
        if (i >= photos.length) return;
        var img = new Image();
        img.onload = img.onerror = function () {
          i++;
          setTimeout(next, 50);
        };
        img.src = getPhotoSrc(photos[i]);
      }
      setTimeout(next, 1000);
    }

    return {
      start: function () {
        if (!photos || photos.length === 0) return;
        transition();
        timer = setInterval(transition, cfg.intervalMs || 8000);
        preloadAll();
      }
    };
  })();

  /* ---------- boot ---------- */
  function boot() {
    fit();
    window.addEventListener('resize', fit);
    registerKeys();

    $('t-welcome').textContent = P.intro.welcome;
    $('t-name').textContent = P.intro.name;
    $('t-name').setAttribute('data-text', P.intro.name);
    $('t-num').innerHTML = P.intro.number + '<span>' + P.intro.suffix + '</span>';
    $('t-party').textContent = P.intro.tagline;

    // Build intro party timeline overlay
    var tl = P.timeline || [];
    var introTlHtml = '';
    tl.forEach(function (item) {
      introTlHtml += '<div class="intro-timeline-row">' +
                       '<div class="intro-timeline-time">' + item.time + '</div>' +
                       '<div class="intro-timeline-event">' + item.event + '</div>' +
                     '</div>';
    });
    if ($('intro-timeline-list')) $('intro-timeline-list').innerHTML = introTlHtml;

    // Bind WiFi details from config
    if (P.wifi) {
      if ($('wifi-ssid')) $('wifi-ssid').textContent = P.wifi.ssid;
      if ($('wifi-pass')) $('wifi-pass').textContent = P.wifi.password;
    }

    buildHome();
    startClock();
    FX.start();
    Slideshow.start();

    audio.loop = true;
    audio.volume = P.music.introVolume;
    // Explicit 'ended' fallback in case older/certain TV webkit builds drop audio.loop
    audio.addEventListener('ended', function () {
      audio.currentTime = P.music.startAt || 0;
      safePlay();
    });
    audio.addEventListener('error', function () {
      state.musicOk = false;
      badge('No theme song found: add ' + P.music.src);
    });
    audio.src = P.music.src;

    // Try to autoplay. TVs allow it; desktop browsers may block until a key press.
    var p;
    try { p = audio.play(); } catch (e) { p = null; }
    if (p && p.then) {
      p.then(function () { playIntro(); }, function (err) {
        if (err && err.name === 'NotAllowedError') openGate();
        else { state.musicOk = false; playIntro(); }
      });
    } else {
      playIntro();
    }
  }

  boot();
})();
