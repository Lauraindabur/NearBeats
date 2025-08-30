document.addEventListener("DOMContentLoaded", function() {
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