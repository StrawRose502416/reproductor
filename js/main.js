// Variables globales
var media, repro, bar, progress, bucle;

function start() {
    console.log("Iniciando reproductor...");
    
    // Obtener elementos del DOM
    media = document.getElementById("video");
    repro = document.getElementById("repro");
    bar = document.getElementById("bar");
    progress = document.getElementById("progress");
    
    // Verificar que los elementos existen
    if (!media || !repro || !bar || !progress) {
        console.error("No se encontraron todos los elementos necesarios");
        return;
    }
    
    // Verificar soporte de video
    verificarSoporteVideo();
    
    // Event listeners
    repro.addEventListener("click", clicking, false);
    bar.addEventListener("click", moving, false);
    
    // Evento cuando el video termina
    media.addEventListener("ended", function() {
        console.log("Video terminado");
        repro.innerHTML = "Play";
        repro.className = "btn btn-primary";
        progress.style.width = "0%";
        clearInterval(bucle);
    }, false);
    
    // Evento de error
    media.addEventListener("error", function(e) {
        console.error("Error en el video:", e);
        mostrarErrorVideo();
    }, false);
    
    // Evento cuando el video puede reproducirse
    media.addEventListener("canplay", function() {
        console.log("Video listo para reproducir");
        console.log("Duración:", media.duration, "segundos");
    }, false);
    
    // Evento cuando se carga metadata
    media.addEventListener("loadedmetadata", function() {
        console.log("Metadata cargada - Duración:", media.duration);
    }, false);
}

function verificarSoporteVideo() {
    console.log("=== Verificando soporte de formatos ===");
    
    // Verificar MP4
    var soportaMP4 = media.canPlayType('video/mp4');
    console.log("MP4: " + (soportaMP4 ? soportaMP4 : "No soportado"));
    
    // Verificar OGV
    var soportaOGV = media.canPlayType('video/ogg');
    console.log("OGV: " + (soportaOGV ? soportaOGV : "No soportado"));
    
    // Mostrar fuentes disponibles
    var sources = media.getElementsByTagName('source');
    console.log("Fuentes de video disponibles:", sources.length);
    for (var i = 0; i < sources.length; i++) {
        console.log("Fuente " + (i+1) + ":", sources[i].src, "Tipo:", sources[i].type);
    }
}

function mostrarErrorVideo() {
    var error = media.error;
    if (error) {
        switch(error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
                alert("La reproducción fue abortada");
                break;
            case MediaError.MEDIA_ERR_NETWORK:
                alert("Error de red al cargar el video");
                break;
            case MediaError.MEDIA_ERR_DECODE:
                alert("Error al decodificar el video - formato no compatible");
                break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                alert("Formato de video no soportado. Asegúrate de tener un archivo MP4 válido en la carpeta 'videos/'");
                console.error("URL del video:", media.currentSrc || "No hay fuente válida");
                break;
            default:
                alert("Error desconocido al cargar el video");
        }
    }
}

function clicking() {
    console.log("Botón clickeado. Estado actual - Pausado:", media.paused, "Terminado:", media.ended);
    
    if (media.paused || media.ended) {
        // Intentar reproducir
        var playPromise = media.play();
        
        if (playPromise !== undefined) {
            playPromise.then(function() {
                console.log("Reproducción iniciada");
                repro.innerHTML = "Pause";
                repro.className = "btn btn-warning";
                if (bucle) clearInterval(bucle);
                bucle = setInterval(status, 50);
            }).catch(function(error) {
                console.error("Error al reproducir:", error);
                alert("No se pudo reproducir el video. Verifica que el archivo existe en la carpeta 'videos/'");
            });
        }
    } else {
        console.log("Pausando video");
        media.pause();
        repro.innerHTML = "Play";
        repro.className = "btn btn-primary";
        clearInterval(bucle);
    }
}

function status() {
    if (!media.ended && media.duration && !isNaN(media.duration)) {
        var porcentaje = (media.currentTime / media.duration) * 100;
        progress.style.width = porcentaje + "%";
        
        // Debug opcional (cada 1 segundo)
        if (Math.floor(media.currentTime) % 1 === 0 && media.currentTime > 0) {
            console.log("Tiempo:", media.currentTime, "/", media.duration, "(" + porcentaje.toFixed(1) + "%)");
        }
    }
}

function moving(event) {
    // Obtener la posición del clic
    var rect = bar.getBoundingClientRect();
    var clickX = event.clientX - rect.left;
    var porcentaje = clickX / rect.width;
    
    // Calcular y actualizar tiempo
    var nuevoTiempo = porcentaje * media.duration;
    if (!isNaN(nuevoTiempo) && isFinite(nuevoTiempo)) {
        media.currentTime = nuevoTiempo;
        progress.style.width = porcentaje * 100 + "%";
        console.log("Saltando a:", nuevoTiempo, "segundos");
    }
}

// Iniciar cuando la página cargue
window.addEventListener("load", start, false);