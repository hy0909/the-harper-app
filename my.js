/* 내 정보: 알림 스위치 켜고 끄기. 언어 드로어는 drawer.js가 처리한다(고르면 줄 안의 글자가 바뀐다) */
(function () {
  var sw = document.querySelector('.switch');
  if (sw) {
    sw.addEventListener('click', function () {
      var on = sw.getAttribute('aria-checked') === 'true';
      sw.setAttribute('aria-checked', on ? 'false' : 'true');
    });
  }
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
