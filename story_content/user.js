window.InitUserScripts = function()
{
var player = GetPlayer();
var object = player.object;
var once = player.once;
var addToTimeline = player.addToTimeline;
var setVar = player.SetVar;
var getVar = player.GetVar;
var update = player.update;
var pointerX = player.pointerX;
var pointerY = player.pointerY;
var showPointer = player.showPointer;
var hidePointer = player.hidePointer;
var slideWidth = player.slideWidth;
var slideHeight = player.slideHeight;
var getKeyDown = player.getKeyDown;
var keydown = player.keydown;
var keyup = player.keyup;
window.Script7 = function()
{
  (function () {
  'use strict';

  /*** CONFIG ***/
  var IDS = {
    option1: { rect: '5yzHNXRVJbX', thumb: '6lVDTvggO2t' },
    option2: { rect: '6dm6vnR5pnl', thumb: '6WWoKBnOmCO' },
    option3: { rect: '5mCkPM27azz', thumb: '6g2dwEtDyZ7' },
    option4: { rect: '6iRGmzXll2V', thumb: '667QNcExZgU' }
  };

  var DUR = 0.45;
  var EASE = 'power2.out';
  var DEBUG = true;

  var HOVER = {
    scale: 1.12,
    glowColor: 'rgba(100, 180, 255, 0.8)',
    glowSize: 20,
    transitionSpeed: 0.2
  };

  var OPTION_KEYS = ['option1', 'option2', 'option3', 'option4'];

  var mouseX = -9999, mouseY = -9999;
  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function log() {
    if (DEBUG && window.console) {
      console.log.apply(console, ['[ThumbStepper]'].concat([].slice.call(arguments)));
    }
  }

  /*** Element getters ***/
  function getEl(id, fallbackVarName) {
    try {
      if (
        typeof window[fallbackVarName] !== 'undefined' &&
        window[fallbackVarName] &&
        window[fallbackVarName].nodeType === 1
      ) return window[fallbackVarName];
    } catch (_) {}
    return document.querySelector('[data-model-id="' + id + '"]');
  }

  /*** Check if mouse is over element ***/
  function isMouseOver(el, padding) {
    if (!el || mouseX === -9999) return false;
    var p = padding || 5;
    var rect = el.getBoundingClientRect();
    return mouseX >= (rect.left - p) &&
           mouseX <= (rect.right + p) &&
           mouseY >= (rect.top - p) &&
           mouseY <= (rect.bottom + p);
  }

  /*** Store original/home transform values for each rect ***/
  var HOME = {
    option1: { x: 0, xPercent: 0 },
    option2: { x: 0, xPercent: 0 },
    option3: { x: 0, xPercent: 0 },
    option4: { x: 0, xPercent: 0 }
  };

  var homeCaptured = false;

  function captureHomePositions() {
    if (homeCaptured || typeof gsap === 'undefined') return;

    OPTION_KEYS.forEach(function (k) {
      var r = els[k].rect;
      if (!r) return;

      HOME[k].x = gsap.getProperty(r, 'x') || 0;
      HOME[k].xPercent = gsap.getProperty(r, 'xPercent') || 0;
    });

    homeCaptured = true;
    log('Captured HOME positions:', HOME);
  }

  /*** Motion helpers ***/
  function setOffscreenLeft(el) {
    if (!el) return;
    if (typeof gsap !== 'undefined') {
      gsap.set(el, { xPercent: -101 });
    } else {
      el.style.transform = 'translateX(-101%)';
    }
  }

  function setHome(el, key) {
    if (!el) return;
    if (typeof gsap !== 'undefined') {
      gsap.set(el, {
        x: HOME[key].x,
        xPercent: HOME[key].xPercent
      });
    } else {
      el.style.transform = 'translateX(0%)';
    }
  }

  function slideHome(el, key, done) {
    if (!el) {
      if (done) done();
      return;
    }

    el.style.visibility = 'visible';

    if (typeof gsap !== 'undefined') {
      gsap.to(el, {
        x: HOME[key].x,
        xPercent: HOME[key].xPercent,
        duration: DUR,
        ease: EASE,
        onComplete: done || null
      });
    } else {
      el.style.transition = 'transform ' + DUR + 's ease';
      el.style.transform = 'translateX(0%)';
      if (done) setTimeout(done, (DUR * 1000) + 30);
    }
  }

  function setOpacity(el, o) {
    if (!el) return;
    if (typeof gsap !== 'undefined') gsap.set(el, { opacity: o });
    else el.style.opacity = String(o);
    el.style.visibility = (o <= 0) ? 'hidden' : 'visible';
  }

  function fadeTo(el, o, done) {
    if (!el) {
      if (done) done();
      return;
    }

    if (o > 0) el.style.visibility = 'visible';

    if (typeof gsap !== 'undefined') {
      gsap.to(el, {
        opacity: o,
        duration: DUR,
        ease: EASE,
        onComplete: function () {
          if (o <= 0) el.style.visibility = 'hidden';
          if (done) done();
        }
      });
    } else {
      el.style.transition = 'opacity ' + DUR + 's ease';
      el.style.opacity = String(o);
      setTimeout(function () {
        if (o <= 0) el.style.visibility = 'hidden';
        if (done) done();
      }, (DUR * 1000) + 30);
    }
  }

  function enable(el, on) {
    if (el) el.style.pointerEvents = on ? '' : 'none';
  }

  function primeForPerf(el, isRect) {
    if (el) {
      el.style.willChange = isRect ? 'transform' : 'opacity, transform, filter';
      el.style.touchAction = 'manipulation';
    }
  }

  /*** Hover ***/
  function applyHover(el) {
    if (!el) return;
    if (typeof gsap !== 'undefined') {
      gsap.to(el, {
        scale: HOVER.scale,
        duration: HOVER.transitionSpeed,
        ease: 'power2.out'
      });
    } else {
      el.style.transform = 'scale(' + HOVER.scale + ')';
    }
    el.style.filter = 'drop-shadow(0 0 ' + HOVER.glowSize + 'px ' + HOVER.glowColor + ')';
  }

  function removeHover(el) {
    if (!el) return;
    if (typeof gsap !== 'undefined') {
      gsap.to(el, {
        scale: 1,
        duration: HOVER.transitionSpeed,
        ease: 'power2.out'
      });
    } else {
      el.style.transform = 'scale(1)';
    }
    el.style.filter = '';
  }

  function setupHoverEffects(el) {
    if (!el) return;

    el.style.cursor = 'pointer';
    el.style.transition = 'filter ' + HOVER.transitionSpeed + 's ease-out';

    if (el.__hoverIn) el.removeEventListener('pointerenter', el.__hoverIn);
    if (el.__hoverOut) el.removeEventListener('pointerleave', el.__hoverOut);

    el.__hoverIn = function () {
      if (el.style.pointerEvents === 'none') return;
      applyHover(el);
    };

    el.__hoverOut = function () {
      removeHover(el);
    };

    el.addEventListener('pointerenter', el.__hoverIn);
    el.addEventListener('pointerleave', el.__hoverOut);
  }

  function checkHoverOnReveal(el) {
    if (!el) return;

    var checks = 0;
    var maxChecks = 10;
    var applied = false;

    function poll() {
      checks++;
      if (applied) return;

      if (el.style.pointerEvents !== 'none' && isMouseOver(el)) {
        applied = true;
        applyHover(el);

        try {
          el.dispatchEvent(new PointerEvent('pointerenter', {
            bubbles: true,
            clientX: mouseX,
            clientY: mouseY
          }));
        } catch (e) {}

        log('Hover applied on reveal, check #' + checks);
        return;
      }

      if (checks < maxChecks) setTimeout(poll, 50);
    }

    poll();
  }

  function clearHoverState(el) {
    if (!el) return;
    if (typeof gsap !== 'undefined') gsap.set(el, { scale: 1 });
    else el.style.transform = 'scale(1)';
    el.style.filter = '';
  }

  /*** Layer utilities ***/
  function getLayerRoot(el) {
    var n = el;
    while (n && n !== document.body) {
      if (n.classList && n.classList.contains('slide-layer')) return n;
      n = n.parentNode;
    }
    return document.querySelector('.slide-layer.shown') || null;
  }

  function isLayerShown(layerEl) {
    if (!layerEl) return true;
    var ah = layerEl.getAttribute && layerEl.getAttribute('aria-hidden');
    return (ah !== 'true') || layerEl.classList.contains('shown');
  }

  /*** Elements ***/
  var els = {
    option1: { rect: null, thumb: null },
    option2: { rect: null, thumb: null },
    option3: { rect: null, thumb: null },
    option4: { rect: null, thumb: null }
  };

  function capture() {
    els.option1.rect  = getEl(IDS.option1.rect, 'option1rectangle');
    els.option1.thumb = getEl(IDS.option1.thumb, 'option1thumb');

    els.option2.rect  = getEl(IDS.option2.rect, 'option2rectangle');
    els.option2.thumb = getEl(IDS.option2.thumb, 'option2thumb');

    els.option3.rect  = getEl(IDS.option3.rect, 'option3rectangle');
    els.option3.thumb = getEl(IDS.option3.thumb, 'option3thumb');

    els.option4.rect  = getEl(IDS.option4.rect, 'option4rectangle');
    els.option4.thumb = getEl(IDS.option4.thumb, 'option4thumb');
  }

  /*** Hide later options immediately ***/
  function preHideLaterOptions() {
    ['option2', 'option3', 'option4'].forEach(function (k) {
      if (els[k].rect) {
        els[k].rect.style.visibility = 'hidden';
        setOffscreenLeft(els[k].rect);
      }
      if (els[k].thumb) {
        els[k].thumb.style.visibility = 'hidden';
        setOpacity(els[k].thumb, 0);
        enable(els[k].thumb, false);
        clearHoverState(els[k].thumb);
      }
    });

    if (els.option1.rect) {
      els.option1.rect.style.visibility = 'visible';
      setHome(els.option1.rect, 'option1');
    }
    if (els.option1.thumb) {
      els.option1.thumb.style.visibility = 'visible';
      setOpacity(els.option1.thumb, 1);
      enable(els.option1.thumb, true);
    }
  }

  /*** Initial state ***/
  function initState() {
    setHome(els.option1.rect, 'option1');
    if (els.option1.rect) els.option1.rect.style.visibility = 'visible';
    setOpacity(els.option1.thumb, 1);
    enable(els.option1.thumb, true);
    clearHoverState(els.option1.thumb);

    ['option2', 'option3', 'option4'].forEach(function (k) {
      if (els[k].rect) els[k].rect.style.visibility = 'hidden';
      setOffscreenLeft(els[k].rect);
      setOpacity(els[k].thumb, 0);
      enable(els[k].thumb, false);
      clearHoverState(els[k].thumb);
    });

    checkHoverOnReveal(els.option1.thumb);
  }

  function bindStep(fromKey, toKey) {
    var fromThumb = els[fromKey] && els[fromKey].thumb;
    var toRect = toKey && els[toKey] && els[toKey].rect;
    var toThumb = toKey && els[toKey] && els[toKey].thumb;

    if (!fromThumb) return;

    fromThumb.__boundPD = function () {
      log('Clicked:', fromKey, '→', toKey);

      enable(fromThumb, false);
      clearHoverState(fromThumb);

      fadeTo(fromThumb, 0, function () {
        if (!toKey) return;

        if (toRect) {
          toRect.style.visibility = 'visible';
          slideHome(toRect, toKey, function () {
            fadeTo(toThumb, 1, function () {
              enable(toThumb, true);
              checkHoverOnReveal(toThumb);
            });
          });
        } else {
          log('Missing rect for', toKey);
        }
      });
    };

    fromThumb.addEventListener('pointerdown', fromThumb.__boundPD);
  }

  /*** Wire interactions ***/
  function wire() {
    OPTION_KEYS.forEach(function (k) {
      var t = els[k].thumb;
      var r = els[k].rect;
      if (!t && !r) return;

      if (t && t.__boundPD) {
        t.removeEventListener('pointerdown', t.__boundPD);
      }

      primeForPerf(t, false);
      primeForPerf(r, true);
      setupHoverEffects(t);
    });

    bindStep('option1', 'option2');
    bindStep('option2', 'option3');
    bindStep('option3', 'option4');
    bindStep('option4', null);
  }

  /*** Observe for revisits ***/
  function observeLayer(layerRoot) {
    if (!layerRoot) return;
    initState();

    var attrObs = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (
          m.type === 'attributes' &&
          (m.attributeName === 'class' || m.attributeName === 'aria-hidden' || m.attributeName === 'style')
        ) {
          if (isLayerShown(layerRoot)) initState();
        }
      }
    });

    try {
      attrObs.observe(layerRoot, {
        attributes: true,
        attributeFilter: ['class', 'aria-hidden', 'style']
      });
    } catch (_) {}

    var docObs = new MutationObserver(function () {
      var replaced = false;

      OPTION_KEYS.forEach(function (k) {
        var curT = document.querySelector('[data-model-id="' + IDS[k].thumb + '"]');
        var curR = document.querySelector('[data-model-id="' + IDS[k].rect + '"]');

        if (curT && curT !== els[k].thumb) {
          els[k].thumb = curT;
          replaced = true;
        }
        if (curR && curR !== els[k].rect) {
          els[k].rect = curR;
          replaced = true;
        }
      });

      if (replaced) {
        homeCaptured = false;
        captureHomePositions();
        preHideLaterOptions();
        wire();
        if (isLayerShown(layerRoot)) initState();
      }
    });

    try {
      docObs.observe(document.body, { childList: true, subtree: true });
    } catch (_) {}
  }

  /*** Bootstrap ***/
  (function boot(waitMs, intervalMs) {
    var deadline = Date.now() + (waitMs || 8000);
    var iv = intervalMs || 80;

    (function tick() {
      capture();

      if (els.option1.rect && els.option1.thumb) {
        captureHomePositions();
        preHideLaterOptions();

        OPTION_KEYS.forEach(function (k) {
          primeForPerf(els[k].thumb, false);
          primeForPerf(els[k].rect, true);
        });

        initState();
        wire();

        var layerRoot = getLayerRoot(els.option1.rect || els.option1.thumb);
        observeLayer(layerRoot);

        window.addEventListener('pageshow', function () {
          capture();
          homeCaptured = false;
          captureHomePositions();
          preHideLaterOptions();
          wire();
          if (isLayerShown(layerRoot)) initState();
        });

        return;
      }

      if (Date.now() > deadline) {
        log('Timeout waiting for option1 rect/thumb');
        return;
      }

      setTimeout(tick, iv);
    })();
  })(8000, 80);
})();
}

window.Script8 = function()
{
  (function () {
  'use strict';

  /*** CONFIG ***/
  var IDS = {
    option1: { rect: '6DlnfrgawPK', thumb: '6oQq8BAIl4n' },
    option2: { rect: '5fpqvSBVlyh', thumb: '6DqwJ4cZoqi' },
   // option3: { rect: '5mCkPM27azz', thumb: '6g2dwEtDyZ7' },
   //option4: { rect: '6iRGmzXll2V', thumb: '667QNcExZgU' }
  };

  var DUR = 0.45;
  var EASE = 'power2.out';
  var DEBUG = true;

  var HOVER = {
    scale: 1.12,
    glowColor: 'rgba(100, 180, 255, 0.8)',
    glowSize: 20,
    transitionSpeed: 0.2
  };

  var OPTION_KEYS = ['option1', 'option2', 'option3', 'option4'];

  var mouseX = -9999, mouseY = -9999;
  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function log() {
    if (DEBUG && window.console) {
      console.log.apply(console, ['[ThumbStepper]'].concat([].slice.call(arguments)));
    }
  }

  /*** Element getters ***/
  function getEl(id, fallbackVarName) {
    try {
      if (
        typeof window[fallbackVarName] !== 'undefined' &&
        window[fallbackVarName] &&
        window[fallbackVarName].nodeType === 1
      ) return window[fallbackVarName];
    } catch (_) {}
    return document.querySelector('[data-model-id="' + id + '"]');
  }

  /*** Check if mouse is over element ***/
  function isMouseOver(el, padding) {
    if (!el || mouseX === -9999) return false;
    var p = padding || 5;
    var rect = el.getBoundingClientRect();
    return mouseX >= (rect.left - p) &&
           mouseX <= (rect.right + p) &&
           mouseY >= (rect.top - p) &&
           mouseY <= (rect.bottom + p);
  }

  /*** Store original/home transform values for each rect ***/
  var HOME = {
    option1: { x: 0, xPercent: 0 },
    option2: { x: 0, xPercent: 0 },
    option3: { x: 0, xPercent: 0 },
    option4: { x: 0, xPercent: 0 }
  };

  var homeCaptured = false;

  function captureHomePositions() {
    if (homeCaptured || typeof gsap === 'undefined') return;

    OPTION_KEYS.forEach(function (k) {
      var r = els[k].rect;
      if (!r) return;

      HOME[k].x = gsap.getProperty(r, 'x') || 0;
      HOME[k].xPercent = gsap.getProperty(r, 'xPercent') || 0;
    });

    homeCaptured = true;
    log('Captured HOME positions:', HOME);
  }

  /*** Motion helpers ***/
  function setOffscreenLeft(el) {
    if (!el) return;
    if (typeof gsap !== 'undefined') {
      gsap.set(el, { xPercent: -101 });
    } else {
      el.style.transform = 'translateX(-101%)';
    }
  }

  function setHome(el, key) {
    if (!el) return;
    if (typeof gsap !== 'undefined') {
      gsap.set(el, {
        x: HOME[key].x,
        xPercent: HOME[key].xPercent
      });
    } else {
      el.style.transform = 'translateX(0%)';
    }
  }

  function slideHome(el, key, done) {
    if (!el) {
      if (done) done();
      return;
    }

    el.style.visibility = 'visible';

    if (typeof gsap !== 'undefined') {
      gsap.to(el, {
        x: HOME[key].x,
        xPercent: HOME[key].xPercent,
        duration: DUR,
        ease: EASE,
        onComplete: done || null
      });
    } else {
      el.style.transition = 'transform ' + DUR + 's ease';
      el.style.transform = 'translateX(0%)';
      if (done) setTimeout(done, (DUR * 1000) + 30);
    }
  }

  function setOpacity(el, o) {
    if (!el) return;
    if (typeof gsap !== 'undefined') gsap.set(el, { opacity: o });
    else el.style.opacity = String(o);
    el.style.visibility = (o <= 0) ? 'hidden' : 'visible';
  }

  function fadeTo(el, o, done) {
    if (!el) {
      if (done) done();
      return;
    }

    if (o > 0) el.style.visibility = 'visible';

    if (typeof gsap !== 'undefined') {
      gsap.to(el, {
        opacity: o,
        duration: DUR,
        ease: EASE,
        onComplete: function () {
          if (o <= 0) el.style.visibility = 'hidden';
          if (done) done();
        }
      });
    } else {
      el.style.transition = 'opacity ' + DUR + 's ease';
      el.style.opacity = String(o);
      setTimeout(function () {
        if (o <= 0) el.style.visibility = 'hidden';
        if (done) done();
      }, (DUR * 1000) + 30);
    }
  }

  function enable(el, on) {
    if (el) el.style.pointerEvents = on ? '' : 'none';
  }

  function primeForPerf(el, isRect) {
    if (el) {
      el.style.willChange = isRect ? 'transform' : 'opacity, transform, filter';
      el.style.touchAction = 'manipulation';
    }
  }

  /*** Hover ***/
  function applyHover(el) {
    if (!el) return;
    if (typeof gsap !== 'undefined') {
      gsap.to(el, {
        scale: HOVER.scale,
        duration: HOVER.transitionSpeed,
        ease: 'power2.out'
      });
    } else {
      el.style.transform = 'scale(' + HOVER.scale + ')';
    }
    el.style.filter = 'drop-shadow(0 0 ' + HOVER.glowSize + 'px ' + HOVER.glowColor + ')';
  }

  function removeHover(el) {
    if (!el) return;
    if (typeof gsap !== 'undefined') {
      gsap.to(el, {
        scale: 1,
        duration: HOVER.transitionSpeed,
        ease: 'power2.out'
      });
    } else {
      el.style.transform = 'scale(1)';
    }
    el.style.filter = '';
  }

  function setupHoverEffects(el) {
    if (!el) return;

    el.style.cursor = 'pointer';
    el.style.transition = 'filter ' + HOVER.transitionSpeed + 's ease-out';

    if (el.__hoverIn) el.removeEventListener('pointerenter', el.__hoverIn);
    if (el.__hoverOut) el.removeEventListener('pointerleave', el.__hoverOut);

    el.__hoverIn = function () {
      if (el.style.pointerEvents === 'none') return;
      applyHover(el);
    };

    el.__hoverOut = function () {
      removeHover(el);
    };

    el.addEventListener('pointerenter', el.__hoverIn);
    el.addEventListener('pointerleave', el.__hoverOut);
  }

  function checkHoverOnReveal(el) {
    if (!el) return;

    var checks = 0;
    var maxChecks = 10;
    var applied = false;

    function poll() {
      checks++;
      if (applied) return;

      if (el.style.pointerEvents !== 'none' && isMouseOver(el)) {
        applied = true;
        applyHover(el);

        try {
          el.dispatchEvent(new PointerEvent('pointerenter', {
            bubbles: true,
            clientX: mouseX,
            clientY: mouseY
          }));
        } catch (e) {}

        log('Hover applied on reveal, check #' + checks);
        return;
      }

      if (checks < maxChecks) setTimeout(poll, 50);
    }

    poll();
  }

  function clearHoverState(el) {
    if (!el) return;
    if (typeof gsap !== 'undefined') gsap.set(el, { scale: 1 });
    else el.style.transform = 'scale(1)';
    el.style.filter = '';
  }

  /*** Layer utilities ***/
  function getLayerRoot(el) {
    var n = el;
    while (n && n !== document.body) {
      if (n.classList && n.classList.contains('slide-layer')) return n;
      n = n.parentNode;
    }
    return document.querySelector('.slide-layer.shown') || null;
  }

  function isLayerShown(layerEl) {
    if (!layerEl) return true;
    var ah = layerEl.getAttribute && layerEl.getAttribute('aria-hidden');
    return (ah !== 'true') || layerEl.classList.contains('shown');
  }

  /*** Elements ***/
  var els = {
    option1: { rect: null, thumb: null },
    option2: { rect: null, thumb: null },
    option3: { rect: null, thumb: null },
    option4: { rect: null, thumb: null }
  };

  function capture() {
    els.option1.rect  = getEl(IDS.option1.rect, 'option1rectangle');
    els.option1.thumb = getEl(IDS.option1.thumb, 'option1thumb');

    els.option2.rect  = getEl(IDS.option2.rect, 'option2rectangle');
    els.option2.thumb = getEl(IDS.option2.thumb, 'option2thumb');

    els.option3.rect  = getEl(IDS.option3.rect, 'option3rectangle');
    els.option3.thumb = getEl(IDS.option3.thumb, 'option3thumb');

    els.option4.rect  = getEl(IDS.option4.rect, 'option4rectangle');
    els.option4.thumb = getEl(IDS.option4.thumb, 'option4thumb');
  }

  /*** Hide later options immediately ***/
  function preHideLaterOptions() {
    ['option2', 'option3', 'option4'].forEach(function (k) {
      if (els[k].rect) {
        els[k].rect.style.visibility = 'hidden';
        setOffscreenLeft(els[k].rect);
      }
      if (els[k].thumb) {
        els[k].thumb.style.visibility = 'hidden';
        setOpacity(els[k].thumb, 0);
        enable(els[k].thumb, false);
        clearHoverState(els[k].thumb);
      }
    });

    if (els.option1.rect) {
      els.option1.rect.style.visibility = 'visible';
      setHome(els.option1.rect, 'option1');
    }
    if (els.option1.thumb) {
      els.option1.thumb.style.visibility = 'visible';
      setOpacity(els.option1.thumb, 1);
      enable(els.option1.thumb, true);
    }
  }

  /*** Initial state ***/
  function initState() {
    setHome(els.option1.rect, 'option1');
    if (els.option1.rect) els.option1.rect.style.visibility = 'visible';
    setOpacity(els.option1.thumb, 1);
    enable(els.option1.thumb, true);
    clearHoverState(els.option1.thumb);

    ['option2', 'option3', 'option4'].forEach(function (k) {
      if (els[k].rect) els[k].rect.style.visibility = 'hidden';
      setOffscreenLeft(els[k].rect);
      setOpacity(els[k].thumb, 0);
      enable(els[k].thumb, false);
      clearHoverState(els[k].thumb);
    });

    checkHoverOnReveal(els.option1.thumb);
  }

  function bindStep(fromKey, toKey) {
    var fromThumb = els[fromKey] && els[fromKey].thumb;
    var toRect = toKey && els[toKey] && els[toKey].rect;
    var toThumb = toKey && els[toKey] && els[toKey].thumb;

    if (!fromThumb) return;

    fromThumb.__boundPD = function () {
      log('Clicked:', fromKey, '→', toKey);

      enable(fromThumb, false);
      clearHoverState(fromThumb);

      fadeTo(fromThumb, 0, function () {
        if (!toKey) return;

        if (toRect) {
          toRect.style.visibility = 'visible';
          slideHome(toRect, toKey, function () {
            fadeTo(toThumb, 1, function () {
              enable(toThumb, true);
              checkHoverOnReveal(toThumb);
            });
          });
        } else {
          log('Missing rect for', toKey);
        }
      });
    };

    fromThumb.addEventListener('pointerdown', fromThumb.__boundPD);
  }

  /*** Wire interactions ***/
  function wire() {
    OPTION_KEYS.forEach(function (k) {
      var t = els[k].thumb;
      var r = els[k].rect;
      if (!t && !r) return;

      if (t && t.__boundPD) {
        t.removeEventListener('pointerdown', t.__boundPD);
      }

      primeForPerf(t, false);
      primeForPerf(r, true);
      setupHoverEffects(t);
    });

    bindStep('option1', 'option2');
    bindStep('option2', 'option3');
    bindStep('option3', 'option4');
    bindStep('option4', null);
  }

  /*** Observe for revisits ***/
  function observeLayer(layerRoot) {
    if (!layerRoot) return;
    initState();

    var attrObs = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (
          m.type === 'attributes' &&
          (m.attributeName === 'class' || m.attributeName === 'aria-hidden' || m.attributeName === 'style')
        ) {
          if (isLayerShown(layerRoot)) initState();
        }
      }
    });

    try {
      attrObs.observe(layerRoot, {
        attributes: true,
        attributeFilter: ['class', 'aria-hidden', 'style']
      });
    } catch (_) {}

    var docObs = new MutationObserver(function () {
      var replaced = false;

      OPTION_KEYS.forEach(function (k) {
        var curT = document.querySelector('[data-model-id="' + IDS[k].thumb + '"]');
        var curR = document.querySelector('[data-model-id="' + IDS[k].rect + '"]');

        if (curT && curT !== els[k].thumb) {
          els[k].thumb = curT;
          replaced = true;
        }
        if (curR && curR !== els[k].rect) {
          els[k].rect = curR;
          replaced = true;
        }
      });

      if (replaced) {
        homeCaptured = false;
        captureHomePositions();
        preHideLaterOptions();
        wire();
        if (isLayerShown(layerRoot)) initState();
      }
    });

    try {
      docObs.observe(document.body, { childList: true, subtree: true });
    } catch (_) {}
  }

  /*** Bootstrap ***/
  (function boot(waitMs, intervalMs) {
    var deadline = Date.now() + (waitMs || 8000);
    var iv = intervalMs || 80;

    (function tick() {
      capture();

      if (els.option1.rect && els.option1.thumb) {
        captureHomePositions();
        preHideLaterOptions();

        OPTION_KEYS.forEach(function (k) {
          primeForPerf(els[k].thumb, false);
          primeForPerf(els[k].rect, true);
        });

        initState();
        wire();

        var layerRoot = getLayerRoot(els.option1.rect || els.option1.thumb);
        observeLayer(layerRoot);

        window.addEventListener('pageshow', function () {
          capture();
          homeCaptured = false;
          captureHomePositions();
          preHideLaterOptions();
          wire();
          if (isLayerShown(layerRoot)) initState();
        });

        return;
      }

      if (Date.now() > deadline) {
        log('Timeout waiting for option1 rect/thumb');
        return;
      }

      setTimeout(tick, iv);
    })();
  })(8000, 80);
})();
}

window.Script9 = function()
{
  var p = GetPlayer();
var total = 20;

// Build ordered list
var arr = [];
for (var i = 1; i <= total; i++) arr.push(i);

// Fisher–Yates shuffle
for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

// Export back to Storyline variables RandomList1..20
for (var k = 0; k < arr.length; k++) {
    p.SetVar("RandomList" + (k+1), arr[k]);
}

// Reset counters
p.SetVar("RandomIndex", 0);
p.SetVar("TrialNumber", 0);
p.SetVar("HumanScore", 0);
p.SetVar("AIScore", 0);
p.SetVar("DelegationChoice", "");
p.SetVar("LogCSV", "");

}

window.Script10 = function()
{
  window.InitAISortGame();
window.ResetGame();
}

window.Script11 = function()
{
  (function () {
  var player = GetPlayer();

  window.InitAISortGame = function () {
    if (!window.aiSortGame) {
      window.aiSortGame = {
        fullItemPool: [
          { id: 1, category: "Fire Hazard" },
          { id: 2, category: "Fire Hazard" },
          { id: 3, category: "Fire Hazard" },
          { id: 4, category: "Fire Hazard" },
          { id: 5, category: "Fire Hazard" },
          { id: 6, category: "Security Breach" },
          { id: 7, category: "Security Breach" },
          { id: 8, category: "Security Breach" },
          { id: 9, category: "Safe" },
          { id: 10, category: "Security Breach" },
          { id: 11, category: "Medical Emergency" },
          { id: 12, category: "Medical Emergency" },
          { id: 13, category: "Medical Emergency" },
          { id: 14, category: "Medical Emergency" },
          { id: 15, category: "Medical Emergency" },
          { id: 16, category: "Safe" },
          { id: 17, category: "Safe" },
          { id: 18, category: "Safe" },
          { id: 19, category: "Safe" },
          { id: 20, category: "Safe" },
          { id: 21, category: "Security Breach" },
          { id: 22, category: "Fire Hazard" },
          { id: 23, category: "Fire Hazard" },
          { id: 24, category: "Fire Hazard" },
          { id: 25, category: "Fire Hazard" },
          { id: 26, category: "Fire Hazard" },
          { id: 27, category: "Security Breach" },
          { id: 28, category: "Security Breach" },
          { id: 29, category: "Security Breach" },
          { id: 30, category: "Security Breach" },
          { id: 31, category: "Medical Emergency" },
          { id: 32, category: "Medical Emergency" },
          { id: 33, category: "Medical Emergency" },
          { id: 34, category: "Medical Emergency" },
          { id: 35, category: "Medical Emergency" },
          { id: 36, category: "Safe" },
          { id: 37, category: "Safe" },
          { id: 38, category: "Safe" },
          { id: 39, category: "Safe" },
          { id: 40, category: "Safe" },
          { id: 41, category: "Fire Hazard" },
          { id: 42, category: "Fire Hazard" },
          { id: 43, category: "Fire Hazard" },
          { id: 44, category: "Fire Hazard" },
          { id: 45, category: "Fire Hazard" },
          { id: 46, category: "Fire Hazard" },
          { id: 47, category: "Medical Emergency" },
          { id: 48, category: "Medical Emergency" },
          { id: 49, category: "Medical Emergency" },
          { id: 50, category: "Medical Emergency" },
          { id: 51, category: "Medical Emergency" },
          { id: 52, category: "Safe" },
          { id: 53, category: "Safe" },
          { id: 54, category: "Safe" },
          { id: 55, category: "Safe" },
          { id: 56, category: "Safe" },
          { id: 57, category: "Safe" },
          { id: 58, category: "Security Breach" },
          { id: 59, category: "Security Breach" },
          { id: 60, category: "Security Breach" },
          { id: 61, category: "Security Breach" },
          { id: 62, category: "Security Breach" },
          { id: 63, category: "Security Breach" },
          { id: 64, category: "Security Breach" }
        ],
        sessionItems: [],
        currentIndex: 0,
        aiAccuracy: 0.70,
        isProcessing: false,
        answerTimer: null,
        nextTimer: null,
        hasStarted: false
      };
    }
  };

  window.ShuffleArray = function (array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  };

  window.BuildSessionItems = function () {
    var game = window.aiSortGame;
    if (!game) return;

    var shuffledPool = game.fullItemPool.slice();
    window.ShuffleArray(shuffledPool);
    game.sessionItems = shuffledPool.slice(0, Math.min(20, shuffledPool.length));

    for (var i = 0; i < game.sessionItems.length; i++) {
      game.sessionItems[i].askLearner = false;
    }
  };

  window.MarkHelpItems = function () {
    var game = window.aiSortGame;
    if (!game || !game.sessionItems || game.sessionItems.length === 0) return;

    var helpCount = Math.min(6, game.sessionItems.length);
    var chosenIndices = [];

    while (chosenIndices.length < helpCount) {
      var idx = Math.floor(Math.random() * game.sessionItems.length);
      if (chosenIndices.indexOf(idx) === -1) {
        chosenIndices.push(idx);
        game.sessionItems[idx].askLearner = true;
      }
    }
  };

  window.GetWrongCategory = function (correctCategory) {
    var categories = ["Fire Hazard", "Security Breach", "Medical Emergency", "Safe"];
    var wrongChoices = [];

    for (var i = 0; i < categories.length; i++) {
      if (categories[i] !== correctCategory) {
        wrongChoices.push(categories[i]);
      }
    }

    return wrongChoices[Math.floor(Math.random() * wrongChoices.length)];
  };

  window.ClearGameTimers = function () {
    var game = window.aiSortGame;
    if (!game) return;

    if (game.answerTimer) {
      clearTimeout(game.answerTimer);
      game.answerTimer = null;
    }

    if (game.nextTimer) {
      clearTimeout(game.nextTimer);
      game.nextTimer = null;
    }
  };

  window.ClearDisplayedFeedback = function () {
    player.SetVar("ShowHelpMe", false);
    player.SetVar("LearnerAnswerInput", "");
    player.SetVar("AIGuess", "");
    player.SetVar("AIStatusMessage", "");
    player.SetVar("HumanStatusMessage", "");
    player.SetVar("ResultMessage", "");
    player.SetVar("ClearFeedbackText", false);
    player.SetVar("ClearFeedbackText", true);
  };

  window.UpdateProgress = function () {
    var game = window.aiSortGame;
    var percent = 0;
    var trialNumber = 0;

    if (game && game.sessionItems.length > 0 && game.currentIndex < game.sessionItems.length) {
      trialNumber = game.currentIndex + 1;
      percent = Math.ceil((trialNumber / game.sessionItems.length) * 100);
      if (percent > 100) percent = 100;
    }

    player.SetVar("TrialNumber", trialNumber);
    player.SetVar("ProgressPercent", percent);
  };

  window.ResetGame = function () {
    var game = window.aiSortGame;
    if (!game) return;

    window.ClearGameTimers();

    game.currentIndex = 0;
    game.isProcessing = false;
    game.hasStarted = false;
    game.sessionItems = [];

    player.SetVar("AIScore", 0);
    player.SetVar("AICorrect", 0);
    player.SetVar("AIWrong", 0);
    player.SetVar("LearnerHelp", 0);
    player.SetVar("LearnerScore", 0);
    player.SetVar("CurrentImage", 0);
    player.SetVar("CurrentCorrectCategory", "");
    player.SetVar("AIGuess", "");
    player.SetVar("WaitingForLearner", false);
    player.SetVar("ShowHelpMe", false);
    player.SetVar("LearnerAnswerInput", "");
    player.SetVar("StatusMessage", "AI is ready to begin.");
    player.SetVar("AIStatusMessage", "");
    player.SetVar("HumanStatusMessage", "");
    player.SetVar("ResultMessage", "");
    player.SetVar("SessionComplete", false);
    player.SetVar("ProgressPercent", 0);
    player.SetVar("TrialNumber", 0);
    player.SetVar("ClearFeedbackText", false);
  };

  window.ProcessNextImage = function () {
    var game = window.aiSortGame;

    if (!game) {
      player.SetVar("StatusMessage", "Game not initialized.");
      player.SetVar("AIStatusMessage", "Game not initialized.");
      player.SetVar("HumanStatusMessage", "Please restart the activity.");
      player.SetVar("ShowHelpMe", false);
      return;
    }

    if (game.isProcessing) return;

    if (game.currentIndex >= game.sessionItems.length) {
      window.EndSession();
      return;
    }

    window.ClearGameTimers();
    game.isProcessing = true;

    var item = game.sessionItems[game.currentIndex];

    window.ClearDisplayedFeedback();

    player.SetVar("CurrentImage", item.id);
    player.SetVar("CurrentCorrectCategory", item.category);

    window.UpdateProgress();

    if (item.askLearner) {
      player.SetVar("WaitingForLearner", true);
      player.SetVar("ShowHelpMe", true);
      player.SetVar("LearnerHelp", player.GetVar("LearnerHelp") + 1);
      player.SetVar("AIGuess", "I need help");
      player.SetVar("StatusMessage", "AI needs help.");
      player.SetVar("AIStatusMessage", "Choose a category.");
      player.SetVar("HumanStatusMessage", "Choose a category.");
      game.isProcessing = false;
      return;
    }

    player.SetVar("WaitingForLearner", false);
    player.SetVar("ShowHelpMe", false);
    player.SetVar("StatusMessage", "AI is classifying the image.");
    player.SetVar("AIStatusMessage", "");
    player.SetVar("HumanStatusMessage", "");

    game.answerTimer = setTimeout(function () {
      var game = window.aiSortGame;
      if (!game || game.currentIndex >= game.sessionItems.length) return;

      var currentItem = game.sessionItems[game.currentIndex];
      var guessedCategory = "";
      var isCorrect = Math.random() < game.aiAccuracy;
      var feedbackMessage = "";

      if (isCorrect) {
        guessedCategory = currentItem.category;
        player.SetVar("AIScore", player.GetVar("AIScore") + 1);
        player.SetVar("AICorrect", player.GetVar("AICorrect") + 1);
        player.SetVar("StatusMessage", "AI made a correct classification.");
        feedbackMessage = "Correct";
      } else {
        guessedCategory = window.GetWrongCategory(currentItem.category);
        player.SetVar("AIWrong", player.GetVar("AIWrong") + 1);
        player.SetVar("StatusMessage", "AI made an incorrect classification.");
        feedbackMessage = "The correct is: <b>" + currentItem.category + "</b>";
      }

      player.SetVar("AIGuess", guessedCategory);
      player.SetVar("AIStatusMessage", feedbackMessage);
      player.SetVar("HumanStatusMessage", feedbackMessage);

      game.currentIndex += 1;
      game.answerTimer = null;

      game.nextTimer = setTimeout(function () {
        var game = window.aiSortGame;
        if (game) {
          game.nextTimer = null;
          game.isProcessing = false;
        }
        window.ProcessNextImage();
      }, 3000);
    }, 2500);
  };

  window.SubmitLearnerAnswer = function (selectedAnswer) {
    var game = window.aiSortGame;

    if (!game) {
      player.SetVar("StatusMessage", "Game not initialized.");
      player.SetVar("AIStatusMessage", "Game not initialized.");
      player.SetVar("HumanStatusMessage", "Please restart the activity.");
      player.SetVar("ShowHelpMe", false);
      return;
    }

    if (!player.GetVar("WaitingForLearner")) return;

    window.ClearGameTimers();

    var currentItem = game.sessionItems[game.currentIndex];
    var answer = String(selectedAnswer || "").trim();
    var correct = currentItem ? String(currentItem.category || "").trim() : "";
    var feedbackMessage = "";

    player.SetVar("LearnerAnswerInput", answer);
    player.SetVar("AIGuess", answer);
    player.SetVar("WaitingForLearner", false);
    player.SetVar("ShowHelpMe", false);

    if (answer === "") {
      player.SetVar("StatusMessage", "Choose a category before submitting.");
      player.SetVar("AIStatusMessage", "Choose a category before submitting.");
      player.SetVar("HumanStatusMessage", "Choose a category before submitting.");
      game.isProcessing = false;
      return;
    }

    if (answer.toUpperCase() === correct.toUpperCase()) {
      player.SetVar("AIScore", player.GetVar("AIScore") + 1);
      player.SetVar("LearnerScore", player.GetVar("LearnerScore") + 1);
      player.SetVar("StatusMessage", "The image was classified correctly.");
      feedbackMessage = "Correct";
    } else {
      player.SetVar("AIWrong", player.GetVar("AIWrong") + 1);
      player.SetVar("StatusMessage", "The image was classified incorrectly.");
      feedbackMessage = "The correct is: <b>" + correct + "</b>";
    }

    player.SetVar("AIStatusMessage", feedbackMessage);
    player.SetVar("HumanStatusMessage", feedbackMessage);

    game.currentIndex += 1;

    game.nextTimer = setTimeout(function () {
      var game = window.aiSortGame;
      if (game) {
        game.nextTimer = null;
        game.isProcessing = false;
      }
      window.ProcessNextImage();
    }, 2500);
  };

  window.EndSession = function () {
    var game = window.aiSortGame;
    if (!game) return;

    window.ClearGameTimers();
    game.isProcessing = false;
    game.hasStarted = false;

    player.SetVar("ShowHelpMe", false);
    player.SetVar("WaitingForLearner", false);
    player.SetVar("TrialNumber", game.sessionItems.length);
    player.SetVar("ProgressPercent", 100);

    var summary =
      "Score: " + player.GetVar("AIScore") +
      " | AI correct: " + player.GetVar("AICorrect") +
      " | AI wrong: " + player.GetVar("AIWrong") +
      " | Learner helped: " + player.GetVar("LearnerHelp") +
      " | Learner correct: " + player.GetVar("LearnerScore");

    player.SetVar("ResultMessage", summary);
    player.SetVar("StatusMessage", "All images complete.");
    player.SetVar("AIStatusMessage", "All images complete.");
    player.SetVar("HumanStatusMessage", "All images complete.");
    player.SetVar("SessionComplete", true);
  };

  window.StartGame = function () {
    var game = window.aiSortGame;
    if (!game || game.hasStarted) return;

    game.hasStarted = true;
    window.ClearGameTimers();
    window.BuildSessionItems();
    window.MarkHelpItems();
    game.currentIndex = 0;
    game.isProcessing = false;

    player.SetVar("AIScore", 0);
    player.SetVar("AICorrect", 0);
    player.SetVar("AIWrong", 0);
    player.SetVar("LearnerHelp", 0);
    player.SetVar("LearnerScore", 0);
    player.SetVar("CurrentImage", 0);
    player.SetVar("CurrentCorrectCategory", "");
    player.SetVar("AIGuess", "");
    player.SetVar("WaitingForLearner", false);
    player.SetVar("ShowHelpMe", false);
    player.SetVar("LearnerAnswerInput", "");
    player.SetVar("ResultMessage", "");
    player.SetVar("SessionComplete", false);
    player.SetVar("StatusMessage", "AI is classifying the image.");
    player.SetVar("AIStatusMessage", "");
    player.SetVar("HumanStatusMessage", "");
    player.SetVar("ProgressPercent", 0);
    player.SetVar("TrialNumber", 0);
    player.SetVar("ClearFeedbackText", false);

    setTimeout(function () {
      window.ProcessNextImage();
    }, 50);
  };

  window.InitAISortGame();
  window.ResetGame();
})();
}

window.Script12 = function()
{
  window.StartGame();
}

window.Script13 = function()
{
  window.SubmitLearnerAnswer("Safe");
}

window.Script14 = function()
{
  window.SubmitLearnerAnswer("Medical Emergency");
}

window.Script15 = function()
{
  window.SubmitLearnerAnswer("Security Breach");
}

window.Script16 = function()
{
  window.SubmitLearnerAnswer("Fire Hazard");
}

window.Script17 = function()
{
  var player = GetPlayer();
var score = player.GetVar("ScorePercent");
score = Math.ceil(score);
player.SetVar("ScorePercent", score);
}

window.Script18 = function()
{
  var p = GetPlayer();
var csv = p.GetVar("LogCSV");

// Create a downloadable file
var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
var url = URL.createObjectURL(blob);

// Create a link element
var link = document.createElement("a");
link.setAttribute("href", url);
link.setAttribute("download", "results_log.csv");
document.body.appendChild(link);
link.click();
document.body.removeChild(link);

}

window.Script19 = function()
{
  var p = GetPlayer();
var total = 20;

// Build ordered list
var arr = [];
for (var i = 1; i <= total; i++) arr.push(i);

// Fisher–Yates shuffle
for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

// Export back to Storyline variables RandomList1..20
for (var k = 0; k < arr.length; k++) {
    p.SetVar("RandomList" + (k+1), arr[k]);
}

// Reset counters
p.SetVar("RandomIndex", 0);
p.SetVar("TrialNumber", 0);
p.SetVar("HumanScore", 0);
p.SetVar("AIScore", 0);
p.SetVar("DelegationChoice", "");
p.SetVar("LogCSV", "");

}

window.Script20 = function()
{
  (function () {
  var player = GetPlayer();

  if (!window.AITrialEngine) {
    window.AITrialEngine = {
      started: false,
      currentIndex: 0,
      aiAccuracy: 0.7,
      answerTimer: null,
      nextTimer: null,

      allItems: [
        { id: 1, category: "Fire Hazard" },
        { id: 2, category: "Fire Hazard" },
        { id: 3, category: "Fire Hazard" },
        { id: 4, category: "Fire Hazard" },
        { id: 5, category: "Fire Hazard" },
        { id: 6, category: "Security Breach" },
        { id: 7, category: "Security Breach" },
        { id: 8, category: "Security Breach" },
        { id: 9, category: "Safe" },
        { id: 10, category: "Security Breach" },
        { id: 11, category: "Medical Emergency" },
        { id: 12, category: "Medical Emergency" },
        { id: 13, category: "Medical Emergency" },
        { id: 14, category: "Medical Emergency" },
        { id: 15, category: "Medical Emergency" },
        { id: 16, category: "Safe" },
        { id: 17, category: "Safe" },
        { id: 18, category: "Safe" },
        { id: 19, category: "Safe" },
        { id: 20, category: "Safe" },
        { id: 21, category: "Security Breach" },
        { id: 22, category: "Fire Hazard" },
        { id: 23, category: "Fire Hazard" },
        { id: 24, category: "Fire Hazard" },
        { id: 25, category: "Fire Hazard" },
        { id: 26, category: "Fire Hazard" },
        { id: 27, category: "Security Breach" },
        { id: 28, category: "Security Breach" },
        { id: 29, category: "Security Breach" },
        { id: 30, category: "Security Breach" },
        { id: 31, category: "Medical Emergency" },
        { id: 32, category: "Medical Emergency" },
        { id: 33, category: "Medical Emergency" },
        { id: 34, category: "Medical Emergency" },
        { id: 35, category: "Medical Emergency" },
        { id: 36, category: "Safe" },
        { id: 37, category: "Safe" },
        { id: 38, category: "Safe" },
        { id: 39, category: "Safe" },
        { id: 40, category: "Safe" },
        { id: 41, category: "Fire Hazard" },
        { id: 42, category: "Fire Hazard" },
        { id: 43, category: "Fire Hazard" },
        { id: 44, category: "Fire Hazard" },
        { id: 45, category: "Fire Hazard" },
        { id: 46, category: "Fire Hazard" },
        { id: 47, category: "Medical Emergency" },
        { id: 48, category: "Medical Emergency" },
        { id: 49, category: "Medical Emergency" },
        { id: 50, category: "Medical Emergency" },
        { id: 51, category: "Medical Emergency" },
        { id: 52, category: "Safe" },
        { id: 53, category: "Safe" },
        { id: 54, category: "Safe" },
        { id: 55, category: "Safe" },
        { id: 56, category: "Safe" },
        { id: 57, category: "Safe" },
        { id: 58, category: "Security Breach" },
        { id: 59, category: "Security Breach" },
        { id: 60, category: "Security Breach" },
        { id: 61, category: "Security Breach" },
        { id: 62, category: "Security Breach" },
        { id: 63, category: "Security Breach" },
        { id: 64, category: "Security Breach" }
      ],

      activeItems: [],

      shuffleArray: function (array) {
        for (var i = array.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = array[i];
          array[i] = array[j];
          array[j] = temp;
        }
      },

      clearTimers: function () {
        if (this.answerTimer) {
          clearTimeout(this.answerTimer);
          this.answerTimer = null;
        }
        if (this.nextTimer) {
          clearTimeout(this.nextTimer);
          this.nextTimer = null;
        }
      },

      buildSession: function () {
        var shuffled = this.allItems.slice();
        this.shuffleArray(shuffled);
        this.activeItems = shuffled.slice(0, 20);
      },

      resetSlide: function () {
        this.clearTimers();
        this.started = false;
        this.currentIndex = 0;
        this.activeItems = [];

        player.SetVar("ImgIndex", 0);
        player.SetVar("TrialNumber", 0);
        player.SetVar("ProgressPercent", 0);
        player.SetVar("TruthLabel", "");
        player.SetVar("AIGuess", "");
        player.SetVar("AIScore", 0);
        player.SetVar("AICorrect", 0);
        player.SetVar("AIWrong", 0);
        player.SetVar("SessionComplete", false);
        player.SetVar("StatusMessage", "Click Start to begin.");
        player.SetVar("AIStatusMessage", "AI is ready.");
        player.SetVar("ResultMessage", "");
      },

      updateProgress: function () {
        var total = this.activeItems.length;
        var trialNumber = this.currentIndex + 1;

        if (trialNumber < 1) trialNumber = 1;
        if (trialNumber > total) trialNumber = total;

        var percent = total ? Math.round((trialNumber / total) * 100) : 0;
        if (percent < 0) percent = 0;
        if (percent > 100) percent = 100;

        player.SetVar("TrialNumber", trialNumber);
        player.SetVar("ProgressPercent", percent);
      },

      loadCurrentItem: function () {
        if (this.currentIndex >= this.activeItems.length) {
          this.endSession();
          return;
        }

        var item = this.activeItems[this.currentIndex];

        player.SetVar("ImgIndex", item.id);
        player.SetVar("TruthLabel", item.category);
        player.SetVar("AIGuess", "");
        this.updateProgress();

        player.SetVar("StatusMessage", "AI is classifying the image.");
        player.SetVar("AIStatusMessage", "AI is classifying the image.");

        var self = this;
        this.answerTimer = setTimeout(function () {
          var isCorrect = Math.random() < self.aiAccuracy;
          var guess;

          if (isCorrect) {
            guess = item.category;
            player.SetVar("AIScore", player.GetVar("AIScore") + 1);
            player.SetVar("AICorrect", player.GetVar("AICorrect") + 1);
            //player.SetVar("StatusMessage", "AI made a correct classification.");
            player.SetVar("StatusMessage", "AI made a <b>correct</b> classification.");
            player.SetVar("AIStatusMessage", "AI classified the image correctly.");
          } else {
            guess = self.getWrongCategory(item.category);
            player.SetVar("AIWrong", player.GetVar("AIWrong") + 1);
            player.SetVar("StatusMessage", "The Correct answer is: " + item.category);
            player.SetVar("AIStatusMessage", "AI classified the image incorrectly.");
          }

          player.SetVar("AIGuess", guess);

          self.answerTimer = null;
          self.currentIndex += 1;

          self.nextTimer = setTimeout(function () {
            self.nextTimer = null;
            self.loadCurrentItem();
          }, 2500);
        }, 1800);
      },

      getWrongCategory: function (correctCategory) {
        var categories = ["Fire Hazard", "Security Breach", "Medical Emergency", "Safe"];
        var wrongChoices = [];

        for (var i = 0; i < categories.length; i++) {
          if (categories[i] !== correctCategory) {
            wrongChoices.push(categories[i]);
          }
        }

        return wrongChoices[Math.floor(Math.random() * wrongChoices.length)];
      },

      start: function () {
        if (this.started) return;

        this.started = true;
        this.currentIndex = 0;
        this.clearTimers();
        this.buildSession();

        player.SetVar("AIScore", 0);
        player.SetVar("AICorrect", 0);
        player.SetVar("AIWrong", 0);
        player.SetVar("SessionComplete", false);
        player.SetVar("ResultMessage", "");

        this.loadCurrentItem();
      },

      endSession: function () {
        this.clearTimers();
        this.started = false;

        player.SetVar("TrialNumber", this.activeItems.length);
        player.SetVar("ProgressPercent", 100);
        player.SetVar("SessionComplete", true);

        var summary =
          "Score: " + player.GetVar("AIScore") +
          " | AI correct: " + player.GetVar("AICorrect") +
          " | AI wrong: " + player.GetVar("AIWrong");

        player.SetVar("ResultMessage", summary);
        player.SetVar("StatusMessage", "All trials complete.");
        player.SetVar("AIStatusMessage", "Session complete.");
      }
    };
  }

  window.StopAITrialEngine = function () {
    if (!window.AITrialEngine) return;
    window.AITrialEngine.clearTimers();
    window.AITrialEngine.started = false;
  };

  window.AITrialEngine.resetSlide();
})();
}

window.Script21 = function()
{
  window.AITrialEngine.start();
}

window.Script22 = function()
{
  window.StopAITrialEngine();
}

window.Script23 = function()
{
  var p = GetPlayer();
var csv = p.GetVar("LogCSV");

// Create a downloadable file
var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
var url = URL.createObjectURL(blob);

// Create a link element
var link = document.createElement("a");
link.setAttribute("href", url);
link.setAttribute("download", "results_log.csv");
document.body.appendChild(link);
link.click();
document.body.removeChild(link);

}

window.Script24 = function()
{
  var p = GetPlayer();
var total = 20;

// Build ordered list
var arr = [];
for (var i = 1; i <= total; i++) arr.push(i);

// Fisher–Yates shuffle
for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

// Export back to Storyline variables RandomList1..20
for (var k = 0; k < arr.length; k++) {
    p.SetVar("RandomList" + (k+1), arr[k]);
}

// Reset counters
p.SetVar("RandomIndex", 0);
p.SetVar("TrialNumber", 0);
p.SetVar("HumanScore", 0);
p.SetVar("AIScore", 0);
p.SetVar("DelegationChoice", "");
p.SetVar("LogCSV", "");

}

window.Script25 = function()
{
  var p = GetPlayer();
var csv = p.GetVar("LogCSV");

// Create a downloadable file
var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
var url = URL.createObjectURL(blob);

// Create a link element
var link = document.createElement("a");
link.setAttribute("href", url);
link.setAttribute("download", "results_log.csv");
document.body.appendChild(link);
link.click();
document.body.removeChild(link);

}

window.Script26 = function()
{
  window.ResetHumanAloneGame();
}

window.Script27 = function()
{
  var player = GetPlayer();

if (!window.HumanAloneGame) {
  window.HumanAloneGame = {
    allItems: [
      { id: 1, category: "Fire Hazard" },
      { id: 2, category: "Fire Hazard" },
      { id: 3, category: "Fire Hazard" },
      { id: 4, category: "Fire Hazard" },
      { id: 5, category: "Fire Hazard" },
      { id: 6, category: "Security Breach" },
      { id: 7, category: "Security Breach" },
      { id: 8, category: "Security Breach" },
      { id: 9, category: "Safe" },
      { id: 10, category: "Security Breach" },
      { id: 11, category: "Medical Emergency" },
      { id: 12, category: "Medical Emergency" },
      { id: 13, category: "Medical Emergency" },
      { id: 14, category: "Medical Emergency" },
      { id: 15, category: "Medical Emergency" },
      { id: 16, category: "Safe" },
      { id: 17, category: "Safe" },
      { id: 18, category: "Safe" },
      { id: 19, category: "Safe" },
      { id: 20, category: "Safe" },
      { id: 21, category: "Security Breach" },
      { id: 22, category: "Fire Hazard" },
      { id: 23, category: "Fire Hazard" },
      { id: 24, category: "Fire Hazard" },
      { id: 25, category: "Fire Hazard" },
      { id: 26, category: "Fire Hazard" },
      { id: 27, category: "Security Breach" },
      { id: 28, category: "Security Breach" },
      { id: 29, category: "Security Breach" },
      { id: 30, category: "Security Breach" },
      { id: 31, category: "Medical Emergency" },
      { id: 32, category: "Medical Emergency" },
      { id: 33, category: "Medical Emergency" },
      { id: 34, category: "Medical Emergency" },
      { id: 35, category: "Medical Emergency" },
      { id: 36, category: "Safe" },
      { id: 37, category: "Safe" },
      { id: 38, category: "Safe" },
      { id: 39, category: "Safe" },
      { id: 40, category: "Safe" },
      { id: 41, category: "Fire Hazard" },
      { id: 42, category: "Fire Hazard" },
      { id: 43, category: "Fire Hazard" },
      { id: 44, category: "Fire Hazard" },
      { id: 45, category: "Fire Hazard" },
      { id: 46, category: "Fire Hazard" },
      { id: 47, category: "Medical Emergency" },
      { id: 48, category: "Medical Emergency" },
      { id: 49, category: "Medical Emergency" },
      { id: 50, category: "Medical Emergency" },
      { id: 51, category: "Medical Emergency" },
      { id: 52, category: "Safe" },
      { id: 53, category: "Safe" },
      { id: 54, category: "Safe" },
      { id: 55, category: "Safe" },
      { id: 56, category: "Safe" },
      { id: 57, category: "Safe" },
      { id: 58, category: "Security Breach" },
      { id: 59, category: "Security Breach" },
      { id: 60, category: "Security Breach" },
      { id: 61, category: "Security Breach" },
      { id: 62, category: "Security Breach" },
      { id: 63, category: "Security Breach" },
      { id: 64, category: "Security Breach" }
    ],
    activeItems: [],
    currentIndex: 0,
    hasStarted: false,
    awaitingAnswer: false,
    feedbackTimer: null,
    sessionId: 0
  };
}

window.ShuffleArray = function(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};

window.ClearHumanAloneTimer = function() {
  var game = window.HumanAloneGame;
  if (game && game.feedbackTimer) {
    clearTimeout(game.feedbackTimer);
    game.feedbackTimer = null;
  }
};

window.ResetHumanAloneGame = function() {
  var game = window.HumanAloneGame;

  window.ClearHumanAloneTimer();

  game.activeItems = [];
  game.currentIndex = 0;
  game.hasStarted = false;
  game.awaitingAnswer = false;
  game.sessionId += 1;

  player.SetVar("ImgIndex", 0);
  player.SetVar("TruthLabel", "");
  player.SetVar("LearnerAnswerInput", "");
  player.SetVar("HumanStatusMessage", "Waiting to begin.");
  player.SetVar("LearnerScore", 0);
  player.SetVar("TrialNumber", 0);
  player.SetVar("ProgressPercent", 0);
  player.SetVar("SessionComplete", false);
};

window.LoadCurrentHumanTrial = function() {
  var game = window.HumanAloneGame;

  if (game.currentIndex >= game.activeItems.length) {
    game.hasStarted = false;
    game.awaitingAnswer = false;
    player.SetVar("SessionComplete", true);
    player.SetVar("HumanStatusMessage", "All trials complete.");
    player.SetVar("TrialNumber", game.activeItems.length);
    player.SetVar("ProgressPercent", 100);
    return;
  }

  var item = game.activeItems[game.currentIndex];

  game.awaitingAnswer = true;

  player.SetVar("ImgIndex", item.id);
  player.SetVar("TruthLabel", item.category);
  player.SetVar("LearnerAnswerInput", "");
  player.SetVar("HumanStatusMessage", "Choose the correct category.");
  player.SetVar("TrialNumber", game.currentIndex + 1);
  player.SetVar("ProgressPercent", Math.round(((game.currentIndex + 1) / game.activeItems.length) * 100));
};

window.StartHumanAloneGame = function() {
  var game = window.HumanAloneGame;
  if (!game || game.hasStarted) return;

  window.ClearHumanAloneTimer();

  game.hasStarted = true;
  game.currentIndex = 0;
  game.awaitingAnswer = false;
  game.sessionId += 1;

  var shuffled = game.allItems.slice();
  window.ShuffleArray(shuffled);
  game.activeItems = shuffled.slice(0, 20);

  player.SetVar("LearnerScore", 0);
  player.SetVar("SessionComplete", false);

  window.LoadCurrentHumanTrial();
};

window.SubmitHumanAloneAnswer = function(answer) {
  var game = window.HumanAloneGame;
  if (!game || !game.hasStarted) return;
  if (!game.awaitingAnswer) return;
  if (game.currentIndex >= game.activeItems.length) return;

  game.awaitingAnswer = false;
  window.ClearHumanAloneTimer();

  var item = game.activeItems[game.currentIndex];
  var learnerAnswer = String(answer || "").trim();
  var correctAnswer = String(item.category || "").trim();
  var thisSession = game.sessionId;

  player.SetVar("LearnerAnswerInput", learnerAnswer);

  if (learnerAnswer.toUpperCase() === correctAnswer.toUpperCase()) {
    player.SetVar("LearnerScore", player.GetVar("LearnerScore") + 1);
    player.SetVar("HumanStatusMessage", "Correct");
  } else {
    //player.SetVar("HumanStatusMessage", "The Correct answer is: " + correctAnswer);
  	player.SetVar("HumanStatusMessage", "The correct answer is: <b>" + correctAnswer + "</b>");
  }

  game.currentIndex += 1;

  game.feedbackTimer = setTimeout(function() {
    if (!window.HumanAloneGame) return;
    if (window.HumanAloneGame.sessionId !== thisSession) return;
    if (!window.HumanAloneGame.hasStarted) return;

    window.HumanAloneGame.feedbackTimer = null;
    window.LoadCurrentHumanTrial();
  }, 1500);
};

window.ResetHumanAloneGame();
}

window.Script28 = function()
{
  window.SubmitHumanAloneAnswer("Fire Hazard");
}

window.Script29 = function()
{
  window.SubmitHumanAloneAnswer("Security Breach");
}

window.Script30 = function()
{
  window.SubmitHumanAloneAnswer("Medical Emergency");
}

window.Script31 = function()
{
  window.SubmitHumanAloneAnswer("Safe");
}

window.Script32 = function()
{
  window.StartHumanAloneGame();
}

window.Script33 = function()
{
  var p = GetPlayer();
var total = 20;

// Build ordered list
var arr = [];
for (var i = 1; i <= total; i++) arr.push(i);

// Fisher–Yates shuffle
for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

// Export back to Storyline variables RandomList1..20
for (var k = 0; k < arr.length; k++) {
    p.SetVar("RandomList" + (k+1), arr[k]);
}

// Reset counters
p.SetVar("RandomIndex", 0);
p.SetVar("TrialNumber", 0);
p.SetVar("HumanScore", 0);
p.SetVar("AIScore", 0);
p.SetVar("DelegationChoice", "");
p.SetVar("LogCSV", "");

}

window.Script34 = function()
{
  (function () {
  var player = GetPlayer();

  if (!window.HumanAIHelpGame) {
    window.HumanAIHelpGame = {
      started: false,
      currentIndex: 0,
      aiAccuracy: 0.7,
      feedbackTimer: null,

      allItems: [
		  { id: 1, category: "Fire Hazard" },
		  { id: 2, category: "Fire Hazard" },
		  { id: 3, category: "Fire Hazard" },
		  { id: 4, category: "Fire Hazard" },
		  { id: 5, category: "Fire Hazard" },
		  { id: 6, category: "Security Breach" },
		  { id: 7, category: "Security Breach" },
		  { id: 8, category: "Security Breach" },
		  { id: 9, category: "Safe" },
		  { id: 10, category: "Security Breach" },
		  { id: 11, category: "Medical Emergency" },
		  { id: 12, category: "Medical Emergency" },
		  { id: 13, category: "Medical Emergency" },
		  { id: 14, category: "Medical Emergency" },
		  { id: 15, category: "Medical Emergency" },
		  { id: 16, category: "Safe" },
		  { id: 17, category: "Safe" },
		  { id: 18, category: "Safe" },
		  { id: 19, category: "Safe" },
		  { id: 20, category: "Safe" },
		  { id: 21, category: "Security Breach" },
		  { id: 22, category: "Fire Hazard" },
		  { id: 23, category: "Fire Hazard" },
		  { id: 24, category: "Fire Hazard" },
		  { id: 25, category: "Fire Hazard" },
		  { id: 26, category: "Fire Hazard" },
		  { id: 27, category: "Security Breach" },
		  { id: 28, category: "Security Breach" },
		  { id: 29, category: "Security Breach" },
		  { id: 30, category: "Security Breach" },
		  { id: 31, category: "Medical Emergency" },
		  { id: 32, category: "Medical Emergency" },
		  { id: 33, category: "Medical Emergency" },
		  { id: 34, category: "Medical Emergency" },
		  { id: 35, category: "Medical Emergency" },
		  { id: 36, category: "Safe" },
		  { id: 37, category: "Safe" },
		  { id: 38, category: "Safe" },
		  { id: 39, category: "Safe" },
		  { id: 40, category: "Safe" },
		  { id: 41, category: "Fire Hazard" },
		  { id: 42, category: "Fire Hazard" },
		  { id: 43, category: "Fire Hazard" },
		  { id: 44, category: "Fire Hazard" },
		  { id: 45, category: "Fire Hazard" },
		  { id: 46, category: "Fire Hazard" },
		  { id: 47, category: "Medical Emergency" },
		  { id: 48, category: "Medical Emergency" },
		  { id: 49, category: "Medical Emergency" },
		  { id: 50, category: "Medical Emergency" },
		  { id: 51, category: "Medical Emergency" },
		  { id: 52, category: "Safe" },
		  { id: 53, category: "Safe" },
		  { id: 54, category: "Safe" },
		  { id: 55, category: "Safe" },
		  { id: 56, category: "Safe" },
		  { id: 57, category: "Safe" },
		  { id: 58, category: "Security Breach" },
		  { id: 59, category: "Security Breach" },
		  { id: 60, category: "Security Breach" },
		  { id: 61, category: "Security Breach" },
		  { id: 62, category: "Security Breach" },
		  { id: 63, category: "Security Breach" },
		  { id: 64, category: "Security Breach" }
      ],

      activeItems: [],

      shuffleArray: function (array) {
        for (var i = array.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = array[i];
          array[i] = array[j];
          array[j] = temp;
        }
      },

      clearTimers: function () {
        if (this.feedbackTimer) {
          clearTimeout(this.feedbackTimer);
          this.feedbackTimer = null;
        }
      },

      buildSession: function () {
        var shuffled = this.allItems.slice();
        this.shuffleArray(shuffled);
        this.activeItems = shuffled.slice(0, 20);
      },

      resetSlide: function () {
        this.clearTimers();
        this.started = false;
        this.currentIndex = 0;
        this.activeItems = [];

        player.SetVar("ImgIndex", 0);
        player.SetVar("TruthLabel", "");
        player.SetVar("AIGuess", "");
        player.SetVar("LearnerAnswerInput", "");
        player.SetVar("ChoiceDisplay", "");

        player.SetVar("LearnerScore", 0);
        player.SetVar("AIHelpCount", 0);

        player.SetVar("TrialNumber", 0);
        player.SetVar("ProgressPercent", 0);
        player.SetVar("SessionComplete", false);

        player.SetVar("HelpUsedThisTrial", false);
        player.SetVar("CanAskAI", false);

        player.SetVar("StatusMessage", "Click Start to begin.");
        player.SetVar("AIStatusMessage", "AI is available if you ask for help.");
        player.SetVar("HumanStatusMessage", "Waiting to begin.");
        player.SetVar("ResultMessage", "");
      },

      updateProgress: function () {
        var total = this.activeItems.length;
        var trialNumber = this.currentIndex + 1;

        if (trialNumber < 1) trialNumber = 1;
        if (trialNumber > total) trialNumber = total;

        var percent = total ? Math.round((trialNumber / total) * 100) : 0;

        player.SetVar("TrialNumber", trialNumber);
        player.SetVar("ProgressPercent", percent);
      },

      loadCurrentItem: function () {
        if (this.currentIndex >= this.activeItems.length) {
          this.endSession();
          return;
        }

        var item = this.activeItems[this.currentIndex];

        player.SetVar("ImgIndex", item.id);
        player.SetVar("TruthLabel", "");
        player.SetVar("AIGuess", "");
        player.SetVar("LearnerAnswerInput", "");
        player.SetVar("ChoiceDisplay", "");

        player.SetVar("HelpUsedThisTrial", false);
        player.SetVar("CanAskAI", true);

        this.updateProgress();

        player.SetVar("StatusMessage", "Choose the correct category or ask AI for help.");
        player.SetVar("AIStatusMessage", "AI is waiting.");
        player.SetVar("HumanStatusMessage", "");
      },

      requestAIHelp: function () {
        if (!this.started) return;
        if (this.currentIndex >= this.activeItems.length) return;

        this.clearTimers();

        var item = this.activeItems[this.currentIndex];
        var correctAnswer = String(item.category || "").trim();
        var guess;
        var isCorrect = Math.random() < this.aiAccuracy;

        if (isCorrect) {
          guess = correctAnswer;
        } else {
          guess = this.getWrongCategory(correctAnswer);
        }

        player.SetVar("AIGuess", guess);
        player.SetVar("TruthLabel", correctAnswer);
        player.SetVar("HelpUsedThisTrial", true);
        player.SetVar("CanAskAI", false);
        player.SetVar("AIHelpCount", player.GetVar("AIHelpCount") + 1);
        player.SetVar("ChoiceDisplay", "     AI chose: " + guess);

        if (guess.toUpperCase() === correctAnswer.toUpperCase()) {
          player.SetVar("LearnerScore", player.GetVar("LearnerScore") + 1);
          player.SetVar("StatusMessage", "AI classified correctly.");
        } else {
          player.SetVar("StatusMessage", "AI classified incorrectly.");
        }

        player.SetVar("AIStatusMessage", "                               AI chose: " + guess);
        player.SetVar("HumanStatusMessage", "The correct answer is: " + correctAnswer);

        var self = this;
        this.currentIndex += 1;

        this.feedbackTimer = setTimeout(function () {
          self.feedbackTimer = null;
          self.loadCurrentItem();
        }, 2000);
      },

      submitLearnerAnswer: function (answer) {
        if (!this.started) return;
        if (this.currentIndex >= this.activeItems.length) return;

        this.clearTimers();

        var item = this.activeItems[this.currentIndex];
        var learnerAnswer = String(answer || "").trim();
        var correctAnswer = String(item.category || "").trim();

        player.SetVar("LearnerAnswerInput", learnerAnswer);
        player.SetVar("TruthLabel", correctAnswer);
        player.SetVar("CanAskAI", false);
        player.SetVar("ChoiceDisplay", "You chose: " + learnerAnswer);

        if (learnerAnswer.toUpperCase() === correctAnswer.toUpperCase()) {
          player.SetVar("LearnerScore", player.GetVar("LearnerScore") + 1);
          player.SetVar("StatusMessage", "Correct classification.");
        } else {
          player.SetVar("StatusMessage", "Incorrect classification.");
        }

        player.SetVar("HumanStatusMessage", "The correct answer is: " + correctAnswer);
        player.SetVar("AIStatusMessage", "Trial complete.");

        var self = this;
        this.currentIndex += 1;

        this.feedbackTimer = setTimeout(function () {
          self.feedbackTimer = null;
          self.loadCurrentItem();
        }, 2000);
      },

      getWrongCategory: function (correctCategory) {
        var categories = ["Fire Hazard", "Security Breach", "Medical Emergency", "Safe"];
        var wrongChoices = [];

        for (var i = 0; i < categories.length; i++) {
          if (categories[i] !== correctCategory) {
            wrongChoices.push(categories[i]);
          }
        }

        return wrongChoices[Math.floor(Math.random() * wrongChoices.length)];
      },

      start: function () {
        if (this.started) return;

        this.started = true;
        this.currentIndex = 0;
        this.clearTimers();
        this.buildSession();

        player.SetVar("LearnerScore", 0);
        player.SetVar("AIHelpCount", 0);
        player.SetVar("SessionComplete", false);
        player.SetVar("ResultMessage", "");

        this.loadCurrentItem();
      },

      endSession: function () {
        this.clearTimers();

        player.SetVar("TrialNumber", this.activeItems.length);
        player.SetVar("ProgressPercent", 100);
        player.SetVar("CanAskAI", false);
        player.SetVar("SessionComplete", true);

        var summary =
          "Total Correct: " + player.GetVar("LearnerScore") +
          " | AI used: " + player.GetVar("AIHelpCount");

        player.SetVar("ResultMessage", summary);
        player.SetVar("StatusMessage", "All trials complete.");
        player.SetVar("AIStatusMessage", "Session complete.");
        player.SetVar("HumanStatusMessage", "Review the results.");
        player.SetVar("ChoiceDisplay", "");
        player.SetVar("TruthLabel", "");
      }
    };
  }

  window.HumanAIHelpGame.resetSlide();
})();
}

window.Script35 = function()
{
  window.HumanAIHelpGame.submitLearnerAnswer("Fire Hazard");
}

window.Script36 = function()
{
  window.HumanAIHelpGame.submitLearnerAnswer("Security Breach");
}

window.Script37 = function()
{
  window.HumanAIHelpGame.submitLearnerAnswer("Medical Emergency");
}

window.Script38 = function()
{
  window.HumanAIHelpGame.submitLearnerAnswer("Safe");
}

window.Script39 = function()
{
  window.HumanAIHelpGame.start();
}

window.Script40 = function()
{
   window.HumanAIHelpGame.requestAIHelp();
}

window.Script41 = function()
{
  var p = GetPlayer();
var csv = p.GetVar("LogCSV");

// Create a downloadable file
var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
var url = URL.createObjectURL(blob);

// Create a link element
var link = document.createElement("a");
link.setAttribute("href", url);
link.setAttribute("download", "results_log.csv");
document.body.appendChild(link);
link.click();
document.body.removeChild(link);

}

};
