/* 고칠 수 있는 글·사진은 Supabase(editors · site_content 표)에 있고, 못 읽으면 data/content.json 을 대신 읽는다(관리자 페이지가 둘 다 고친다).
   여기서는 그 데이터를 읽어 홈 화면(오늘의 추천 · 투어 종류 · 피드 · PICK)을 그리고,
   다른 화면의 에디터 표시([data-editor])도 채운다. 다 그리면 document 에 'harper:content' 를 알린다 */
/* 사진 주소: Supabase Storage 의 절대 주소(http…)면 그대로, 아니면 저장소 안 상대 경로 그대로 쓴다 */
window.HARPER_img = window.HARPER_img || function (v) {
  v = String(v == null ? '' : v);
  return /^https?:\/\//i.test(v) ? v : v;
};
/* Supabase(PostgREST) 에서 한 표를 읽는다. 키가 비어 있으면 조용히 실패(→ JSON 파일로), 그 밖의 실패는 한 번만 경고 */
window.HARPER_sbGet = window.HARPER_sbGet || function (path) {
  var cfg = window.HARPER_SUPABASE || {};
  if (!cfg.url || !cfg.anonKey) return Promise.reject({ silent: true });
  return fetch(cfg.url + '/rest/v1/' + path, {
    cache: 'no-store',
    headers: { apikey: cfg.anonKey, Authorization: 'Bearer ' + cfg.anonKey, Accept: 'application/json' }
  }).then(function (r) {
    if (!r.ok) throw new Error('Supabase ' + r.status + ' (' + path + ')');
    return r.json();
  });
};
window.HARPER_sbWarn = window.HARPER_sbWarn || function (err) {
  if (err && err.silent) return;
  if (window.HARPER_sbWarned) return;
  window.HARPER_sbWarned = true;
  console.warn('Supabase 에서 못 읽어 data/ JSON 파일로 대신 그립니다', err);
};
(function () {
  var img = window.HARPER_img;
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
      ? '<img class="editor__avatar" src="' + esc(img(e.avatar)) + '" alt="">'
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
        '<img class="photo__img" src="' + esc(img(t.image)) + '" alt="">' +
        '<div class="photo__shade" aria-hidden="true"></div>' +
        editorHTML(editors, t.editor);
      el('today-price').textContent = t.price || '';
      el('today-note').textContent = t.note || '';
      /* 예약하기 버튼은 뺐다(2026-10). 카드 전체가 글로 이어진다 */
      if (t.link && el('today-section')) el('today-section').querySelectorAll('.photo, #today-headline').forEach(function (n) {
        n.style.cursor = 'pointer';
        n.addEventListener('click', function () { location.href = t.link; });
      });
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
            '<img class="photo__img" src="' + esc(img(c.image)) + '" alt="">' +
            '<div class="photo__shade photo__shade--top" aria-hidden="true"></div>' +
            '<div class="photo__top">' +
              '<div class="photo__price-row"><p class="photo__price">' + esc(c.price) + '</p></div>' +
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
            '<img class="photo__img" src="' + esc(img(c.image)) + '" alt="">' +
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
  /* 데이터가 온 뒤에 data-editor 를 바꾼 화면(매거진 상세)이 다시 채울 때 부른다. 아직 안 왔으면 'harper:content' 때 같이 채워진다 */
  window.HARPER_fillEditors = function () { if (window.HARPER_CONTENT) fillEditors(window.HARPER_CONTENT); };

  /* ① Supabase: editors 표 + site_content 표의 home 값 → { editors, home } (JSON 파일과 같은 모양) */
  function fromSupabase() {
    return Promise.all([
      window.HARPER_sbGet('editors?select=*&order=sort.asc'),
      window.HARPER_sbGet('site_content?select=value&key=eq.home')
    ]).then(function (res) {
      var editors = (res[0] || []).map(function (e) { return { id: e.id, name: e.name || '', avatar: e.avatar || '' }; });
      var row = (res[1] || [])[0];
      if (!row || !row.value) throw new Error('site_content 에 home 이 없음');
      return fillMissingLinks(row.value).then(function (home) { return { editors: editors, home: home }; });
    });
  }
  /* Supabase 홈 값에 매거진 링크(?id=)가 아직 없으면(관리자 SQL 실행 전) 저장소 JSON 의 같은 자리 링크를 빌려 쓴다.
     안 그러면 피드 카드가 전부 첫 글로만 열린다 */
  function fillMissingLinks(home) {
    var needs = function (l) { return !l || l.indexOf('id=') < 0; };
    return fromJSON().then(function (json) {
      var j = (json && json.home) || {};
      if (home.today && j.today && needs(home.today.link) && j.today.link) home.today.link = j.today.link;
      var items = (home.feed && home.feed.items) || [];
      var jitems = (j.feed && j.feed.items) || [];
      items.forEach(function (c, i) { if (needs(c.link) && jitems[i] && jitems[i].link) c.link = jitems[i].link; });
      return home;
    }).catch(function () { return home; });
  }
  /* ② 못 읽으면 저장소 안 JSON 파일 */
  function fromJSON() {
    return fetch('data/content.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('content.json ' + r.status); return r.json(); });
  }

  fromSupabase()
    .catch(function (err) { window.HARPER_sbWarn(err); return fromJSON(); })
    .then(function (data) {
      window.HARPER_CONTENT = data;
      renderHome(data);
      fillEditors(data);
      document.dispatchEvent(new CustomEvent('harper:content', { detail: data }));
    })
    .catch(function (err) { console.error('콘텐츠를 불러오지 못했습니다', err); });
})();
