// Función para calcular la distancia de Levenshtein entre dos cadenas
function levenshtein(a, b) {
    // Si una de las cadenas es vacía, se devuelve la longitud de la otra cadena
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    // Inicialización de la matriz para el algoritmo de Levenshtein
    var matrix = [];

    // Inicialización de la primera fila de la matriz
    var i;
    for (i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Inicialización de la primera columna de la matriz
    var j;
    for (j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Llenado de la matriz con la distancia de Levenshtein
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
    }

    // Devolución de la distancia de Levenshtein final
    return matrix[b.length][a.length];
}

// Función para eliminar acentos de una cadena
function eliminarAcentos(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}

// Función para verificar si un valor es numérico
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

// Función para convertir una cadena en un ArrayBuffer
function s2ab(s) { 
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf); 
    for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; 
    return buf;    
}

// Evento cuando el DOM ha cargado completamente
document.addEventListener('DOMContentLoaded', (event) => {
    // Obtener datos desde una URL
    fetch('https://deissms.github.io/nsiceps/nomenclador.json')
    .then(response => response.json())
    .then(data => {
        // Obtener categorías únicas
        let categories = [...new Set(data.map(item => item.modulo))];
        let selectElement = document.getElementById('categoria');

        // Crea opciones para el elemento de selección (dropdown)
        categories.forEach(category => {
            let optionElement = document.createElement('option');
            optionElement.value = category;
            optionElement.textContent = category;
            selectElement.appendChild(optionElement);
        });

        // Evento cuando se ingresa texto en la búsqueda
        document.getElementById('busqueda').addEventListener('input', function(e) {
            document.getElementById('categoria').value = '';
        });

        // Evento cuando se cambia la categoría seleccionada
        document.getElementById('categoria').addEventListener('change', function(e) {
            document.getElementById('busqueda').value = '';
        });

        // Evento cuando se envía el formulario de búsqueda
        document.getElementById('buscador').addEventListener('submit', function(e) {
            e.preventDefault();

            // Evento para descargar resultados como archivo Excel
            document.getElementById('descargar-resultados').addEventListener('click', function() {
            });

            // Descarga el nomenclador completo como archivo Excel
            document.getElementById('descargar-consolidado').addEventListener('click', function() {
            });
        });
    })
    .catch(error => console.error('Error:', error));

    // Abre una nueva ventana con información sobre prestaciones
    document.getElementById('prestaciones').addEventListener('click', function(e) {
        e.preventDefault();
        window.open('prestaciones.html', '_blank');
    });

    // Abre una nueva ventana con información sobre las leyes
    document.getElementById('leyes').addEventListener('click', function(e) {
        e.preventDefault();
        window.open('leyes.html', '_blank');
    });
});
