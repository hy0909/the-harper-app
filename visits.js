/* 방문 히스토리 데이터(미리보기용 고정 값). 내 정보 미리보기(my.html)와 전체 목록(history.html)이 같이 쓴다.
   date: 방문일, shop: 매장 id(shops.js), n: 글 키 번호(i18n.js 의 history.<n>.name · history.<n>.sub).
   HARPER_renderVisits(ul, limit) 는 ul 에 줄을 그리고 그린 개수를 돌려준다. limit 을 주면 앞에서 그만큼만 */
(function () {
  window.HARPER_VISITS = [
    { date: '2026-09-28', shop: 0, n: 1 },
    { date: '2026-09-21', shop: 3, n: 2 },
    { date: '2026-09-14', shop: 4, n: 3 }
  ];
  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  window.HARPER_renderVisits = function (ul, limit) {
    var t = window.HARPER_t || function (k) { return k; };
    var rows = limit ? window.HARPER_VISITS.slice(0, limit) : window.HARPER_VISITS;
    ul.innerHTML = rows.map(function (v) {
      return '<li><a class="history-row" href="shop.html?id=' + encodeURIComponent(v.shop) + '">' +
        '<time class="history-row__date" datetime="' + esc(v.date) + '">' + esc(v.date.slice(5).replace('-', '.')) + '</time>' +
        '<span class="history-row__text">' +
          '<span class="history-row__name">' + esc(t('history.' + v.n + '.name')) + '</span>' +
          '<span class="history-row__sub">' + esc(t('history.' + v.n + '.sub')) + '</span>' +
        '</span>' +
        '<img class="history-row__chev" src="assets/chevron-right.svg" width="20" height="20" alt="">' +
      '</a></li>';
    }).join('');
    return rows.length;
  };
})();
