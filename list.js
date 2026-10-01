/* 목록 화면: 지역을 고르면 그 지역 매장만 남기고 개수를 바꾼다 */
(function () {
  var rows = Array.prototype.slice.call(document.querySelectorAll('.shop-list .shop-row'));
  var count = document.querySelector('.filter__count-num');
  var shops = window.HARPER_SHOPS || [];
  if (!rows.length || !shops.length) return;
  function apply(area) {
    var n = 0;
    rows.forEach(function (r, i) {
      var show = shops[i] && shops[i].area === area;
      r.hidden = !show;
      if (show) n += 1;
    });
    if (count) count.textContent = n;
  }
  apply('seongsu');
  document.addEventListener('areachange', function (e) { apply(e.detail.area); });
})();
