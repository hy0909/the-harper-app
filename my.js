/* 내 정보: 알림 스위치 켜고 끄기. 전체 보기 · 언어 · 고객센터 동작은 아래에서 붙인다 */
(function () {
  var sw = document.querySelector('.switch');
  if (sw) {
    sw.addEventListener('click', function () {
      var on = sw.getAttribute('aria-checked') === 'true';
      sw.setAttribute('aria-checked', on ? 'false' : 'true');
    });
  }
})();

/* 로그인 상태(auth.js): 로그인 전이면 안내 글과 로그인·가입 버튼, 로그인 후면 닉네임과 어느 SNS 인지. 로그아웃을 누르면 바로 로그인 전 모습으로 */
(function () {
  var t = window.HARPER_t || function (k) { return k; };
  var sec = document.querySelector('.profile');
  if (!sec || !window.HARPER_getUser) return;
  var name = document.getElementById('profile-name');
  var sub = document.getElementById('profile-sub');
  var loginBtn = document.getElementById('profile-login');
  var editBtn = document.getElementById('profile-edit');
  var logout = document.getElementById('logout');
  var avatar = document.getElementById('profile-avatar');
  /* 아바타 동그라미: 사진이 있으면 그 사진, 없으면 회색 */
  function paintAvatar(el, src) {
    el.innerHTML = src ? '<img alt="">' : '';
    if (src) el.firstChild.src = src;
  }
  function render() {
    var u = window.HARPER_getUser();
    sec.classList.toggle('profile--out', !u);
    paintAvatar(avatar, u && u.avatar);
    if (u) {
      name.textContent = u.name;
      sub.textContent = t('my.via', { p: window.HARPER_providerName(u.provider) });
    } else {
      name.textContent = t('my.loginTitle');
      sub.textContent = t('my.loginSub');
    }
    loginBtn.hidden = !!u;
    editBtn.hidden = !u;
    logout.hidden = !u;
  }
  render();
  document.getElementById('logout-btn').addEventListener('click', function () {
    window.HARPER_logOut();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  /* 뒤로 가기로 돌아오면 로그인 화면에서 바뀐 상태를 다시 읽는다 */
  window.addEventListener('pageshow', render);

  /* 프로필 수정 모달: 사진 올리기·바꾸기·지우기, 닉네임. 확인을 눌러야 저장되고, X·바깥·Esc 는 버린다 */
  var modal = document.getElementById('profile-modal');
  if (!modal) return;
  var mAvatar = document.getElementById('profile-modal-avatar');
  var pickBtn = document.getElementById('profile-photo-pick');
  var removeBtn = document.getElementById('profile-photo-remove');
  var fileInput = document.getElementById('profile-photo-input');
  var nameInput = document.getElementById('profile-name-input');
  var okBtn = document.getElementById('profile-modal-ok');
  var draft = { name: '', avatar: '' };

  function paintDraft() {
    paintAvatar(mAvatar, draft.avatar);
    pickBtn.textContent = t(draft.avatar ? 'profile.photoChange' : 'profile.photoUpload');
    removeBtn.hidden = !draft.avatar;
    okBtn.disabled = !nameInput.value.trim();
  }
  function openModal() {
    var u = window.HARPER_getUser();
    if (!u) return;
    draft = { name: u.name || '', avatar: u.avatar || '' };
    nameInput.value = draft.name;
    paintDraft();
    modal.hidden = false;
    editBtn.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('is-locked');
    nameInput.focus();
  }
  function closeModal() {
    modal.hidden = true;
    editBtn.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('is-locked');
    fileInput.value = '';
    editBtn.focus();
  }
  editBtn.addEventListener('click', openModal);
  Array.prototype.forEach.call(modal.querySelectorAll('[data-modal-close]'), function (el) { el.addEventListener('click', closeModal); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
  nameInput.addEventListener('input', paintDraft);

  /* 고른 사진을 가운데 기준 정사각형(256px)으로 잘라 JPEG data URL 로. 기기 저장소(localStorage)에 넣을 만큼만 작게 */
  function squareImage(file, size) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var s = Math.min(img.naturalWidth, img.naturalHeight);
        var sx = (img.naturalWidth - s) / 2;
        var sy = (img.naturalHeight - s) / 2;
        var c = document.createElement('canvas');
        c.width = size; c.height = size;
        c.getContext('2d').drawImage(img, sx, sy, s, s, 0, 0, size, size);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('이미지를 읽지 못함')); };
      img.src = url;
    });
  }
  pickBtn.addEventListener('click', function () { fileInput.click(); });
  fileInput.addEventListener('change', function () {
    var file = fileInput.files && fileInput.files[0];
    if (!file) return;
    squareImage(file, 256).then(function (dataUrl) { draft.avatar = dataUrl; paintDraft(); })
      .catch(function (err) { console.warn(err); });
  });
  removeBtn.addEventListener('click', function () { draft.avatar = ''; fileInput.value = ''; paintDraft(); });
  okBtn.addEventListener('click', function () {
    if (okBtn.disabled) return;
    window.HARPER_updateUser({ name: nameInput.value.trim(), avatar: draft.avatar });
    closeModal();
    render();
  });
})();

/* 언어 줄: 지금 쓰는 언어 이름(i18n.js 의 harper:lang)을 보여 준다. 누르면 language.html 로 간다.
   뒤로 가기 캐시로 돌아오면 언어가 바뀌었을 수 있어 다시 그린다 */
(function () {
  var value = document.getElementById('lang-value');
  if (!value) return;
  var names = window.HARPER_LANG_NAMES || {};
  var lang = window.HARPER_LANG || 'ko';
  value.textContent = names[lang] || '';
  window.addEventListener('pageshow', function (e) { if (e.persisted) location.reload(); });
})();

/* 찜한 매장: harper:likes 에 든 매장 id 를 shops.js 데이터(HARPER_SHOPS)에서 찾아 카드로 그린다.
   데이터 순서가 아니라 찜한 순서(최근이 앞)로 보여 준다. 하나도 없으면 한 줄 안내. 전체 목록은 saved.html */
(function () {
  var list = document.getElementById('saved-list');
  var count = document.getElementById('saved-count');
  var empty = document.getElementById('saved-empty');
  if (!list) return;
  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  function render() {
    var shops = window.HARPER_SHOPS || [];
    var saved = window.HARPER_getLikes().map(function (id) {
      return shops.filter(function (s) { return String(s.id) === String(id); })[0];
    }).filter(Boolean);
    list.innerHTML = saved.map(function (s) {
      return '<a class="saved-card" href="shop.html?id=' + encodeURIComponent(s.id) + '">' +
        '<div class="saved-card__photo">' +
          (s.photo ? '<img src="' + esc(window.HARPER_img(s.photo)) + '" alt="">' : '') +
          (s.pick ? '<span class="badge badge--search">PICK</span>' : '') +
        '</div>' +
        '<p class="saved-card__name">' + esc(s.name) + '</p>' +
        '<p class="saved-card__area">' + esc(s.areaName) + '</p>' +
      '</a>';
    }).join('');
    list.hidden = !saved.length;
    empty.hidden = saved.length > 0;
    count.textContent = String(saved.length);
  }
  window.HARPER_onShops(render);
  /* 뒤로 가기로 돌아오면 상세에서 바뀐 찜 상태를 다시 읽는다 */
  window.addEventListener('pageshow', function () { if (window.HARPER_SHOPS) render(); });
})();

/* 방문 기록: 미리보기는 앞의 3줄, 개수는 전체 기록 수(visits.js). 전체 목록은 history.html */
(function () {
  var list = document.getElementById('history-list');
  var count = document.getElementById('history-count');
  if (!list || !window.HARPER_renderVisits) return;
  window.HARPER_renderVisits(list, 3);
  if (count) count.textContent = String(window.HARPER_VISITS.length);
})();

/* 고객센터: 모달 없이 메일로 바로 연다. 휴대폰(iPhone · iPad · Android)은 mailto 기본 동작으로 메일 앱이 열리고,
   컴퓨터는 Gmail 작성 창을 새 탭으로 연다. href 는 mailto 로 두어 길게 누르기·복사와 자바스크립트 없이도 맞게 동작한다 */
(function () {
  var EMAIL = 'contact@theharper.co.kr';
  var link = document.getElementById('support-link');
  if (!link) return;
  var t = window.HARPER_t || function (k) { return k; };
  var ua = navigator.userAgent || '';
  var uad = navigator.userAgentData;
  /* 휴대폰 판별: userAgentData.mobile 이 있으면 그 값, 없으면 UA(아이폰 · 안드로이드 · 아이패드)와 iPadOS(맥 UA + 터치) */
  var isMobile = (uad && typeof uad.mobile === 'boolean')
    ? uad.mobile
    : (/Android|iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  /* 제목·본문: 고른 언어로 쓰고, 앱 버전 · 언어 · 기기 줄을 붙인다. 본문은 짧게 */
  function mailParts() {
    var lang = window.HARPER_LANG || 'ko';
    var names = window.HARPER_LANG_NAMES || {};
    var body = [
      t('support.bodyHead'),
      '',
      '---',
      t('support.version') + ': web-preview',
      t('settings.lang') + ': ' + (names[lang] || lang),
      t('support.device') + ': ' + ua.slice(0, 120)
    ].join('\n');
    return { subject: t('support.subject'), body: body };
  }
  function mailtoUrl() {
    var m = mailParts();
    return 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(m.subject) + '&body=' + encodeURIComponent(m.body);
  }
  function gmailUrl() {
    var m = mailParts();
    return 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(EMAIL) +
      '&su=' + encodeURIComponent(m.subject) + '&body=' + encodeURIComponent(m.body);
  }
  link.href = mailtoUrl();
  link.addEventListener('click', function (e) {
    if (isMobile) return; /* 휴대폰: 기본 동작(mailto)으로 메일 앱을 연다 */
    e.preventDefault();
    /* 컴퓨터: 누른 것이 직접 여는 동작이라 팝업 차단에 걸리지 않는다. noopener 로 새 탭과 연결을 끊는다 */
    window.open(gmailUrl(), '_blank', 'noopener');
  });
})();
