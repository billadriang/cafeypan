class CollageTabs extends HTMLElement{
  constructor(){
    super()
    this.headingsList = [...this.querySelectorAll('.collection-collage__heading')]
    this.headingsList.forEach((button) =>{
      return button.addEventListener('mouseover', this.onButtonHover.bind(this))
    })
  }

  onButtonHover(event){
    const target = event.target

    this.querySelectorAll('[data-block-id]').forEach((button) => {
      if(target.dataset.blockId === button.dataset.blockId){
        button.classList.add('is-active')
      } else {
        button.classList.remove('is-active')
      }
    })
  }
}

customElements.define('collage-tabs', CollageTabs)