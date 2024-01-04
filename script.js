function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    var matrix = [];

    var i;
    for (i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    var j;
    for (j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
    }

    return matrix[b.length][a.length];
}

function eliminarAcentos(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function s2ab(s) { 
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf); 
    for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; 
    return buf;    
}

document.addEventListener('DOMContentLoaded', (event) => {
    fetch('https://deissms.github.io/nsiceps/nomenclador.json')
    .then(response => response.json())
    .then(data => {
        let categories = [...new Set(data.map(item => item.modulo))];
        let selectElement = document.getElementById('categoria');
        categories.forEach(category => {
            let optionElement = document.createElement('option');
            optionElement.value = category;
            optionElement.textContent = category;
            selectElement.appendChild(optionElement);
        });

        document.getElementById('busqueda').addEventListener('input', function(e) {
            document.getElementById('categoria').value = '';
        });

        document.getElementById('categoria').addEventListener('change', function(e) {
            document.getElementById('busqueda').value = '';
        });

        document.getElementById('buscador').addEventListener('submit', function(e) {
            e.preventDefault();
            let searchResult = document.getElementById('texto-seccion');
            searchResult.innerHTML = '';  // Limpiar resultados anteriores

            var valorBuscado = eliminarAcentos(document.getElementById('busqueda').value.toLowerCase());
            var valorCategoria = document.getElementById('categoria').value;

            var resultado = data.filter(function(obj) {
                let prestacionNormalizada = eliminarAcentos(obj.prestacion.toLowerCase());
                let moduloNormalizado = eliminarAcentos(obj.modulo.toLowerCase());
                let observacionesNormalizadas = obj.observaciones ? eliminarAcentos(obj.observaciones.toLowerCase()) : "";
                
                if (valorBuscado !== "") {
                    return prestacionNormalizada.includes(valorBuscado) ||
                    moduloNormalizado.includes(valorBuscado) ||
                    observacionesNormalizadas.includes(valorBuscado) || // Nueva condición para observaciones
                    levenshteinSearch(prestacionNormalizada, valorBuscado);                } else {
                    return obj.modulo === valorCategoria;
                }
            });

            if (resultado.length > 0) {
                document.getElementById('texto-seccion').style.display = 'block';
                var coberturas = resultado.map(function(obj) {
                    var arancelFormateado = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(obj.arancel);
                    
                    return '<p class="nombre-resultado">'+ obj.prestacion +'</p>' +
                        '<p class="resultado">Módulo: ' + obj.modulo + '</p>' +
                        '<p class="resultado">Submódulo: ' + obj.submodulo + '</p>' +
                        '<p class="resultado">Código: ' + obj.codigo + '</p>' +
                        '<p class="resultado"><b>Arancel: ' + arancelFormateado + '</b></p>' +
                        '<p class="resultado">Observaciones: ' + obj.observaciones + '</p>';
                });

                var tituloResultado = resultado.length === 1 ? "Resultado de la búsqueda: 1 prestación encontrada" : "Resultado de la búsqueda: " + resultado.length + " prestaciones encontradas";

                document.getElementById('texto-seccion').innerHTML = `
                <div class="acciones">
                    <button id="descargar-resultados" class="boton-accion">Descargar Resultados</button>
                    <button id="descargar-consolidado" class="boton-accion">Descargar Nomenclador SICEPS</button>
                    
                </div>
                <h2 class="titulo-resultado">${tituloResultado}</h2>
                ` + coberturas.join('<hr>'); //<button id="ver-legislacion" class="boton-accion">Ver legislación</button>

                document.getElementById('descargar-consolidado').addEventListener('click', function() {
                  window.location.href = 'data/nomenclador.xlsx'; // Cambiar la ruta del archivo si es necesario
                });

                //document.getElementById('ver-legislacion').addEventListener('click', function() {
                  //  window.open('legislacion.html', '_blank');
                   // });
                    
                document.getElementById('descargar-resultados').addEventListener('click', function() {
                  /* Crear un objeto de libro de trabajo */
                var wb = XLSX.utils.book_new();
                wb.Props = {
                    Title: "Resultados de la búsqueda",
                    Author: "Ministerio de Salud de la Nación",
                    CreatedDate: new Date()
                };

                  /* Crear una hoja de cálculo */
                wb.SheetNames.push("Resultados");

                  /* Convertir los datos a formato de hoja de cálculo */
                var ws_data = resultado.map(function(obj) {
                    return [
                        obj.prestacion,
                        obj.modulo,
                        obj.submodulo,
                        obj.codigo,
                        isNumeric(obj.arancel) ? `$${parseFloat(obj.arancel).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : obj.arancel,
                        obj.observaciones
                    ];
                });
                ws_data.unshift(["Prestación", "Modulo", "Submodulo", "Código", "Nivel de arancel", "Observaciones"]);

                var ws = XLSX.utils.aoa_to_sheet(ws_data);

                  /* Añadir la hoja de cálculo al libro de trabajo */
                wb.Sheets["Resultados"] = ws;

                  /* Guardar el libro de trabajo como archivo XLSX */
                var wbout = XLSX.write(wb, {bookType:'xlsx', type: 'binary'});
                saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), 'resultados.xlsx');
                });
            } else {
                alert('No se encontró el valor buscado');
            }
        });
    })
    .catch(error => console.error('Error:', error));
});

function levenshteinSearch(source, searchTerm) {
    for (let i = 0; i <= source.length - searchTerm.length; i++) {
        const segment = source.substr(i, searchTerm.length);
        if (levenshtein(segment, searchTerm) <= 4) {
            return true;
        }
    }
    return false;
}

document.getElementById('prestaciones').addEventListener('click', function(e) {
    e.preventDefault();
    window.open('prestaciones.html', '_blank');
});

document.getElementById('leyes').addEventListener('click', function(e) {
    e.preventDefault();
    window.open('leyes.html', '_blank');
});

