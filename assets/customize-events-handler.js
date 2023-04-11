window.Designer = new class {
  constructor() {
    this.sections = {}
    this._queue = {}
    this._await = {}

    this.initListeners()
  }

  initListeners() {
    if (!Shopify.designMode) return

    document.addEventListener('shopify:section:load', ({ detail, target }) => {
      if(this._queue[detail.sectionId]) this._queue[detail.sectionId]()

      const section = this.sections[detail.sectionId]
      if (!section) return


      const listeners = section._events['load']
      if (listeners) listeners.forEach(callback => callback({detail, target, subscriber: section.element}))
      // delete this.sections[detail.sectionId]
    })

    document.addEventListener('shopify:section:unload', ({ detail, target }) => {
        const section = this.sections[detail.sectionId]
        if (!section) return
        const listeners = section._events['unload']
        if (listeners) listeners.forEach(callback => callback({detail, target, subscriber: section.element}))
      }
    )

    document.addEventListener('shopify:section:select', ({ detail, target }) => {
      const section = this.sections[detail.sectionId]
      if (!section) return
      const listeners = section._events['select']
      if (listeners) listeners.forEach(callback => callback({detail, target, subscriber: section.element}))
    })

    document.addEventListener('shopify:section:deselect', ({ detail }) => {
      const section = this.sections[detail.sectionId]
      if (!section) return
      const listeners = section._events['deselect']
      if (listeners) listeners.forEach(callback => callback({detail, target, subscriber: section.element}))
    })

    document.addEventListener('shopify:section:reorder', ({ detail, target }) => {
      const section = this.sections[detail.sectionId]
      if (!section) return
      const listeners = section._events['reorder']
      if (listeners) listeners.forEach(callback => callback({detail, target, subscriber: section.element}))
    })

    document.addEventListener('shopify:block:select', ({ detail, target }) => {
      const section = this.sections[detail.sectionId]
      if (!section) return
      const listeners = section._blockEvents[detail.blockId]['select']
      if (listeners) listeners.forEach(callback => callback({detail, target, subscriber: section.element}))
    })

    document.addEventListener('shopify:block:deselect', ({ detail, target }) => {
      const section = this.sections[detail.sectionId]
      if (!section) return
      const listeners = section._blockEvents[detail.blockId]['deselect']
      if (listeners) listeners.forEach(callback => callback({detail, target, subscriber: section.element}))
    })
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

  prepare({section, element}) {
    const blocks = [...element.querySelectorAll('[data-shopify-editor-block]')]
    const sectionTree = {
      blocks,
      element,
      _blockEvents: {},
      _events: {}
    }
    blocks.forEach(block => {
      const data = Designer.getAttributes(block)
      block.dataset.designer_section_parent = section.id
      sectionTree._blockEvents[data.id] = {}
    })
    

    this._await[section.id] = new Promise(s => {
      const resolve = () => {
        delete Designer.sections[section.id]
        Designer.sections[section.id] = sectionTree
        s()
      }

      if(!this.sections[section.id]) return resolve()

      this._queue[section.id] = resolve
    })
  }

  subscribe(element) {
    if(!Shopify.designMode) return
    const section = this.getAttributes(element)
    if(section.itemType !== 'section') return console.error('El elemento no es una sección')

    this.prepare({section, element})
  }
}

Element.prototype.DesignerEvent = async function (event, callback) {
  if (!Shopify.designMode) return

  const item = Designer.getAttributes(this)
  
  switch (item.itemType) {
    case 'block':
      const sectionID = this.dataset.designer_section_parent
      if (!sectionID) return
      await Designer._await[sectionID]
      
      let events = Designer.sections[sectionID]._blockEvents[item.id][event]
      if (!events)
      Designer.sections[sectionID]._blockEvents[item.id][event] = []
      Designer.sections[sectionID]._blockEvents[item.id][event].push(callback)
      break

    case 'section':
      if(Designer._await[item.id]) await Designer._await[item.id]
      const eventsSection = Designer.sections[item.id]?._events[event]
      if (!eventsSection) Designer.sections[item.id]._events[event] = []
      Designer.sections[item.id]?._events[event].push(callback)
  }
}
