/* 가로 카드 묶음(투어 종류 · 에디터's PICK): 화살표로 한 장씩 넘긴다 */
(function () {
  function carousel(trackId, cardSelector, arrowSelector, padLeft) {
    const track = document.getElementById(trackId);
    if (!track) return;
    const cards = Array.from(track.querySelectorAll(cardSelector));
    const arrows = Array.from(document.querySelectorAll(arrowSelector));
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
        const target = cards[next].offsetLeft - padLeft; /* scroll-padding-left 만큼 뺀다 */
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
  }
  carousel('tours-track', '.tour-card', '.tours__arrow', 20);
  carousel('picks-track', '.pick-card', '.picks__arrow', 24);
})();
