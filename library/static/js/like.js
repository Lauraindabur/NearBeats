document.addEventListener("DOMContentLoaded", function() {
  // Función para obtener la cookie CSRF
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      document.cookie.split(";").forEach(cookie => {
        cookie = cookie.trim();
        if (cookie.startsWith(name + "=")) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        }
      });
    }
    return cookieValue;
  }

  // Función para manejar el click del like
  document.querySelectorAll(".like-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      const songId = this.dataset.songId;
      const icon = this.querySelector("i");
      const counter = document.getElementById(`likes-count-${songId}`);

      // Evita clicks rápidos múltiples
      if (btn.disabled) return;
      btn.disabled = true;

      // Determinar si actualmente está likeado
      const isLiked = icon.classList.contains("bi-heart-fill");

      // Actualizar visualmente inmediatamente
      if (isLiked) {
        icon.className = "bi bi-heart";
        counter.textContent = parseInt(counter.textContent) - 1;
      } else {
        icon.className = "bi bi-heart-fill text-danger";
        counter.textContent = parseInt(counter.textContent) + 1;
      }

      fetch(`/toggle-like/${songId}/`, {
        method: "POST",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
          "Content-Type": "application/json"
        },
        credentials: "same-origin"
      })
      .then(res => res.json())
      .then(data => {
        if (counter) counter.textContent = data.likes_count;
        btn.disabled = false;
      })
      .catch(err => {
        console.error("Error:", err);
        if (isLiked) {
          icon.className = "bi bi-heart-fill text-danger";
          counter.textContent = parseInt(counter.textContent) + 1;
        } else {
          icon.className = "bi bi-heart";
          counter.textContent = parseInt(counter.textContent) - 1;
        }
        btn.disabled = false;
      });
    });
  });
});

