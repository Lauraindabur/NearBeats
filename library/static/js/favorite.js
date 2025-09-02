document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".favorite-btn").forEach(button => {
    button.addEventListener("click", async () => {
      const songId = button.dataset.songId;

      try {
        const response = await fetch(`/toggle-favorite/${songId}/`, {
          method: "POST",
          headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "X-Requested-With": "XMLHttpRequest"
          }
        });

        const data = await response.json();
        const icon = button.querySelector("i");

        if (data.is_favorited) {
          icon.classList.remove("bi-star");
          icon.classList.add("bi-star-fill", "text-warning");
        } else {
          icon.classList.remove("bi-star-fill", "text-warning");
          icon.classList.add("bi-star");

          // **Eliminar tarjeta en favoritos**
          const songItem = document.querySelector(`#song-${songId}`);
          if (songItem) {
            songItem.remove();
          }

          // **Mostrar mensaje si la lista queda vacía**
          if (!document.querySelector(".song-item")) {
            const container = document.querySelector(".row");
            container.innerHTML = "<p>No tienes canciones favoritas aún.</p>";
          }
        }
      } catch (error) {
        console.error("Error:", error);
      }
    });
  });
});

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
