class IntersectionHandler {
  constructor() {
    this.options = {
      rootMargin: "0px",
      threshold: 0.6,
    };
    this.observer = new IntersectionObserver(
      this.intersectionListenerCallback,
      this.options
    );

    this.intersectingStart = new Event("intersectingStart");
    this.intersectingEnd = new Event("intersectingEnd");
  }

  intersectionListenerCallback = (entries) =>
    entries.forEach((entry) =>
      entry.isIntersecting
        ? entry.target.dispatchEvent(this.intersectingStart)
        : entry.target.dispatchEvent(this.intersectingEnd)
    );

  addListener = (
    element,
    intersectingStartCallback,
    intersectingEndCallback = null
  ) => {
    element.addEventListener("intersectingStart", intersectingStartCallback);
    if (intersectingEndCallback)
      element.addEventListener("intersectingEnd", intersectingEndCallback);
    this.observer.observe(element);
  };
}

window.IntersectionHandler = new IntersectionHandler();
