/**
* Customizer Library
* Permite manejar eventos del designmode
* Pre-requisitos: Los elementos deben tener su respectivo {{ block.shopify_attributes}}

* USO:
* Haciendola.customizer.subscribe(sectionElement); // Entiendase elemento como la sección
* sectionElement.customizerEvent("select", callback); // "select" es el evento a escuchar. Callback es lo que sucederá cuando se dispare el evento
* bloque.customizerEvent("select", callback); // "select" es el evento del bloque. Callback será lo que se ejecuta cuando suceda.

* NOTA PARA LIQUID:
- Los imports deben hacerse por funciones, no por sentencia import
  - Mal EJ:
    import Swiper from 'swiper.js'

  - Buen EJ:
    const {Swiper} = await import('swiper.js')

*/

const Queue = new (class {
  constructor() {
    this.queue = {}
    this.SECTION_FIELD = '__sectionEvents'
  }
  addToSection({ sectionID, event, payload }) {
    if (!this.queue[sectionID])
      this.queue[sectionID] = { [this.SECTION_FIELD]: {} }
    this.queue[sectionID][this.SECTION_FIELD][event] = payload
  }
  getSectionEvent({ sectionID, event }) {
    if (!this.queue[sectionID]) return
    return this.queue[sectionID][this.SECTION_FIELD][event]
  }
  addToBlock({ sectionID, blockID, event, payload }) {
    if (!this.queue[sectionID]) this.queue[sectionID] = {}
    if (!this.queue[sectionID][blockID]) this.queue[sectionID][blockID] = {}
    for (let blockName in this.queue[sectionID]) {
      if (blockName === this.SECTION_FIELD) continue
      delete this.queue[sectionID][blockName][event]
    }
    this.queue[sectionID][blockID][event] = payload
  }
  getBlockEvent({ sectionID, blockID, event }) {
    if (!this.queue[sectionID]) return
    if (!this.queue[sectionID][blockID]) return
    if (!this.queue[sectionID][blockID][event]) return
    return this.queue[sectionID][blockID][event]
  }
})()

class CustomizerClass {
  constructor() {
    this.sections = {}
    this._queue = {}
    this._await = {}

    this.initListeners()
  }
  loadScripts(target) {
    const scripts = target.querySelectorAll('script')
    scripts.forEach(sc => {
      const src = sc.getAttribute('src')
      if (!src) {
        eval(sc.textContent)
        return
      }
      fetch(sc.src)
        .then(src => src.text())
        .then(code => eval(code))
    })
  }
  makeSectionEvent({ detail, target }, EVENT_NAME) {
    const section = this.sections[detail.sectionId]
    const payload = { detail, target, subscriber: section.element }
    const event = {
      sectionID: detail.sectionId,
      event: EVENT_NAME,
      payload: payload,
    }

    if (!section) return Queue.addToSection(event)

    const listeners = section._events[EVENT_NAME]
    if (!listeners) return Queue.addToSection(event)
    listeners.forEach(callback => callback(payload))
  }
  initListeners() {
    if (!Shopify.designMode) return

    document.addEventListener('shopify:section:load', ({ detail, target }) => {
      this.loadScripts(target)
      if (this._queue[detail.sectionId]) this._queue[detail.sectionId]()

      this.makeSectionEvent({ detail, target }, 'load')
    })

    document.addEventListener('shopify:section:unload', event => {
      this.makeSectionEvent(event, 'unload')
    })

    document.addEventListener('shopify:section:select', event => {
      this.makeSectionEvent(event, 'select')
    })

    document.addEventListener('shopify:section:deselect', event => {
      this.makeSectionEvent(event, 'deselect')
    })

    document.addEventListener('shopify:section:reorder', event => {
      this.makeSectionEvent(event, 'reorder')
    })

    document.addEventListener('shopify:block:select', ({ detail, target }) => {
      const EVENT_NAME = 'select'
      const section = this.sections[detail.sectionId]
      const payload = {
        detail,
        target,
        subscriber: section ? section.element : false,
      }
      const event = {
        sectionID: detail.sectionId,
        blockID: detail.blockId,
        event: EVENT_NAME,
        payload,
      }

      if (!section) return Queue.addToBlock(event)

      const listeners = section._blockEvents[detail.blockId][EVENT_NAME]
      if (listeners) {
        listeners.forEach(callback => callback(payload))
        return
      }
      Queue.addToBlock(event)
    })

    document.addEventListener(
      'shopify:block:deselect',
      ({ detail, target }) => {
        const EVENT_NAME = 'deselect'
        const section = this.sections[detail.sectionId]
        const payload = {
          detail,
          target,
          subscriber: section ? section.element : false,
        }
        const event = {
          sectionID: detail.sectionId,
          blockID: detail.blockId,
          event: EVENT_NAME,
          payload,
        }

        if (!section) return Queue.addToBlock(event)

        const listeners = section._blockEvents[detail.blockId][EVENT_NAME]
        if (listeners) {
          listeners.forEach(callback => callback(payload))
          return
        }
        Queue.addToBlock(event)
      }
    )
  }

  getAttributes(element) {
    if (!Shopify.designMode) return
    const block = element.getAttribute('data-shopify-editor-block')
    if (block) return { ...JSON.parse(block), itemType: 'block' }
    const section = element.closest(`[data-shopify-editor-section]`)
    if (!section) return {}
    const sectionData = section.getAttribute('data-shopify-editor-section')
    return { ...JSON.parse(sectionData), itemType: 'section' }
  }

  prepare({ section, element }) {
    const blocks = [...element.querySelectorAll('[data-shopify-editor-block]')]
    const sectionTree = {
      blocks,
      element,
      _blockEvents: {},
      _events: {},
    }
    blocks.forEach(block => {
      const data = Haciendola.customizer.getAttributes(block)
      block.dataset.designer_section_parent = section.id
      sectionTree._blockEvents[data.id] = {}
    })

    this._await[section.id] = new Promise(s => {
      const resolve = () => {
        delete Haciendola.customizer.sections[section.id]
        Haciendola.customizer.sections[section.id] = sectionTree
        s()
      }

      if (!this.sections[section.id]) return resolve()

      this._queue[section.id] = resolve
    })
  }

  subscribe(element) {
    if (!Shopify.designMode) return
    const section = this.getAttributes(element)
    if (section.itemType !== 'section')
      return console.error('El elemento no es una sección')

    this.prepare({ section, element })
  }
}

Haciendola.registerLibrary('customizer', new CustomizerClass())

Element.prototype.customizerEvent = async function (event, callback) {
  if (!Shopify.designMode) return

  const item = Haciendola.customizer.getAttributes(this)
  switch (item.itemType) {
    case 'block':
      const sectionID = this.dataset.designer_section_parent
      if (!sectionID) return
      await Haciendola.customizer._await[sectionID]

      let events =
        Haciendola.customizer.sections[sectionID]._blockEvents[item.id][event]
      if (!events) {
        Haciendola.customizer.sections[sectionID]._blockEvents[item.id][event] =
          []
      }
      Haciendola.customizer.sections[sectionID]._blockEvents[item.id][
        event
      ].push(callback)

      const lastEvent = Queue.getBlockEvent({
        sectionID: sectionID,
        blockID: item.id,
        event,
      })
      if (lastEvent) callback(lastEvent)
      break

    case 'section':
      if (Haciendola.customizer._await[item.id])
        await Haciendola.customizer._await[item.id]
      const eventsSection =
        Haciendola.customizer.sections[item.id]?._events[event]
      if (!eventsSection)
        Haciendola.customizer.sections[item.id]._events[event] = []
      Haciendola.customizer.sections[item.id]?._events[event].push(callback)
      const lastSectionEvent = Queue.getSectionEvent({
        sectionID: item.id,
        event: event,
      })
      if (lastEvent) callback(lastSectionEvent)
  }
}
