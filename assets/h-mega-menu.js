class HaciendolaMegaMenu extends HTMLElement {
  constructor() {
    super()
    const menuItems = [
      ...document.querySelectorAll('.header .header__inline-menu li'),
    ]
    this.label = this.dataset.trigger.trim()
    this.linkTitle = this.label.toLowerCase()

    this.trigger = menuItems.find(item => {
      const summary = item.querySelector('summary')
      const search = (summary || item).textContent.toLowerCase().trim()
      const selected = search === this.linkTitle

      if (summary && summary.nextElementSibling && selected)
        summary.nextElementSibling.remove()
      return selected
    })
    if (!this.trigger) return

    this.parent = this.trigger.closest('.header')

    if (this.trigger) {
      /*
        const lnk = this.trigger.querySelector("a") || this.trigger.querySelector('summary span')
        lnk.style.display = "flex"
        lnk.style.gap = ".3em"
        lnk.style.alignItems = "center"
        lnk.innerHTML = `
          <span>${this.label}</span>
          <svg width=".6em" height=".6em" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 24 24">
              <path d="M23.245 4l-11.245 14.374-11.219-14.374-.781.619 12 15.381 12-15.391-.755-.609z" stroke="currentColor"/>
          </svg>
        `
      */

      this.parent.appendChild(this)
      if (this.classList.contains('h-megamenu--fullwidth')) {
        this.style.width = `${this.parent.offsetWidth}px`
      }

      this.trigger.addEventListener('click', e => {
        e.preventDefault()
      })

      // this.trigger.addEventListener('click', e => this.hide(e))
      this.trigger.addEventListener('mouseenter', () => this.show())

      this.addEventListener('mouseenter', () => this.show())
      this.addEventListener('mouseleave', e => this.hide(e), false)
    }
  }

  show() {
    const openedMM = this.parent.openedMM
    if (openedMM && openedMM !== this) openedMM.hide()
    this.parent.openedMM = this

    const top = this.trigger.offsetTop + this.trigger.offsetHeight
    this.style.setProperty('--top-position', `${top}px`)
    this.style.display = 'grid'
    this.trigger.classList.add("h-megamenu--trigger")
  }
  hide(e) {
    if (!e || e.target === this || e.target === this.trigger) {
      this.style.display = 'none'
      this.trigger.classList.remove("h-megamenu--trigger")
    }
  }
}

customElements.define('h-megamenu', HaciendolaMegaMenu)
