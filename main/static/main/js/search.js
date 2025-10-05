document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form.form-search');
    const input = document.getElementById('busqueda');
    const inputFiltro = document.getElementById('inputFiltro');
    const dropdownItems = document.querySelectorAll('.dropdown-menu .dropdown-item');
    const offcanvas = document.getElementById('emocionesOffcanvas');
    const emotionButtons = offcanvas ? offcanvas.querySelectorAll('.list-group-item') : [];
    const maxRecent = 3;

    if (!form || !input) return;
    function getRecents() { try { return JSON.parse(localStorage.getItem('recentSearches') || '[]'); } catch(e){ return []; } }
    function saveRecents(arr) { try { localStorage.setItem('recentSearches', JSON.stringify(arr)); } catch(e){} }
    dropdownItems.forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const filtroSeleccionado = document.getElementById('filtroSeleccionado');
            filtroSeleccionado.textContent = item.textContent;
            inputFiltro.value = item.getAttribute('data-value');
            if (item.getAttribute('data-value') === 'emocion' && offcanvas) {
                var bsOffcanvas = new bootstrap.Offcanvas(offcanvas);
                bsOffcanvas.show();
            }
        });
    });
    emotionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const emotion = btn.getAttribute('data-emotion');
            input.value = emotion;
            inputFiltro.value = 'emocion';
            const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
            if (bsOffcanvas) bsOffcanvas.hide();
        });
    });

    // Implementación del popup
    let popup = null;
    let hideTimeout = null;

    function createPopup(){
        if (popup) return popup;
        popup = document.createElement('div');
        popup.className = 'nb-suggestions-popup border rounded shadow-sm bg-white';
        popup.setAttribute('role','listbox');
        popup.style.position = 'absolute';
        popup.style.zIndex = 9999;
        popup.style.boxSizing = 'border-box';
        popup.style.display = 'none';
        document.body.appendChild(popup);
        return popup;
    }
    function positionPopup(p){
        const rect = input.getBoundingClientRect();
        const left = rect.left + window.scrollX;
        p.style.left = Math.max(8, left) + 'px';
        p.style.top = (rect.bottom + window.scrollY) + 'px';
        p.style.width = Math.min(rect.width, 600) + 'px';
    }

    function renderSongsInto(p, songs){
        if (!songs || songs.length === 0) {
            p.innerHTML = '<div class="p-3 text-muted">No hay sugerencias disponibles</div>';
            return;
        }
        let html = '<div class="list-group list-group-flush"><div class="px-3 py-2 border-bottom"><strong>Sugerencias</strong></div>';
    songs.forEach((s, idx) => {
        const cover = s.cover || '/static/images/sin_portada.png';
        // construir href directo a la búsqueda  sin eso no nos dejaba buscar
        const filtroParam = inputFiltro && inputFiltro.value ? '&filtro=' + encodeURIComponent(inputFiltro.value) : '';
        const href = '/buscar/?q=' + encodeURIComponent(s.title) + filtroParam;
        html += `<a href="${href}" class="list-group-item list-group-item-action d-flex align-items-center suggestion-item" data-title="${s.title}" data-index="${idx}">` +
            `<img src="${cover}" alt="portada" style="width:48px;height:48px;object-fit:cover;border-radius:6px;margin-right:10px;">` +
            `<div class="flex-grow-1"><div class="fw-semibold">${s.title}</div><div class="text-muted small">${s.artist || ''}</div></div></a>`;
    });
        html += '</div>';
        p.innerHTML = html;
    }

    function fetchAndShow(){
        const p = createPopup();
        fetch('/buscar/suggested/').then(r => r.json()).then(data => {
            const songs = data.songs || [];
            renderSongsInto(p, songs);
            positionPopup(p);
            p.style.display = 'block';
            attachPopupHandlers(p);
        }).catch(()=>{
            renderSongsInto(p, []);
            positionPopup(p);
            p.style.display = 'block';
        });
    }

    function showPopup(){
        fetchAndShow();
    }

    function hidePopup(){
        if (popup) popup.style.display = 'none';
    }

    function attachPopupHandlers(p){
        const items = p.querySelectorAll('.suggestion-item');
        items.forEach((item, idx) => {
            item.setAttribute('role','option');
            item.tabIndex = -1;
            item.addEventListener('mousedown', function(e){
                try {
                    const href = this.getAttribute && this.getAttribute('href');
                    if (href) {
                        window.location.href = href;
                    }
                } catch(err){}
            });
            item.addEventListener('touchstart', function(e){
                try {
                    const href = this.getAttribute && this.getAttribute('href');
                    if (href) {
                        window.location.href = href;
                    }
                } catch(err){}
            });
            
        });

        let active = -1;
        function setActive(i){
            const all = p.querySelectorAll('.suggestion-item');
            if (all[active]) all[active].classList.remove('active');
            active = i;
            if (all[active]){
                all[active].classList.add('active');
                all[active].scrollIntoView({block:'nearest'});
            }
        }
    const onKeyDown = function(e){
            const all = p.querySelectorAll('.suggestion-item');
            if (!all || all.length === 0) return;
            if (e.key === 'ArrowDown'){
                e.preventDefault();
                setActive(Math.min(all.length-1, active+1));
            } else if (e.key === 'ArrowUp'){
                e.preventDefault();
                setActive(Math.max(0, active-1));
            } else if (e.key === 'Enter'){
                if (active >= 0 && all[active]){
                    e.preventDefault();
                    all[active].click();
                }
            } else if (e.key === 'Escape'){
                hidePopup();
            }
        };
        input.removeEventListener('keydown', input._nb_keydown || function(){});
        input.addEventListener('keydown', onKeyDown);
        input._nb_keydown = onKeyDown;
    }

    // Reposicionar al hacer scroll/resize
    function repositionPopup(){ if (popup && popup.style.display !== 'none') positionPopup(popup); }
    window.addEventListener('scroll', repositionPopup);
    window.addEventListener('resize', repositionPopup);
    document.addEventListener('click', function(e){
        if (!popup) return;
        if (popup.style.display === 'none') return;
        if (e.target === input) return;
        if (popup.contains(e.target)) return;
        hidePopup();
    });

    input.addEventListener('focus', function(){ showPopup(); });
    input.addEventListener('blur', function(){ hideTimeout = setTimeout(hidePopup, 150); });

    form.addEventListener('submit', function(){
        let recents = getRecents();
        const value = input.value.trim();
        if (value){
            recents = recents.filter(v => v.toLowerCase() !== value.toLowerCase());
            recents.unshift(value);
            if (recents.length > maxRecent) recents = recents.slice(0, maxRecent);
            saveRecents(recents);
        }
        const recentList = document.getElementById('recent-searches-list');
        if (recentList) {
            recentList.style.display = 'none';
            recentList.innerHTML = '';
        }
        if (typeof hidePopup === 'function') hidePopup();
    });

    function bindStaticSuggestionItems(){
        const recentList = document.getElementById('recent-searches-list');
        document.querySelectorAll('#recent-searches-list .suggestion-item').forEach(item => {
            if (item._nb_bound) return;
            item._nb_bound = true;
            item.addEventListener('click', function(e){
                e.preventDefault();
                e.stopPropagation && e.stopPropagation();
                let title = this.dataset.title && this.dataset.title.trim();
                if (!title) {
                    const titleNode = this.querySelector('.fw-semibold');
                    title = titleNode ? titleNode.textContent.trim() : this.textContent.trim();
                }
                input.value = title;
                try { input.focus(); input.select(); } catch(e){}
                try { input.classList.add('nb-input-copied'); setTimeout(()=> input.classList.remove('nb-input-copied'), 600); } catch(e){}
                let recents = getRecents();
                recents = recents.filter(v => v.toLowerCase() !== title.toLowerCase());
                recents.unshift(title);
                if (recents.length > maxRecent) recents = recents.slice(0, maxRecent);
                saveRecents(recents);
                // Ocultar sugerencias tras seleccionar
                if (recentList) recentList.style.display = 'none';
                // enviar formulario
                setTimeout(function(){
                    try { form.submit(); } catch(e){ form.dispatchEvent(new Event('submit', {bubbles:true,cancelable:true})); }
                }, 30);
            });
        });
    }
    // actualizar al recargar la página
    bindStaticSuggestionItems();

    input.addEventListener('focus', function(){
        if (typeof showPopup === 'function') showPopup();
    });
    // Ocultar popup solo tras enviar
    let submitInProgress = false;
    input.addEventListener('blur', function(){
        setTimeout(function(){
            if (!submitInProgress && typeof hidePopup === 'function') hidePopup();
        }, 200);
    });
    form.addEventListener('submit', function(){
        submitInProgress = true;
        if (typeof hidePopup === 'function') hidePopup();
        setTimeout(function(){ submitInProgress = false; }, 500);
    });


});




