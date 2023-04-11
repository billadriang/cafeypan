class StickyProductOptions extends HTMLElement {
  constructor() {
    super()
    this.printSelectors()
    this.modalClass = 'confirm'
    this.BP = parseInt(this.dataset.bp || 768)
    this.initUI()
    this.initSlider()
    document.body.appendChild(this)
  }
  printSelectors() {
    this.variantsContainer = this.querySelector('#variants-container')
    this.fieldsets = [...document.querySelectorAll("variant-radios fieldset, variant-selects fieldset")]

    // if(!this.variantsContainer || this.fieldsets.length === 0) return this.classList.add('only-pay')

    this.fieldsets.forEach(fl => {
      const clone = fl.cloneNode(true)
      clone.classList.add('swiper-slide')
      const childrens = [...clone.querySelectorAll('input[type="radio"], label')]
      childrens.forEach(child => {
        if (child.tagName === "LABEL") {
          const forAttr = child.getAttribute('for')
          child.setAttribute('for', forAttr + "-2")
          return
        }
        const prevId = child.id
        const id = child.id + "-2"
        const name = child.name + "-2"
        child.id = id
        child.name = name
        child.dataset.id = prevId
      })
      this.variantsContainer.appendChild(clone)
      clone.addEventListener('change', e => {
        const orgOption = fl.querySelector(`#${e.target.dataset.id}`)
        if (!orgOption) return
        orgOption.checked = true
        fl.dispatchEvent(new CustomEvent('change', { bubbles: true }))
      })
      fl.addEventListener('change', e => {
        const opt = clone.querySelector(`[data-id="${e.target.id}"]`)
        if (opt) opt.checked = true
      })
      // Todo: Selecciones inversas
    })
  }
  initSlider() {
    this.viewport = this.querySelector('.spo-swiper')
    this.viewportWrapper = this.viewport.querySelector('.swiper-wrapper')
    if (!this.viewportWrapper) return
    const initSwiper = async () => {
      this.viewportWrapper.classList.add('swiper-wrapper')
      const { Swiper } = await import(window.SwiperRoute)
      this.swiper = new Swiper(this.viewport, {
        slidesPerView: 'auto',
        spaceBetween: 20,
        navigation: {
          prevEl: this.querySelector('.spo-variantArrow--prev'),
          nextEl: this.querySelector('.spo-variantArrow--next')
        }
      })
    }
    const destroySwiper = () => {
      if (this.swiper) this.swiper.destroy()
      this.viewportWrapper.classList.remove('swiper-wrapper')
    }
    const validate = () => {
      destroySwiper()
      if (window.innerWidth > 768) initSwiper()
    }
    window.addEventListener('resize', validate)
    validate()
  }
  initUI() {
    this.sendBtn = this.querySelector('#submit')
    this.incrementBtn = this.querySelector('#increment')
    this.decrementBtn = this.querySelector('#decrement')
    this.quantityField = this.querySelector('#quantity')
    this.quantityContainer = this.querySelector('#quantity-container')
    this.price = this.querySelector('.spo-price')

    this.priceOrg = document.querySelector(`#price-${this.dataset.sectionId}`)
    this.sendBtnOrg = document.querySelector('[name="add"][type="submit"]')
    this.quantityFieldOrg = document.querySelector('quantity-input')

    /* Sincronizar precio al cargar page */
    this.price.innerHTML = this.priceOrg.innerHTML


    const priceChange = new MutationObserver(entries => {
      entries.forEach(entry => {
        this.price.innerHTML = this.priceOrg.outerHTML
      })
    })
    priceChange.observe(this.priceOrg, {
      subtree: true,
      characterData: true,
      childList: true,
      attributes: true,
    })

    const setSendBtn = e => {
      this.sendBtn.textContent = this.sendBtnOrg.textContent
      this.sendBtn.setAttribute('aria-disabled', this.sendBtnOrg.getAttribute('aria-diabled'))
      this.sendBtn.disabled = this.sendBtnOrg.disabled
    }
    this.sendBtnOrg.addEventListener('DOMSubtreeModified', setSendBtn)
    setSendBtn()

    const send = () => {
      if (innerWidth <= this.BP) return this.mobileUI()
      this.desktopUI()
    }
    this.addEventListener('click', (e) => {
      const target = e.target
      if (target.tagName === 'BUTTON') e.preventDefault()
      if (target === this) return this.closeModal()
      else if (target === this.sendBtn) return send()
      else if (target === this.incrementBtn) return this.increment()
      else if (target === this.decrementBtn) return this.decrement()
    })
    if (this.quantityField) this.quantityField.addEventListener('change', e => {
      const value = parseInt(this.quantityField.value)
      const max = parseInt(this.quantityField.max)
      if (value >= max)
        return this.quantityField.value = this.quantityField.max
      if (value <= 1) this.quantityField.value = 1
    })
    if (this.quantityFieldOrg && this.quantityField) {
      this.quantityFieldOrg.addEventListener('change', (e) => {
        this.quantityField.value = e.target.value
      })
      this.quantityField.addEventListener('change', () => {
        this.quantityFieldOrg.querySelector('input[type="number"]').value = this.quantityField.value
      })
    }
    else if (this.quantityContainer) this.quantityContainer.remove()


    window.IntersectionHandler.addListener(
      this.sendBtnOrg,
      () => this.classList.remove('spo-show', this.modalClass),
      () => this.classList.add('spo-show')
    )
  }
  increment() {
    this.quantityField.value = parseInt(this.quantityField.value) + 1
    this.quantityField.dispatchEvent(new Event("change"))
  }
  decrement() {
    if (this.quantityField.value <= 1) return false
    this.quantityField.value = parseInt(this.quantityField.value) - 1
    this.quantityField.dispatchEvent(new Event("change"))
  }
  mobileUI() {
    if (!this.classList.contains(this.modalClass) && !this.classList.contains('only-pay')) return this.openModal()
    this.sendForm()
  }
  openModal() {
    this.classList.add(this.modalClass)
    document.body.classList.add('overflow-hidden')
  }
  closeModal() {
    this.classList.remove(this.modalClass)
    document.body.classList.remove('overflow-hidden')
  }
  desktopUI() {
    this.sendForm()
  }
  sendForm() {
    this.closeModal()
    this.sendBtnOrg.click()
  }
}
customElements.define('sticky-product-options', StickyProductOptions)