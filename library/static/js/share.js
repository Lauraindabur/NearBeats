 function share_song(songId) {   // share_song
  const shareUrl = `${window.location.origin}/buscar/?filtro=&q=${songId}`;
  navigator.clipboard.writeText(shareUrl).then(() => {
    alert("Enlace de la canción copiado al portapapeles: " + shareUrl);
  });
}
