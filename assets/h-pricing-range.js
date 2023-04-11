class HPricingRange extends HTMLElement {
  constructor() {
    super()
    this.RANGE_GAP = 10
    this.debounce
    this.coinFormat = (amount) => {
      return new Intl
        .NumberFormat('es-CL', {
          style: 'currency',
          currency: 'CLP'
        })
        .format(amount)
    }

    this.inputFrom = this.querySelector('#h-pricing-from')
    this.inputTo = this.querySelector('#h-pricing-to')
    this.feedbackFrom = this.querySelector('#h-feedback-from')
    this.feedbackTo = this.querySelector('#h-feedback-to')

    this.valuerFrom = document.querySelector('[name="filter.v.price.gte"]')
    this.valuerTo = document.querySelector('[name="filter.v.price.lte"]')

    this.from = 0
    this.to = 100
    this.max = Number(this.dataset.max)

    this.setDefaultValues()

    this.inputFrom.addEventListener('input', (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.changeFrom(e.target.value)
    })
    this.inputTo.addEventListener('input', (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.changeTo(e.target.value)
    })
  }
  changeFrom(value, update = true) {
    const fromMax = 100 - this.RANGE_GAP
    this.from = Number(value)
    if (this.from > fromMax) {
      this.from = fromMax
      this.inputFrom.value = this.from
    }
    this.fromValue = this.toMoney(this.from)
    this.feedback()

    if (!update) {
      this.inputFrom.value = this.from
      return
    }

    if (this.from > this.to) this.changeTo(this.from + this.RANGE_GAP, false)

    this.update()
  }
  changeTo(value, update = true) {
    this.to = Number(value)
    if (this.to < this.RANGE_GAP) {
      this.to = this.RANGE_GAP
      this.inputTo.value = this.to
    }
    this.toValue = this.toMoney(this.to)
    this.feedback()

    if (!update) {
      this.inputTo.value = this.to
      return
    }
    if (this.to < this.from) this.changeFrom(this.to - this.RANGE_GAP, false)

    this.update()
  }

  setDefaultValues() {
    this.fromValue = Number(this.inputFrom.dataset.value)
    this.toValue = Number(this.inputTo.dataset.value)

    this.from = this.toRange(this.fromValue)
    this.to = this.toRange(this.toValue)

    this.inputFrom.value = this.from
    this.inputTo.value = this.to
    this.feedback()
  }

  toMoney(value) {
    return Math.round(value * this.max / 100)
  }
  toRange(value) {
    return Math.round(value * 100 / this.max)
  }

  update() {
    if (this.debounce) clearTimeout(this.debounce)
    this.valuerFrom.value = this.fromValue
    this.valuerTo.value = this.toValue
    this.valuerTo.dispatchEvent(new CustomEvent('input', { bubbles: true }))

    // this.debounce = setTimeout(() => {
    // const url = new URL(location.href)
    // url.searchParams.set('filter.v.price.gte', this.fromValue)
    // url.searchParams.set('filter.v.price.lte', this.toValue)
    // }, 1500)
  }

  feedback() {
    if (this.feedbackFrom) this.feedbackFrom.textContent = this.coinFormat(this.fromValue)
    if (this.feedbackTo) this.feedbackTo.textContent = this.coinFormat(this.toValue)
  }
}

customElements.define('h-pricing-range', HPricingRange)