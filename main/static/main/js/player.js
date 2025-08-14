document.addEventListener("DOMContentLoaded", function() {
  const playButtons = document.querySelectorAll(".play-btn");
  const audioPlayer = document.getElementById("audio-player");
  const playPauseBtn = document.getElementById("playpause-btn");
  const rewindBtn = document.getElementById("rewind-btn");
  const forwardBtn = document.getElementById("forward-btn");
  const playerTitle = document.getElementById("player-title");
  const playerArtist = document.getElementById("player-artist");
  const coverImg = document.getElementById("cover-img");
  const progressBar = document.getElementById("progress-bar");
  const progressFill = document.getElementById("progress-fill");
  const currentTimeElem = document.getElementById("current-time");
  const durationElem = document.getElementById("duration");
  const playerBar = document.getElementById('player-bar');

  let currentSong = null;

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ":" + (secs < 10 ? "0" : "") + secs;
  }

  function updateProgress() {
    if (audioPlayer.duration) {
      const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      progressFill.style.width = percent + "%";
      currentTimeElem.textContent = formatTime(audioPlayer.currentTime);
      durationElem.textContent = formatTime(audioPlayer.duration - audioPlayer.currentTime);
    }
  }

  playerBar.style.display = 'none';

  playButtons.forEach(btn => {
    btn.addEventListener("click", function() {
      const songUrl = this.getAttribute("data-audio");
      const songTitle = this.getAttribute("data-title");
      const songArtist = this.getAttribute("data-artist");
      const songCover = this.parentElement.querySelector("img").src || "{% static 'img/sin_portada.jpg' %}";

      if (currentSong !== songUrl) {
        audioPlayer.src = songUrl;
        currentSong = songUrl;
        playerTitle.textContent = songTitle;
        playerArtist.textContent = songArtist;
        coverImg.src = songCover;
        playerBar.style.display = 'flex';
        audioPlayer.play();
        playPauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
      } else {
        if (audioPlayer.paused) {
          audioPlayer.play();
          playPauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
        } else {
          audioPlayer.pause();
          playPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
        }
      }
    });
  });

  playPauseBtn.addEventListener("click", () => {
    if (audioPlayer.paused) {
      audioPlayer.play();
      playPauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
    } else {
      audioPlayer.pause();
      playPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
    }
  });

  rewindBtn.addEventListener("click", () => {
    audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
  });

  forwardBtn.addEventListener("click", () => {
    audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 10);
  });

  progressBar.addEventListener("click", (e) => {
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percent = clickX / width;
    if (audioPlayer.duration) {
      audioPlayer.currentTime = percent * audioPlayer.duration;
    }
  });

  audioPlayer.addEventListener("timeupdate", updateProgress);

  audioPlayer.addEventListener("ended", () => {
    playPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
    progressFill.style.width = "0%";
    currentTimeElem.textContent = "0:00";
    durationElem.textContent = formatTime(audioPlayer.duration);
    playerBar.style.display = 'none';
  });

  audioPlayer.addEventListener("loadedmetadata", () => {
    durationElem.textContent = formatTime(audioPlayer.duration);
  });
});
