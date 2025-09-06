function toggleFollow(button) {  // follow_artist
    const artistName = button.getAttribute('data-artist-id');
    fetch('/follows/ajax-toggle-follow/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: `artist_name=${encodeURIComponent(artistName)}`
    })
    .then(response => response.json())
    .then(data => {
        const icon = button.querySelector('i');
        if (data.is_followed) {
            icon.classList.add('bi-person-plus-fill', 'text-success');
            icon.classList.remove('bi-person-plus');
        } else {
            icon.classList.remove('bi-person-plus-fill', 'text-success');
            icon.classList.add('bi-person-plus');
        }
        // Si tienes un contador de seguidores, actualízalo aquí
        // document.getElementById('followers-count').textContent = data.followers_count;
    });
}

// Utilidad para obtener el CSRF token
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

function showFollowersCount(button) {
    const artistName = button.getAttribute('data-artist-id');
    fetch(`/follows/get-followers-count/?artist_name=${encodeURIComponent(artistName)}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('followers-count').textContent = data.followers_count + ' seguidores';
                // Mostrar el modal (Bootstrap 5)
                const modal = new bootstrap.Modal(document.getElementById('followersModal'));
                modal.show();
            });
}
