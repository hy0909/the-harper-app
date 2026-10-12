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
/* 매장 데이터는 Supabase(shops · areas 표)에 있고, 못 읽으면 data/shops.json 을 대신 읽는다(관리자 페이지가 둘 다 고친다).
   좌표는 주소를 지오코딩한 값이라 입구와 몇 m 차이가 날 수 있음. 한남은 표본이고 주소·영업시간은 [확인 필요]. tier(1~5)도 임시값 [확인 필요].
   여기서는 데이터를 읽어 window.HARPER_SHOPS · window.HARPER_AREAS 에 넣고 document 에 'harper:shops' 를 알린다.
   목록·지도·상세는 window.HARPER_onShops(fn) 으로 데이터가 준비된 뒤에 돈다 */
(function () {
  window.HARPER_onShops = function (fn) {
    if (window.HARPER_SHOPS) fn();
    else document.addEventListener('harper:shops', fn, { once: true });
  };

  /* 찜한 매장: 이 기기(localStorage 'harper:likes')에 매장 id 배열로 저장한다. 나중에 찜한 것이 앞에 온다.
     저장소를 못 쓰는 환경(사생활 보호 창 등)에서는 빈 목록으로 돌고, 찜은 그 화면에서만 보인다 */
  window.HARPER_getLikes = function () {
    try {
      var v = JSON.parse(localStorage.getItem('harper:likes') || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  };
  window.HARPER_setLikes = function (list) {
    try { localStorage.setItem('harper:likes', JSON.stringify(list)); } catch (e) {}
  };

  /* Supabase 의 shops 행(snake_case: area_name …)을 화면이 쓰는 모양(areaName …)으로 */
  function toShop(r) {
    var s = {
      id: r.id, tier: r.tier, area: r.area, areaName: r.area_name || '',
      name: r.name || '', addr: r.addr || '', lat: Number(r.lat), lng: Number(r.lng),
      pick: !!r.pick, photo: r.photo || '', note: r.note || '',
      intro: Array.isArray(r.intro) ? r.intro : (r.intro ? [String(r.intro)] : [])
    };
    if (r.hours) s.hours = r.hours;
    if (r.closed) s.closed = r.closed;
    if (r.phone) s.phone = r.phone;
    return s;
  }
  /* ① Supabase: areas 표 → { id: [lat, lng] }, shops 표 → 매장 배열 (JSON 파일과 같은 모양) */
  function fromSupabase() {
    return Promise.all([
      window.HARPER_sbGet('areas?select=*'),
      window.HARPER_sbGet('shops?select=*&order=sort.asc,id.asc')
    ]).then(function (res) {
      var areas = {};
      (res[0] || []).forEach(function (a) { areas[a.id] = [Number(a.lat), Number(a.lng)]; });
      return { areas: areas, shops: (res[1] || []).map(toShop) };
    });
  }
  /* ② 못 읽으면 저장소 안 JSON 파일 */
  function fromJSON() {
    return fetch('data/shops.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('shops.json ' + r.status); return r.json(); });
  }

  /* 언어가 한국어가 아니면 data/i18n/<lang>.json 의 매장 글(이름 · 주소 · 한 줄 설명 · 소개)을 덮어씌운다(i18n.js) */
  function translate(data) {
    var ready = window.HARPER_i18nReady || Promise.resolve(null);
    return ready.then(function (tr) {
      if (tr && window.HARPER_trShop) (data.shops || []).forEach(function (s) { window.HARPER_trShop(s, tr); });
      return data;
    });
  }

  fromSupabase()
    .catch(function (err) { window.HARPER_sbWarn(err); return fromJSON(); })
    .then(translate)
    .then(function (data) {
      window.HARPER_SHOPS = data.shops || [];
      window.HARPER_AREAS = data.areas || {};
      document.dispatchEvent(new CustomEvent('harper:shops', { detail: data }));
    })
    .catch(function (err) { console.error('매장 데이터를 불러오지 못했습니다', err); });
})();
