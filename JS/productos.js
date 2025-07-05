const URL_BASE = "https://yofibox.com/api_aura/archivos/";

let precio=document.getElementById('precios');
let Estado=document.getElementById('estado');
let Metros_cuadrados=document.getElementById('metroscuadrados');
let tipo=document.getElementById('tipos');
let Descripcion=document.getElementById('Descripcion');
let products_grid=document.getElementById('products_grid');
let ubicacion=document.getElementById("ubicaciones");
let content_img_flotante=document.getElementById("content_img_flotante");
let titulo=document.getElementById("titulo");
let articulos_all=[];

async function getproductos() {
    try {
        const respuesta = await axios.post(URL_BASE + "buscar_inventario.php");
        console.log('Respuesta del servidor:', respuesta.data);
        articulos_all = []; 
        
        respuesta.data.articulos.forEach(articulo => {
            let componente = {
                id: articulo.id_articulo,
                description: articulo.descripcion,
                type: articulo.tipo,
                location: articulo.ubicacion,
                category: articulo.tipo_de_propiedad,
                price: articulo.precio || 0,
                tamano: articulo.tamano+" m2" || '',
                imagenes: articulo.imagenes || '',
                moneda: articulo.moneda || '',
                nombre: articulo.nombre || '',
                vende_por_m2: articulo.vende_por_m2,
                image: articulo.imagenes && articulo.imagenes.includes('|') 
                    ? URL_BASE + articulo.imagenes.split('|')[0] 
                    : URL_BASE + (articulo.imagenes || '')
            };
            articulos_all.push(componente);
        });
        
        return articulos_all; // Retornamos el array de artículos
    } catch (error) {
        console.error("Error al obtener productos:", error);
        return [];
    }
}

function renderProducts() {
    if (!products_grid) {
        console.error('El elemento products_grid no existe');
        return;
    }

    products_grid.innerHTML = '';  
    if (articulos_all.length === 0) {
        products_grid.innerHTML = '<p>No hay productos disponibles</p>';
        return;
    }

    articulos_all.forEach(articulo => {
        let div_product = document.createElement('div');
        div_product.innerHTML = `
            <img src="${articulo.image}" alt="${articulo.nombre}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${articulo.nombre}</h3>
                <p class="product-price">${articulo.moneda} ${articulo.price.toLocaleString()}</p>
                <p class="product-type">${articulo.type}</p>
                <p class="product-location">${articulo.location}</p>
                <p class="product-category">${articulo.category}</p>
            </div>`;
        div_product.className = 'product-card';
        div_product.addEventListener("click", function(){
            // Asignar valores a los elementos del modal
            titulo.textContent = articulo.nombre;
            precio.textContent = articulo.price+" "+articulo.moneda+(articulo.vende_por_m2==1 ? " por m2" : "");
            Estado.textContent = "En "+ articulo.category;
            Metros_cuadrados.textContent = articulo.tamano;
            tipo.textContent = articulo.type;
            Descripcion.textContent = articulo.description;
            ubicacion.textContent=articulo.location;
            let imagenes= articulo.imagenes.includes('|')? articulo.imagenes.split('|') : [articulo.imagenes];
            
            for (let index = 0; index < content_img_flotante.childNodes.length; index++) {
                const element = content_img_flotante.childNodes[index];
                if(element.tagName === 'IMG') {
                    content_img_flotante.removeChild(element);
                }
            }
            for (let index = 0; index < imagenes.length; index++) {
                let elemento_imagen=document.createElement('img');
                elemento_imagen.src = URL_BASE + imagenes[index];
                elemento_imagen.alt = "imagen_producto";
                elemento_imagen.className = 'show_animate_img';
                content_img_flotante.appendChild(elemento_imagen);

            }
            // Mostrar el modal

            document.getElementById('modal_productos').style.display = 'flex';
        });
        products_grid.appendChild(div_product);
    });
}
function cambiar_img(direccion){
    let array = Array.from(content_img_flotante.getElementsByTagName('IMG'));
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        element.style.zIndex = "0";
        if(element.classList.contains('show_animate_img')) {
            element.classList.remove("show_animate_img");
            
            
            let siguiente_indice;
            if(index + direccion >= array.length) {
                siguiente_indice = 0;
            } else if(index + direccion < 0) {
                siguiente_indice = array.length - 1;
            } else {
                siguiente_indice = index + direccion;
            }
            
            array[siguiente_indice].classList.add("show_animate_img");
            array[siguiente_indice].style.zIndex = "10";
            break;
        }
    }
}

function buscarProductos(query) {
    const busqueda = query.toLowerCase().trim();
    const productosFiltrados = articulos_all.filter(articulo => 
        articulo.description.toLowerCase().includes(busqueda) ||
        articulo.type.toLowerCase().includes(busqueda) ||
        articulo.location.toLowerCase().includes(busqueda) ||
        articulo.category.toLowerCase().includes(busqueda)
    );
    renderizarProductosFiltrados(productosFiltrados);
}

function ordenarProductos(criterio) {
    let productosOrdenados = [...articulos_all];
    
    switch(criterio) {
        case 'price-low':
            productosOrdenados.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            productosOrdenados.sort((a, b) => b.price - a.price);
            break;
        case 'size':
            productosOrdenados.sort((a, b) => {
                const sizeA = parseFloat(a.tamano) || 0;
                const sizeB = parseFloat(b.tamano) || 0;
                return sizeB - sizeA;
            });
            break;
        case 'recent':
            productosOrdenados.sort((a, b) => b.id - a.id);
            break;
    }
    
    renderizarProductosFiltrados(productosOrdenados);
}

function renderizarProductosFiltrados(productos) {
    if (!products_grid) return;
    
    products_grid.innerHTML = '';
    
    if (productos.length === 0) {
        products_grid.innerHTML = '<p class="no-results">No se encontraron productos</p>';
        return;
    }

    productos.forEach(articulo => {
        let div_product = document.createElement('div');
        div_product.innerHTML = `
            <img src="${articulo.image}" alt="${articulo.description}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${articulo.description}</h3>
                <p class="product-price">${articulo.moneda} ${articulo.price.toLocaleString()}</p>
                <p class="product-type">${articulo.type}</p>
                <p class="product-location">${articulo.location}</p>
                <p class="product-category">${articulo.category}</p>
            </div>`;
        div_product.className = 'product-card';
        div_product.addEventListener("click", function(){
            // Asignar valores a los elementos del modal
            precio.textContent = articulo.price+" "+articulo.moneda+(articulo.vende_por_m2==1 ? " por m2" : "");
            Estado.textContent = "En "+ articulo.category;
            Metros_cuadrados.textContent = articulo.tamano;
            tipo.textContent = articulo.type;
            Descripcion.textContent = articulo.description;
            ubicacion.textContent=articulo.location;
            let imagenes= articulo.imagenes.includes('|')? articulo.imagenes.split('|') : [articulo.imagenes];
            
            for (let index = 0; index < content_img_flotante.childNodes.length; index++) {
                const element = content_img_flotante.childNodes[index];
                if(element.tagName === 'IMG') {
                    content_img_flotante.removeChild(element);
                }
            }
            for (let index = 0; index < imagenes.length; index++) {
                let elemento_imagen = document.createElement('img');
                elemento_imagen.src = URL_BASE + imagenes[index];
                elemento_imagen.alt = "imagen_producto";
                elemento_imagen.className = 'show_animate_img';
                content_img_flotante.appendChild(elemento_imagen);

            }
            // Mostrar el modal

            document.getElementById('modal_productos').style.display = 'flex';
        });
        products_grid.appendChild(div_product);
    });
}

function aplicarFiltros() {
    const filtros = {
        moneda: Array.from(document.querySelectorAll('#moneda input:checked')).map(el => el.value),
        tipo: Array.from(document.querySelectorAll('#tipo input:checked')).map(el => el.value),
        tipo_propiedad: Array.from(document.querySelectorAll('#tipo_propiedad input:checked')).map(el => el.value),
        precio: Array.from(document.querySelectorAll('#precio input:checked')).map(el => el.value),
        venta_m2: Array.from(document.querySelectorAll('#venta_m2 input:checked')).map(el => el.value)
    };

    const productosFiltrados = articulos_all.filter(articulo => {
        // Filtro moneda
        if (filtros.moneda.length) {
            const monedaMap = { MXN: 'mx', USD: 'us', EUR: 'eur' }; // Mapeo de monedas
            const monedaArticulo = articulo.moneda.toLowerCase();
            const coincideMoneda = filtros.moneda.some(moneda => monedaMap[moneda] === monedaArticulo);
            if (!coincideMoneda) return false;
        }

        // Filtro tipo de inmueble
        if (filtros.tipo.length && !filtros.tipo.includes(articulo.type)) return false;

        // Filtro tipo de operación (incluyendo renta/venta)
        if (filtros.tipo_propiedad.length) {
            if (articulo.category.includes('/')) {
                // Si el artículo tiene ambos tipos (renta/venta)
                const tiposArticulo = articulo.category.split('/');
                const coincideAlguno = filtros.tipo_propiedad.some(tipo => 
                    tiposArticulo.includes(tipo) || tipo === 'renta/venta'
                );
                if (!coincideAlguno) return false;
            } else {
                // Si el artículo tiene un solo tipo
                if (!filtros.tipo_propiedad.includes(articulo.category) && 
                    !filtros.tipo_propiedad.includes('renta/venta')) return false;
            }
        }

        // Filtro de precio
        if (filtros.precio.length) {
            const precio = parseFloat(articulo.price);
            const coincidePrecio = filtros.precio.some(rango => {
                const [min, max] = rango.split('-').map(Number);
                if (max === undefined) return precio >= min;
                return precio >= min && precio <= max;
            });
            if (!coincidePrecio) return false;
        }

        // Filtro venta por m2
        if (filtros.venta_m2.length && 
            !filtros.venta_m2.includes(articulo.vende_por_m2.toString())) return false;

        return true;
    });

    renderizarProductosFiltrados(productosFiltrados);
}

function inicializarFiltros() {
    document.querySelectorAll('.filter-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const contenido = document.getElementById(targetId);
            
            // Toggle clases active
            this.classList.toggle('active');
            contenido.classList.toggle('active');
        });
    });

    // Agregar eventos para los checkboxes
    document.querySelectorAll('.filter-content input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', aplicarFiltros);
    });
}

// Inicialización
document.addEventListener("DOMContentLoaded", async function() {
    try {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'block';
        
        await getproductos();
        renderProducts();
        inicializarFiltros(); // Agregar esta línea
        
        // Agregar listeners para búsqueda y ordenamiento
        const searchInput = document.getElementById('search-input');
        const sortSelect = document.getElementById('sort-select');

        searchInput?.addEventListener('input', (e) => {
            buscarProductos(e.target.value);
        });

        sortSelect?.addEventListener('change', (e) => {
            ordenarProductos(e.target.value);
        });
        
        // Agregar listeners para los filtros
        document.querySelectorAll('.filter-content input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', aplicarFiltros);
        });

        if (loading) loading.style.display = 'none';
    } catch (error) {
        console.error('Error durante la inicialización:', error);
    }
});

function cerrar_modal(event){
    if (event.target === event.currentTarget) {
        document.getElementById('modal_productos').style.display = 'none';
    }
}