/* 내 정보: 알림 스위치 켜고 끄기. 언어 드로어는 drawer.js가 연다 */
(function () {
  var sw = document.querySelector('.switch');
  if (sw) {
    sw.addEventListener('click', function () {
      var on = sw.getAttribute('aria-checked') === 'true';
      sw.setAttribute('aria-checked', on ? 'false' : 'true');
    });
  }
})();

/* 언어: 줄에는 지금 쓰는 언어 이름(i18n.js 의 harper:lang)을 보여 주고, 드로어에서 고르면 저장한 뒤 페이지를 다시 열어
   데이터에서 오는 글(찜한 매장 이름 등)까지 그 언어로 바꾼다 */
(function () {
  var lang = window.HARPER_LANG || 'ko';
  var names = window.HARPER_LANG_NAMES || {};
  var label = document.querySelector('#lang-toggle [data-drawer-label]');
  if (label && names[lang]) label.textContent = names[lang];
  Array.prototype.forEach.call(document.querySelectorAll('#lang-drawer .drawer__item'), function (b) {
    b.setAttribute('aria-selected', b.dataset.lang === lang ? 'true' : 'false');
  });
  document.addEventListener('langchange', function (e) {
    var v = e.detail && e.detail.lang;
    if (!v || v === lang || !window.HARPER_setLang) return;
    window.HARPER_setLang(v);
    location.reload();
  });
})();

/* 찜한 매장: harper:likes 에 든 매장 id 를 shops.js 데이터(HARPER_SHOPS)에서 찾아 카드로 그린다.
   데이터 순서가 아니라 찜한 순서(최근이 앞)로 보여 준다. 하나도 없으면 한 줄 안내 */
(function () {
  var list = document.getElementById('saved-list');
  var count = document.getElementById('saved-count');
  var empty = document.getElementById('saved-empty');
  if (!list) return;
  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  function render() {
    var shops = window.HARPER_SHOPS || [];
    var saved = window.HARPER_getLikes().map(function (id) {
      return shops.filter(function (s) { return String(s.id) === String(id); })[0];
    }).filter(Boolean);
    list.innerHTML = saved.map(function (s) {
      return '<a class="saved-card" href="shop.html?id=' + encodeURIComponent(s.id) + '">' +
        '<div class="saved-card__photo">' +
          (s.photo ? '<img src="' + esc(window.HARPER_img(s.photo)) + '" alt="">' : '') +
          (s.pick ? '<span class="badge badge--search">PICK</span>' : '') +
        '</div>' +
        '<p class="saved-card__name">' + esc(s.name) + '</p>' +
        '<p class="saved-card__area">' + esc(s.areaName) + '</p>' +
      '</a>';
    }).join('');
    list.hidden = !saved.length;
    empty.hidden = saved.length > 0;
    count.textContent = String(saved.length);
  }
  window.HARPER_onShops(render);
  /* 뒤로 가기로 돌아오면 상세에서 바뀐 찜 상태를 다시 읽는다 */
  window.addEventListener('pageshow', function () { if (window.HARPER_SHOPS) render(); });
})();
