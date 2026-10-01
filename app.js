/* 가로 카드 묶음(투어 종류 · 에디터's PICK): 화살표로 한 장씩 넘기고, 점 5개가 현재 장을 가리킨다 */
(function () {
  function carousel(trackId, cardSelector, arrowSelector, dotsSelector, padLeft) {
    const track = document.getElementById(trackId);
    if (!track) return;
    const cards = Array.from(track.querySelectorAll(cardSelector));
    const arrows = Array.from(document.querySelectorAll(arrowSelector));
    const dots = Array.from(document.querySelectorAll(dotsSelector + ' .dots__dot'));
    let current = 0;
    let timer = null;

    /* i번째 카드가 왼쪽 여백에 딱 붙는 scrollLeft */
    const posOf = (i) => cards[i].getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft - padLeft;
    /* 지금 scrollLeft에 가장 가까운 카드 번호 */
    const nearest = () => {
      let best = 0;
      let dist = Infinity;
      cards.forEach((_, i) => {
        const d = Math.abs(posOf(i) - track.scrollLeft);
        if (d < dist) { dist = d; best = i; }
      });
      return best;
    };
    const render = () => {
      arrows.forEach((a) => {
        const dir = Number(a.dataset.dir);
        a.disabled = dir < 0 ? current <= 0 : current >= cards.length - 1;
      });
      dots.forEach((d, i) => d.classList.toggle('dots__dot--on', i === current));
    };
    const goTo = (i) => {
      current = Math.min(Math.max(i, 0), cards.length - 1);
      render();
      const target = posOf(current);
      const before = track.scrollLeft;
      track.scrollTo({ left: target, behavior: 'smooth' });
      /* 부드러운 스크롤이 안 도는 환경이면 바로 이동 */
      setTimeout(() => {
        if (Math.abs(track.scrollLeft - before) < 2 && Math.abs(target - before) >= 2) track.scrollLeft = target;
      }, 350);
    };

    arrows.forEach((a) => a.addEventListener('click', () => goTo(current + Number(a.dataset.dir))));
    /* 손으로 밀었을 때: 멈춘 뒤 가장 가까운 카드로 번호를 맞춘다 */
    track.addEventListener('scroll', () => {
      clearTimeout(timer);
      timer = setTimeout(() => { current = nearest(); render(); }, 120);
    }, { passive: true });
    window.addEventListener('resize', render);
    render();
  }
  carousel('tours-track', '.tour-card', '.tours__arrow', '.tours__dots', 20);
  carousel('picks-track', '.pick-card', '.picks__arrow', '.picks__dots', 24);
})();
