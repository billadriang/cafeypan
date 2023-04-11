/**
 * Librerías de haciendola
 * Esta es la clase principal que centraliza las distintas librerías de Haciendola
 * Uso: Haciendola.registerLibrary("nombre_de_la_libreria",instancia) // El 2do parámetro es la instancia de una clase, esta justamente es la librería en cuestión
 *
 * Haciendola.nombre_de_la_librería.usarMetodo() // Será la forma de acceso y uso de la librería en cuestión.
 */

window.Haciendola = new (class {
  constructor() {}

  registerLibrary(name, library) {
    this[name] = library
  }
})()
