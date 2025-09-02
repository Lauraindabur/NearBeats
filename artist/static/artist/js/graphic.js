document.addEventListener("DOMContentLoaded", function() {
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
});