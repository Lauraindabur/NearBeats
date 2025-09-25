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
        console.log('Error loading chart data:', e);
    }

    // Gráfico de Top Canciones
    const ctx = document.getElementById('topSongsChart');
    if (ctx && window.song_names && window.play_counts) {
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: window.song_names,
                datasets: [{
                    label: 'Reproducciones',
                    data: window.play_counts,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        ticks: {
                            color: 'white'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'white'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        }
                    }
                }
            }
        });
    }

    // Gráfico de Reproducciones por Hora
    const hourCanvas = document.getElementById('hourLineChart');
    if (hourCanvas && window.hour_labels && window.hour_data) {
        new Chart(hourCanvas, {
            type: 'line',
            data: {
                labels: window.hour_labels,
                datasets: [{
                    label: 'Reproducciones por hora',
                    data: window.hour_data,
                    borderColor: 'rgba(255, 255, 255, 1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 3,
                    pointBackgroundColor: 'white',
                    pointBorderColor: 'rgba(255, 255, 255, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        ticks: {
                            color: 'white'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'white'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        }
                    }
                }
            }
        });
    }
});

function playSong(songId) {
    if (!songId) return;
    
    fetch(`/play/${songId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            console.log('Canción reproducida');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Funcionalidad del botón de play/pausa
document.addEventListener('click', function(e) {
    if (e.target.closest('.play-button')) {
        const button = e.target.closest('.play-button');
        const icon = button.querySelector('span');
        
        if (icon.textContent === '▶️') {
            icon.textContent = '⏸️';
        } else {
            icon.textContent = '▶️';
        }
    }
});