/* 로그인 상태(미리보기용). 실제 SNS 서버에 붙지 않고 이 기기(localStorage)에만 남긴다.
   - harper:user     지금 로그인한 사람 { provider: 'kakao' | 'line' | 'wechat', name, marketing, joinedAt }. 없으면 로그아웃 상태
   - harper:accounts 이 기기에서 가입한 계정들 { kakao: {...}, line: {...} }. 같은 SNS 로 다시 시작하면 가입 화면 없이 바로 로그인된다
   i18n.js 다음, 화면 스크립트(login.js · my.js) 앞에 읽는다 */
(function () {
  var PROVIDERS = { kakao: 'Kakao', line: 'LINE', wechat: 'WeChat' };
  function read(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function write(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  window.HARPER_PROVIDERS = PROVIDERS;
  /* 화면에 보일 SNS 이름: 사전(i18n.js)에 provider.<id> 가 있으면 그 언어로, 없으면 영문 이름 */
  window.HARPER_providerName = function (id) {
    var key = 'provider.' + id;
    var v = window.HARPER_t ? window.HARPER_t(key) : key;
    return v === key ? (PROVIDERS[id] || id) : v;
  };
  window.HARPER_getUser = function () {
    var u = read('harper:user');
    return u && PROVIDERS[u.provider] ? u : null;
  };
  window.HARPER_getAccount = function (provider) {
    var all = read('harper:accounts') || {};
    return all[provider] || null;
  };
  /* 가입: 계정을 남기고 바로 로그인 상태로 */
  window.HARPER_signUp = function (provider, name, marketing) {
    var acc = { provider: provider, name: name, marketing: !!marketing, joinedAt: new Date().toISOString() };
    var all = read('harper:accounts') || {};
    all[provider] = acc;
    write('harper:accounts', all);
    write('harper:user', acc);
    return acc;
  };
  window.HARPER_logIn = function (provider) {
    var acc = window.HARPER_getAccount(provider);
    if (acc) write('harper:user', acc);
    return acc;
  };
  /* 프로필 고치기: 닉네임 · 사진(data URL, 없으면 ''). 로그인한 사람과 계정 목록 둘 다 바꾼다 */
  window.HARPER_updateUser = function (patch) {
    var u = window.HARPER_getUser();
    if (!u) return null;
    Object.keys(patch || {}).forEach(function (k) { u[k] = patch[k]; });
    var all = read('harper:accounts') || {};
    all[u.provider] = u;
    write('harper:accounts', all);
    write('harper:user', u);
    return u;
  };
  window.HARPER_logOut = function () { write('harper:user', null); };
})();
