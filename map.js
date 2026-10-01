/* 지도: Leaflet + OpenStreetMap 타일(키 없이 쓸 수 있음, 출처 표기 필수). 핀을 누르면 아래 카드에 매장 정보 */
(function () {
  var el = document.getElementById('map');
  if (!el || typeof L === 'undefined') return;

  /* 성수 편집샵 표본. 좌표는 주소를 지오코딩한 값이라 매장 입구와 몇 m 차이가 날 수 있음 [확인 필요: 실제 100곳 목록으로 교체] */
  var shops = [
    { name: '썬러브 링크스 성수', addr: '성수동2가 269-77', lat: 37.54048, lng: 127.05601, pick: true, note: '성수 숨은 디자이너 브랜드 편집샵' },
    { name: '포인트오브뷰 성수', addr: '연무장길 18', lat: 37.54356, lng: 127.05140, pick: false, note: '에디터 한줄 코멘트 [확인 필요]' },
    { name: 'LCDC SEOUL', addr: '연무장17길 10', lat: 37.54214, lng: 127.06155, pick: false, note: '에디터 한줄 코멘트 [확인 필요]' },
    { name: '아더 스페이스 3.0', addr: '연무장길 53', lat: 37.54418, lng: 127.05062, pick: false, note: '에디터 한줄 코멘트 [확인 필요]' }
  ];

  var map = L.map(el, { zoomControl: false, attributionControl: true, scrollWheelZoom: false })
    .setView([37.5428, 127.0555], 15);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var card = document.getElementById('map-card');
  var nameEl = document.getElementById('map-card-name');
  var addrEl = document.getElementById('map-card-addr');
  var noteEl = document.getElementById('map-card-note');
  var badgeEl = document.getElementById('map-card-badge');
  var markers = [];

  function select(i) {
    markers.forEach(function (m, j) {
      var node = m.getElement();
      if (node) node.querySelector('.map-pin').classList.toggle('map-pin--active', i === j);
    });
    var s = shops[i];
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

  map.on('click', function () {
    card.hidden = true;
    markers.forEach(function (m) {
      var node = m.getElement();
      if (node) node.querySelector('.map-pin').classList.remove('map-pin--active');
    });
  });

  select(0); /* 처음엔 PICK 매장을 보여 준다 */

  /* 지역 드로어에서 고르면 그 동네로 이동. 핀은 아직 성수만 있음 [확인 필요: 한남·압구정 매장] */
  var areas = {
    seongsu: [37.5428, 127.0555],
    hannam: [37.5345, 127.0012],
    apgujeong: [37.5270, 127.0285]
  };
  document.addEventListener('areachange', function (e) {
    var c = areas[e.detail.area];
    if (!c) return;
    map.setView(c, 15);
    if (e.detail.area !== 'seongsu') {
      card.hidden = true;
      markers.forEach(function (m) {
        var node = m.getElement();
        if (node) node.querySelector('.map-pin').classList.remove('map-pin--active');
      });
    } else {
      select(0);
    }
  });
})();
