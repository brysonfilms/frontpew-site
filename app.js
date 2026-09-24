/* Front Pew site. No libraries, no network calls, nothing stored.
   Everything here is a nicety: the page reads fine with JavaScript off. */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Pip hops ---------- */

  function hop(pip) {
    if (reduce || !pip) { return; }
    pip.classList.remove('hop');
    void pip.offsetWidth;               // restart the animation
    pip.classList.add('hop');
  }

  var pips = document.querySelectorAll('.pip');
  Array.prototype.forEach.call(pips, function (pip) {
    pip.addEventListener('animationend', function (e) {
      if (e.animationName === 'hop') { pip.classList.remove('hop'); }
    });
    pip.addEventListener('click', function () { hop(pip); });
  });

  /* Pip hops once as each part of the page arrives, so it walks down with you. */
  if ('IntersectionObserver' in window && !reduce) {
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        hop(entry.target);
        seen.unobserve(entry.target);
      });
    }, { threshold: 0.9 });
    Array.prototype.forEach.call(document.querySelectorAll('.margin .pip'), function (pip) { seen.observe(pip); });
  }

  /* The one joke, hidden: tap the footer Pip five times. */
  var footPip = document.getElementById('foot-pip');
  var footSays = document.getElementById('foot-says');
  if (footPip && footSays) {
    var taps = 0;
    var tagline = footSays.textContent;
    footPip.addEventListener('click', function () {
      taps += 1;
      if (taps === 5) {
        footSays.textContent = 'Pew pew.';
        window.setTimeout(function () { footSays.textContent = tagline; taps = 0; }, 2400);
      }
    });
  }

  /* ---------- the practice page: starters land at the cursor and never split a line ---------- */

  var pad = document.getElementById('pad-text');
  if (pad) {
    Array.prototype.forEach.call(document.querySelectorAll('.starters button'), function (button) {
      button.addEventListener('click', function () {
        var before = button.getAttribute('data-before') || '';
        var after = button.getAttribute('data-after') || '';
        var text = pad.value;
        var at = pad.selectionStart == null ? text.length : pad.selectionStart;

        var lineStart = text.lastIndexOf('\n', at - 1) + 1;
        var lineEnd = text.indexOf('\n', at);
        if (lineEnd === -1) { lineEnd = text.length; }
        var lineIsEmpty = text.slice(lineStart, lineEnd).trim() === '';

        var insertAt = lineIsEmpty ? lineStart : lineEnd;
        var lead = lineIsEmpty ? '' : '\n';
        var tail = lineIsEmpty ? text.slice(lineEnd) : text.slice(lineEnd);
        pad.value = text.slice(0, insertAt) + lead + before + after + tail;

        var caret = insertAt + lead.length + before.length;
        pad.focus();
        pad.setSelectionRange(caret, caret);
      });
    });
  }

  /* ---------- the waitlist ---------- */

  var form = document.getElementById('waitlist-form');
  if (form) {
    var status = document.getElementById('wl-status');
    var email = document.getElementById('wl-email');
    form.addEventListener('submit', function (e) {
      var live = form.getAttribute('data-live') === 'true' && form.getAttribute('action') !== '#';

      if (!email.value || !email.checkValidity()) {
        e.preventDefault();
        status.textContent = 'That email doesn’t look right. Try it again?';
        email.setAttribute('aria-invalid', 'true');
        email.focus();
        return;
      }
      email.removeAttribute('aria-invalid');

      if (!live) {
        // OWNER: this branch runs until index.html has a real action and data-live="true".
        e.preventDefault();
        status.textContent = 'Launching soon. The waitlist isn’t open yet, so nothing was sent and nothing was saved. Your seat’s safe with Pip.';
        hop(document.getElementById('seat-pip'));
        return;
      }
      // Live: let the browser post the form to the address in action="".
    });
  }
})();
