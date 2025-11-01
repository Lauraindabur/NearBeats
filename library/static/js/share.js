 function share_song(songId) {   // share_song
  const shareUrl = `${window.location.origin}/buscar/?filtro=&q=${songId}`;
  navigator.clipboard.writeText(shareUrl).then(() => {
    alert("Enlace de la canción copiado al portapapeles: " + shareUrl);
  });
}

// Funcion que genera y copia url con la que se podrá acceder a una pantalla con la playlist
// de momento aprovechamos que ya habia un html para mostrar las playlist -> playlist_detail, entonces lo que hacemos copiar en portapapeles el link de este para la playlist especifica
function share_playlist(playlist_id) {
  const share_url = `${window.location.origin}/playlists/${playlist_id}`; //Recibimos desde html el id, y lo estructuramos en la url que ya fue creada con nombre playlist_detail
   if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(share_url).then(() => {
      alert("Enlace de la playlist copiado al portapapeles: " + share_url);
    }).catch(err => {
      console.error("Falla al copiar enlace:", err);
    });
   }
}