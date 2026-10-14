/* 매장 상세: ?id=N 매장을 shops.js 데이터로 채운다. 사진 캐러셀 · 탭 고정 · 찜 · 뒤로 가기 경로 */
/* 위치: 소개 아래 16:9 미니 지도 + 핀 + 주소. 지도는 움직이지 않고, 누르면 map.html?id=N 으로 간다.
   지도는 map.js 와 같은 벡터 지도(map-style.js, 홈페이지 v2와 같은 모양)를 쓰고, 못 불러오면 OpenStreetMap 타일로. 좌표가 NaN 이거나 0 이면 지도 칸을 숨기고 주소만 보여 준다 */
function setupLocation(s) {
  var block = document.getElementById('shop-map-block');
  var frame = document.getElementById('shop-map-frame');
  var addrEl = document.getElementById('shop-map-addr');
  var lat = Number(s.lat);
  var lng = Number(s.lng);
  var hasPos = isFinite(lat) && isFinite(lng) && lat !== 0 && lng !== 0;
  if (addrEl) addrEl.textContent = s.addr || '';
  var canMap = hasPos && typeof L !== 'undefined';
  frame.hidden = !canMap;
  if (!canMap && !s.addr && block) { block.hidden = true; return; }
  if (!canMap) return;

  var link = document.getElementById('shop-map-link');
  link.href = 'map.html?id=' + s.id;

  var mini = L.map(document.getElementById('shop-map'), {
    zoomControl: false,
    scrollWheelZoom: false,
    dragging: false,
    touchZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false
  }).setView([lat, lng], 16);
  var vector = window.HARPER_mapStyle ? window.HARPER_mapStyle.addTo(mini, window.HARPER_LANG) : Promise.resolve(false);
  vector.then(function (ok) {
    if (ok) return;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mini);
  });

  /* 핀은 map.js 와 같은 모양(코코아 점 + 매장명). 이 매장 하나만 있으니 강조된 상태로 */
  var pin = document.createElement('div');
  pin.className = 'map-pin map-pin--active' + (s.pick ? ' map-pin--pick' : '');
  pin.innerHTML = '<span class="map-pin__dot"></span><span class="map-pin__label"></span>';
  pin.querySelector('.map-pin__label').textContent = s.name;
  L.marker([lat, lng], {
    icon: L.divIcon({ className: 'map-pin-icon', iconSize: [0, 0], iconAnchor: [0, 0], html: pin }),
    interactive: false,
    keyboard: false
  }).addTo(mini);

  /* 핀(점 + 매장명) 묶음이 지도 칸 한가운데 오게. 마커 기준점이 매장명 아래 끝이라, 묶음 높이의 절반만큼 지도를 위로 옮긴다 */
  function centerPin() {
    mini.invalidateSize();
    mini.setView([lat, lng], 16, { animate: false });
    mini.panBy([0, -pin.offsetHeight / 2], { animate: false });
  }
  centerPin();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(centerPin);
  window.addEventListener('resize', centerPin);
}

window.HARPER_onShops(function () {
  var shops = window.HARPER_SHOPS || [];
  var params = new URLSearchParams(location.search);
  var id = Number(params.get('id'));
  var s = shops.filter(function (x) { return x.id === id; })[0] || shops[0];
  if (!s) return;
  var byId = function (i) { return document.getElementById(i); };
  var set = function (i, v) { var el = byId(i); if (el) el.textContent = v; };

  var t = window.HARPER_t || function (k) { return k; }; /* 화면 글자 사전(i18n.js) */
  document.title = t('title.prefix') + s.name;

  /* ① 사진: 이 매장 사진 + 다른 매장 사진 3장(실사진이 오기 전 자리) */
  var photos = [s.photo].concat(
    shops.map(function (x) { return x.photo; }).filter(function (p) { return p !== s.photo; }).slice(0, 3)
  );
  var track = byId('gallery-track');
  var dots = byId('gallery-dots');
  photos.forEach(function (src, i) {
    var slide = document.createElement('div');
    slide.className = 'gallery__slide photo photo--mag';
    slide.innerHTML = '<img class="photo__img" src="' + window.HARPER_img(src) + '" alt="">';
    track.appendChild(slide);
    var d = document.createElement('span');
    d.className = 'dots__dot' + (i === 0 ? ' dots__dot--on' : '');
    dots.appendChild(d);
  });
  var count = byId('gallery-count');
  var arrows = Array.prototype.slice.call(document.querySelectorAll('.gallery__arrow'));
  function updateGallery() {
    var i = Math.round(track.scrollLeft / track.clientWidth);
    count.textContent = (i + 1) + '/' + photos.length;
    Array.prototype.forEach.call(dots.children, function (d, j) { d.classList.toggle('dots__dot--on', j === i); });
    /* 좌우 화살표: 사진이 2장 이상일 때만 보이고, 첫·끝 사진에서는 그쪽 화살표를 끈다 */
    arrows.forEach(function (b) {
      var dir = Number(b.dataset.dir);
      b.hidden = photos.length < 2;
      b.disabled = dir < 0 ? i <= 0 : i >= photos.length - 1;
    });
  }
  arrows.forEach(function (b) {
    b.addEventListener('click', function () {
      var i = Math.round(track.scrollLeft / track.clientWidth) + Number(b.dataset.dir);
      track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
    });
  });
  track.addEventListener('scroll', updateGallery, { passive: true });
  updateGallery();

  /* ② 이름 · 배지 · 태그 */
  set('shop-name', s.name);
  byId('shop-badge').hidden = !s.pick;
  /* 주소 왼쪽에 티어 뱃지(목록과 같은 모양). 티어가 없으면 주소만 */
  var addrEl = byId('shop-addr');
  addrEl.innerHTML = (s.tier ? '<span class="badge badge--tier">TIER ' + String(s.tier).replace(/[<>&"]/g, '') + '</span>' : '') + '<span></span>';
  addrEl.lastChild.textContent = s.addr || '';
  var tags = [s.areaName, s.pick ? t('shop.chipPick') : t('shop.chipRec'), t('shop.chipNoJapan')];
  byId('shop-tags').innerHTML = tags.map(function (t, i) {
    return '<span class="shop__chip' + (i === 1 && s.pick ? ' shop__chip--pick' : '') + '">' + t + '</span>';
  }).join('');

  /* ③ 에디터 노트 · ④ 매장 정보 */
  set('shop-note', s.note);
  set('shop-info-addr', s.addr);
  if (s.hours) set('shop-info-hours', s.hours);
  if (s.closed) set('shop-info-closed', s.closed);
  if (s.phone) set('shop-info-phone', s.phone);

  /* ⑤ 소개 · 위치 · 상품·드롭 */
  var body = byId('shop-intro');
  body.innerHTML = '';
  (s.intro || []).forEach(function (t) { var p = document.createElement('p'); p.textContent = t; body.appendChild(p); });
  setupLocation(s);
  byId('shop-drops').innerHTML =
    '<a class="shop-row" href="magazine.html?id=seongsu-daydrop">' +
      '<div class="shop-row__thumb"><img class="photo__img" src="assets/photos/seongsu-brick-showroom.jpg" alt=""><div class="photo__shade" aria-hidden="true"></div><span class="badge badge--search">DAY DROP</span></div>' +
      '<div class="shop-row__body"><div class="shop-row__text"><h3 class="shop-row__name">' + t('shop.dropTitle') + '</h3><p class="shop-row__addr">' + t('shop.dropPrice') + '</p></div>' +
      '<p class="shop-row__note"><img src="assets/check-circle.svg" width="16" height="16" alt=""><span>' + t('shop.dropNote') + '</span></p></div>' +
    '</a>';

  /* 탭: 누르면 그 부분으로, 스크롤하면 보이는 부분에 맞춰 표시 */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.shop-tabs__tab'));
  var sections = tabs.map(function (t) { return document.querySelector(t.getAttribute('href')); });
  function markTab(i) { tabs.forEach(function (t, j) { if (j === i) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current'); }); }
  var hold = 0; /* 탭을 눌러 이동하는 동안은 스크롤로 표시를 바꾸지 않는다 */
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function (e) {
      e.preventDefault();
      markTab(i);
      hold = Date.now() + 800;
      var tabsH = document.getElementById('shop-tabs').offsetHeight;
      var target = sections[i].getBoundingClientRect().top + window.scrollY - tabsH;
      var before = window.scrollY;
      window.scrollTo({ top: target, behavior: 'smooth' });
      /* 부드러운 스크롤이 안 도는 환경이면 바로 이동 */
      setTimeout(function () { if (Math.abs(window.scrollY - before) < 2 && Math.abs(target - before) >= 2) window.scrollTo(0, target); }, 350);
    });
  });
  window.addEventListener('scroll', function () {
    if (Date.now() < hold) return;
    var line = 80; /* 탭 줄 바로 아래 */
    var cur = 0;
    sections.forEach(function (sec, i) { if (sec.getBoundingClientRect().top <= line) cur = i; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) cur = sections.length - 1;
    markTab(cur);
  }, { passive: true });

  /* ⑦ 찜(헤더 하트) · 예약. 찜 목록은 이 기기에 저장한다(shops.js 의 HARPER_getLikes · HARPER_setLikes) */
  var likeBtns = [byId('shop-like-top'), byId('shop-like')].filter(Boolean);
  var sid = String(s.id);
  function isLiked(list) { return list.some(function (x) { return String(x) === sid; }); }
  function paintLike(on) {
    likeBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.setAttribute('aria-label', on ? t('unlike') : t('like'));
    });
  }
  paintLike(isLiked(window.HARPER_getLikes()));
  likeBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var list = window.HARPER_getLikes();
      var on = !isLiked(list);
      list = list.filter(function (x) { return String(x) !== sid; });
      if (on) list.unshift(s.id); /* 나중에 찜한 매장이 내 정보에서 앞에 온다 */
      window.HARPER_setLikes(list);
      paintLike(on);
    });
  });

  /* 지도에서 들어왔으면 뒤로 가기도 그 매장이 선택된 지도로, 아니면 목록으로 */
  var back = document.querySelector('.mag-header__back');
  if (back) back.href = params.get('from') === 'map' ? 'map.html?id=' + s.id : 'search.html';
});
