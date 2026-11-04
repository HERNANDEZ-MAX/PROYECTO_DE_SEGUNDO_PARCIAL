const campoBusqueda = document.getElementById("buscar-productos");
const botonBuscar = document.getElementById("boton-buscar");
const mensajeResultados = document.getElementById("resultado-busqueda");
const productos = document.querySelectorAll(".producto");

function normalizarTexto(texto) {
    return texto
        .toLocaleLowerCase("es")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function buscarProductos() {
    const consulta = normalizarTexto(campoBusqueda.value.trim());
    let cantidadEncontrada = 0;

    productos.forEach((producto) => {
        const nombre = normalizarTexto(producto.querySelector("h2").textContent);
        const coincide = nombre.includes(consulta);

        producto.hidden = !coincide;
        if (coincide) {
            cantidadEncontrada += 1;
        }
    });

    if (consulta === "") {
        mensajeResultados.textContent = `Se muestran todos los productos (${cantidadEncontrada}).`;
    } else if (cantidadEncontrada === 0) {
        mensajeResultados.textContent = "No se encontraron productos con ese nombre.";
    } else {
        mensajeResultados.textContent = `Se encontraron ${cantidadEncontrada} producto(s).`;
    }
}

botonBuscar.addEventListener("click", buscarProductos);
campoBusqueda.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
        buscarProductos();
    }
});
