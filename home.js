/* 고칠 수 있는 글·사진은 data/content.json 에 있다(관리자 페이지가 이 파일을 고친다).
   여기서는 그 JSON을 읽어 홈 화면(오늘의 추천 · 투어 종류 · 피드 · PICK)을 그리고,
   다른 화면의 에디터 표시([data-editor])도 채운다. 다 그리면 document 에 'harper:content' 를 알린다 */
(function () {
  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  /* 제목의 줄바꿈(\n)은 <br> 로 */
  var lines = function (s) { return esc(s).split('\n').join('<br>'); };

  /* 에디터 표시: 사진이 있으면 둥근 사진, 없으면 회색 동그라미 */
  function editorHTML(editors, id, extraClass) {
    var e = (editors || []).filter(function (x) { return x.id === id; })[0] || { name: '', avatar: '' };
    var avatar = e.avatar
      ? '<img class="editor__avatar" src="' + esc(e.avatar) + '" alt="">'
      : '<span class="editor__avatar" aria-hidden="true"></span>';
    return '<div class="editor' + (extraClass ? ' ' + extraClass : '') + '">' + avatar + '<span class="editor__name">' + esc(e.name) + '</span></div>';
  }
  function dotsHTML(n) {
    var out = '';
    for (var i = 0; i < n; i += 1) out += '<span class="dots__dot' + (i === 0 ? ' dots__dot--on' : '') + '"></span>';
    return out;
  }

  function renderHome(data) {
    var home = data.home || {};
    var editors = data.editors || [];
    var el = function (id) { return document.getElementById(id); };

    /* 오늘의 추천 */
    var t = home.today;
    if (t && el('today-section')) {
      el('today-title').textContent = t.eyebrow || '';
      el('today-headline').innerHTML = lines(t.title);
      el('today-photo').innerHTML =
        '<img class="photo__img" src="' + esc(t.image) + '" alt="">' +
        '<div class="photo__shade" aria-hidden="true"></div>' +
        editorHTML(editors, t.editor);
      el('today-price').textContent = t.price || '';
      el('today-note').textContent = t.note || '';
      var cta = el('today-cta');
      cta.textContent = t.cta || '';
      if (t.link) cta.addEventListener('click', function () { location.href = t.link; });
    }

    /* 투어 종류 */
    var tours = home.tours;
    if (tours && el('tours-track')) {
      el('tours-title').textContent = tours.title || '';
      el('tours-track').innerHTML = (tours.items || []).map(function (c) {
        var right = c.open
          ? '<p class="tour-card__price">' + esc(c.price) + '</p>'
          : '<p class="tour-card__soon"><span class="tour-card__soon-chip">' + esc(tours.soonLabel) + '</span></p>';
        return '<article class="tour-card' + (c.open ? '' : ' tour-card--soon" aria-disabled="true') + '">' +
          '<p class="tour-card__tier">' + esc(c.tier) + '</p>' +
          '<div class="tour-card__row"><h2 class="tour-card__title">' + esc(c.title) + '</h2>' + right + '</div>' +
          '</article>';
      }).join('');
      el('tours-dots').innerHTML = dotsHTML((tours.items || []).length);
    }

    /* 에디터 큐레이션 피드 */
    var feed = home.feed;
    if (feed && el('feed-list')) {
      el('feed-title').textContent = feed.title || '';
      el('feed-list').innerHTML = (feed.items || []).map(function (c) {
        return '<a class="feed-card feed-card--' + esc(c.color) + '" href="' + esc(c.link || 'magazine.html') + '">' +
          '<h2 class="feed-card__title">' + lines(c.title) + '</h2>' +
          '<div class="photo photo--card">' +
            '<img class="photo__img" src="' + esc(c.image) + '" alt="">' +
            '<div class="photo__shade photo__shade--top" aria-hidden="true"></div>' +
            '<div class="photo__top">' +
              '<div class="photo__price-row"><p class="photo__price">' + esc(c.price) + '</p><span class="badge badge--drop">' + esc(c.badge) + '</span></div>' +
              editorHTML(editors, c.editor) +
            '</div>' +
          '</div>' +
          '</a>';
      }).join('');
    }

    /* 에디터's PICK */
    var picks = home.picks;
    if (picks && el('picks-track')) {
      el('picks-title').textContent = picks.title || '';
      el('picks-track').innerHTML = (picks.items || []).map(function (c) {
        return '<article class="pick-card"' + (c.link ? ' data-link="' + esc(c.link) + '" style="cursor:pointer"' : '') + '>' +
          '<div class="photo photo--pick">' +
            '<img class="photo__img" src="' + esc(c.image) + '" alt="">' +
            '<div class="photo__shade" aria-hidden="true"></div>' +
            editorHTML(editors, c.editor) +
          '</div>' +
          '<div class="pick-card__text">' +
            '<h2 class="pick-card__title">' + esc(c.title) + '</h2>' +
            '<div class="pick-card__price"><span class="pick-card__value">' + esc(c.price) + '</span><span class="pick-card__note">' + esc(c.note) + '</span></div>' +
          '</div>' +
          '</article>';
      }).join('');
      el('picks-dots').innerHTML = dotsHTML((picks.items || []).length);
      el('picks-track').addEventListener('click', function (e) {
        var card = e.target.closest('[data-link]');
        if (card) location.href = card.dataset.link;
      });
    }
  }

  /* 매거진·샵 상세처럼 정적으로 적힌 에디터 표시: <div class="editor" data-editor="h"> 를 채운다 */
  function fillEditors(data) {
    var editors = data.editors || [];
    Array.prototype.forEach.call(document.querySelectorAll('[data-editor]'), function (node) {
      var tmp = document.createElement('div');
      tmp.innerHTML = editorHTML(editors, node.dataset.editor);
      node.innerHTML = tmp.firstChild.innerHTML;
    });
  }

  window.HARPER_editorHTML = editorHTML;

  fetch('data/content.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('content.json ' + r.status); return r.json(); })
    .then(function (data) {
      window.HARPER_CONTENT = data;
      renderHome(data);
      fillEditors(data);
      document.dispatchEvent(new CustomEvent('harper:content', { detail: data }));
    })
    .catch(function (err) { console.error('콘텐츠를 불러오지 못했습니다', err); });
})();
