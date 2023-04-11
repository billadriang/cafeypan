class MegaMenu extends HTMLElement {
  constructor() {
    super();
    this.targetLink = [...document.querySelectorAll(".header__menu-item")].find(
      (x) =>
        x.innerText.toLowerCase() === this.dataset.targetLinkTitle.toLowerCase()
    );
    this.megaMenuContent = this.querySelector(".mega-menu__content");
    if(this.targetLink) this.targetLink.parentNode.appendChild(this.megaMenuContent);
    this.header = this.megaMenuContent.closest('sticky-header')
    if(this.header) this.previousBG = window.getComputedStyle(this.header).background


    if(this.targetLink) this.targetLink.parentNode.addEventListener("mouseenter", this.open, false);
    if(this.targetLink) this.targetLink.parentNode.addEventListener(
      "mouseleave",
      this.close,
      false
    );

    switch (this.dataset.megaMenuType) {
      case "collection_two_level":
        this.initTwoLevelMegaMenu();
        break;
    }

    // setTimeout(() => this.open(), 500);
  }

  open = () => {
    const background = window.getComputedStyle(this.megaMenuContent).background
    if(this.header) this.header.style.background = background
    if(this.header)  this.header.classList.add('megamenu-opened')
    this.megaMenuContent.classList.add("active");
  };

  close = () => {
    if(this.header) this.header.classList.remove('megamenu-opened')
    if(this.header && this.previousBG) this.header.style.background = this.previousBG
    this.megaMenuContent.classList.remove("active");
  };

  initTwoLevelMegaMenu = () => {
    const twoLevelMenuFirstLevelLinks = [
      ...this.megaMenuContent.querySelectorAll(
        ".two-level-menu__first-level-link"
      ),
    ];
    twoLevelMenuFirstLevelLinks.forEach((link) =>
      link.addEventListener("mouseenter", this.handleTwoLevelMegaMenuLinkHover)
    );
  };

  handleTwoLevelMegaMenuLinkHover = (event) => {
    const aux = [
      ...this.megaMenuContent.querySelectorAll(".second-level__links"),
    ];
    aux.forEach((div) => div.classList.remove("active"));
    this.megaMenuContent
      .querySelector(
        `#second-level__menu-${event.target.dataset.twoLevelMenuIndex}`
      )
      .classList.add("active");
    console.log();
  };
}

customElements.define("mega-menu", MegaMenu);