document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll(".play-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      const songId = this.getAttribute("data-song-id");
      fetch(`/play/${songId}/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCookie('csrftoken'),
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'ok') {
          //location.reload(); Recarga la página para actualizar el contador
          const counter = document.getElementById('play-counter');
          if (counter){
            counter.textContent = parseInt(counter.textContent) + 1;
          }
        }
      });
    });
  });

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
}); 