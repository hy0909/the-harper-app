/* 샵 상세: ?id=N 매장을 shops.js 데이터로 채운다. 사진 캐러셀 · 탭 고정 · 찜 · 뒤로 가기 경로 */
(function () {
  var shops = window.HARPER_SHOPS || [];
  var params = new URLSearchParams(location.search);
  var id = Number(params.get('id'));
  var s = shops.filter(function (x) { return x.id === id; })[0] || shops[0];
  if (!s) return;
  var byId = function (i) { return document.getElementById(i); };
  var set = function (i, v) { var el = byId(i); if (el) el.textContent = v; };

  document.title = 'THE HARPER 앱 미리보기 — ' + s.name;

  /* ① 사진: 이 매장 사진 + 다른 매장 사진 3장(실사진이 오기 전 자리) */
  var photos = [s.photo].concat(
    shops.map(function (x) { return x.photo; }).filter(function (p) { return p !== s.photo; }).slice(0, 3)
  );
  var track = byId('gallery-track');
  var dots = byId('gallery-dots');
  photos.forEach(function (src, i) {
    var slide = document.createElement('div');
    slide.className = 'gallery__slide photo photo--mag';
    slide.innerHTML = '<img class="photo__img" src="' + src + '" alt="">';
    track.appendChild(slide);
    var d = document.createElement('span');
    d.className = 'dots__dot' + (i === 0 ? ' dots__dot--on' : '');
    dots.appendChild(d);
  });
  var count = byId('gallery-count');
  function updateGallery() {
    var i = Math.round(track.scrollLeft / track.clientWidth);
    count.textContent = (i + 1) + '/' + photos.length;
    Array.prototype.forEach.call(dots.children, function (d, j) { d.classList.toggle('dots__dot--on', j === i); });
  }
  track.addEventListener('scroll', updateGallery, { passive: true });
  updateGallery();

  /* ② 이름 · 배지 · 태그 */
  set('shop-name', s.name);
  byId('shop-badge').hidden = !s.pick;
  set('shop-addr', s.addr);
  var tags = [s.areaName, s.pick ? '에디터 PICK' : '에디터 추천', '일본 미입점'];
  byId('shop-tags').innerHTML = tags.map(function (t, i) {
    return '<span class="shop__chip' + (i === 1 && s.pick ? ' shop__chip--pick' : '') + '">' + t + '</span>';
  }).join('');

  /* ③ 에디터 노트 · ④ 매장 정보 */
  set('shop-note', s.note);
  set('shop-info-addr', s.addr);
  if (s.hours) set('shop-info-hours', s.hours);
  if (s.closed) set('shop-info-closed', s.closed);
  if (s.phone) set('shop-info-phone', s.phone);

  /* ⑤ 소개 · 상품·드롭 */
  var body = byId('shop-intro');
  body.innerHTML = '';
  (s.intro || []).forEach(function (t) { var p = document.createElement('p'); p.textContent = t; body.appendChild(p); });
  byId('shop-drops').innerHTML =
    '<a class="shop-row" href="magazine.html">' +
      '<div class="shop-row__thumb"><img class="photo__img" src="assets/photos/seongsu-brick-showroom.jpg" alt=""><div class="photo__shade" aria-hidden="true"></div><span class="badge badge--search">DAY DROP</span></div>' +
      '<div class="shop-row__body"><div class="shop-row__text"><h3 class="shop-row__name">성수 창고 쇼룸에서 고르는 한국 브랜드</h3><p class="shop-row__addr">128,000원~ · 4인 기준</p></div>' +
      '<p class="shop-row__note"><img src="assets/check-circle.svg" width="16" height="16" alt=""><span>에디터와 함께 5곳을 돌아보는 투어</span></p></div>' +
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

  /* ⑦ 찜 · 예약 · 길찾기 */
  var like = byId('shop-like');
  like.addEventListener('click', function () {
    var on = like.getAttribute('aria-pressed') !== 'true';
    like.setAttribute('aria-pressed', on ? 'true' : 'false');
    like.setAttribute('aria-label', on ? '찜 해제' : '찜하기');
  });
  byId('shop-route').href = 'map.html?id=' + s.id;

  /* 지도에서 들어왔으면 뒤로 가기도 그 매장이 선택된 지도로, 아니면 목록으로 */
  var back = document.querySelector('.mag-header__back');
  if (back) back.href = params.get('from') === 'map' ? 'map.html?id=' + s.id : 'search.html';
})();
