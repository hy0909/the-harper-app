/* 로그인·회원가입(login.html): SNS 버튼 → 연결 중(0.9초) → 이 기기에 그 SNS 계정이 있으면 바로 로그인, 없으면 가입 마무리(닉네임 · 약관) → 돌아간다.
   돌아갈 곳은 ?from=<페이지> (기본 my.html). 상태 저장은 auth.js */
(function () {
  var t = window.HARPER_t || function (k) { return k; };
  var login = document.getElementById('login');
  var connecting = document.getElementById('connecting');
  var signup = document.getElementById('signup');
  if (!login || !connecting || !signup) return;

  /* 돌아갈 페이지: 같은 폴더의 html 만 받는다(바깥 주소로 튀지 않게) */
  var from = new URLSearchParams(location.search).get('from') || '';
  if (!/^[\w-]+\.html(\?[^#]*)?$/.test(from)) from = 'my.html';
  document.getElementById('login-close').href = from;
  function done() { location.replace(from); }

  function show(sec) {
    [login, connecting, signup].forEach(function (s) { s.hidden = s !== sec; });
    window.scrollTo(0, 0);
  }

  var provider = '';
  var nameEl = document.getElementById('signup-name');
  var doneBtn = document.getElementById('signup-done');
  var agrees = Array.prototype.slice.call(signup.querySelectorAll('.agree__item'));
  var agreeAll = signup.querySelector('.agree__all');
  var checked = function (b) { return b.getAttribute('aria-checked') === 'true'; };

  /* 가입 완료 버튼: 닉네임이 있고 필수 약관을 다 켰을 때만 */
  function update() {
    var ok = nameEl.value.trim().length > 0 &&
      agrees.every(function (b) { return !b.hasAttribute('data-required') || checked(b); });
    doneBtn.disabled = !ok;
    agreeAll.setAttribute('aria-checked', agrees.every(checked) ? 'true' : 'false');
  }
  agrees.forEach(function (b) {
    b.addEventListener('click', function () { b.setAttribute('aria-checked', checked(b) ? 'false' : 'true'); update(); });
  });
  agreeAll.addEventListener('click', function () {
    var on = !checked(agreeAll);
    agrees.forEach(function (b) { b.setAttribute('aria-checked', on ? 'true' : 'false'); });
    update();
  });
  nameEl.addEventListener('input', update);

  /* SNS 버튼: 연결 중 화면을 잠깐 보여 준 뒤 로그인 또는 가입 화면 */
  Array.prototype.forEach.call(login.querySelectorAll('.sns'), function (btn) {
    btn.addEventListener('click', function () {
      provider = btn.dataset.provider;
      var pname = window.HARPER_providerName(provider);
      document.getElementById('connecting-text').textContent = t('login.connecting', { p: pname });
      show(connecting);
      setTimeout(function () {
        if (window.HARPER_logIn(provider)) { done(); return; }
        document.getElementById('signup-sub').textContent = t('signup.sub', { p: pname });
        nameEl.value = '';
        agrees.forEach(function (b) { b.setAttribute('aria-checked', 'false'); });
        update();
        show(signup);
        nameEl.focus();
      }, 900);
    });
  });

  document.getElementById('signup-back').addEventListener('click', function () { show(login); });
  doneBtn.addEventListener('click', function () {
    if (doneBtn.disabled) return;
    var marketing = checked(agrees.filter(function (b) { return b.dataset.agree === 'marketing'; })[0]);
    window.HARPER_signUp(provider, nameEl.value.trim(), marketing);
    done();
  });

  show(login);
})();
