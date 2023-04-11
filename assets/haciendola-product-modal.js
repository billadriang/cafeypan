
const ImageVisualizer = new class {
  constructor() {
    this.visualizer = document.createElement('div')
    this.wrapper = document.createElement('div')
    this.closeButton = document.createElement('button')
    this.visualizer.classList.add('haciendola-image-visualizer')
    this.wrapper.classList.add('haciendola-image-visualizer__wrapper')
    this.closeButton.classList.add('haciendola-image-visualizer__close')

    this.closeButton.innerHTML = `<svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="m12.002 2.005c5.518 0 9.998 4.48 9.998 9.997 0 5.518-4.48 9.998-9.998 9.998-5.517 0-9.997-4.48-9.997-9.998 0-5.517 4.48-9.997 9.997-9.997zm0 1.5c-4.69 0-8.497 3.807-8.497 8.497s3.807 8.498 8.497 8.498 8.498-3.808 8.498-8.498-3.808-8.497-8.498-8.497zm0 7.425 2.717-2.718c.146-.146.339-.219.531-.219.404 0 .75.325.75.75 0 .193-.073.384-.219.531l-2.717 2.717 2.727 2.728c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.384-.073-.53-.219l-2.729-2.728-2.728 2.728c-.146.146-.338.219-.53.219-.401 0-.751-.323-.751-.75 0-.192.073-.384.22-.531l2.728-2.728-2.722-2.722c-.146-.147-.219-.338-.219-.531 0-.425.346-.749.75-.749.192 0 .385.073.531.219z" fill-rule="nonzero" fill="#fff"/></svg>`

    this.wrapper.appendChild(this.closeButton)
    this.visualizer.appendChild(this.wrapper)
    document.body.appendChild(this.visualizer)

    this.wrapper.addEventListener('click', e => {
      if (e.target === this.wrapper || e.target.classList.contains('haciendola-image-visualizer__image-wrapper')) this.hide()
    })
    this.closeButton.addEventListener('click', () => this.hide())

    this.zoomed()

    this.visualizer.addEventListener('transitionend', e => {
      if (e.target === this.visualizer && this.visualizer.classList.contains('opened')) {
        this.visualizer.classList.remove('visible')
        this.visualizer.style.removeProperty('opacity')
        document.body.classList.remove('overflow-hidden')
      }
      this.visualizer.classList.toggle('opened')
    })
  }
  zoomed() {
    this.wrapper.addEventListener("mousemove", (e) => {
      this.wrapper.style.setProperty('--zoomed-y', `${e.pageY}px`)
    })
  }
  show(index = 0) {
    if (innerWidth < 768) return
    this.slider.embla.scrollTo(index)
    document.body.classList.add('overflow-hidden')
    this.visualizer.classList.add('visible')
  }

  hide() {
    this.visualizer.style.opacity = 0
  }
  
  setImages(images) {
    this.slider = document.createElement('haciendola-carousel')
    this.slider.append(...images.map(img => {
      img.addEventListener('click', e => img.classList.toggle('zoomed'))
      const wrapper = document.createElement('div')
      wrapper.classList.add('haciendola-image-visualizer__image-wrapper')
      wrapper.appendChild(img)
      return wrapper
    }))

    this.wrapper.appendChild(this.slider)
    this.slider.configure({
      loop: false,
      slidesPerview: 1,
      gap: 0,
      controls: {
        arrows: true,
        dots: true,
      }
    })
  }
}

if (!customElements.get('product-modal')) {
  customElements.define('product-modal', class productModal extends HTMLElement {
    constructor() {
      super()
      this.images = [...this.querySelectorAll('img')]
      ImageVisualizer.setImages(this.images)
    }
    show(opener) {
      const index = this.images.findIndex(img => opener.dataset.mediaId === img.dataset.mediaId)
      ImageVisualizer.show(index)
    }
    hide() {
      console.log('Cerrando')
    }
  })
}