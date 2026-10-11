/* 처음 켤 때: 스플래시(1.6초) → 언어 선택 → 관심 스타일 선택 → 홈. 한 번 끝내면 다시 안 보인다.
   다시 보려면 주소 뒤에 ?onboarding=1 을 붙인다. 고른 값은 localStorage harper:lang · harper:styles 에 남긴다 */
(function () {
  var KEY = 'harper:onboarded';
  var start = document.getElementById('start');
  if (!start) return;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var force = /[?&]onboarding=1/.test(location.search);
  if (store.get(KEY) && !force) return;

  var splash = document.getElementById('splash');
  var lang = document.getElementById('onb-lang');
  var style = document.getElementById('onb-style');
  start.hidden = false;
  document.body.style.overflow = 'hidden';

  function show(sec) {
    [splash, lang, style].forEach(function (s) { s.hidden = s !== sec; });
    window.scrollTo(0, 0);
  }

  /* 단일 선택(언어) · 복수 선택(스타일) 모두 aria-checked 로 표시 */
  function bind(sec, multi) {
    var items = Array.prototype.slice.call(sec.querySelectorAll('.onb__item'));
    var cta = sec.querySelector('.onb__cta');
    function update() { cta.disabled = !items.some(function (b) { return b.getAttribute('aria-checked') === 'true'; }); }
    items.forEach(function (b) {
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-checked') === 'true';
        if (multi) b.setAttribute('aria-checked', on ? 'false' : 'true');
        else items.forEach(function (o) { o.setAttribute('aria-checked', o === b ? 'true' : 'false'); });
        update();
      });
    });
    update();
    return function picked() {
      return items.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })
        .map(function (b) { return b.dataset.value; });
    };
  }
  var pickedLang = bind(lang, false);
  var pickedStyle = bind(style, true);

  lang.querySelector('.onb__cta').addEventListener('click', function () {
    store.set('harper:lang', pickedLang()[0] || 'ko');
    show(style);
  });
  style.querySelector('.onb__cta').addEventListener('click', function () {
    store.set('harper:styles', JSON.stringify(pickedStyle()));
    store.set(KEY, '1');
    start.hidden = true;
    document.body.style.overflow = '';
  });

  show(splash);
  setTimeout(function () { show(lang); }, 1600);
})();
