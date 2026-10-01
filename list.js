/* 목록 화면: 지역·티어를 고르면 맞는 매장만 남기고 개수를 바꾼다 */
(function () {
  var rows = Array.prototype.slice.call(document.querySelectorAll('.shop-list .shop-row'));
  var count = document.querySelector('.filter__count-num');
  var shops = window.HARPER_SHOPS || [];
  if (!rows.length || !shops.length) return;
  var area = 'seongsu';
  var tier = 'all';
  function apply() {
    var n = 0;
    rows.forEach(function (r, i) {
      var s = shops[i];
      var show = s && s.area === area && (tier === 'all' || String(s.tier) === tier);
      r.hidden = !show;
      if (show) n += 1;
    });
    if (count) count.textContent = n;
  }
  apply();
  document.addEventListener('areachange', function (e) { area = e.detail.area; apply(); });
  document.addEventListener('tierchange', function (e) { tier = e.detail.tier; apply(); });
})();
