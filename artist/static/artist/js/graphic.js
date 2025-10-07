//implementacion see_artist_graphic

document.addEventListener("DOMContentLoaded", function() {
  // usar solo cuando estemos en la página de perfil del artista
  const root = document.querySelector('.artist-profile');
  if (!root) return;

  // Cargar datos  desde las etiquetas json_script dentro del scope
  try {
    const playsScript = root.querySelector('#plays_this_month');
    const namesScript = root.querySelector('#song_names');
    const countsScript = root.querySelector('#play_counts');
    const labelsScript = root.querySelector('#hour_labels');
    const hourDataScript = root.querySelector('#hour_data');

    window.plays_this_month = playsScript ? JSON.parse(playsScript.textContent) : 0;
    window.song_names = namesScript ? JSON.parse(namesScript.textContent) : [];
    window.play_counts = countsScript ? JSON.parse(countsScript.textContent) : [];
    window.hour_labels = labelsScript ? JSON.parse(labelsScript.textContent) : [];
    window.hour_data = hourDataScript ? JSON.parse(hourDataScript.textContent) : [];
  } catch (e) {
    // mantener valores por defecto 
  }


  

  // Gráfico Top canciones 
  const topCanvas = root.querySelector('#topSongsChart');
  const palette = {
    primary: 'rgba(181,107,240,0.95)',
    primarySoft: 'rgba(241,198,251,0.9)',
    accent: 'rgba(214,130,227,0.9)'
  };

  function createTopChart(){
    if (window._topChart) return;
    if (!topCanvas) return;
    const ctx = topCanvas.getContext('2d');
    window._topChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: window.song_names,
        datasets: [{
          label: 'Reproducciones',
          data: window.play_counts,
          backgroundColor: palette.primary,
          hoverBackgroundColor: palette.accent,
        }]
      },
      options: {
        indexAxis: 'x',
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // Gráfico reproducciones por hora 
  const hourCanvas = root.querySelector('#hourLineChart');
  function createHourChart(){
    if (window._hourChart) return;
    if (!hourCanvas || !window.hour_labels || !window.hour_data) return;
    const hourCtx = hourCanvas.getContext('2d');
    window._hourChart = new Chart(hourCtx, {
      type: 'line',
      data: {
        labels: window.hour_labels,
        datasets: [{
          label: 'Reproducciones por hora',
          data: window.hour_data,
          borderColor: 'rgba(138,59,224,0.95)',
          backgroundColor: 'rgba(214,130,227,0.18)',
          tension: 0.3,
          fill: true,
          pointRadius: 2
        }]
      },
      options: { scales: { y: { beginAtZero: true } }, plugins: { legend: { display: true } } }
    });
  }

  const playBtn = root.querySelector('#play-tracks-btn');
  const statsBtn = root.querySelector('#stats-btn');
  const tracksSection = root.querySelector('#tracks-section');
  const statsSection = root.querySelector('#stats-section');

  function showTracks() {
    playBtn.classList.add('active');
    statsBtn.classList.remove('active');
    tracksSection.classList.remove('d-none');
    statsSection.classList.add('d-none');
  }

  function showStats() {
    playBtn.classList.remove('active');
    statsBtn.classList.add('active');
    tracksSection.classList.add('d-none');
    statsSection.classList.remove('d-none');
    // Crear charts si aún no existen 
    createTopChart();
    createHourChart();
    if (window._topChart) window._topChart.resize();
    if (window._hourChart) window._hourChart.resize();
  }

  if (playBtn) playBtn.addEventListener('click', showTracks);
  if (statsBtn) statsBtn.addEventListener('click', showStats);

  // por defecto-> mostrar tracks
  showTracks();

});