/* 매장 데이터는 data/shops.json 에 있다(관리자 페이지가 이 파일을 고친다). 좌표는 주소를 지오코딩한 값이라 입구와 몇 m 차이가 날 수 있음.
   한남은 표본이고 주소·영업시간은 [확인 필요]. tier(1~5)도 임시값 [확인 필요].
   여기서는 JSON을 읽어 window.HARPER_SHOPS · window.HARPER_AREAS 에 넣고 document 에 'harper:shops' 를 알린다.
   목록·지도·상세는 window.HARPER_onShops(fn) 으로 데이터가 준비된 뒤에 돈다 */
(function () {
  window.HARPER_onShops = function (fn) {
    if (window.HARPER_SHOPS) fn();
    else document.addEventListener('harper:shops', fn, { once: true });
  };
  fetch('data/shops.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('shops.json ' + r.status); return r.json(); })
    .then(function (data) {
      window.HARPER_SHOPS = data.shops || [];
      window.HARPER_AREAS = data.areas || {};
      document.dispatchEvent(new CustomEvent('harper:shops', { detail: data }));
    })
    .catch(function (err) { console.error('매장 데이터를 불러오지 못했습니다', err); });
})();
