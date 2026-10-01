/* 아래에서 올라오는 드로어. 버튼의 data-drawer 에 적힌 드로어를 연다(지역·티어 공용)
   고르면 버튼 안 글자가 바뀌고, 드로어의 data-event 이름으로 document 에 알린다 */
(function () {
  var toggles = Array.prototype.slice.call(document.querySelectorAll('[data-drawer]'));
  toggles.forEach(function (toggle) {
    var drawer = document.getElementById(toggle.dataset.drawer);
    var label = toggle.querySelector('[data-drawer-label]');
    if (!drawer || !label) return;
    var items = Array.prototype.slice.call(drawer.querySelectorAll('.drawer__item'));
    var eventName = drawer.dataset.event || 'drawerchange';

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
        label.textContent = b.dataset.label || b.textContent.trim();
        var detail = { name: b.textContent.trim() };
        Object.keys(b.dataset).forEach(function (k) { if (k !== 'label') detail[k] = b.dataset[k]; });
        document.dispatchEvent(new CustomEvent(eventName, { detail: detail }));
        close();
      });
    });
  });
})();
