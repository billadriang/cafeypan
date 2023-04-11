class HaciendolaAnimations {
  constructor() {
    this.SHOW_CLASS = 'haciendola-animate--show'
    this.documentSections = document.querySelectorAll('.shopify-section:not(.haciendola-animate--ignore)')
    this.documentSections.forEach(section => {
      this.showSection(section)
    })
    document.addEventListener('shopify:section:load', e =>
      this.showSection(e.target)
    )
  }
  show(element) {
    const hasChildrens = element.classList.contains(
      'haciendola-animate--childrens'
    )
    if (!hasChildrens) return element.classList.add(this.SHOW_CLASS)
    let delay = 0
    const childrens = [...element.children]
    childrens.forEach(child => {
      child.style.animationDelay = `${delay}ms`
      child.classList.add(this.SHOW_CLASS)
      delay += 200
    })
  }
  showSection(section) {
    const internalAnimations = [
      ...section.querySelectorAll('.haciendola-animate'),
    ]
    if (internalAnimations.length === 0) return this.subscribeElement(section)
    section.style.opacity = '1'
    section.style.animation = 'none'
    section.classList.add(this.SHOW_CLASS)
    internalAnimations.forEach(animated => this.subscribeElement(animated))
  }
  subscribeElement(element) {
    const controlH = window.innerHeight * 0.6
    if (element.offsetHeight > controlH) {
      this.show(element)
      element.classList.add(this.SHOW_CLASS)
      return
    }
    Haciendola.intersection.subscribe({
      element: element,
      onStart: () => this.show(element),
    })
  }
}
Haciendola.registerLibrary('animations', new HaciendolaAnimations())