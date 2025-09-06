//implements see_artist_graphic

document.addEventListener("DOMContentLoaded", function() {
 // Cargar datos seguros desde las etiquetas json_script
 try {
   window.plays_this_month = JSON.parse(document.getElementById('plays_this_month').textContent);
   window.song_names = JSON.parse(document.getElementById('song_names').textContent);
   window.play_counts = JSON.parse(document.getElementById('play_counts').textContent);
   window.hour_labels = JSON.parse(document.getElementById('hour_labels').textContent);
   window.hour_data = JSON.parse(document.getElementById('hour_data').textContent);
 } catch (e) {
   // Si falla, lo que queremos hacer es maantener valores por defecto
 }

 var reproducciones = window.plays_this_month || "0";
    var html = `
      <div class="reproducciones-mes">
        <span class="repro-count">${reproducciones}</span>
        <span class="repro-label">Reproducciones este mes</span>
        <span class="music-waves">
          <svg width="40" height="24" viewBox="0 0 40 24">
            <rect class="wave" x="2" y="8" width="4" height="8" rx="2"/>
            <rect class="wave" x="10" y="4" width="4" height="16" rx="2"/>
            <rect class="wave" x="18" y="12" width="4" height="8" rx="2"/>
            <rect class="wave" x="26" y="6" width="4" height="12" rx="2"/>
            <rect class="wave" x="34" y="10" width="4" height="10" rx="2"/>
          </svg>
        </span>
      </div>
    `;
    var container = document.getElementById("repro-mes-container");
    if (container) {
        container.innerHTML = html;
    }


    const ctx = document.getElementById('topSongsChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: window.song_names,
            datasets: [{
                label: 'Reproducciones',
                data: window.play_counts,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            }]
        },
        options: {
            indexAxis: 'x',
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

  // Segundo grafico se usa para  linea de reproducciones por hora
  const hourCanvas = document.getElementById('hourLineChart');
  if (hourCanvas && window.hour_labels && window.hour_data) {
    const hourCtx = hourCanvas.getContext('2d');
    new Chart(hourCtx, {
      type: 'line',
      data: {
        labels: window.hour_labels,
        datasets: [{
          label: 'Reproducciones por hora',
          data: window.hour_data,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.3,
          fill: true,
          pointRadius: 2
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true }
        },
        plugins: {
          legend: { display: true }
        }
      }
    });
  }
    
});