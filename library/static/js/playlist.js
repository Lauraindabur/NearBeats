document.addEventListener('DOMContentLoaded', function () {
    // Obtener CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith(name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const token = getCookie('csrftoken') || csrftoken;

    // Elementos del DOM
    const searchInput = document.getElementById('songSearch');
    const clearSearchBtn = document.getElementById('clearSearch');
    const genreFilter = document.getElementById('genreFilter');
    const moodFilter = document.getElementById('moodFilter');
    const selectAll = document.getElementById('selectAll');
    const addSelectedBtn = document.getElementById('addSelectedBtn');
    const songsTableBody = document.getElementById('songsTableBody');
    const visibleCount = document.getElementById('visibleCount');
    const totalCount = document.getElementById('totalCount');
    const selectedCount = document.getElementById('selectedCount');
    const selectedNumber = document.getElementById('selectedNumber');

    let existingSongIds = [];
    let songsAddedDuringSession = 0;
    
    // Cargar IDs de canciones existentes
    function loadExistingSongIds() {
        try {
            const existingSongsElement = document.getElementById('songs-in-playlist');
            if (existingSongsElement) {
                existingSongIds = JSON.parse(existingSongsElement.textContent) || [];
            }
        } catch (error) {
            console.error('Error loading existing song IDs:', error);
            existingSongIds = [];
        }
    }

    // Marcar canciones ya agregadas
    function markExistingSongs() {
        existingSongIds.forEach(songId => {
            const rowBtn = document.querySelector(`.add-single-btn[data-song-id="${songId}"]`);
            const rowCb = document.querySelector(`.song-checkbox[value="${songId}"]`);
            
            if (rowBtn) {
                rowBtn.innerHTML = '✅ Ya agregada';
                rowBtn.classList.remove('btn-success');
                rowBtn.classList.add('btn-outline-secondary');
                rowBtn.disabled = true;
            }
            
            if (rowCb) {
                rowCb.checked = false;
                rowCb.disabled = true;
            }
        });
    }

    // Inicializar modal
    function initializeModal() {
        loadExistingSongIds();
        markExistingSongs();
        updateCountsAndButtons();
        songsAddedDuringSession = 0;
    }

    // Actualizar contadores y botones
    function updateCountsAndButtons() {
        const allRows = document.querySelectorAll('.song-row');
        const visibleRows = document.querySelectorAll('.song-row:not(.d-none)');
        const selected = document.querySelectorAll('.song-checkbox:checked:not(:disabled)');

        totalCount.textContent = allRows.length;
        visibleCount.textContent = visibleRows.length;
        selectedCount.textContent = selected.length;
        selectedNumber.textContent = selected.length;

        addSelectedBtn.disabled = selected.length === 0;
        addSelectedBtn.classList.toggle('btn-primary', selected.length > 0);
        addSelectedBtn.classList.toggle('btn-outline-primary', selected.length === 0);
    }

    // Filtrar canciones
    function filterSongs() {
        const searchTerm = (searchInput.value || '').toLowerCase().trim();
        const selectedGenre = (genreFilter.value || '').toLowerCase();
        const selectedMood = (moodFilter.value || '').toLowerCase();

        const rows = document.querySelectorAll('.song-row');
        let visible = 0;

        rows.forEach(row => {
            const title = (row.getAttribute('data-title') || '').toLowerCase();
            const artist = (row.getAttribute('data-artist') || '').toLowerCase();
            const genre = (row.getAttribute('data-genre') || '').toLowerCase();
            const mood = (row.getAttribute('data-mood') || '').toLowerCase();

            const matchesSearch = !searchTerm || title.includes(searchTerm) || artist.includes(searchTerm) || genre.includes(searchTerm);
            const matchesGenre = !selectedGenre || genre === selectedGenre;
            const matchesMood = !selectedMood || mood === selectedMood;

            if (matchesSearch && matchesGenre && matchesMood) {
                row.classList.remove('d-none');
                visible++;
            } else {
                row.classList.add('d-none');
            }
        });

        visibleCount.textContent = visible;
        updateSelectAllState();
        updateCountsAndButtons();
    }

    // Actualizar estado de "Seleccionar todos"
    function updateSelectAllState() {
        const visibleCheckboxes = document.querySelectorAll('.song-row:not(.d-none) .song-checkbox:not(:disabled)');
        const checkedVisible = Array.from(visibleCheckboxes).filter(cb => cb.checked).length;
        selectAll.checked = visibleCheckboxes.length > 0 && checkedVisible === visibleCheckboxes.length;
        selectAll.indeterminate = (checkedVisible > 0 && checkedVisible < visibleCheckboxes.length);
    }

    // Notificaciones
    function showSuccessNotification(message) {
        const toastContainer = document.getElementById('toast-container') || createToastContainer();
        const toastId = 'toast-' + Date.now();
        
        const toastHTML = `
            <div id="${toastId}" class="toast align-items-center text-bg-success border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="bi bi-check-circle-fill me-2"></i>${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
        
        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 2000
        });
        toast.show();
        
        toastElement.addEventListener('hidden.bs.toast', function() {
            toastElement.remove();
        });
    }

    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    }

    // Agregar canción individual 
    function handleAddSingle(button) {
        const songId = button.getAttribute('data-song-id');
        if (!songId) return;

        const originalHTML = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="bi bi-hourglass-split"></i>';

        fetch(addSongUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': token
            },
            body: `song_id=${encodeURIComponent(songId)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success || data.already_added) {
                if (!existingSongIds.includes(songId)) {
                    existingSongIds.push(songId);
                }
                markSongAsAdded(songId);
                updateCountsAndButtons();
                
                songsAddedDuringSession++;
                updatePlaylistCounters(1);
                showSuccessNotification('Canción agregada a la playlist');
            }
        })
        .catch(err => {
            console.error('Error al agregar canción individual:', err);
            button.innerHTML = '<i class="bi bi-x-lg"></i>';
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.disabled = false;
            }, 1000); 
        });
    }

    // Marcar canción como agregada
    function markSongAsAdded(songId) {
        const rowBtn = document.querySelector(`.add-single-btn[data-song-id="${songId}"]`);
        const rowCb = document.querySelector(`.song-checkbox[value="${songId}"]`);
        
        if (rowBtn) {
            rowBtn.innerHTML = '✅ Ya agregada';
            rowBtn.classList.remove('btn-success');
            rowBtn.classList.add('btn-outline-secondary');
            rowBtn.disabled = true;
        }
        
        if (rowCb) {
            rowCb.checked = false;
            rowCb.disabled = true;
        }
    }

    function updatePlaylistCounters(count) {
        const songCountElement = document.getElementById('playlist-song-count');
        const badgeElement = document.querySelector('.card-header .badge');
        
        if (songCountElement) {
            const currentCount = parseInt(songCountElement.textContent) || 0;
            songCountElement.textContent = currentCount + count;
        }
        
        if (badgeElement) {
            const currentCount = parseInt(badgeElement.textContent) || 0;
            badgeElement.textContent = (currentCount + count) + ' canciones';
        }
    }

    
    function checkAndReloadIfNeeded() {
        if (songsAddedDuringSession > 0) {
            window.location.reload(); 
        }
    }

    // Agregar múltiples canciones 
    addSelectedBtn?.addEventListener('click', function () {
        const selectedSongs = Array.from(document.querySelectorAll('.song-checkbox:checked:not(:disabled)')).map(cb => cb.value);
        if (selectedSongs.length === 0) return;

        const modal = bootstrap.Modal.getInstance(document.getElementById('addSongModal'));
        const originalText = addSelectedBtn.innerHTML;
        const originalClass = addSelectedBtn.className;
        addSelectedBtn.disabled = true;
        addSelectedBtn.innerHTML = `<i class="bi bi-hourglass-split me-2"></i>Agregando ${selectedSongs.length} canción(es)...`;

        let completed = 0;
        let successful = 0;

        const processNextSong = () => {
            if (completed >= selectedSongs.length) {
                addSelectedBtn.innerHTML = `<i class="bi bi-check-circle me-2"></i>¡${successful} canción(es) agregada(s)!`;
                addSelectedBtn.className = originalClass.replace('btn-primary', 'btn-success');
              
                updatePlaylistCounters(successful);
                songsAddedDuringSession += successful;
                showSuccessNotification(`${successful} canción(es) agregada(s) a la playlist`);
                
                setTimeout(() => {
                    if (modal) modal.hide();
                    // Recarga inmediata después de cerrar
                    setTimeout(() => {
                        window.location.reload();
                    }, 50); 
                }, 1000); 
                return;
            }

            const songId = selectedSongs[completed];
            
            fetch(addSongUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': token
                },
                body: `song_id=${encodeURIComponent(songId)}`
            })
            .then(response => response.json())
            .then(data => {
                completed++;
                if (data.success || data.already_added) {
                    successful++;
                    if (!existingSongIds.includes(songId)) {
                        existingSongIds.push(songId);
                    }
                    markSongAsAdded(songId);
                }
                
                addSelectedBtn.innerHTML = `<i class="bi bi-hourglass-split me-2"></i>Agregando... (${completed}/${selectedSongs.length})`;
                
                setTimeout(processNextSong, 50); 
            })
            .catch(error => {
                completed++;
                console.error('Error adding song:', error);
                addSelectedBtn.innerHTML = `<i class="bi bi-hourglass-split me-2"></i>Agregando... (${completed}/${selectedSongs.length})`;
                setTimeout(processNextSong, 50); 
            });
        };

        processNextSong();
        updateCountsAndButtons();
    });

    // Event Listeners básicos
    searchInput?.addEventListener('input', function() {
        filterSongs();
        if (this.value.trim() !== '') {
            clearSearchBtn.parentElement.classList.remove('d-none');
        } else {
            clearSearchBtn.parentElement.classList.add('d-none');
        }
    });

    genreFilter?.addEventListener('change', filterSongs);
    moodFilter?.addEventListener('change', filterSongs);
    
    clearSearchBtn?.addEventListener('click', function () {
        if (searchInput) searchInput.value = '';
        this.parentElement.classList.add('d-none');
        filterSongs();
        searchInput?.focus();
    });

    selectAll?.addEventListener('change', function () {
        const visibleCheckboxes = document.querySelectorAll('.song-row:not(.d-none) .song-checkbox:not(:disabled)');
        visibleCheckboxes.forEach(cb => { cb.checked = this.checked; });
        updateCountsAndButtons();
    });

    songsTableBody?.addEventListener('change', function (e) {
        const cb = e.target.closest('.song-checkbox');
        if (cb) {
            updateCountsAndButtons();
            updateSelectAllState();
        }
    });

    songsTableBody?.addEventListener('click', function (e) {
        const btn = e.target.closest('.add-single-btn');
        if (btn && !btn.disabled) {
            handleAddSingle(btn);
        }
    });

    function fixModalBackdrop() {
        const existingBackdrops = document.querySelectorAll('.modal-backdrop');
        existingBackdrops.forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
        document.body.style.overflow = '';
    }

    // Manejo del modal
    const modalEl = document.getElementById('addSongModal');
    if (modalEl) {
        modalEl.addEventListener('shown.bs.modal', function() {
            fixModalBackdrop();
            initializeModal();
        });
        
        modalEl.addEventListener('hidden.bs.modal', function() {
            fixModalBackdrop();
            checkAndReloadIfNeeded();
            
            // Resetear filtros
            if (searchInput) searchInput.value = '';
            if (genreFilter) genreFilter.value = '';
            if (moodFilter) moodFilter.value = '';
            if (clearSearchBtn && clearSearchBtn.parentElement) {
                clearSearchBtn.parentElement.classList.add('d-none');
            }
            filterSongs();
        });
    }

    // Inicialización básica
    filterSongs();
    setTimeout(fixModalBackdrop, 50); 
});