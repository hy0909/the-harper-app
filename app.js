/* 투어 종류 카드: 화살표로 한 장씩 넘긴다 */
(function () {
  const track = document.getElementById('tours-track');
  if (!track) return;
  const cards = Array.from(track.querySelectorAll('.tour-card'));
  const arrows = Array.from(document.querySelectorAll('.tours__arrow'));
  const step = () => (cards[0] ? cards[0].offsetWidth + 8 : 0);
  const index = () => Math.round(track.scrollLeft / step());
  const update = () => {
    const i = index();
    arrows.forEach((a) => {
      const dir = Number(a.dataset.dir);
      a.disabled = dir < 0 ? i <= 0 : i >= cards.length - 1;
    });
  };
  arrows.forEach((a) => {
    a.addEventListener('click', () => {
      const next = Math.min(Math.max(index() + Number(a.dataset.dir), 0), cards.length - 1);
      const target = cards[next].offsetLeft - 20; /* scroll-padding-left 만큼 뺀다 */
      const before = track.scrollLeft;
      track.scrollTo({ left: target, behavior: 'smooth' });
      /* 부드러운 스크롤이 안 도는 환경이면 바로 이동 */
      setTimeout(() => {
        if (Math.abs(track.scrollLeft - before) < 2 && Math.abs(target - before) >= 2) track.scrollLeft = target;
        update();
      }, 350);
    });
  });
  track.addEventListener('scroll', update, { passive: true });
  track.addEventListener('scrollend', update);
  window.addEventListener('resize', update);
  update();
})();
