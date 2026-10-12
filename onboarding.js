/* 온보딩 페이지(onboarding.html): 스플래시(1.6초) → 언어 선택 → 관심 스타일 선택 → 홈(index.html).
   끝내거나 건너뛰면 harper:onboarded 를 남기고 홈으로 돌아간다. 고른 값은 localStorage harper:lang · harper:styles 에 남긴다.
   건너뛰기는 언어 화면의 현재 선택(처음엔 ko)만 남기고 스타일은 남기지 않는다. index.html 은 harper:onboarded 를 보고 이 페이지로 보낼지 정한다 */
(function () {
  var KEY = 'harper:onboarded';
  var store = {
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var splash = document.getElementById('splash');
  var lang = document.getElementById('onb-lang');
  var style = document.getElementById('onb-style');
  if (!splash || !lang || !style) return;

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

  /* 언어: 전에 고른 언어(harper:lang)가 있으면 그 줄이 선택돼 있고, 누르는 즉시 화면 글이 그 언어로 바뀐다(i18n.js) */
  var langItems = Array.prototype.slice.call(lang.querySelectorAll('.onb__item'));
  var current = window.HARPER_LANG || 'ko';
  langItems.forEach(function (b) { b.setAttribute('aria-checked', b.dataset.value === current ? 'true' : 'false'); });
  langItems.forEach(function (b) {
    b.addEventListener('click', function () { if (window.HARPER_setLang) window.HARPER_setLang(b.dataset.value); });
  });

  /* 홈으로 돌아가기. 상대 경로라서 GitHub Pages 하위 경로에서도 맞게 간다 */
  function finish() {
    store.set(KEY, '1');
    location.replace('index.html');
  }

  lang.querySelector('.onb__cta').addEventListener('click', function () {
    store.set('harper:lang', pickedLang()[0] || 'ko');
    show(style);
  });
  style.querySelector('.onb__cta').addEventListener('click', function () {
    store.set('harper:styles', JSON.stringify(pickedStyle()));
    finish();
  });
  /* 건너뛰기(X): 언어 화면이든 스타일 화면이든 같은 동작 */
  [lang, style].forEach(function (sec) {
    sec.querySelector('.onb__close').addEventListener('click', function () {
      store.set('harper:lang', pickedLang()[0] || 'ko');
      finish();
    });
  });

  show(splash);
  setTimeout(function () { show(lang); }, 1600);
})();
