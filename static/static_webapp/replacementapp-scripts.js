var nameMachine = '';
var idMachine = '';
var second_rest_int;
var url_Api = '/replacement/replacement_app';
var selectedLocation = {}; // Global variable to store location information


$(document).ready(function() {
    
    console.log("URLK!!!!!!!!");
    console.log(window.location.href);

    if(window.location.href.includes("busqueda_repuestos")){

     let  bu = sessionStorage.getItem("bu")
     let  tecnico = sessionStorage.getItem("tecnico")
     let  orden_trabajo = sessionStorage.getItem("orden_trabajo")


      document.getElementById('ordtrabajo').textContent  = "Orden de trabajo:" + orden_trabajo;
      document.getElementById('tecnico').textContent  = "Técnico: " + tecnico;
      
      console.log(tecnico);
      console.log(orden_trabajo);
      console.log(bu);
      console.log(sessionStorage.getItem("bu"))


    }
    $('#searchTable').DataTable({
        "searching": false,  // Desactiva la funcionalidad de búsqueda
        "lengthChange": true, // Desactiva la opción de cambiar la cantidad de filas a mostrar
        "pageLength": 10, // Establece la cantidad de filas visibles por defecto a 10
        "info": true, // Desactiva la información sobre el número de registros mostrados
        "paging": true, // Habilita la paginación
    });

    $('#resumenTable').DataTable({
        "searching": false,  // Desactiva la funcionalidad de búsqueda
        "lengthChange": true, // Desactiva la opción de cambiar la cantidad de filas a mostrar
        "pageLength": 10, // Establece la cantidad de filas visibles por defecto a 10
        "info": true, // Desactiva la información sobre el número de registros mostrados
        "paging": true, // Habilita la paginación
    });



    //const url_Api = window.location.origin; // o configura la URL específica de tu API


    $('.dropdown-item').click(function() {
        // Obtén el valor de data-value
        var businessUnitValue = $(this).data('value');
    
        // Imprime el valor seleccionado en la consola (puedes hacer cualquier otra acción con este valor)
        console.log('Business Unit Seleccionado: ' + businessUnitValue);
      });

      
});

function validateNumber(){
    const inputNumerico = document.getElementById('cantidad_item');
    const valor = event.target.value;
    const valorNumerico = valor.replace(/[^0-9]/g, ''); // Elimina caracteres no numéricos
    event.target.value = valorNumerico;
}


function codigobarras() {
    const modal = document.getElementById('barcodeModal');
    modal.style.display = 'block'; // Muestra el modal
    document.getElementById('barcodeInput').focus(); // Enfoca el campo para escanear código
}

// Función para cerrar el modal
function cerrarcodigobarras() {
    const modal = document.getElementById('barcodeModal');
    modal.style.display = 'none'; // Oculta el modal
}

// Función para poner el código de barras en el campo de texto desde el modal
function confirmarcodbarras() {
    const barcodeValue = document.getElementById('barcodeInput').value; // Obtiene el valor del input
    if (barcodeValue) {
        document.getElementById('repuesto').value = barcodeValue; // Asigna el valor al campo de descripción
    }
    cerrarcodigobarras(); // Cierra el modal después de poner el valor
    buscarProducto(); // Realiza la búsqueda inmediatamente después de poner el código de barras
}

// procesar el valor del código de barras directamente desde el input
function processBarcodeInput() {
    const barcodeValue = document.getElementById('barcodeInput').value;
    if (barcodeValue) {
        document.getElementById('repuesto').value = barcodeValue; // Asigna automáticamente el código escaneado al campo de texto
        buscarProducto(); // Llama a la búsqueda cuando el código es escaneado
    }
}

// Función para validar y realizar la búsqueda al ingresar texto en el campo
function checkBarcodeInput() {
    const repuesto = document.getElementById('repuesto').value;
    if (repuesto && repuesto.length >= 8) {  // Ajustar longitud según el tipo de código de barras
        buscarProducto(); // Realiza la búsqueda cuando el campo tiene valor
    }
}
 
// Función para buscar producto
function buscarProducto() {
    // Convertir unidad de mantenimiento a unidad de inventario primero
    BusinessUnit = sessionStorage.getItem("bu")
    console.log("RUL")
    console.log(`${url_Api}/unidadMantenimiento?businessUnit=${BusinessUnit}`)
    // Llamar a unidadMantenimiento para obtener la unidad de inventario correspondiente
    fetch(`${url_Api}/unidadMantenimiento?businessUnit=${BusinessUnit}`, { 
        method: 'GET'
    
    })
    .then(response => response.json())
    .then(data => {

        if (data && data.length > 0) {
            let inventoryUnit = data[0].inventoryUnit || data[0].codigoUnidad || data[0];
            console.log("Unidad de inventario obtenida:", inventoryUnit['uni_inventario']);
        // Continúa con la búsqueda de productos usando la unidad de inventario
        buscarProductoConUnidad(inventoryUnit['uni_inventario']);

        } else {
            console.error('No se recibieron datos de unidad de inventario');
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo obtener la unidad de inventario',
                confirmButtonText: 'Aceptar'
            });
        }
    })
}          
function buscarProductoConUnidad(inventoryUnit) {

    let carro = sessionStorage.getItem("carrito")  

    tableSearch = document.getElementById('searchTable')
    const tbody = tableSearch.querySelector('tbody');
    const filas = tbody.rows[0];
    var repuesto = document.getElementById('repuesto').value;

    if (repuesto.length <=5) {
        Swal.fire({
            icon: 'error',
            title: 'Caracteres insuficientes',
            text: 'Por favor, ingrese una cantidad de caracteres mayor en la barra busqueda para ayudarle con la consulta',
            confirmButtonText: 'Aceptar'
        });
        return;
    }
    if (!repuesto) {
        Swal.fire({
            icon: 'error',
            title: 'Campo vacío',
            text: 'Por favor, ingrese un repuesto para buscar',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    console.log(`Buscando producto con unidad de inventario: ${inventoryUnit}`);

    // Construir get para solicitar datos enviando repuesto y la unidad de mto
    fetch(`${url_Api}/buscarProducto?repuesto=${repuesto}&businessUnit=${inventoryUnit}`, {
        method: 'GET' // Realizamos una solicitud GET
    })
    .then(response => response.json()) 
    .then(data => {
        console.log('respuesta', data)
        // Verificamos si se recibieron filas en la respuesta
        if (data && data.length > 0) {
            // Si la tabla ya es un DataTable, la destruimos antes de reinicializarla
            if ($.fn.dataTable.isDataTable('#searchTable')) {
                $('#searchTable').DataTable().clear().destroy();
            }

            // Limpiar la tabla antes de agregar nuevas filas
            tbody.innerHTML = '';

            // Recorrer el arreglo de filas y agregar cada uno a la tabla
            data.forEach(function(fila) {
                agregarFilaTabla(fila.INV_ITEM_ID, fila.DESCR, fila.LOCATION, fila.QTY_AVAILABLE, fila.UNID_MEDIDA, fila.WH_ID, fila.UID,fila.UNAVAILABLE_QTY);
            });

            // Volver a inicializar el DataTable después de agregar los datos
            $('#searchTable').DataTable({
                // Aquí puedes agregar las configuraciones que desees para el DataTable
                paging: true,
                searching: false,
                ordering: true,
                info: true,
                // Otros parámetros de configuración si es necesario
            });

        } else {
            // Si no se recibieron resultados
            Swal.fire({
                icon: 'warning',
                title: 'No se encontraron resultados',
                text: 'No se encontraron productos para el repuesto buscado.',
                confirmButtonText: 'Aceptar'
            });
        }
    })
    .catch(error => {
        // Manejo de errores en caso de fallo en la solicitud
        console.error('Error al obtener los datos del servidor:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'Hubo un error al conectarse al servidor. Inténtelo de nuevo.',
            confirmButtonText: 'Aceptar'
        });
    });
}
// Función para agregar una fila a la tabla de búsqueda
function agregarFilaTabla(codigo, descripcion, ubicacion, cantDisponible, unidad, bodega, identificador, UNAVAILABLE_QTY ) {
    
    var tableBody = document.getElementById('searchTable_tbody');
    // Crear una nueva fila
    var newRow = document.createElement('tr');
    
    // Crear las celdas
    var codigoCell = document.createElement('td');
    var descripcionCell = document.createElement('td');
    var ubicacionCell = document.createElement('td');
    var cantDisponibleCell = document.createElement('td');
    var unidadCell = document.createElement('td');
    var cantRequeridaCell = document.createElement('td');

    codigoCell.setAttribute("data-bodega" , bodega);
    codigoCell.setAttribute("data-uid" , identificador);
    codigoCell.setAttribute("data-unavailableQty" , UNAVAILABLE_QTY);
    codigoCell.setAttribute("data-unidad", unidad);

    // Asignar los valores a las celdas
    codigoCell.textContent = codigo;
    descripcionCell.textContent = descripcion;
    ubicacionCell.textContent = ubicacion;
    cantDisponibleCell.textContent = cantDisponible;
    unidadCell.textContent = unidad;

    // Reducir tamaño letra de la tabla
    codigoCell.classList.add('table-texto');
    descripcionCell.classList.add('table-texto');
    ubicacionCell.classList.add('table-texto')
    cantDisponibleCell.classList.add('table-texto');
    unidadCell.classList.add('table-texto');
    
    // Crear el contenedor para los controles de cantidad
    var cantidadControlsDiv = document.createElement('div');
    cantidadControlsDiv.classList.add('cantidad-controls');
    cantidadControlsDiv.style.display = 'flex';
    cantidadControlsDiv.style.alignItems = 'center';
    
    // Crear los botones de cantidad requerida
    var decreaseButton = document.createElement('button');
    decreaseButton.type = 'button';
    decreaseButton.classList.add('decrease');
    decreaseButton.textContent = '-';
    decreaseButton.style.textAlign = 'center';
    decreaseButton.onclick = function() { updateQuantity(this, -1); };
    
    var input = document.createElement('input');
    input.type = 'number';
    input.classList.add('quantity-input');
    input.value = '0'; 
    input.min = '0';
    input.step = '0.01'; 
    input.style.textAlign = 'center';
    input.setAttribute('oninput', 'validateNumber(this)');
    
    var increaseButton = document.createElement('button');
    increaseButton.type = 'button';
    increaseButton.classList.add('decrease');
    increaseButton.textContent = '+';
    increaseButton.style.textAlign = 'center';
    increaseButton.onclick = function() { updateQuantity(this, 1); };
    
    // Agregar los botones al contenedor
    cantidadControlsDiv.appendChild(decreaseButton);
    cantidadControlsDiv.appendChild(input);
    cantidadControlsDiv.appendChild(increaseButton);
    
    
    // Añadir el contenedor a la celda
    cantRequeridaCell.appendChild(cantidadControlsDiv);
    
    // Añadir las celdas a la fila
    newRow.appendChild(codigoCell);
    newRow.appendChild(descripcionCell);
    newRow.appendChild(ubicacionCell);
    newRow.appendChild(cantDisponibleCell);
    newRow.appendChild(unidadCell);
    newRow.appendChild(cantRequeridaCell);
    
    // Agregar la nueva fila al cuerpo de la tabla
    tableBody.appendChild(newRow);
    
}


// Función para actualizar la cantidad cuando se hace clic en los botones
function updateQuantity(button, increment) {
    var input = button.parentNode.querySelector('.quantity-input');
    var currentValue = parseInt(input.value);
    console.log(currentValue)

    if (!isNaN(currentValue)) {
        var newValue = currentValue + increment;
        if (newValue >= 0) { // Cambié 1 por 0 para permitir que llegue a 0
            input.value = newValue;
        }
    }
}
// Función para validar el número ingresado (permitiendo decimales)
function validateNumber(input) {
    var value = input.value;
    var decimalRegex = /^\d*(\.\d{0,4})?$/; // cuatro decimales
    
    if (!decimalRegex.test(value)) {
        // Si el valor no es válido, se borra el campo o se ajusta al último valor válido
        input.setCustomValidity("Por favor ingresa un número válido con decimales.");
    } else {
        input.setCustomValidity("");
    }
}

// Función para actualizar la cantidad (al hacer clic en los botones + o -)
function updateQuantity(button, delta) {
    var input = button.parentElement.querySelector('.quantity-input');
    var currentValue = parseFloat(input.value);
    var newValue = currentValue + delta;

    // Asegurarse de que no sea menor que 0
    if (newValue >= 0) {
        input.value = newValue.toFixed(4); // Mantener dos decimales
    }
    console.log()
}


// Función modificada para añadir productos con cantidad > 0 a la tabla de resumen
function Añadir() {

    var tableBody = document.getElementById('searchTable');
    const tbody = tableBody.querySelector('tbody');
    const filas = tbody.rows;
    var productosSeleccionados = [];
    // Verificar que haya al menos una fila en la tabla de búsqueda
    if (tableBody.rows.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'No hay productos',
            text: 'Primero busque un producto',
            confirmButtonText: 'Aceptar'
        });
        return;
    }
    
    console.log("Filas en tabla de búsqueda:", filas); // Debug
    
    // Recorrer todas las filas de la tabla
    validacionCantidad = true;
    let productosConExceso = []; // Lista de productos con exceso de cantidad
    
    for (var i = 0; i < filas.length; i++) {
        var row = filas[i];
        // Obtener las celdas necesarias
        var cantidadRequeridaCampo = row.cells[5];
        var cantDisponible = parseInt(row.cells[3].textContent); // Asegúrate de que sea un número entero
        const cantidadRequerida = parseInt(cantidadRequeridaCampo.querySelector('input').value);
        var bodega = row.cells[0].getAttribute('data-bodega');
        var identificador = row.cells[0].getAttribute('data-uid');
        var unavailable_qty = row.cells[0].getAttribute('data-unavailableQty');

        
    
        // Mostrar valores para depuración
        console.log("cantidadRequerida:", cantidadRequerida);
        console.log("cantDisponible:", cantDisponible);
    
        // Verificar que la cantidad requerida sea mayor que 0
        if (cantidadRequerida > 0) {
            // Verificar que la cantidad requerida sea menor que la cantidad disponible
            if (cantidadRequerida > cantDisponible) {
                // Si la cantidad requerida es mayor que la disponible, agregar a la lista de excesos
                productosConExceso.push({
                    row: row,
                    producto: row.cells[1].textContent, // Descripción del producto
                    cantidadRequerida: cantidadRequerida,
                    cantDisponible: cantDisponible
                });
                // Pintar el campo de la cantidad en rojo
                cantidadRequeridaCampo.style.backgroundColor = 'red';
            } else {
                // Si la cantidad es válida, limpiar el color de fondo
                cantidadRequeridaCampo.style.backgroundColor = '';
            }
        } else {
            // Si la cantidad requerida es 0 o menor, también lo marcamos en rojo
            console.log("Error: La cantidad requerida para el producto", row.cells[1].textContent, "es menor o igual a 0.");
        }
    }
    
    // Si hay productos con exceso de cantidad, mostrar un popup
    if (productosConExceso.length > 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Algunos productos exceden la cantidad disponible',
            text: 'Por favor, valida los campos resaltados.',
            confirmButtonText: 'Aceptar'
        }).then(() => {
            // Después de aceptar el mensaje, los campos siguen en rojo para indicar el error.
        });
        return; // No permitir continuar hasta que se resuelvan los problemas
    }
    
    // Si todo está correcto, procesamos los productos seleccionados
    for (var i = 0; i < filas.length; i++) {
        var row = filas[i];
        var cantidadRequeridaCampo = row.cells[5];
        var cantDisponible = parseFloat(row.cells[3].textContent);
        const cantidadRequerida = parseFloat(cantidadRequeridaCampo.querySelector('input').value);
    
        if (cantidadRequerida > 0 && cantidadRequerida <= cantDisponible) {
            var codigo = row.cells[0].textContent;
            var descripcion = row.cells[1].textContent;
            var ubicacion = row.cells[2].textContent;
            var un = row.cells[4].textContent;
          
            var bodega = row.cells[0].getAttribute('data-bodega');  
            var identificador = row.cells[0].getAttribute('data-uid');
            var unavailable_qty = row.cells[0].getAttribute('data-unavailableQty');


            
            console.log("bodegaaaaaaaaaaaaaaa aqui") 
            console.log(bodega) 

            
            // Añadir el producto a la lista de seleccionados
            productosSeleccionados.push({
                codigo: codigo,
                descripcion: descripcion,
                cantidad: cantidadRequerida,
                ubicacion: ubicacion,
                bodega: bodega,  
                identificador: identificador ,
                unavailable_qty:unavailable_qty,
                disponible : cantDisponible,
                unidad:un
                
            });

        }
    }

    // Verificar si se seleccionaron productos válidos
    if (productosSeleccionados.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Ningún producto con cantidad válida',
            text: 'Por favor, asigne una cantidad mayor a cero y menor que la cantidad disponible a al menos un producto.',
            confirmButtonText: 'Aceptar'
        });
        return;
    }
      
    // Limpiar la tabla de búsqueda antes de añadir a resumen
    limpiarTablaIzquierda();
    // Verificamos si se recibieron filas en la respuesta
    var resumenTableBody = document.querySelector('#resumenTable_tbody');
    const filasResumen = resumenTableBody.rows;
    console.log (filasResumen.length)
    console.log (" holaaaaaaaa")
   
    
    
 if (filasResumen && filasResumen.length > 0) {
    console.log (" 111111")
    // Si la tabla ya es un DataTable, la destruimos antes de reinicializarla
    if ($.fn.dataTable.isDataTable('#resumenTable_tbody')) {
        console.log (" 2222")
        $('#resumenTable_tbody').DataTable().clear().destroy();
    }

    // Limpiar la tabla antes de agregar nuevas filas
    resumenTableBody.innerHTML = '';
}    


    
    // Añadir productos seleccionados a la tabla de resumen
    for (var j = 0; j < productosSeleccionados.length; j++) {
        var producto = productosSeleccionados[j];
        // Añadir ubicación al producto para mostrar en la tabla de resumen
        agregarProductoResumen(producto.descripcion, producto.codigo, producto.cantidad, producto.ubicacion, producto.bodega, producto.identificador, producto.disponible, producto.unavailable_qty , producto.unidad);
    }
}
 

// Función para agregar un producto a la tabla de resumen
function agregarProductoResumen(descripcion, codigo, cantidad, ubicacion, bodega, identificador ,disponible, reservado , unidad) {
    var resumenTableBody = document.querySelector('#resumenTable tbody');
    console.log (resumenTableBody)
    console.log (" jijijijijijiji tabla resumen ")
    if (!resumenTableBody) {
        console.error("No se encontró la tabla de resumen");
        return;
    }
        
    var newRow = document.createElement('tr');
    
    var descripcionCell = document.createElement('td');
    descripcionCell.textContent = descripcion;
    descripcionCell.classList.add('table-texto');
    
    var codigoCell = document.createElement('td');
    codigoCell.textContent = codigo;
    codigoCell.classList.add('table-texto');
    codigoCell.setAttribute("data-ubicacion", ubicacion);
    codigoCell.setAttribute("data-bodega", bodega);       
    codigoCell.setAttribute("data-uid", identificador);
    codigoCell.setAttribute("data-disponible", disponible);
    codigoCell.setAttribute("data-reservado", reservado);
    codigoCell.setAttribute("data-unidad", unidad);

    //var searchTable = document.getElementById('searchTable');
    //if (searchTable) {
    //    var searchRows = searchTable.querySelectorAll('tbody tr');
    //    for (var i = 0; i < searchRows.length; i++) {
    //        var row = searchRows[i];
    //        if (row.cells[0].textContent === codigo) {
    //            // Almacenar disponible, reservado y unidad como atributos
    //            codigoCell.setAttribute("data-disponible", row.cells[3].textContent);
    //            codigoCell.setAttribute("data-reservado", row.cells[0].getAttribute('data-unavailableQty'));
    //            codigoCell.setAttribute("data-unidad", row.cells[4].textContent);
    //            break;
    //        }
    //    }
    //}
    var cantidadCell = document.createElement('td');
    cantidadCell.textContent = parseFloat(cantidad).toFixed(4);
    cantidadCell.classList.add('table-texto');
    
    var eliminarCell = document.createElement('td');
    var deleteIcon = document.createElement('i');
    deleteIcon.classList.add('fa', 'fa-trash');
    deleteIcon.classList.add('table-texto');
    deleteIcon.style.cursor = 'pointer';
    deleteIcon.onclick = function() {
        eliminarProducto(newRow);
    };
 

    eliminarCell.appendChild(deleteIcon);
    
    newRow.appendChild(descripcionCell);
    newRow.appendChild(codigoCell);
    newRow.appendChild(cantidadCell);
    newRow.appendChild(eliminarCell);
    
    resumenTableBody.appendChild(newRow);
    console.log (newRow)
    console.log (" jijijijijijiji lineas agregadas ")
    
}

// Función para limpiar la tabla izquierda
function limpiarTablaIzquierda() {
    var tableBody = document.getElementById('searchTable_tbody');
    if (tableBody) {
        tableBody.innerHTML = ''; // Limpiar todas las filas de la tabla

    }
}

// Función para eliminar un producto de la tabla de resumen
function eliminarProducto(row) {
    if (row) {
        row.remove();
        console.log("Producto eliminado de tabla resumen");
    }
}

// Función para limpiar toda la tabla de resumen
function limpiar() {
    var resumenTableBody = document.querySelector('#resumenTable tbody');
    if (resumenTableBody) {
        resumenTableBody.innerHTML = '';
        console.log("Tabla resumen limpiada completamente");
    }
}

// Asegurarse de que el botón Añadir tenga un event listener
document.addEventListener('DOMContentLoaded', function() {
    var añadirButton = document.getElementById('btnAñadir');
    if (añadirButton) {
        añadirButton.addEventListener('click', Añadir);
        console.log("Event listener añadido al botón Añadir");
    }
});


let selectedBusinessUnit = "";
document.querySelectorAll('[id="BusinessUnit"]').forEach(item => {
    item.addEventListener('click', function(e) {
        selectedBusinessUnit = e.target.getAttribute('data-value');
        console.log("Selected BusinessUnit:", selectedBusinessUnit);
        
        document.querySelector('.dropdown-toggle').textContent = selectedBusinessUnit;
    });
});
$("#btn_buscar").click(function () {
    let orden_trabajo = document.getElementById('No_OrdenTrabajo').value;
    let codigo_kronos = document.getElementById('Cod_Kronos').value;

    console.log("Selected BusinessUnit at search:", selectedBusinessUnit);
    
    // Verify all required fields are filled and valid
    if (orden_trabajo !== "" && codigo_kronos !== "" &&
        Number.isInteger(parseInt(orden_trabajo)) && Number.isInteger(parseInt(codigo_kronos)) && selectedBusinessUnit !== "") {
  
        let endpoint = url_Api + '/searchOt?';
        endpoint += `orden_trabajo=${orden_trabajo}&codigo_kronos=${codigo_kronos}&businessunit=${selectedBusinessUnit}`;
        
        $.getJSON(endpoint)
        .done(function(data) {
            console.log("Respuesta recibida:", data);
            if (data && data.orden_trabajo && data.tecnico) {
              
                sessionStorage.setItem("bu", selectedBusinessUnit);
                sessionStorage.setItem("tecnico", data.tecnico);
                sessionStorage.setItem("orden_trabajo", data.orden_trabajo);
                sessionStorage.setItem("codigo_kronos", codigo_kronos);

                // Redireccionar a busqueda_seleccion.html
                window.location.href ='/replacement/replacement_app/busqueda_repuestos';
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Datos incompletos',
                    text: 'No se encontraron los datos solicitados.',
                    confirmButtonText: 'Aceptar'
                });
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            Swal.fire({
                icon: 'error',
                title: 'Información errada',
                text: 'Ingrese datos correctos',
                confirmButtonText: 'Aceptar'
            });
            console.error("Error:", textStatus, errorThrown, jqXHR);
        });

    } else {
        let errorMessage = "Ingrese datos correctos";

        if (selectedBusinessUnit === "") {
            errorMessage = "Debe seleccionar una sede.";
        }

        Swal.fire({
            icon: 'error',
            title: 'Información errada',
            text: errorMessage,
            confirmButtonText: 'Aceptar'
        });
    }
});

$("#btn_limpiar").click(function (){
   document.getElementById('No_OrdenTrabajo').value = "";
   document.getElementById('Cod_Kronos').value="";
});

function validarCampos(datos) {
    for (let i = 0; i < datos.length; i++) {
        const item = datos[i];
        if (!item.identificadorRegistro || !item.warehouse_id || !item.item_id || 
            !item.location_id || item.disponible === undefined || item.reservado === undefined || 
            !item.requerida || !item.uom) {
            return false;
        }
    }
    return true;
}

// Función para mostrar mensajes de éxito
function mostrarExito(mensaje, data) {
    Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: mensaje,
        confirmButtonText: 'Aceptar'
    }).then(() => {
        // Limpiar la tabla de resumen después de una operación exitosa
        limpiar();
    });
}


// Funciones de los botones de acción

document.addEventListener('DOMContentLoaded', function() {
    // Obtener referencia al botón Solicitar
    const btnSolicitar = document.getElementById('btnSolicitar');
    if (btnSolicitar) {
        // Eliminar event listeners anteriores para evitar duplicados
        btnSolicitar.removeEventListener('click', solicitar);
        // Añadir el nuevo event listener
        btnSolicitar.addEventListener('click', solicitar);
        console.log("Event listener añadido al botón Solicitar");
    } else {
        console.error("No se encontró el botón Solicitar");
    }
});

function solicitar() {
    // Obtener todos los productos de la tabla
    const productos = obtenerProductosDeResumen();
    console.log("datosss!!!");
    console.log(productos);
    if (productos.length === 0) {
        mostrarError('No se han agregado productos a la tabla.');
        return;
    }
    // Obtener el código Kronos de la sesión
    let codigo_kronos = sessionStorage.getItem("codigo_kronos") || document.getElementById('Cod_Kronos')?.value || "";
    // Preparar los datos para enviar al backend
    const datos = productos.map(producto => ({
        identificadorRegistro: producto.identificador,
        warehouse_id: producto.bodega,
        item_id: producto.codigo,
        location_id: producto.ubicacion,
        disponible: producto.disponible,  
        reservado: producto.reservado,   
        requerida: producto.cantidad,   
        uom: producto.unidad, 
        ARI_KRONOSCODE: codigo_kronos 
    })
    
);

    // Validar campos obligatorios (puedes ajustar esta parte si es necesario)
    if (!validarCampos(datos)) {
        mostrarError('Por favor, complete todos los campos obligatorios.');
        return;
        
    }

    // Llamar a la función que actualiza las cantidades
    actualizarCantidades(datos);
    console.log(datos)
}

// Función para obtener los productos de la tabla resumen
function obtenerProductosDeResumen() {
    const productos = [];
    const rows = document.querySelectorAll('#resumenTable tbody tr');
    console.log (rows)
    console.log ("se imprime las lineas rowwwwwwwsssssssssss")

    rows.forEach(row => {
      
        const codigo = row.cells[1].textContent;
        const cantidad = parseFloat(row.cells[2].textContent);
        const ubicacion = row.cells[1].getAttribute('data-ubicacion');
        const bodega = row.cells[1].getAttribute('data-bodega');
        const identificador = row.cells[1].getAttribute('data-uid');
        const disponible = row.cells[1].getAttribute('data-disponible') || "0";
        const reservado = row.cells[1].getAttribute('data-reservado') || "0";
        const unidad = row.cells[1].getAttribute('data-unidad') || "UN";
        console.log(rows)
        // Crear objeto para cada producto y agregarlo a la lista
        productos.push({
           
            codigo,
            cantidad,
            ubicacion,
            bodega,
            identificador,
            disponible: parseFloat(disponible),
            reservado: parseFloat(reservado),
            unidad
        });
    });
    console.log(productos)
    console.log("los productos son <-------------productos")
    
    
    return productos;
}

// Función para mostrar mensajes de error
// function mostrarError(mensaje) {
//     const resultadosDiv = document.getElementById('resultados');
//     const mensajeDiv = document.getElementById('mensajeResultado');
//     const datosDiv = document.getElementById('datosResultado');
    
//     resultadosDiv.style.display = 'block';
//     mensajeDiv.innerHTML = `<div class="alert alert-danger">${mensaje}</div>`;
//     datosDiv.textContent = '';
// }
// Función para actualizar cantidades
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};
function actualizarCantidades(datos) {
    // La URL sigue siendo la misma
    const url_Apia =`${url_Api}/actualizarCantidades`;
    console.log (url_Apia)
    console.log("la url es ---------------------------")

    // Mostrar indicador de carga
    const btnSolicitar = document.getElementById('btnSolicitar');
    const textoOriginal = btnSolicitar.textContent;
    btnSolicitar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';
    btnSolicitar.disabled = true;
    var csrftoken = getCookie('csrftoken');

    // Realizar la solicitud POST
    fetch(url_Apia, {
        method: 'POST',  
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(datos)  // Enviar los datos en el cuerpo de la solicitud
    })
    .then(response => {
        // Restaurar el botón
        btnSolicitar.innerHTML = textoOriginal;
        btnSolicitar.disabled = false;

        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.message || `Error en la respuesta: ${response.status}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Respuesta exitosa:', data);
        mostrarExito('La actualización se ha completado correctamente', data);
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarError(`Error: ${error.message}`);
        btnSolicitar.disabled = false;
    });
}

function cancelar() {
    Swal.fire({
        title: '¿Está seguro?',
        text: "¿Desea cancelar la operación?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            limpiar();
            document.getElementById('repuesto').value = '';
            limpiarTablaIzquierda();
        }
    });
}







