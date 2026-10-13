/* 고칠 수 있는 글·사진은 Supabase(editors · site_content · magazines 표)에 있고, 못 읽으면 data/ 의 JSON 을 대신 읽는다(관리자 페이지가 둘 다 고친다).
   여기서는 그 데이터를 읽어 홈 화면(오늘의 추천 · 투어 종류 · 피드 · PICK)을 그리고,
   다른 화면의 에디터 표시([data-editor])도 채운다. 다 그리면 document 에 'harper:content' 를 알린다.
   오늘의 추천 · 피드 · PICK 은 매거진 글 id(home 의 magazine)로 글을 찾아 제목·사진·에디터를 가져온다. 가격은 그리지 않는다 */
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

  /* 홈 한 칸의 매거진 id: 새 구조는 item.magazine, 옛 구조는 link 의 ?id= 값 */
  function idFromLink(link) {
    var m = /[?&]id=([^&#]+)/.exec(String(link || ''));
    return m ? decodeURIComponent(m[1]) : '';
  }
  /* 제목 비교용: 줄바꿈과 공백을 뺀 글자 */
  var plain = function (s) { return String(s == null ? '' : s).replace(/\s/g, ''); };
  /* 칸의 제목(item.title, 줄바꿈 있음)을 쓴다. 글자(줄바꿈·공백 뺀 것)가 매거진 제목과 다르면 매거진 제목을 쓰고 알린다 */
  function titleOf(item, id, m) {
    var own = String(item.title || '');
    if (!own.trim()) return m.title;
    if (plain(own) === plain(m.title)) return own;
    console.warn('홈 카드 제목이 매거진 제목과 달라 매거진 제목을 씁니다: ' + id + ' (칸: ' + own.replace(/\n/g, ' / ') + ', 글: ' + m.title + ')');
    return m.title;
  }
  /* 칸에 보일 값: 매거진 글이 있으면 그 글의 제목·사진·에디터.
     글을 못 찾으면 null(칸을 숨긴다) — 옛 구조 Supabase 값에 남은 칸이 엉뚱한 글로 열리지 않게.
     매거진 목록 자체를 하나도 못 읽은 경우에만 칸에 적힌 값(옛 구조)을 그대로 쓴다 */
  function cardOf(item, magazines) {
    var id = item.magazine || idFromLink(item.link);
    var m = id ? (magazines || []).filter(function (x) { return x.id === id; })[0] : null;
    if (!m && (magazines || []).length) return null;
    return {
      id: id,
      href: id ? 'magazine.html?id=' + encodeURIComponent(id) : (item.link || 'magazine.html'),
      title: m ? titleOf(item, id, m) : (item.title || ''),
      image: m ? m.hero : (item.image || ''),
      editor: m ? m.editor : (item.editor || '')
    };
  }

  /* 아직 안 연 투어의 칩 글자. Supabase 에 남은 옛 글자 '추후 확장'은 '오픈 예정'으로 보여 준다 */
  function soonLabelOf(tours) {
    var v = (tours && tours.soonLabel) || '';
    return (!v || v === '추후 확장') ? t('tours.soon') : v;
  }
  /* 화면에 박힌 글자(사전, i18n.js). i18n.js 를 안 읽은 페이지면 한국어 그대로 */
  var t = window.HARPER_t || function (k) { return ({ 'tours.soon': '오픈 예정', 'tours.infoSoon': '추후 공개', 'tours.infoTitle': '투어 종류 안내' })[k] || k; };

  /* 투어 종류 안내 모달: ⓘ 버튼으로 열고, 닫기 X · 바깥 어두운 영역 · Esc 로 닫는다. 열려 있는 동안 뒤 화면은 스크롤하지 않는다 */
  function renderTourInfo(tours, magazines) {
    var btn = document.getElementById('tours-info');
    var modal = document.getElementById('tour-info');
    if (!btn || !modal) return;
    var info = tours.info || {};
    var soon = t('tours.infoSoon'); /* 안내 창 칩은 ‘추후 공개’(홈 투어 카드의 ‘오픈 예정’과 따로) */
    document.getElementById('tour-info-title').textContent = info.title || t('tours.infoTitle');
    /* 맨 아래 예약하기: 투어(kind=tour) 글이 있으면 그 글로, 없으면 매거진 첫 글로 */
    var cta = document.getElementById('tour-info-cta');
    var tourMag = (magazines || []).filter(function (m) { return m.kind === 'tour'; })[0];
    if (cta) cta.href = tourMag ? 'magazine.html?id=' + encodeURIComponent(tourMag.id) : 'magazine.html';
    document.getElementById('tour-info-list').innerHTML = (tours.items || []).map(function (c) {
      var right = c.open
        ? '<p class="tour-info__price">' + esc(c.price) + '</p>'
        : '<span class="tour-card__soon-chip">' + esc(soon) + '</span>';
      return '<li class="tour-info__item">' +
        '<p class="tour-info__tier">' + esc(c.tier) + '</p>' +
        '<div class="tour-info__row"><h3 class="tour-info__name">' + esc(c.title) + '</h3>' + right + '</div>' +
        '<p class="tour-info__desc">' + esc(c.desc) + '</p>' +
        '</li>';
    }).join('');

    var closeBtn = modal.querySelector('.tour-info__close');
    var dim = modal.querySelector('.tour-info__dim');
    var open = function () {
      modal.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      document.documentElement.classList.add('is-locked');
      closeBtn.focus();
    };
    var close = function () {
      modal.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('is-locked');
      btn.focus();
    };
    btn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    dim.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (modal.hidden) return;
      if (e.key === 'Escape') { close(); return; }
      /* Tab 이 모달 밖으로 나가지 않게 안의 요소끼리만 돈다 */
      if (e.key === 'Tab') {
        var f = modal.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  function renderHome(data) {
    var home = data.home || {};
    var editors = data.editors || [];
    var magazines = data.magazines || [];
    var el = function (id) { return document.getElementById(id); };

    /* 오늘의 추천: 제목·사진·에디터는 매거진 글에서. 제목 · 사진 바 전체가 글로 이어진다 */
    var t = home.today;
    if (t && el('today-section')) {
      var today = cardOf(t, magazines);
      el('today-title').textContent = t.eyebrow || '';
      el('today-headline').href = today.href;
      el('today-headline').innerHTML = lines(today.title);
      el('today-link').href = today.href;
      el('today-photo').dataset.magazine = today.id || '';
      el('today-photo').innerHTML =
        '<img class="photo__img" src="' + esc(img(today.image)) + '" alt="">' +
        '<div class="photo__shade" aria-hidden="true"></div>';
      el('today-editor').innerHTML = editorHTML(editors, today.editor);
    }

    /* 투어 종류 */
    var tours = home.tours;
    if (tours && el('tours-track')) {
      el('tours-title').textContent = tours.title || '';
      el('tours-track').innerHTML = (tours.items || []).map(function (c) {
        var right = c.open
          ? '<p class="tour-card__price">' + esc(c.price) + '</p>'
          : '<p class="tour-card__soon"><span class="tour-card__soon-chip">' + esc(soonLabelOf(tours)) + '</span></p>';
        return '<article class="tour-card' + (c.open ? '' : ' tour-card--soon" aria-disabled="true') + '">' +
          '<p class="tour-card__tier">' + esc(c.tier) + '</p>' +
          '<div class="tour-card__row"><h2 class="tour-card__title">' + esc(c.title) + '</h2>' + right + '</div>' +
          '</article>';
      }).join('');
      el('tours-dots').innerHTML = dotsHTML((tours.items || []).length);
      renderTourInfo(tours, magazines);
    }

    /* 에디터 큐레이션 피드: 칸마다 글 하나. 카드 전체가 글로 이어진다 */
    var feed = home.feed;
    if (feed && el('feed-list')) {
      el('feed-title').textContent = feed.title || '';
      el('feed-list').innerHTML = (feed.items || []).map(function (item) {
        var c = cardOf(item, magazines);
        if (!c) return '';
        return '<a class="feed-card feed-card--' + esc(item.color) + '" data-magazine="' + esc(c.id) + '" href="' + esc(c.href) + '">' +
          '<h2 class="feed-card__title">' + lines(c.title) + '</h2>' +
          '<div class="photo photo--card">' +
            '<img class="photo__img" src="' + esc(img(c.image)) + '" alt="">' +
            '<div class="photo__shade photo__shade--top" aria-hidden="true"></div>' +
            editorHTML(editors, c.editor) +
          '</div>' +
          '</a>';
      }).join('');
    }

    /* 에디터's PICK: 칸 하나가 글 하나로 이어진다 */
    var picks = home.picks;
    if (picks && el('picks-track')) {
      el('picks-title').textContent = picks.title || '';
      el('picks-track').innerHTML = (picks.items || []).map(function (item) {
        var c = cardOf(item, magazines);
        if (!c) return '';
        return '<a class="pick-card" data-magazine="' + esc(c.id) + '" href="' + esc(c.href) + '">' +
          '<div class="photo photo--pick">' +
            '<img class="photo__img" src="' + esc(img(c.image)) + '" alt="">' +
            '<div class="photo__shade" aria-hidden="true"></div>' +
            editorHTML(editors, c.editor) +
          '</div>' +
          '<h2 class="pick-card__title">' + lines(c.title) + '</h2>' +
          '</a>';
      }).join('');
      el('picks-dots').innerHTML = dotsHTML((picks.items || []).length);
    }
  }

  /* 매거진·매장 상세처럼 정적으로 적힌 에디터 표시: <div class="editor" data-editor="h"> 를 채운다 */
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

  /* 매거진 글 목록(홈 카드가 참조하는 제목·사진·에디터): Supabase magazines 표 → 못 읽으면 data/magazines.json */
  function magazinesFromJSON() {
    return fetch('data/magazines.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('magazines.json ' + r.status); return r.json(); })
      .then(function (j) { return Array.isArray(j) ? j : (j.magazines || []); })
      .catch(function () { return []; });
  }
  function loadMagazines() {
    return window.HARPER_sbGet('magazines?select=id,title,hero,editor,kind,sort&order=sort.asc')
      .catch(function (err) { window.HARPER_sbWarn(err); return magazinesFromJSON(); });
  }

  /* Supabase 의 home 값이 옛 구조라 글 id(magazine)나 투어 안내 글이 빠져 있으면, 저장소 JSON 의 같은 자리 값을 빌려 쓴다.
     칸은 순서대로 맞추고(피드·PICK), 투어는 등급(tier)으로 맞춘다. 관리자 SQL 을 돌려 Supabase 가 새 구조가 되면 빌릴 일이 없다.
     안 그러면 피드·PICK 카드가 전부 첫 글로만 열린다 */
  function fetchJSONContent() {
    return fetch('data/content.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('content.json ' + r.status); return r.json(); })
      .catch(function () { return {}; });
  }
  function borrowFromJSON(home, jh) {
    var needs = function (x) { return x && !x.magazine && !idFromLink(x.link); };
    /* 글 id 를 빌릴 때 칸 제목(줄바꿈 제목)도 같이 빌린다. 옛 칸에 남은 제목은 옛 글의 것이라 빌린 글과 맞지 않으므로 덮어쓴다 */
    var borrow = function (x, jx) {
      if (needs(x) && jx && jx.magazine) {
        x.magazine = jx.magazine;
        x.title = jx.title || '';
      }
    };
    if (home.today) borrow(home.today, jh.today);
    ((home.feed || {}).items || []).forEach(function (x, i) { borrow(x, ((jh.feed || {}).items || [])[i]); });
    ((home.picks || {}).items || []).forEach(function (x, i) { borrow(x, ((jh.picks || {}).items || [])[i]); });
    var jt = jh.tours || {};
    var tours = home.tours;
    if (tours) {
      if (!tours.info && jt.info) tours.info = jt.info;
      (tours.items || []).forEach(function (x) {
        var jx = (jt.items || []).filter(function (y) { return y.tier === x.tier; })[0];
        if (!x.desc && jx && jx.desc) x.desc = jx.desc;
      });
    }
    return home;
  }

  /* ① Supabase: editors 표 + site_content 표의 home 값 + magazines 표 → { editors, home, magazines } (JSON 파일과 같은 모양) */
  function fromSupabase() {
    return Promise.all([
      window.HARPER_sbGet('editors?select=*&order=sort.asc'),
      window.HARPER_sbGet('site_content?select=value&key=eq.home'),
      loadMagazines(),
      fetchJSONContent()
    ]).then(function (res) {
      var json = res[3] || {};
      /* Supabase 에 에디터 사진이 비어 있으면 content.json 의 같은 id 사진을 빌린다(관리자에서 사진을 올리면 그쪽이 먼저) */
      var jsonAvatar = function (id) { var x = (json.editors || []).filter(function (e) { return e.id === id; })[0]; return (x && x.avatar) || ''; };
      var editors = (res[0] || []).map(function (e) { return { id: e.id, name: e.name || '', avatar: e.avatar || jsonAvatar(e.id) }; });
      var row = (res[1] || [])[0];
      if (!row || !row.value) throw new Error('site_content 에 home 이 없음');
      return { editors: editors, home: borrowFromJSON(row.value, json.home || {}), magazines: res[2] || [] };
    });
  }
  /* ② 못 읽으면 저장소 안 JSON 파일 (content.json: editors · home, magazines.json: 글 목록) */
  function fromJSON() {
    return Promise.all([
      fetch('data/content.json', { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('content.json ' + r.status); return r.json(); }),
      magazinesFromJSON()
    ]).then(function (res) {
      return { editors: res[0].editors || [], home: res[0].home || {}, magazines: res[1] };
    });
  }

  /* 언어가 한국어가 아니면 data/i18n/<lang>.json 의 홈 글 · 에디터 이름 · 매거진 제목을 덮어씌운다(i18n.js) */
  function translate(data) {
    var ready = window.HARPER_i18nReady || Promise.resolve(null);
    return ready.then(function (tr) {
      if (tr && window.HARPER_trHome) window.HARPER_trHome(data, tr);
      return window.HARPER_curlyDeep ? window.HARPER_curlyDeep(data) : data; /* 곧은 따옴표 → 둥근 따옴표 */
    });
  }

  fromSupabase()
    .catch(function (err) { window.HARPER_sbWarn(err); return fromJSON(); })
    .then(translate)
    .then(function (data) {
      window.HARPER_CONTENT = data;
      try { renderHome(data); fillEditors(data); }
      catch (err) { console.error('홈을 그리다 오류', err); }
      /* 그리다 오류가 나도 다른 스크립트(캐러셀·에디터 표시)는 계속 돌게 알린다 */
      document.dispatchEvent(new CustomEvent('harper:content', { detail: data }));
    })
    .catch(function (err) { console.error('콘텐츠를 불러오지 못했습니다', err); });
})();
