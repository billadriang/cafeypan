class IconTabs extends HTMLElement {
  constructor() {
    super();
    this.autoplay = this.dataset.autoplay 
    this.autoplaySpeed = parseInt(this.dataset.timer * 1000) 
    // Traer elementos que vamos a utlizar
    this.parentContainer = this.querySelector(".tabs-container__list");
    this.tabsIcons = this.querySelectorAll(".tabs-container__button");
    this.tabsContainerMessage = this.querySelectorAll(
      ".tabs-container__popoup-text"
    );
    this.signal = this.querySelector(".tabs-container__triangle");
    this.popup = this.querySelector(".tabs-container__popup");
    this.buttons = this.querySelector(".tabs-container__buttons")
    this.popupText = this.querySelector(".tabs-container__popoup-text")
    this.mediaQuery = window.matchMedia('(max-width: 500px)')

    this.designMode()

    const timeoutCall = () => {
      const active = this.buttons.querySelector('.tabs-container__button.active')
      let nextButton = active.nextElementSibling
      if(!nextButton || !nextButton.classList.contains('tabs-container__button')) nextButton = this.buttons.firstElementChild
      nextButton.click()
    }

    // agregar event listener a cada boton/icon
    this.tabsIcons.forEach((icon, idx) => {
      icon.DesignerEvent('select', e => {
        icon.click()
      })
      icon.addEventListener("click", () => {
        if(this.timeoutId) clearTimeout(this.timeoutId)
        // remover clases activas del boton/icon
          // remover clases activas del div con texto
        this.removeActiveClasses();
        this.hideAllContents()

        // Responsable de mover el triangulo debajo de cada icon
        this.signal.style.left = `${icon.offsetLeft + 9}px`;

        // agregar clases active al:
          // #1- boton/icon
          // #2- div con textos
        const section = this.tabsContainerMessage[idx]
        section.classList.add('active')
        icon.classList.add("active");

        
        // Logica para el ancho y alto 
        let width = (section.offsetWidth + 40)
        let height = (section.offsetHeight + 40)

        if(this.buttons.offsetWidth > width) width = this.buttons.offsetWidth
        
        // Valores mínimos
        const minW = 325
        const minH = 68
        if(width < minW) width = minW
        if(height < minH) height = minH

        this.popup.style.setProperty('--dynamicMaxWidth', `${width}px`);
        this.popup.style.setProperty('--dynamicMinWidth', `${width}px`);
        this.popup.style.setProperty('--dynamicMinHeight', `${height}px`);
        this.popup.style.setProperty('--dynamicMaxHeight', `${height}px`);
        // Logica para mobile
        if (this.mediaQuery.matches) {
          this.signal.setProperty('--triangleSignal', `${icon.offsetLeft - 4}px`);
          this.popup.style.setProperty('--dynamicMaxWidth', '450px');
          this.popup.style.setProperty('--dynamicMinWidth', '375px');
        }


        if(this.autoplay === "true") this.timeoutId = setTimeout(timeoutCall,this.autoplaySpeed)
      });     
    });
    this.buttons.firstElementChild.click();
    
    window.addEventListener('resize', () => {
      this.querySelector('.tabs-container__button.active').click()
    })
  }

  removeActiveClasses() {
    this.tabsIcons.forEach(icon => {icon.classList.remove("active")});
  }

  hideAllContents(){
    this.tabsContainerMessage.forEach(tab => tab.classList.remove('active'))
  }
  
  designMode() {
    Designer.subscribe(this)
  }
}

customElements.define("icon-tabs", IconTabs);
