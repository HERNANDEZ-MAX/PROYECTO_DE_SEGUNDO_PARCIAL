const campoBusqueda = document.getElementById("buscar-productos");
const botonBuscar = document.getElementById("boton-buscar");
const botonLimpiar = document.getElementById("limpiar-busqueda");
const selectorCategoria = document.getElementById("filtrar-categoria");
const selectorDisponibilidad = document.getElementById("filtrar-disponibilidad");
const selectorOrden = document.getElementById("ordenar-productos");
const mensajeResultados = document.getElementById("resultado-busqueda");
const galeria = document.querySelector(".galeria");
const productos = Array.from(galeria.querySelectorAll(".producto"));
const ordenOriginal = new Map(productos.map((producto, indice) => [producto, indice]));
const filtrosRapidos = Array.from(document.querySelectorAll(".filtro-rapido"));
const contadorCatalogo = document.getElementById("contador-catalogo");
const totalProductos = document.getElementById("total-productos");

totalProductos.textContent = `${productos.length}+`;

function normalizarTexto(texto) {
    return texto
        .toLocaleLowerCase("es")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function obtenerPrecio(producto) {
    const textoInventario = producto.querySelector(".inventario").textContent;
    const precio = textoInventario.match(/Precio sugerido:\s*\$([\d,.]+)/);

    return precio ? Number(precio[1].replace(/,/g, "")) : Number.POSITIVE_INFINITY;
}

function obtenerCategoria(nombre) {
    const reglas = [
        ["juguetes", ["animalitos", "juguete", "carrito", "peluche", "pop ii"]],
        ["manualidades", ["unisel", "palillos", "pegamento", "silicon", "pincel", "pintura", "brillantina", "diamantes", "aluminio"]],
        ["escritura", ["boligrafo", "lapiz", "marcador", "plumon", "plumas", "colores", "gises", "goma"]],
        ["papel", ["cuaderno", "papel", "hojas", "folder", "forder", "carton", "monografia", "biografias", "post it", "post-it", "cubre hojas"]],
        ["oficina", ["calculadora", "cutter", "diurex", "grapadora", "regla", "memoria usb", "tijera"]]
    ];

    for (const [categoria, palabrasClave] of reglas) {
        if (palabrasClave.some((palabra) => nombre.includes(palabra))) {
            return categoria;
        }
    }

    return "otros";
}

const datosProductos = productos.map((producto) => {
    const textoInventario = normalizarTexto(producto.querySelector(".inventario").textContent);
    const piezas = textoInventario.match(/piezas disponibles:\s*(\d+)/);

    return {
        elemento: producto,
        nombre: normalizarTexto(producto.querySelector("h2").textContent),
        categoria: obtenerCategoria(normalizarTexto(producto.querySelector("h2").textContent)),
        disponible: !textoInventario.includes("agotado")
            && !textoInventario.includes("no disponible")
            && (!piezas || Number(piezas[1]) > 0)
    };
});

function actualizarProductos() {
    const consulta = normalizarTexto(campoBusqueda.value.trim());
    const categoriaSeleccionada = selectorCategoria.value;
    const disponibilidadSeleccionada = selectorDisponibilidad.value;

    let cantidadEncontrada = 0;
    datosProductos.forEach((producto) => {
        const coincideBusqueda = producto.nombre.includes(consulta);
        const coincideCategoria = categoriaSeleccionada === "todas"
            || producto.categoria === categoriaSeleccionada;
        const coincideDisponibilidad = disponibilidadSeleccionada === "todas"
            || (disponibilidadSeleccionada === "disponible" && producto.disponible)
            || (disponibilidadSeleccionada === "agotado" && !producto.disponible);
        const coincide = coincideBusqueda && coincideCategoria
            && coincideDisponibilidad;

        producto.elemento.hidden = !coincide;
        if (coincide) {
            cantidadEncontrada += 1;
        }
    });
    contadorCatalogo.textContent = `${cantidadEncontrada} ${cantidadEncontrada === 1 ? "producto" : "productos"}`;
    filtrosRapidos.forEach((filtro) => {
        const activo = filtro.dataset.categoria === categoriaSeleccionada;
        filtro.classList.toggle("activo", activo);
        filtro.setAttribute("aria-pressed", String(activo));
    });

    if (cantidadEncontrada === 0) {
        mensajeResultados.textContent = "No se encontraron productos con esos filtros.";
    } else if (
        consulta === ""
        && categoriaSeleccionada === "todas"
        && disponibilidadSeleccionada === "todas"
    ) {
        mensajeResultados.textContent = `Se muestran todos los productos (${cantidadEncontrada}).`;
    } else {
        mensajeResultados.textContent = `Se encontraron ${cantidadEncontrada} producto(s).`;
    }
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

botonBuscar.addEventListener("click", actualizarProductos);
campoBusqueda.addEventListener("input", actualizarProductos);
botonLimpiar.addEventListener("click", () => {
    campoBusqueda.value = "";
    selectorCategoria.value = "todas";
    selectorDisponibilidad.value = "todas";
    selectorOrden.value = "original";
    ordenarProductos();
    actualizarProductos();
    campoBusqueda.focus();
});
selectorOrden.addEventListener("change", ordenarProductos);
selectorCategoria.addEventListener("change", actualizarProductos);
selectorDisponibilidad.addEventListener("change", actualizarProductos);
filtrosRapidos.forEach((filtro) => {
    filtro.addEventListener("click", () => {
        selectorCategoria.value = filtro.dataset.categoria;
        actualizarProductos();
    });
});

contadorCatalogo.textContent = `${productos.length} productos`;
actualizarProductos();
