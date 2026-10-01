/* 지역 드로어: 필터 줄의 지역 버튼 → 아래에서 목록(성수·한남·압구정) */
(function () {
  var toggle = document.getElementById('area-toggle');
  var drawer = document.getElementById('area-drawer');
  var label = document.getElementById('area-label');
  if (!toggle || !drawer || !label) return;
  var items = Array.prototype.slice.call(drawer.querySelectorAll('.drawer__item'));

  function open() {
    drawer.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    var current = items.filter(function (b) { return b.getAttribute('aria-selected') === 'true'; })[0] || items[0];
    current.focus();
  }
  function close() {
    drawer.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  }

  toggle.addEventListener('click', open);
  drawer.querySelector('[data-drawer-close]').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !drawer.hidden) close(); });

  items.forEach(function (b) {
    b.addEventListener('click', function () {
      items.forEach(function (o) { o.setAttribute('aria-selected', o === b ? 'true' : 'false'); });
      label.textContent = b.textContent.trim();
      /* 지도 등 다른 스크립트가 듣는다 */
      document.dispatchEvent(new CustomEvent('areachange', { detail: { area: b.dataset.area, name: b.textContent.trim() } }));
      close();
    });
  });
})();
