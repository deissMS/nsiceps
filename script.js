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

document.addEventListener('DOMContentLoaded', (event) => {
    fetch('https://deissms.github.io/nsiceps/nomenclador.json')
    .then(response => response.json())
    .then(data => {
        let modulos = [...new Set(data.map(item => item.modulo))];
        let selectElement = document.getElementById('modulo');
        modulos.forEach(modulo => {
            let optionElement = document.createElement('option');
            optionElement.value = modulo;
            optionElement.textContent = modulo;
            selectElement.appendChild(optionElement);
        });

        document.getElementById('busqueda').addEventListener('input', function(e) {
            document.getElementById('modulo').value = '';
        });

        document.getElementById('modulo').addEventListener('change', function(e) {
            document.getElementById('busqueda').value = '';
        });
        
        document.getElementById('buscador').addEventListener('submit', function(e) {
            e.preventDefault();
            document.getElementById('texto-seccion').innerHTML = ''; // limpia los resultados anteriores
            var valorBuscado = eliminarAcentos(document.getElementById('busqueda').value.toLowerCase());
            var valorCategoria = document.getElementById('modulo').value;

            var resultado = data.filter(function(obj) {
                let prestacionNormalizada = eliminarAcentos(obj.prestacion.toLowerCase());
                let moduloNormalizado = eliminarAcentos(obj.modulo.toLowerCase());

                if (valorBuscado !== "") {
                    if (nombreNormalizado.includes(valorBuscado) || categoriaNormalizada.includes(valorBuscado)) {
                        return true;
                    }
                
                    for (let i = 0; i <= nombreNormalizado.length - valorBuscado.length; i++) {
                        const segmento = nombreNormalizado.substr(i, valorBuscado.length);
                        if (levenshtein(segmento, valorBuscado) <= 4) {
                            return true;
                        }
                    }
                    return false;
                }
                 else {
                    return obj.modulo === valorCategoria;
                }
            });

            if (resultado.length > 0) {
                document.getElementById('texto-seccion').style.display = 'block';
                var aranceles = resultado.map(function(obj) {
                    var arancelText; // Cambiar 'coberturaText' por 'arancelText'
                    if (isNumeric(obj.arancel)) { // Cambiar 'cobertura' por 'arancel'
                      arancelText = (obj.arancel * 100) + '%';
                    } else {
                    arancelText = obj.arancel; // Cambiar 'cobertura' por 'arancel'
                    }
                    return '<p class="nombre-resultado">'+ obj.prestacion +'</p>' + // Cambiar 'nombre' por 'prestacion'
                        '<p class="resultado">Modulo: ' + obj.modulo + '</p>' + // Cambiar 'CategorÍa' por 'Modulo' y 'categoria' por 'modulo'
                        '<p class="resultado">Submodulo: ' + obj.submodulo + '</p>' + // Cambiar 'SubcategorÍa' por 'Submodulo' y 'subcategoria' por 'submodulo'
                        '<p class="resultado">Código que la incluye: ' + obj.codigo + '</p>' + // Cambiar 'Normativa' por 'Código' y 'norma' por 'codigo'
                        '<p class="resultado"><b>Nivel de arancel: ' + arancelText + '</b></p>' + // Cambiar 'Nivel de cobertura' por 'Nivel de arancel' y 'coberturaText' por 'arancelText'
                        '<p class="resultado">Observaciones de uso: ' + obj.observaciones + '</p>'; // Cambiar 'Recomendaciones' por 'Observaciones' y 'recomendaciones' por 'observaciones'
                });

                var tituloResultado = resultado.length === 1 ? "Resultado de la búsqueda: 1 prestación encontrada" : "Resultado de la búsqueda: " + resultado.length + " prestaciones encontradas";

                document.getElementById('texto-seccion').innerHTML = `
                <div class="acciones">
                    <button id="descargar-resultados" class="boton-accion">Descargar Resultados</button>
                    <button id="descargar-consolidado" class="boton-accion">Descargar Canasta Prestacional</button>
                    <button id="ver-legislacion" class="boton-accion">Ver legislación</button>
                </div>
                <h2 class="titulo-resultado">${tituloResultado}</h2>
                <p class="subtitulo-resultado">En caso de que las prestaciones se brinden en modalidad de internación, el Anexo I de la Resolución 201/2002 MS del PMO establece que la cobertura de las mismas deberá ser del 100%. 
                Para aquellos casos en donde las prestaciones sean ambulatorias, y con excepción de aquellas en donde la legislación establece un nivel de cobertura explícito, los financiadores tienen permitido el cobro de un coseguro. 
                Podés ver los valores de coseguros máximos autorizados por la Superintendencia de Servicios de Salud <a class="links" href="https://www.argentina.gob.ar/sssalud/valores-coseguros" target="_blank" rel="noopener">haciendo clic aquí</a>.</p>
                ` + coberturas.join('<hr>');

                document.getElementById('descargar-consolidado').addEventListener('click', function() {
                  window.location.href = 'data/consolidado.xlsx'; // Cambiar la ruta del archivo si es necesario
                });

                document.getElementById('ver-legislacion').addEventListener('click', function() {
                    window.open('legislacion.html', '_blank');
                    });
                    
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
                        isNumeric(obj.arancel) ? (obj.arancel * 100) + '%' : obj.arancel,
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

document.getElementById('prestaciones').addEventListener('click', function(e) {
    e.preventDefault();
    window.open('prestaciones.html', '_blank');
});

document.getElementById('leyes').addEventListener('click', function(e) {
    e.preventDefault();
    window.open('leyes.html', '_blank');
});

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
