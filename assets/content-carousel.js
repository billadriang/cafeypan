class ContentCarousel extends HTMLElement {
  constructor() {
    super();

    const viewportNode = this.querySelector('.embla__viewport')

    const options = {
      loop: true,
      slidesToScroll: 1,
      draggable: true,
      startIndex: 0,
      align: 'start'
    }

    const setupPrevNextBtns = (prevBtn, nextBtn, embla) => {
      prevBtn.addEventListener('click', embla.scrollPrev, false);
      nextBtn.addEventListener('click', embla.scrollNext, false);
    };

    const disablePrevNextBtns = (prevBtn, nextBtn, embla) => {
      return () => {
        if (embla.canScrollPrev()) prevBtn.style.opacity = '1';
        else prevBtn.style.opacity = '0';

        if (embla.canScrollNext()) nextBtn.style.opacity = '1';
        else nextBtn.style.opacity = '0';
      };
    };

    // Grab button nodes
    const prevButtonNode = this.querySelector('.embla__button--prev')
    const nextButtonNode = this.querySelector('.embla__button--next')


    const carousel = EmblaCarousel(viewportNode, options)
    const disablePrevAndNextBtns = disablePrevNextBtns(prevButtonNode, nextButtonNode, carousel);
    setupPrevNextBtns(prevButtonNode, nextButtonNode, carousel)
    // Add click listeners

    carousel.on("select", disablePrevAndNextBtns);
    carousel.on("init", disablePrevAndNextBtns);

  }
}

customElements.define('content-carousel', ContentCarousel)