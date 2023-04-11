class HAttachedProduct extends HTMLElement {
  constructor() {
    super()
    this.id = Number(this.dataset.productId)
    this.input = this.querySelector('input')
    this.addEventListener('change', (e) => this.toggleProduct(e))
    window.CartSubscriber.on('updated', () => {
      console.log('Nos actualizamos')
      this.updateChecked()
    })
    this.updateChecked()
  }
  updateChecked() {
    const find = window.CartSubscriber.find(this.id)
    console.log(find, window.CartSubscriber.cart)
    if (find !== undefined) this.input.checked = true
    else this.input.checked = false
  }
  toggleProduct(e) {
    const toAdd = e.target.checked
    if (toAdd) return this.addProduct()
    this.removeProduct()
  }
  async addProduct() {
    this.innerHTML = '<div class="loading-spinner"></div>'
    window.CartSubscriber.enableLoading()
    const body = {
      items: [
        {
          id: Number(this.id),
          quantity: 1,
          properties: {
            '_is_attached': 'true'
          }
        }
      ]
    }
    await fetch(`/cart/add.js`, {
      method: 'post',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json'
      }
    })

    window.CartSubscriber.updateWithUI()
    // location.reload()
  }
  async removeProduct() {
    this.innerHTML = '<div class="loading-spinner"></div>'
    window.CartSubscriber.enableLoading()

    await fetch(`/cart/update.js`, {
      method: 'post',
      body: JSON.stringify({
        updates: {
          [Number(this.id)]: 0
        }
      }),
      headers: {
        'content-type': 'application/json'
      }
    })

    window.CartSubscriber.updateWithUI()
  }
}
window.customElements.define('h-attached-product', HAttachedProduct)