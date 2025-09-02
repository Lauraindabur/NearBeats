document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form.form-search');
    const input = document.getElementById('busqueda');
    const recentList = document.getElementById('recent-searches-list');
    const maxRecent = 2;

    // Si no hay buscador en la página, salimos sin romper nada
    if (!form || !input) return;

    function renderRecent() {
        if (!recentList) return; // si no hay contenedor, no hacemos nada
        let recents = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        recentList.innerHTML = '';

        if (recents.length === 0) {
            recentList.innerHTML = `
              <span class="text-muted" style="font-size:0.93rem;">
                  No hay búsquedas recientes
              </span>`;
        } else {
            recents.forEach(function(term) {
                const div = document.createElement('div');
                div.className = 'recent-item d-flex align-items-center';
                div.innerHTML = `
                  <i class="bi bi-clock-history me-2"></i>
                  <span>${term}</span>
                `;
                div.addEventListener('click', function() {
                    input.value = term;
                    input.focus();
                });
                recentList.appendChild(div);
            });
        }
    }

    // Renderizar al cargar
    renderRecent();

    // Guardar búsqueda al enviar formulario
    form.addEventListener('submit', function() {
        let recents = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        const value = input.value.trim();

        if (value && !recents.includes(value)) {
            recents.unshift(value);
            if (recents.length > maxRecent) {
                recents = recents.slice(0, maxRecent);
            }
            localStorage.setItem('recentSearches', JSON.stringify(recents));
        }
    });
});
