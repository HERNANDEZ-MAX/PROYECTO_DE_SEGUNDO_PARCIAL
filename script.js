const campoBusqueda = document.getElementById("buscar-productos");
const botonBuscar = document.getElementById("boton-buscar");
const botonLimpiar = document.getElementById("limpiar-busqueda");
const selectorOrden = document.getElementById("ordenar-productos");
const mensajeResultados = document.getElementById("resultado-busqueda");
const galeria = document.querySelector(".galeria");
const productos = Array.from(galeria.querySelectorAll(".producto"));
const ordenOriginal = new Map(productos.map((producto, indice) => [producto, indice]));

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

function obtenerPrecio(producto) {
    const textoInventario = producto.querySelector(".inventario").textContent;
    const precio = textoInventario.match(/Precio sugerido:\s*\$([\d,.]+)/);

    return precio ? Number(precio[1].replace(/,/g, "")) : Number.POSITIVE_INFINITY;
}

function ordenarProductos() {
    const orden = selectorOrden.value;
    const productosOrdenados = [...productos];

    productosOrdenados.sort((productoA, productoB) => {
        if (orden === "nombre") {
            return productoA.querySelector("h2").textContent.localeCompare(
                productoB.querySelector("h2").textContent,
                "es",
                { sensitivity: "base" }
            );
        }

        if (orden === "precio-asc") {
            return obtenerPrecio(productoA) - obtenerPrecio(productoB);
        }

        if (orden === "precio-desc") {
            return obtenerPrecio(productoB) - obtenerPrecio(productoA);
        }

        return ordenOriginal.get(productoA) - ordenOriginal.get(productoB);
    });

    productosOrdenados.forEach((producto) => galeria.appendChild(producto));
}

botonBuscar.addEventListener("click", buscarProductos);
campoBusqueda.addEventListener("input", buscarProductos);
botonLimpiar.addEventListener("click", () => {
    campoBusqueda.value = "";
    buscarProductos();
    campoBusqueda.focus();
});
selectorOrden.addEventListener("change", ordenarProductos);
