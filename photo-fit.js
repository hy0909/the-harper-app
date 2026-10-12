/* 상세 화면 사진 칸 비율: 사진이 로드되면 원본 크기(naturalWidth · naturalHeight)를 보고 칸 비율을 정한다.
   세로(높이 ÷ 너비 ≥ 1.15): 칸을 원본 비율 그대로 만들어 사진 전체가 보이게 한다.
   정사각에 가까움(0.87 ≤ 높이 ÷ 너비 < 1.15): 칸을 1:1 로 하고 가득 채운다.
   가로(높이 ÷ 너비 < 0.87): 비율을 주지 않아 CSS 의 기존 칸(16:9, cover)을 그대로 쓴다.
   img: 사진 요소. box: 비율을 줄 칸(없으면 사진 자신). onFit: 비율을 준 뒤 한 번 부른다(샵 캐러셀이 트랙 높이를 다시 맞출 때 쓴다).
   로드 전에는 아무것도 하지 않아 기존 칸이 그대로 보인다. */
window.HARPER_fitPhoto = function (img, box, onFit) {
  if (!img) return;
  var target = box || img;
  function fit() {
    var w = img.naturalWidth;
    var h = img.naturalHeight;
    if (!w || !h) return;
    var r = h / w;
    if (r >= 1.15) {
      target.style.aspectRatio = w + ' / ' + h;
      img.style.objectFit = 'contain'; /* 칸 비율이 원본과 같으니 contain 이면 사진 전체가 보인다 */
    } else if (r >= 0.87) {
      target.style.aspectRatio = '1 / 1';
      img.style.objectFit = '';
    } else {
      target.style.removeProperty('aspect-ratio');
      img.style.objectFit = '';
    }
    if (onFit) onFit();
  }
  if (img.complete && img.naturalWidth) fit();
  else img.addEventListener('load', fit, { once: true });
};
