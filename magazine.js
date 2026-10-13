/* 매거진 상세: ?id=<slug> 글을 Supabase magazines 표에서 읽고, 못 읽으면 data/magazines.json 을 대신 읽어 채운다.
   id 가 없거나 못 찾으면 sort 가 가장 앞선 글을 보여 준다. 에디터 표시([data-editor])는 home.js 가 채운다 */
(function () {
  var img = window.HARPER_img;
  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  /* 글: 빈 줄 = 새 문단(<p>), 줄바꿈 하나 = <br> */
  function paragraphsHTML(text) {
    return String(text == null ? '' : text).replace(/\r\n/g, '\n').split(/\n\s*\n/)
      .map(function (p) { return p.trim(); })
      .filter(function (p) { return p; })
      .map(function (p) { return '<p>' + esc(p).split('\n').join('<br>') + '</p>'; })
      .join('');
  }
  var byId = function (i) { return document.getElementById(i); };

  function render(m) {
    document.title = (window.HARPER_t ? window.HARPER_t('title.prefix') : 'THE HARPER 앱 미리보기 — ') + (m.title || '');

    /* 대표 사진 · 배지 */
    byId('mag-hero').src = img(m.hero || '');
    /* 사진 초점은 styles.css 의 [data-magazine] 규칙이 쓴다 */
    byId('mag-hero').parentNode.dataset.magazine = m.id || '';
    byId('mag-badge').textContent = m.badge || '';
    byId('mag-badge').hidden = !m.badge;

    /* 제목 · 에디터 · 날짜 */
    byId('mag-title').textContent = m.title || '';
    var editor = byId('mag-editor');
    editor.dataset.editor = m.editor || '';
    if (window.HARPER_fillEditors) window.HARPER_fillEditors();
    byId('mag-date').textContent = m.date || '';

    /* 가격 */
    byId('mag-price').hidden = !m.price;
    byId('mag-price-value').textContent = m.price || '';
    byId('mag-price-note').textContent = m.note || '';

    /* 한 줄 요약 · 안내 */
    byId('mag-quote').hidden = !m.summary;
    byId('mag-summary').textContent = m.summary || '';
    var info = Array.isArray(m.info) ? m.info : [];
    byId('mag-info').hidden = !info.length;
    byId('mag-info-labels').innerHTML = info.map(function (r) { return '<dt>' + esc(r.label) + '</dt>'; }).join('');
    byId('mag-info-values').innerHTML = info.map(function (r) { return '<dd>' + esc(r.value) + '</dd>'; }).join('');
    byId('mag-cards').hidden = !m.summary && !info.length;

    /* 본문 */
    var body = byId('mag-body');
    body.innerHTML = paragraphsHTML(m.intro);
    body.classList.toggle('mag__body--magazine', m.kind === 'tour'); /* 투어 글은 소제목과 항목 묶음을 붙여 쓴다 */
    body.hidden = !body.innerHTML;

    /* 브랜드·사람 묶음 */
    var sections = Array.isArray(m.sections) ? m.sections : [];
    var list = byId('mag-sections');
    list.hidden = !sections.length;
    list.dataset.magazine = m.id || ''; /* 글마다 사진 비율을 다르게 쓸 수 있게(magazine.css) */
    list.innerHTML = sections.map(function (s) {
      return '<section class="mag-section">' +
        (s.image ? '<img class="mag-section__image" src="' + esc(img(s.image)) + '" alt="" loading="lazy">' : '') +
        (s.heading || s.sub
          ? '<div class="mag-section__head">' +
            (s.heading ? '<h2 class="mag-section__heading">' + esc(s.heading) + '</h2>' : '') +
            (s.sub ? '<p class="mag-section__sub">' + esc(s.sub) + '</p>' : '') +
            '</div>'
          : '') +
        (s.body ? '<div class="mag-section__body">' + paragraphsHTML(s.body) + '</div>' : '') +
        (s.link
          ? '<a class="mag-section__link" href="' + esc(s.link) + '" target="_blank" rel="noopener">' +
            (/instagram\.com/i.test(s.link) ? '<span class="mag-section__link-icon" aria-hidden="true"></span>' : '') + /* 인스타그램 링크면 아이콘 */
            '<span>' + esc(s.link_label || (window.HARPER_t ? window.HARPER_t('mag.more') : '자세히 보기')) + '</span></a>'
          : '') +
        '</section>';
    }).join('');

    /* 관련 매장 · 하단 버튼 */
    var related = byId('mag-related');
    related.hidden = !m.related_link;
    related.href = m.related_link || '#';
    byId('mag-related-label').textContent = m.related_label || '';
    var cta = byId('mag-cta');
    /* 인스타그램 아이콘(assets/instagram.svg, Ionicons logo-instagram) + 글자 */
    cta.innerHTML = m.cta_label
      ? '<span class="mag__cta-icon" aria-hidden="true"></span><span>' + esc(m.cta_label) + '</span>'
      : '';
    if (m.cta_link) {
      cta.href = m.cta_link;
      cta.removeAttribute('aria-disabled');
    } else {
      cta.href = '#';
      cta.setAttribute('aria-disabled', 'true');
    }
    cta.parentNode.hidden = !m.cta_label;
  }

  /* ① Supabase magazines 표 (JSON 파일과 같은 모양) */
  function fromSupabase() {
    return window.HARPER_sbGet('magazines?select=*&order=sort.asc,id.asc');
  }
  /* ② 못 읽으면 저장소 안 JSON 파일 */
  function fromJSON() {
    return fetch('data/magazines.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('magazines.json ' + r.status); return r.json(); });
  }

  fromSupabase()
    .catch(function (err) { window.HARPER_sbWarn(err); return fromJSON(); })
    .then(function (rows) {
      var list = (rows || []).slice().sort(function (a, b) { return (a.sort || 0) - (b.sort || 0); });
      var id = new URLSearchParams(location.search).get('id');
      var m = list.filter(function (x) { return x.id === id; })[0] || list[0];
      if (!m) throw new Error('매거진 글이 없음');
      /* 언어가 한국어가 아니면 data/i18n/<lang>.json 의 이 글 번역을 덮어씌운다(i18n.js) */
      var ready = window.HARPER_i18nReady || Promise.resolve(null);
      return ready.then(function (tr) {
        if (tr && window.HARPER_trMagazine) window.HARPER_trMagazine(m, tr);
        if (window.HARPER_curlyDeep) window.HARPER_curlyDeep(m); /* 곧은 따옴표 → 둥근 따옴표 */
        window.HARPER_MAGAZINE = m;
        render(m);
      });
    })
    .catch(function (err) { console.error('매거진 글을 불러오지 못했습니다', err); });
})();
