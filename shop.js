/* 매장 상세: ?id=N 으로 들어온 매장을 shops.js 데이터로 채운다 */
(function () {
  var shops = window.HARPER_SHOPS || [];
  var id = Number(new URLSearchParams(location.search).get('id'));
  var s = shops.filter(function (x) { return x.id === id; })[0] || shops[0];
  if (!s) return;
  var set = function (sel, v) { var el = document.getElementById(sel); if (el) el.textContent = v; };
  document.title = 'THE HARPER 앱 미리보기 — ' + s.name;
  document.getElementById('shop-photo').src = s.photo;
  document.getElementById('shop-badge').hidden = !s.pick;
  set('shop-name', s.name);
  set('shop-addr', s.addr);
  set('shop-area', s.areaName);
  set('shop-info-area', s.areaName);
  set('shop-info-addr', s.addr);
  set('shop-note', s.note);
  var tier = document.getElementById('shop-tier');
  tier.textContent = s.pick ? '에디터 PICK' : '에디터 추천';
  tier.classList.toggle('shop__chip--pick', !!s.pick);
  var body = document.getElementById('shop-intro');
  body.innerHTML = '';
  (s.intro || []).forEach(function (t) { var p = document.createElement('p'); p.textContent = t; body.appendChild(p); });
  document.getElementById('shop-map-link').href = 'map.html?id=' + s.id;
})();
