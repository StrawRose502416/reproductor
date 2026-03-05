var media, repro, bar, progress, bucle;

function start() {
    media = document.getElementById("video");
    repro = document.getElementById("repro");
    bar = document.getElementById("bar");
    progress = document.getElementById("progress");

    repro.addEventListener("click", clicking, false);
    bar.addEventListener("click", moving, false);
    
    // Evento cuando el video termina
    media.addEventListener("ended", function() {
        repro.innerHTML = "Play";
        repro.className = "btn btn-primary";
        progress.style.width = "0%";
        clearInterval(bucle);
    }, false);
    
    // Evento cuando hay error al cargar el video
    media.addEventListener("error", function() {
        console.error("Error al cargar el video. Formatos soportados:");
        console.log("MP4: " + (media.canPlayType('video/mp4') ? "Sí" : "No"));
        console.log("OGV: " + (media.canPlayType('video/ogg') ? "Sí" : "No"));
        
        // Mostrar mensaje al usuario
        alert("No se pudo cargar el video. Asegúrate de que el archivo existe en la carpeta 'videos/'");
    }, false);
    
    // Verificar qué formatos soporta el navegador (solo para depuración)
    console.log("Soporte de formatos:");
    console.log("MP4: " + (media.canPlayType('video/mp4') || "no"));
    console.log("OGV: " + (media.canPlayType('video/ogg') || "no"));
}

function clicking() {
    if (media.paused || media.ended) {
        // Intentar reproducir
        var playPromise = media.play();
        
        if (playPromise !== undefined) {
            playPromise.then(function() {
                // Reproducción exitosa
                repro.innerHTML = "Pause";
                repro.className = "btn btn-warning";
                if (bucle) clearInterval(bucle);
                bucle = setInterval(status, 50);
            }).catch(function(error) {
                // Error al reproducir
                console.error("Error al reproducir:", error);
                alert("No se pudo reproducir el video. Formato no soportado o archivo faltante.");
            });
        }
    } else {
        media.pause();
        repro.innerHTML = "Play";
        repro.className = "btn btn-primary";
        clearInterval(bucle);
    }
}

function status() {
    if (!media.ended && media.duration) {
        var porcentaje = (media.currentTime / media.duration) * 100;
        progress.style.width = porcentaje + "%";
    }
}

function moving(event) {
    // Obtener la posición del clic relativa a la barra
    var rect = bar.getBoundingClientRect();
    var clickX = event.clientX - rect.left;
    var porcentaje = clickX / rect.width;
    
    // Calcular el nuevo tiempo
    var nuevoTiempo = porcentaje * media.duration;
    
    // Actualizar tiempo del video
    if (!isNaN(nuevoTiempo)) {
        media.currentTime = nuevoTiempo;
        progress.style.width = porcentaje * 100 + "%";
    }
}

window.addEventListener("load", start, false);