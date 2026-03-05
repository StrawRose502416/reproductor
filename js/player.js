class DropboxPlayer {
    constructor() {
        this.video = document.getElementById('videoPlayer');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.progressBar = document.getElementById('progress');
        this.bufferBar = document.getElementById('buffer');
        this.progressContainer = document.getElementById('progressBar');
        this.currentTimeSpan = document.getElementById('currentTime');
        this.durationSpan = document.getElementById('duration');
        this.volumeBtn = document.getElementById('volumeBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
        this.dropboxUrl = document.getElementById('dropboxUrl');
        this.loadVideoBtn = document.getElementById('loadVideoBtn');
        this.qualitySelector = document.getElementById('qualitySelector');
        
        this.isPlaying = false;
        this.isMuted = false;
        this.volume = 1;
        
        this.init();
    }
    
    init() {
        // Event listeners
        this.playPauseBtn.addEventListener('click', () => this.togglePlay());
        this.video.addEventListener('click', () => this.togglePlay());
        this.video.addEventListener('timeupdate', () => this.updateProgress());
        this.video.addEventListener('loadedmetadata', () => this.updateDuration());
        this.video.addEventListener('progress', () => this.updateBuffer());
        this.video.addEventListener('waiting', () => this.showLoading());
        this.video.addEventListener('canplay', () => this.hideLoading());
        this.video.addEventListener('error', (e) => this.handleError(e));
        
        this.progressContainer.addEventListener('click', (e) => this.seek(e));
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e));
        this.volumeBtn.addEventListener('click', () => this.toggleMute());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        this.loadVideoBtn.addEventListener('click', () => this.loadFromDropbox());
        
        // Ejemplos
        document.querySelectorAll('.example-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.dropboxUrl.value = e.target.dataset.url;
                this.loadFromDropbox();
            });
        });
        
        // Teclado
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Inicializar con el primer video
        setTimeout(() => this.loadFromDropbox(), 100);
    }
    
    convertDropboxUrl(url) {
        if (!url) return url;
        
        // Si es URL de Dropbox
        if (url.includes('dropbox.com')) {
            // Convertir www.dropbox.com a dl.dropboxusercontent.com
            url = url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
            
            // Cambiar dl=0 por dl=1 o raw=1
            if (url.includes('?dl=0')) {
                url = url.replace('?dl=0', '?dl=1');
            } else if (!url.includes('?dl=1') && !url.includes('raw=1')) {
                url = url + '?dl=1';
            }
        }
        
        return url;
    }
    
    loadFromDropbox() {
        let url = this.dropboxUrl.value.trim();
        
        if (!url) {
            this.showError('Por favor, ingresa una URL');
            return;
        }
        
        // Convertir URL de Dropbox
        url = this.convertDropboxUrl(url);
        
        console.log('Cargando video desde:', url);
        this.showLoading();
        
        // Limpiar fuentes anteriores
        while (this.video.firstChild) {
            this.video.removeChild(this.video.firstChild);
        }
        
        // Crear nueva fuente
        const source = document.createElement('source');
        source.src = url;
        source.type = this.getVideoType(url);
        this.video.appendChild(source);
        
        // Recargar video
        this.video.load();
        
        // Timeout para errores de carga
        this.loadTimeout = setTimeout(() => {
            if (this.video.readyState === 0) {
                this.showError('No se pudo cargar el video. Verifica la URL');
            }
        }, 10000);
    }
    
    getVideoType(url) {
        const extension = url.split('.').pop().toLowerCase();
        if (extension === 'mp4') return 'video/mp4';
        if (extension === 'ogv' || extension === 'ogg') return 'video/ogg';
        if (extension === 'webm') return 'video/webm';
        return 'video/mp4'; // Por defecto
    }
    
    togglePlay() {
        if (this.video.paused || this.video.ended) {
            this.play();
        } else {
            this.pause();
        }
    }
    
    play() {
        this.video.play()
            .then(() => {
                this.isPlaying = true;
                this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            })
            .catch(error => {
                console.error('Error al reproducir:', error);
                this.showError('Error al reproducir: ' + error.message);
            });
    }
    
    pause() {
        this.video.pause();
        this.isPlaying = false;
        this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
    
    updateProgress() {
        if (this.video.duration) {
            const percent = (this.video.currentTime / this.video.duration) * 100;
            this.progressBar.style.width = percent + '%';
            this.currentTimeSpan.textContent = this.formatTime(this.video.currentTime);
        }
    }
    
    updateDuration() {
        this.durationSpan.textContent = this.formatTime(this.video.duration);
        clearTimeout(this.loadTimeout);
        this.hideLoading();
    }
    
    updateBuffer() {
        if (this.video.buffered.length > 0) {
            const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1);
            const duration = this.video.duration;
            if (duration > 0) {
                const percent = (bufferedEnd / duration) * 100;
                this.bufferBar.style.width = percent + '%';
            }
        }
    }
    
    seek(e) {
        const rect = this.progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        this.video.currentTime = pos * this.video.duration;
    }
    
    setVolume(e) {
        this.volume = e.target.value;
        this.video.volume = this.volume;
        
        // Actualizar icono
        if (this.volume == 0) {
            this.volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            this.isMuted = true;
        } else if (this.volume < 0.5) {
            this.volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
            this.isMuted = false;
        } else {
            this.volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            this.isMuted = false;
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.video.muted = this.isMuted;
        
        if (this.isMuted) {
            this.volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            this.volumeSlider.value = 0;
        } else {
            this.volumeSlider.value = this.volume;
            this.setVolume({ target: this.volumeSlider });
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.video.requestFullscreen();
            this.fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            document.exitFullscreen();
            this.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    }
    
    handleKeyPress(e) {
        // Espacio para play/pause
        if (e.code === 'Space') {
            e.preventDefault();
            this.togglePlay();
        }
        
        // Flechas para navegar
        if (e.code === 'ArrowLeft') {
            this.video.currentTime -= 10;
        }
        
        if (e.code === 'ArrowRight') {
            this.video.currentTime += 10;
        }
        
        // M para mute
        if (e.code === 'KeyM') {
            this.toggleMute();
        }
        
        // F para fullscreen
        if (e.code === 'KeyF') {
            this.toggleFullscreen();
        }
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }
    
    showLoading() {
        this.loadingOverlay.style.display = 'flex';
        this.errorMessage.style.display = 'none';
    }
    
    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }
    
    showError(message) {
        console.error('Error:', message);
        this.errorText.textContent = message;
        this.errorMessage.style.display = 'block';
        this.loadingOverlay.style.display = 'none';
        clearTimeout(this.loadTimeout);
    }
    
    handleError(e) {
        let errorMsg = 'Error desconocido al cargar el video';
        
        if (this.video.error) {
            switch(this.video.error.code) {
                case MediaError.MEDIA_ERR_ABORTED:
                    errorMsg = 'La reproducción fue cancelada';
                    break;
                case MediaError.MEDIA_ERR_NETWORK:
                    errorMsg = 'Error de red. Verifica tu conexión';
                    break;
                case MediaError.MEDIA_ERR_DECODE:
                    errorMsg = 'Error al decodificar el video. Formato no compatible';
                    break;
                case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    errorMsg = 'Formato de video no soportado o URL incorrecta';
                    break;
            }
        }
        
        this.showError(errorMsg);
    }
}

// Iniciar el reproductor cuando la página cargue
document.addEventListener('DOMContentLoaded', () => {
    new DropboxPlayer();
});