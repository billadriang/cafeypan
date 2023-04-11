window.CartSubscriber = new class {
  constructor() {
    this.isCartPage = location.pathname === '/cart'
    this.cart = JSON.parse(document.querySelector("#cartInitialData").textContent.trim())
    this._events = {}
  }
  on(event, callback) {
    if (!this._events[event]) this._events[event] = []
    this._events[event].push(callback)
  }
  dispatch(event, payload) {
    if (!this._events[event]) return
    this._events[event].forEach(callback => callback(payload))
  }
  find(variantId) {
    variantId = Number(variantId)
    return this.cart.items.find(variant => variant.id === variantId)
  }
  async loadCart(updateUI = false) {
    if (!updateUI) return fetch(`/cart.json`).then(res => res.json())
    this.enableLoading()
    const code = await fetch('/cart').then(res => res.text())
    const virtualDOM = new DOMParser().parseFromString(code, 'text/html')
    const toParse = virtualDOM.querySelector('#cartInitialData')

    const items = virtualDOM.querySelector('cart-items')
    const currentItems = document.querySelector('cart-items')
    const footer = virtualDOM.querySelector('#main-cart-footer')
    const currentFooter = document.querySelector('#main-cart-footer')

    if (items && currentItems) currentItems.replaceWith(items)
    if (footer && currentFooter) currentFooter.replaceWith(footer)

    return this.__updater(toParse)
  }
  async __updater(element, updateUI = false) {
    const old = this.cart
    if (!element) element = document.querySelector("#CartDrawer #cart-data")
    if (element) this.cart = JSON.parse(element.textContent.trim())
    else this.cart = await this.loadCart(updateUI)
    if (updateUI) return
    this.dispatch("updated", { cart: this.cart, old_cart: old })
  }
  async update(element) {
    return this.__updater(element)
  }
  async updateWithUI(element) {
    await this.__updater(element, true)
  }
  enableLoading() {
    const button = document.querySelector('#checkout[type="submit"]')
    if (button) button.disabled = true
  }
}