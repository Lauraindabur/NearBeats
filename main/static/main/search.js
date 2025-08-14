// Seleccionamos el dropdown y el input oculto
document.addEventListener('DOMContentLoaded', function () {
  const offcanvas = document.getElementById('emocionesOffcanvas');
  const emotionButtons = offcanvas.querySelectorAll('.list-group-item');
  const searchInput = document.getElementById('busqueda');

  emotionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const emotion = btn.getAttribute('data-emotion');
      searchInput.value = emotion;
      // Cerrar offcanvas
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
      bsOffcanvas.hide();
    });
  });
});


document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form.form-search');
    const input = document.getElementById('busqueda');
    const recentList = document.getElementById('recent-searches-list');
    const maxRecent = 2;  

    function renderRecent() {
        let recents = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        recentList.innerHTML = '';
        if (recents.length === 0) {
            recentList.innerHTML = '<span class="text-muted" style="font-size:0.93rem;">No hay búsquedas recientes</span>';
        } else {
            recents.forEach(function(term) {
                 const div = document.createElement('div');
                div.className = 'recent-item d-flex align-items-center';
                div.innerHTML = '<i class="bi bi-clock-history me-2"></i><span>' + term + '</span>';
                div.addEventListener('click', function() {
                    input.value = term;
                    input.focus();
                });
                recentList.appendChild(div);
            });
                 }
    }

    renderRecent();

    form.addEventListener('submit', function() {
        let recents = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        const value = input.value.trim();
        if (value && !recents.includes(value)) {
            recents.unshift(value);
            if (recents.length > maxRecent) recents = recents.slice(0, maxRecent);
              localStorage.setItem('recentSearches', JSON.stringify(recents));
        }
    });
});

