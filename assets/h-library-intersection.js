/**
 * Intersection Library
 * Permite detectar cuando el elemento entra/sale del viewport
 *
 * USO:
 * Haciendola.intersection.subscribe(element) // Suscribe el elemento del cual queremos enterarnos
 * element.addEventListener(Haciendola.intersection.Events.START, showCallback)
 * element.addEventListener(Haciendola.intersection.Events.END, hideCallback)
 *
 * Eventos disponibles:
 * Haciendola.intersection.Events.START: Cuando el elemento comenzó a ser intersectado (Haciendola:intersection:start)
 * Haciendola.intersection.Events.END: Cuando el elemento dejó de ser intersectado (Haciendola:intersection:end)
 */

const LIBRARY_NAME = 'intersection'
class IntersectionHandler {
  
  constructor() {
    this.options = {
      rootMargin: '0px',
      threshold: 0.4,
    }

    this.observer = new IntersectionObserver(
      this.intersectionListenerCallback,
      this.options
    )

    this.Events = {
      START: `Haciendola:${LIBRARY_NAME}:start`,
      END: `Haciendola:${LIBRARY_NAME}:end`,
    }

    // element.addEventListener('Haciendola:intersection:start', callback)
    this.intersectingStart = new Event(this.Events.START)
    // element.addEventListener('Haciendola:intersection:end', callback)
    this.intersectingEnd = new Event(this.Events.END)
  }

  intersectionListenerCallback = entries => {
    entries.forEach(entry =>
      entry.isIntersecting
        ? entry.target.dispatchEvent(this.intersectingStart)
        : entry.target.dispatchEvent(this.intersectingEnd)
    )
  }

  subscribe = ({ element, onStart, onEnd = null }) => {
    element.addEventListener(this.Events.START, () => {
      if (onEnd === null) this.observer.unobserve(element)
      onStart()
    })
    if (onEnd !== null) element.addEventListener(this.Events.END, onEnd)

    this.observer.observe(element)
  }
}

Haciendola.registerLibrary(LIBRARY_NAME, new IntersectionHandler())
