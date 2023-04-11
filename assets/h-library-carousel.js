class HCarousel extends HTMLElement {
  constructor() {
    super();
    Haciendola.customizer.subscribe(this);
    this.slides = [];
    this.dots = [];
    this.timeout;
    this._events = {
      select: () => {
        const [index] = this.embla.slidesInView(true);
        this.updateControls(index);
        this.initAutoplay();
      },
      pointerUp: () => this.initAutoplay(),
      pointerDown: () => this.stopAutoplay(),
    };
    this.config = {
      slidesPerView: this.dataset.slidesPerView || 1,
      gap: this.dataset.gap || 0,
      slideDuration: 3,
      slidesToScroll: this.dataset.slidesToScroll || 1,
      loop: false,
      controls: {
        dots: true,
        arrows: true,
      },
      dotsSettings: {
        renderMode: "float",
      },
      arrowsSettings: {
        renderMode: "inner",
      },
    };
    if (this.dataset.autoinit === "true") this.configure(this.config);
  }

  init(config) {
    // Cada uno requiere al otro, el orden es importante
    this.updateView();
    this.wrap();

    this.initEmbla(config);

    this.makeControls();
    this.updateControls();
    this.listeners();
    this.initAutoplay();
  }
  // Wrap: Parsea el dom a la estructura correcta
  wrap() {
    this.viewport = document.createElement("div");
    this.container = document.createElement("div");

    this.viewport.classList.add("haciendola-carousel__viewport");
    this.container.classList.add(
      "haciendola-carousel__container",
      "embla__container"
    );

    const childrens = [...this.children];
    this.slides = childrens.map((el, index) => {
      // Manejar el block en el customizer
      el.customizerEvent("select", () => {
        this.stopAutoplay();
        this.embla.scrollTo(index);
      });

      const slide = document.createElement("div");
      slide.classList.add("haciendola-carousel__slide", "embla__slide");
      slide.appendChild(el);
      this.container.appendChild(slide);
      return slide;
    });

    this.viewport.appendChild(this.container);
    this.appendChild(this.viewport);

    if (this._internalConfig.arrowsSettings.renderMode === "outer") {
      this.classList.add("haciendola-carousel--outer-arrows");
    } else {
      this.classList.remove("haciendola-carousel--outer-arrows");
    }

    this.classList.add("initialized");
  }

  // InitEmbla: Inicializa la librería embla
  initEmbla(config) {
    this.embla = EmblaCarousel(this.viewport, {
      speed: 5,
      containScroll: "trimSnaps",
      align: "start",
      skipSnaps: true,
      ...config,
    });
  }

  // MakeControls: Genera los controles
  makeControls() {
    this.makeArrows();
    this.makeDots();
  }

  makeArrows() {
    if (this.arrowsContainer) this.arrowsContainer.remove();
    this.arrowsContainer = document.createElement("div");

    if (!this.embla.canScrollNext() && !this.embla.canScrollPrev()) return;
    if (!this._internalConfig.controls.arrows) return;

    this.prevBtn = document.createElement("button");
    this.nextBtn = document.createElement("button");

    this.arrowsContainer.classList.add("haciendola-carousel__arrows");

    this.prevBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" fill="currentColor" /></svg>`;
    this.nextBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7.33 24l-2.83-2.829 9.339-9.175-9.339-9.167 2.83-2.829 12.17 11.996z" fill="currentColor"/></svg>`;

    this.prevBtn.addEventListener("click", () => this.embla.scrollPrev());
    this.nextBtn.addEventListener("click", () => this.embla.scrollNext());

    this.arrowsContainer.append(this.prevBtn, this.nextBtn);
    this.appendChild(this.arrowsContainer);
  }

  makeDots() {
    if (this.dotsContainer) this.dotsContainer.remove();

    this.dotsContainer = document.createElement("div");
    if (!this._internalConfig.controls.dots) return;

    this.dotsContainer.classList.add("haciendola-carousel__dots");
    let settings = this._internalConfig.dotsSettings || {};
    if (settings.renderMode === "flow") {
      this.dotsContainer.style.position = "static";
    }

    const generateDotBtns = () => {
      const template = `<div class="haciendola-carousel__dot"></div>`;
      this.dotsContainer.innerHTML = this.embla
        .scrollSnapList()
        .reduce((acc) => acc + template, "");
      return [].slice.call(
        this.dotsContainer.querySelectorAll(".haciendola-carousel__dot")
      );
    };

    this.dots = generateDotBtns();

    this.dots.forEach((dot, index) => {
      dot.addEventListener("click", () => this.embla.scrollTo(index));
    });

    if(this.dots.length > 1) this.appendChild(this.dotsContainer);
  }

  updateControls(index = 0) {
    if (this._internalConfig.controls.arrows) {
      const active = this.slides[index].querySelector('[data-arrows-color]');
      if (active) {
        const color = active.dataset.arrowsColor;
        if (color)
          this.arrowsContainer.style.setProperty("--arrows-color", color);
      }
    }

    if (this._internalConfig.controls.dots) {
      this.dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === this.embla.selectedScrollSnap());
      });
    }
  }

  // UpdateView: Actualiza la visualización de los slides
  updateView() {
    this.style.setProperty(
      "--slide-width",
      `${100 / this._internalConfig.slidesPerView}%`
    );
    this.style.setProperty("--gap", `${this._internalConfig.gap}px`);
  }

  // Listeners: Crea los eventListeners
  listeners() {
    this.embla.on("init", () => {
      this.embla.on("select", this._events.select);
      this.embla.on("pointerUp", this._events.pointerUp);
      this.embla.on("pointerDown", this._events.pointerDown);
    });
    let debounce;
    this.embla.on("reInit", () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => {
        this.clear();
        this.embla.on("select", this._events.select);
        this.embla.on("pointerUp", this._events.pointerUp);
        this.embla.on("pointerDown", this._events.pointerDown);
        this.makeControls();
        this.updateControls();
      }, 200);
    });

    window.addEventListener("resize", () => {
      this._setInternalConfig();
      this.updateView();
    });

    this.customizerEvent("unload", ({ subscriber }) => {
      subscriber.embla.destroy();
      subscriber.clear();
    });
  }
  clear() {
    this.embla.off("select", this._events.select);
    this.embla.off("pointerUp", this._events.pointerUp);
    this.embla.off("pointerDown", this._events.pointerDown);
  }

  // Autoplay: Navegación automática
  initAutoplay() {
    if (this.timeout) clearTimeout(this.timeout);
    if (!this._internalConfig.autoplay) return;
    if (!Shopify.designMode) {
      this.timeout = setTimeout(() => {
        this.embla.scrollNext();
      }, this._internalConfig.slideDuration * 1000);
    }
  }
  stopAutoplay() {
    if (this.timeout) {
      this._internalConfig.autoplay = false;
      clearTimeout(this.timeout);
    }
  }

  // Configure: configuración/actualización de los ajustes responsive
  _setInternalConfig() {
    const width = innerWidth;
    const config = { ...this.config };
    for (let bp in this.config.breakpoints) {
      if (width >= bp) {
        for (let k in this.config.breakpoints[bp]) {
          config[k] = this.config.breakpoints[bp][k];
        }
      }
    }
    this._internalConfig = config;
  }

  configure(config) {
    for (let k in config) {
      this.config[k] = config[k];
    }

    const breakpoints = {};
    if (config.breakpoints) {
      for (let bp in config.breakpoints) {
        breakpoints[`(min-width: ${bp}px)`] = config.breakpoints[bp];
      }
    }

    this._setInternalConfig();

    this.init({ ...this.getEmblaConf(), breakpoints });
  }

  getEmblaConf() {
    return {
      slidesToScroll: this._internalConfig.slidesToScroll,
      loop: this._internalConfig.loop,
    };
  }
}
window.customElements.define("haciendola-carousel", HCarousel);
