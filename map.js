/* 지도: Leaflet + OpenStreetMap 타일(키 없이 쓸 수 있음, 출처 표기 필수). 핀을 누르면 아래 카드에 매장 정보, 카드를 누르면 상세로 */
(function () {
  var el = document.getElementById('map');
  if (!el || typeof L === 'undefined') return;
  var shops = window.HARPER_SHOPS || [];
  var areas = window.HARPER_AREAS || {};

  var map = L.map(el, { zoomControl: false, attributionControl: true, scrollWheelZoom: false })
    .setView(areas.seongsu || [37.5428, 127.0555], 15);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  /* 지도 높이가 화면에 맞춰 늘어나므로, 크기가 바뀌면 타일을 다시 맞춘다 */
  window.addEventListener('resize', function () { map.invalidateSize(); });
  setTimeout(function () { map.invalidateSize(); }, 0);

  var card = document.getElementById('map-card');
  var link = document.getElementById('map-card-link');
  var photoEl = document.getElementById('map-card-photo');
  var nameEl = document.getElementById('map-card-name');
  var addrEl = document.getElementById('map-card-addr');
  var noteEl = document.getElementById('map-card-note');
  var badgeEl = document.getElementById('map-card-badge');
  var markers = [];

  function clearActive() {
    markers.forEach(function (m) {
      var node = m.getElement();
      if (node) node.querySelector('.map-pin').classList.remove('map-pin--active');
    });
  }
  function select(i) {
    clearActive();
    var node = markers[i] && markers[i].getElement();
    if (node) node.querySelector('.map-pin').classList.add('map-pin--active');
    var s = shops[i];
    if (!s) return;
    link.href = 'shop.html?id=' + s.id;
    photoEl.src = s.photo;
    nameEl.textContent = s.name;
    addrEl.textContent = s.addr;
    noteEl.textContent = s.note;
    badgeEl.hidden = !s.pick;
    card.hidden = false;
  }

  shops.forEach(function (s, i) {
    var icon = L.divIcon({
      className: 'map-pin-icon',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      html: '<div class="map-pin' + (s.pick ? ' map-pin--pick' : '') + '"><span class="map-pin__dot"></span><span class="map-pin__label">' + s.name + '</span></div>'
    });
    var m = L.marker([s.lat, s.lng], { icon: icon, title: s.name, keyboard: true }).addTo(map);
    m.on('click', function () { select(i); });
    markers.push(m);
  });

  map.on('click', function () { card.hidden = true; clearActive(); });

  /* 지역 드로어에서 고르면 그 동네로 이동하고, 그 지역 첫 매장을 보여 준다 */
  var countEl = document.querySelector('.filter__count-num');
  function setCount(area) {
    if (countEl) countEl.textContent = shops.filter(function (s) { return s.area === area; }).length;
  }
  function showArea(area) {
    var c = areas[area];
    if (c) map.setView(c, 15);
    setCount(area);
    var first = -1;
    shops.some(function (s, i) { if (s.area === area) { first = i; return true; } return false; });
    if (first >= 0) select(first); else { card.hidden = true; clearActive(); }
  }
  document.addEventListener('areachange', function (e) { showArea(e.detail.area); });

  /* 상세·목록에서 ?id=N 으로 들어오면 그 매장을 바로 보여 준다 */
  var id = Number(new URLSearchParams(location.search).get('id'));
  var idx = shops.findIndex(function (s) { return s.id === id; });
  if (idx >= 0) {
    map.setView([shops[idx].lat, shops[idx].lng], 16);
    select(idx);
    var label = document.getElementById('area-label');
    if (label) label.textContent = shops[idx].areaName;
    document.querySelectorAll('.drawer__item').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.area === shops[idx].area ? 'true' : 'false'); });
    setCount(shops[idx].area);
  } else {
    select(0);
    setCount('seongsu');
  }
})();
