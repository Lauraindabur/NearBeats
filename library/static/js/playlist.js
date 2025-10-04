document.addEventListener('DOMContentLoaded', function () {

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
    const token = getCookie('csrftoken') || csrftoken; // csrftoken viene del template


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
+
    function forceModalPosition() {
        const modal = document.getElementById('addSongModal');
        if (!modal) return;
        
        modal.style.display = 'block';
        modal.style.overflow = 'visible';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.right = '0';
        modal.style.bottom = '0';
        modal.style.zIndex = '1060';
        
        const modalDialog = modal.querySelector('.modal-dialog');
        if (modalDialog) {
            modalDialog.style.margin = 'auto';
            modalDialog.style.maxHeight = '95vh';
            modalDialog.style.display = 'flex';
            modalDialog.style.alignItems = 'center';
            modalDialog.style.minHeight = '100vh';
        }
        
        modal.scrollTop = 0;
    }

    // ---------- Inicialización ----------
    function initializeModal() {
        loadExistingSongIds();
        markExistingSongs();
        updateCountsAndButtons();
        forceModalPosition();
        
        const modalBody = document.querySelector('#addSongModal .modal-body');
        if (modalBody) {
            modalBody.scrollTop = 0;
        }
    }


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

    // Filtrado 
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

   
    function updateSelectAllState() {
        const visibleCheckboxes = document.querySelectorAll('.song-row:not(.d-none) .song-checkbox:not(:disabled)');
        const checkedVisible = Array.from(visibleCheckboxes).filter(cb => cb.checked).length;
        selectAll.checked = visibleCheckboxes.length > 0 && checkedVisible === visibleCheckboxes.length;
        selectAll.indeterminate = (checkedVisible > 0 && checkedVisible < visibleCheckboxes.length);
    }


    searchInput && searchInput.addEventListener('input', function() {
        filterSongs();
        if (this.value.trim() !== '') {
            clearSearchBtn.parentElement.classList.remove('d-none');
        } else {
            clearSearchBtn.parentElement.classList.add('d-none');
        }
    });

    genreFilter && genreFilter.addEventListener('change', filterSongs);
    moodFilter && moodFilter.addEventListener('change', filterSongs);
    
    clearSearchBtn && clearSearchBtn.addEventListener('click', function () {
        if (searchInput) searchInput.value = '';
        this.parentElement.classList.add('d-none');
        filterSongs();
        searchInput && searchInput.focus();
    });

    selectAll && selectAll.addEventListener('change', function () {
        const visibleCheckboxes = document.querySelectorAll('.song-row:not(.d-none) .song-checkbox:not(:disabled)');
        visibleCheckboxes.forEach(cb => { cb.checked = this.checked; });
        updateCountsAndButtons();
    });

    songsTableBody && songsTableBody.addEventListener('change', function (e) {
        const cb = e.target.closest('.song-checkbox');
        if (cb) {
            updateCountsAndButtons();
            updateSelectAllState();
        }
    });

    songsTableBody && songsTableBody.addEventListener('click', function (e) {
        const btn = e.target.closest('.add-single-btn');
        if (btn && !btn.disabled) {
            handleAddSingle(btn);
        }
    });

    function handleAddSingle(button) {
        const songId = button.getAttribute('data-song-id');
        if (!songId) return;

        const originalHTML = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="bi bi-hourglass-split"></i>';

        fetch(addSongUrl, {
            method: 'POST',
            credentials: 'same-origin',
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
                updatePlaylistInMainPage();
            }
        })
        .catch(err => {
            console.error('Error al agregar canción individual:', err);
            button.innerHTML = '<i class="bi bi-x-lg"></i>';
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.disabled = false;
            }, 1500);
        });
    }

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

    //Actualizar página principal 
    function updatePlaylistInMainPage() {
        const mainContainer = document.querySelector('.container-fluid');
        if (mainContainer) {
            fetch(window.location.href, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            })
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newMainContainer = doc.querySelector('.container-fluid');
                if (newMainContainer) {
                    mainContainer.innerHTML = newMainContainer.innerHTML;
                    initializeAllEvents();
                }
            })
            .catch(err => {
                console.error('Error updating playlist:', err);
                showSuccessNotification('Actualizando página...');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            });
        } else {
            window.location.reload();
        }
    }

    function initializeAllEvents() {
        const modalBtn = document.getElementById('openModalBtn');
        if (modalBtn) {
            modalBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => {
                    const modal = new bootstrap.Modal(document.getElementById('addSongModal'));
                    modal.show();
                }, 100);
            });
        }
        initializePlaylistEvents();
    }

    function initializePlaylistEvents() {
        const playButtons = document.querySelectorAll('.btn-play-recommendation');
        playButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const songId = this.getAttribute('data-song-id');
                console.log('Reproducir canción:', songId);
            });
        });
        
        const deleteButtons = document.querySelectorAll('a.btn-outline-danger');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                if (!confirm('¿Estás seguro de que quieres remover esta canción de la playlist?')) {
                    e.preventDefault();
                }
            });
        });
    }

 
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
            delay: 3000
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
        container.style.zIndex = '1090';
        document.body.appendChild(container);
        return container;
    }

    //  Agregar múltiples canciones 
    addSelectedBtn && addSelectedBtn.addEventListener('click', function () {
        const selectedSongs = Array.from(document.querySelectorAll('.song-checkbox:checked:not(:disabled)')).map(cb => cb.value);
        if (selectedSongs.length === 0) return;

        const modal = bootstrap.Modal.getInstance(document.getElementById('addSongModal'));
        const originalText = addSelectedBtn.innerHTML;
        const originalClass = addSelectedBtn.className;
        addSelectedBtn.disabled = true;
        addSelectedBtn.innerHTML = `<i class="bi bi-hourglass-split me-2"></i>Agregando ${selectedSongs.length} canción(es)...`;

        let completed = 0;
        let successful = 0;

        const promises = selectedSongs.map(songId => {
            return fetch(addSongUrl, {
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
                return data;
            })
            .catch(error => {
                completed++;
                console.error('Error adding song:', error);
                return { success: false, error: error.message };
            });
        });

        Promise.all(promises)
        .then(results => {
            addSelectedBtn.innerHTML = `<i class="bi bi-check-circle me-2"></i>¡${successful} canción(es) agregada(s)!`;
            addSelectedBtn.className = originalClass.replace('btn-primary', 'btn-success');
            updatePlaylistInMainPage();
            if (successful > 0) {
                showSuccessNotification(`${successful} canción(es) agregada(s) a la playlist`);
            }
            setTimeout(() => {
                if (modal) modal.hide();
                setTimeout(() => {
                    addSelectedBtn.innerHTML = originalText;
                    addSelectedBtn.disabled = false;
                    addSelectedBtn.className = originalClass;
                }, 1000);
            }, 2000);
            updateCountsAndButtons();
        })
        .catch(err => {
            console.error('Error adding songs:', err);
            addSelectedBtn.innerHTML = '<i class="bi bi-x-circle me-2"></i>Error al agregar';
            addSelectedBtn.className = originalClass.replace('btn-primary', 'btn-danger');
            setTimeout(() => {
                addSelectedBtn.innerHTML = originalText;
                addSelectedBtn.disabled = false;
                addSelectedBtn.className = originalClass;
            }, 2000);
        });
    });

    // Modal 
    const modalEl = document.getElementById('addSongModal');
    if (modalEl) {
        modalEl.addEventListener('show.bs.modal', function() {
            document.body.style.overflow = 'hidden';
        });
        
        modalEl.addEventListener('shown.bs.modal', function() {
            initializeModal();
            gentlyPositionModal();
        });
        
        modalEl.addEventListener('hidden.bs.modal', function() {
            document.body.style.overflow = '';
            if (searchInput) searchInput.value = '';
            if (genreFilter) genreFilter.value = '';
            if (moodFilter) moodFilter.value = '';
            if (clearSearchBtn && clearSearchBtn.parentElement) {
                clearSearchBtn.parentElement.classList.add('d-none');
            }
            filterSongs();
        });
    }

    function gentlyPositionModal() {
        const modalDialog = document.querySelector('#addSongModal .modal-dialog');
        if (!modalDialog) return;
        requestAnimationFrame(() => {
            modalDialog.style.transition = 'all 0.3s ease';
            modalDialog.style.opacity = '1';
            modalDialog.style.transform = 'translateY(0)';
        });
    }

    document.getElementById('openModalBtn')?.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            const modal = new bootstrap.Modal(document.getElementById('addSongModal'));
            modal.show();
        }, 100);
    });

    // Inicialización 
    filterSongs();
    initializePlaylistEvents();
});
