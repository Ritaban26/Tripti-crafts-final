/* Adds edge fade + chevron affordances to horizontally-scrolling rails so
   it's clear there is more content to swipe. Each matched element is wrapped
   in a .scroller box; the wrapper gets --more / --back modifiers reflecting
   whether content is hidden to the right / left. Styling lives in
   warm-heritage.css (mobile only). */
(function () {
  var SELECTORS = ['.mcats', '.weave__grid', '.grid-4', '.widget-area', '.wc-tabs', '.account-nav'];

  var rails = [];
  SELECTORS.forEach(function (sel) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
      rails.push(el);
    });
  });

  rails.forEach(function (el) {
    var wrap = document.createElement('div');
    wrap.className = 'scroller';
    el.parentNode.insertBefore(wrap, el);
    wrap.appendChild(el);

    function update() {
      var max = el.scrollWidth - el.clientWidth;
      var overflowing = max > 4;
      wrap.classList.toggle('scroller--back', el.scrollLeft > 4);
      wrap.classList.toggle('scroller--more', overflowing && el.scrollLeft < max - 4);
    }

    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('load', update);
    update();
  });
})();
