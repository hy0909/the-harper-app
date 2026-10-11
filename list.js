/* 목록 화면: data/shops.json(shops.js 가 읽어 둔 것)으로 매장 줄을 그리고, 지역·티어를 고르면 맞는 매장만 남기고 개수를 바꾼다 */
window.HARPER_onShops(function () {
  var list = document.querySelector('.shop-list');
  var count = document.querySelector('.filter__count-num');
  var shops = window.HARPER_SHOPS || [];
  if (!list || !shops.length) return;
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  list.innerHTML = shops.map(function (s) {
    return '<a class="shop-row" href="shop.html?id=' + esc(s.id) + '">' +
      '<div class="shop-row__thumb">' +
        '<img class="photo__img" src="' + esc(s.photo) + '" alt="">' +
        '<div class="photo__shade" aria-hidden="true"></div>' +
        (s.pick ? '<span class="badge badge--search">PICK</span>' : '') +
      '</div>' +
      '<div class="shop-row__body">' +
        '<div class="shop-row__text"><h2 class="shop-row__name">' + esc(s.name) + '</h2><p class="shop-row__addr">' + esc(s.addr) + '</p></div>' +
        '<p class="shop-row__note"><img src="assets/check-circle.svg" width="16" height="16" alt=""><span>' + esc(s.note) + '</span></p>' +
      '</div>' +
      '</a>';
  }).join('');
  var rows = Array.prototype.slice.call(list.querySelectorAll('.shop-row'));
  var area = 'all'; /* 처음엔 전체 지역 */
  var tier = 'all';
  function apply() {
    var n = 0;
    rows.forEach(function (r, i) {
      var s = shops[i];
      var show = s && (area === 'all' || s.area === area) && (tier === 'all' || String(s.tier) === tier);
      r.hidden = !show;
      if (show) n += 1;
    });
    if (count) count.textContent = n;
  }
  apply();
  document.addEventListener('areachange', function (e) { area = e.detail.area; apply(); });
  document.addEventListener('tierchange', function (e) { tier = e.detail.tier; apply(); });
});
