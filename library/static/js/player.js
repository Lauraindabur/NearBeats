document.addEventListener("DOMContentLoaded", function () {
  const playButtons = document.querySelectorAll(".play-btn, .btn-play-recommendation");

  const audioPlayer = document.getElementById("audio-player");
  const playPauseBtn = document.getElementById("playpause-btn");
  const rewindBtn = document.getElementById("rewind-btn");
  const forwardBtn = document.getElementById("forward-btn");
  const playerTitle = document.getElementById("player-title");
  const playerArtist = document.getElementById("player-artist");
  const coverImg = document.getElementById("cover-img");
  const progressBar = document.getElementById("progress-bar");
  const progressFill = document.getElementById("progress-fill");
  const progressThumb = document.getElementById("progress-thumb");
  const currentTimeElem = document.getElementById("current-time");
  const durationElem = document.getElementById("duration");
  const playerBar = document.getElementById('player-bar');

  let currentSong = null;
  let animationFrameId;
  let isDragging = false;

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ":" + (secs < 10 ? "0" : "") + secs;
  }

  function updateProgress() {
    if (!audioPlayer.duration) return;
    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressFill.style.width = percent + "%";
    progressThumb.style.left = percent + "%";
    currentTimeElem.textContent = formatTime(audioPlayer.currentTime);
    durationElem.textContent = formatTime(audioPlayer.duration - audioPlayer.currentTime);
    if (!isDragging) animationFrameId = requestAnimationFrame(updateProgress);
  }

  function stopProgress() {
    cancelAnimationFrame(animationFrameId);
  }

  function playSong(songUrl, songTitle, songArtist, songCover) {
    if (currentSong !== songUrl) {
      stopProgress();
      audioPlayer.src = songUrl;
      currentSong = songUrl;
      playerTitle.textContent = songTitle;
      playerArtist.textContent = songArtist;
      coverImg.src = songCover && songCover.trim() !== "" 
        ? songCover 
        : "{% static 'images/sin_portada.png' %}";
      playerBar.style.display = 'flex';
      audioPlayer.load();

      audioPlayer.play().then(() => {
        playPauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
        requestAnimationFrame(updateProgress);
      }).catch(() => {});
    } else {
      if (audioPlayer.paused) {
        audioPlayer.play().then(() => {
          playPauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
          requestAnimationFrame(updateProgress);
        });
      } else {
        audioPlayer.pause();
        playPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
        stopProgress();
      }
    }
  }

  playerBar.style.display = 'none';

  // --- Botones de reproducción universales ---
  playButtons.forEach(btn => {
    btn.addEventListener("click", function () {
      const songUrl = this.getAttribute("data-audio");
      const songTitle = this.getAttribute("data-title");
      const songArtist = this.getAttribute("data-artist");

      // Busca la imagen de portada más cercana
      const songCover = this.closest("tr")?.querySelector("img")?.src 
                     || this.closest(".song-card")?.querySelector("img")?.src 
                     || this.closest(".recommendation-song")?.querySelector("img")?.src
                     || "{% static 'images/sin_portada.png' %}";

      playSong(songUrl, songTitle, songArtist, songCover);
    });
  });

  // --- Botón play/pause ---
  playPauseBtn.addEventListener("click", () => {
    if (audioPlayer.paused) {
      audioPlayer.play().then(() => {
        playPauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
        requestAnimationFrame(updateProgress);
      });
    } else {
      audioPlayer.pause();
      playPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
      stopProgress();
    }
  });

  // --- Retroceder y adelantar ---
  rewindBtn.addEventListener("click", () => {
    audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
    updateProgress();
  });
  forwardBtn.addEventListener("click", () => {
    if (audioPlayer.duration) {
      audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 10);
      updateProgress();
    }
  });

  // --- Barra de progreso con thumb draggable ---
  function seek(e) {
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percent = Math.min(Math.max(clickX / width, 0), 1);
    audioPlayer.currentTime = percent * audioPlayer.duration;
    updateProgress();
  }

  progressBar.addEventListener("click", (e) => {
    if (!isDragging) seek(e);
  });

  progressThumb.addEventListener("mousedown", (e) => {
    isDragging = true;
    function onMouseMove(eMove) {
      const rect = progressBar.getBoundingClientRect();
      let percent = (eMove.clientX - rect.left) / rect.width;
      percent = Math.min(Math.max(percent, 0), 1);
      progressFill.style.width = percent * 100 + "%";
      progressThumb.style.left = percent * 100 + "%";
      currentTimeElem.textContent = formatTime(percent * audioPlayer.duration);
    }
    function onMouseUp(eUp) {
      const rect = progressBar.getBoundingClientRect();
      let percent = (eUp.clientX - rect.left) / rect.width;
      percent = Math.min(Math.max(percent, 0), 1);
      audioPlayer.currentTime = percent * audioPlayer.duration;
      updateProgress();
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  // --- Canción terminada ---
  audioPlayer.addEventListener("ended", () => {
    playPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
    progressFill.style.width = "0%";
    progressThumb.style.left = "0%";
    currentTimeElem.textContent = "0:00";
    durationElem.textContent = formatTime(audioPlayer.duration);
    playerBar.style.display = 'none';
    stopProgress();
  });

  // --- Al cargar metadatos ---
  audioPlayer.addEventListener("loadedmetadata", () => {
    durationElem.textContent = formatTime(audioPlayer.duration);
  });
});
