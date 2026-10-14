/* 내 정보 하위 화면 3개(saved.html · history.html · language.html)의 동작.
   - 뒤로: 같은 사이트에서 왔으면 history.back(), 아니면 링크(my.html)로 간다
   - 찜한 매장: harper:likes 의 매장을 찜한 순서(최근이 앞)로 목록에 그린다. 줄을 누르면 shop.html?id=
   - 방문 기록: visits.js 의 전체 목록과 개수
   - 언어: 고르면 harper:lang 에 저장하고 이 화면 글을 바로 그 언어로 바꾼다. 체크 표시도 옮기고 화면에 머문다 */
(function () {
  /* 뒤로 가기: 같은 사이트에서 온 기록이 있으면 브라우저 뒤로 가기, 없으면 my.html 링크를 그대로 따른다 */
  var back = document.querySelector('.sub-back');
  if (back) {
    back.addEventListener('click', function (e) {
      var same = false;
      try { same = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (err) {}
      if (same && history.length > 1) { e.preventDefault(); history.back(); }
    });
  }

  /* 뒤로 가기 캐시(bfcache)로 돌아오면 바뀐 언어가 안 보이니 다시 그린다 */
  window.addEventListener('pageshow', function (e) { if (e.persisted) location.reload(); });

  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  var chev = '<img class="history-row__chev" src="assets/chevron-right.svg" width="20" height="20" alt="">';

  /* 찜한 매장 */
  var savedList = document.getElementById('saved-list');
  if (savedList) {
    var savedEmpty = document.getElementById('saved-empty');
    var render = function () {
      var shops = window.HARPER_SHOPS || [];
      var saved = window.HARPER_getLikes().map(function (id) {
        return shops.filter(function (s) { return String(s.id) === String(id); })[0];
      }).filter(Boolean);
      savedList.innerHTML = saved.map(function (s) {
        return '<li><a class="saved-row" href="shop.html?id=' + encodeURIComponent(s.id) + '">' +
          '<span class="saved-row__thumb">' + (s.photo ? '<img src="' + esc(window.HARPER_img(s.photo)) + '" alt="">' : '') + '</span>' +
          '<span class="saved-row__text">' +
            '<span class="saved-card__name">' + esc(s.name) + '</span>' +
            '<span class="saved-card__area">' + esc(s.areaName) + '</span>' +
          '</span>' + chev +
        '</a></li>';
      }).join('');
      savedList.hidden = !saved.length;
      savedEmpty.hidden = saved.length > 0;
    };
    window.HARPER_onShops(render);
  }

  /* 방문 기록: visits.js 의 전체 목록을 그린다 */
  var historyList = document.getElementById('history-list');
  if (historyList && window.HARPER_renderVisits) {
    window.HARPER_renderVisits(historyList);
  }

  /* 언어: 고른 줄에 체크 표시, 화면 글은 HARPER_setLang 이 바로 바꾼다 */
  var langList = document.getElementById('lang-list');
  if (langList) {
    var lang = window.HARPER_LANG || 'ko';
    var items = Array.prototype.slice.call(langList.querySelectorAll('.drawer__item'));
    var paint = function () {
      items.forEach(function (b) { b.setAttribute('aria-selected', b.dataset.lang === lang ? 'true' : 'false'); });
    };
    paint();
    items.forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.dataset.lang;
        if (!window.HARPER_setLang || v === lang) return;
        window.HARPER_setLang(v);
        lang = v;
        paint();
      });
    });
  }
})();
