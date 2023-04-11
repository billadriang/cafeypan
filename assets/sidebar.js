const HTMLSection = "main-collection-product-grid"
const PATHNAME = window.location.pathname
let CONNECTOR = 'OR'
class Sidebar extends HTMLElement {
  constructor() {
    super()
    this.sidebarForm = this.querySelector("form")
    this.filterData = {}
    this.sidebarForm.addEventListener("input", this.onSubmitHandler)
    window.addEventListener('resize', () => this.resize())
    this.resize()

    // AutoCheckear
    const url = new URL(location.href)
    const checked = url.searchParams.getAll('filter.p.tag')

    checked.forEach(tag => {
      const input = this.querySelector(`.side-bar__block:not(.side-bar__unique) input[value="${tag}"]`)
      if (input && !input.checked) input.checked = true
    })

    // BackButton
    const onHistoryChange = () => {
      const { tags, getTags } = Sidebar.getRoute()
      const tagsList = getTags()


      this.sidebarForm.querySelectorAll('input[type="checkbox"]')
        .forEach(tag => !tagsList || !tagsList.includes(tag.name) ? tag.checked = false : tag.checked = true)
      const url = Sidebar.generateURL(tags, false)
      Sidebar.renderPage(url)
    }
    window.addEventListener('popstate', onHistoryChange)
  }

  onSubmitHandler = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const uniqueParent = event.target.closest('.side-bar__unique')
    const isUnique = uniqueParent !== null

    if (isUnique) {
      uniqueParent.querySelectorAll('input').forEach(input => input.checked = input === event.target)
    }

    let selector = isUnique ? `.side-bar__unique input.tag-filter:checked` : `.side-bar__block:not(.side-bar__unique) input.tag-filter:checked`

    console.log('selector', selector)
    const checkedTagFilters = [
      ...this.sidebarForm.querySelectorAll(selector),
    ]

    console.log(isUnique, checkedTagFilters)
    let tagFilterUrl
    if (isUnique) {
      tagFilterUrl = checkedTagFilters
        .map(input => input.name.trim())
        .join('+')
    } else {
      tagFilterUrl = checkedTagFilters
        .map(input => `filter.p.tag=${input.value.trim().replaceAll(' ', '+')}`)
        .join('&')
    }

    const url = Sidebar.generateURL(tagFilterUrl, true, isUnique)
    Sidebar.renderPage(url)
  };
  resize() {
    const inGrid = () => {
      const parent = document.querySelector('.facets-wrapper')
      parent.insertAdjacentElement('beforeend', this)
    }
    const inDraw = () => {
      const sibling = document.querySelector('menu-drawer .mobile-facets__main > .mobile-facets__footer')
      sibling.insertAdjacentElement('beforebegin', this)
    }

    if (window.innerWidth < 750) return inDraw()
    inGrid()
  }

  static async renderPage(url) {
    // Loading
    const grid = document.querySelector('#ProductGridContainer .collection')
    grid.classList.add("loading")

    const cached = this.filterData[url]
    if (cached) Sidebar.render(cached)
    else await Sidebar.renderSectionFromFetch(url)
  }

  static render(html) {
    const virtualDOM = new DOMParser().parseFromString(html, "text/html")
    Sidebar.renderProductGridContainer(virtualDOM)
    // Sidebar.renderFacets(virtualDOM)
  }

  static async renderSectionFromFetch(url) {
    const req = await fetch(url)
    const res = await req.text()
    const html = res
    // Sidebar.filterData = [...Sidebar.filterData, { html, url }];
    // Sidebar.renderFilters(html, event);
    this.filterData[url] = html
    Sidebar.render(html)
  }

  static renderProductGridContainer(virtualDOM) {
    const current = document.querySelector("#ProductGridContainer .collection")
    const newGrid = virtualDOM.querySelector("#ProductGridContainer .collection")

    // console.log(virtualDOM)
    // const sidebar = virtualDOM.querySelector('side-bar form')
    // this.sidebarForm.innerHTML = sidebar.innerHTML
    if (current && newGrid) current.replaceWith(newGrid)
  }

  static renderFacets(virtualDOM) {
    const current = document.querySelector('#ProductCountDesktop')
    const newForm = virtualDOM.querySelector('#ProductCountDesktop')
    if (current && newForm) current.replaceWith(newForm)
  }
  static getRoute(isUnique) {
    const uri = new URL(location.href)
    if (!isUnique) {
      uri.searchParams.delete('filter.p.tag')
    }
    const search = uri.search

    const parts = uri.pathname.split("/")
    const collection = parts[2]
    const tags = parts[3] || ""
    const getTags = () => parts[3] ? parts[3].split('+') : undefined
    return { collection, tags, search, getTags }
  }
  static generateURL(tagFilters, navigate = true, isUnique = true) {
    const { collection, search, tags } = Sidebar.getRoute(isUnique)

    let url
    if (isUnique) {
      url = `/collections/${collection}/${tagFilters}${search}`
    } else {
      url = `/collections/${collection}/${tags}?${tagFilters}${search.replace('?', '&')}`
    }

    console.log('Seteando URL', { url, navigate, isUnique })

    // Cambiar URL
    if (navigate) history.pushState({}, null, url)
    return url
  }
}

Sidebar.filterData = {}
customElements.define("side-bar", Sidebar)
