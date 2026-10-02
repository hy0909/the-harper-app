/* 내 정보: 알림 스위치 켜고 끄기. 언어 드로어는 drawer.js가 처리한다(고르면 줄 안의 글자가 바뀐다) */
(function () {
  var sw = document.querySelector('.switch');
  if (sw) {
    sw.addEventListener('click', function () {
      var on = sw.getAttribute('aria-checked') === 'true';
      sw.setAttribute('aria-checked', on ? 'false' : 'true');
    });
  }
})();
