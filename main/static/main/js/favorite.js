document.addEventListener("DOMContentLoaded", () => {
  // Seleccionamos todos los botones de favorito
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

        if (!response.ok) {
          console.error("Error en la respuesta del servidor");
          return;
        }

        const data = await response.json();
        const icon = button.querySelector("i");

        if (data.is_favorited) {
          // Si quedó en favoritos  estrella amarilla llena
          icon.classList.remove("bi-star");
          icon.classList.add("bi-star-fill", "text-warning");
        } else {
          // Si se quitó  estrella vacía
          icon.classList.remove("bi-star-fill", "text-warning");
          icon.classList.add("bi-star");
        }
      } catch (error) {
        console.error("Error al hacer la petición:", error);
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
