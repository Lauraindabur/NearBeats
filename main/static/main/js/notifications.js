(function(){
  const POLL_INTERVAL = 30000; // 30s
  function getCookie(name){ const v=document.cookie.match('(^|;)\s*'+name+'\s*=\s*([^;]+)'); return v? v.pop(): ''; }

  async function fetchNotifs(){
    try{
      if(!window.NOTIFS_URL) return;
      const res = await fetch(window.NOTIFS_URL, {credentials: 'same-origin'});
      if(!res.ok) return;
      const data = await res.json();
      const notifs = data.notifications || [];
      if(notifs.length === 0) return;
      notifs.forEach(n => showToast(n));
    }catch(e){ /* para ignorar */ }
  }

  function showToast(n){
    const container = document.getElementById('notification-toast-container');
    if(!container) return;
    const id = 'notif-' + n.id;
    if(document.getElementById(id)) return;
    const div = document.createElement('div');
    div.id = id; div.className = 'toast border show'; div.style.minWidth = '260px'; div.style.marginBottom = '8px';
    div.innerHTML = `\
      <div class="toast-header">\
        <strong class="me-auto">Hay algo nuevo de ${n.artist_name}</strong>\
        <small class="text-muted ms-2">ahora</small>\
        <button type="button" class="btn-close ms-2" aria-label="Close" onclick="document.getElementById('${id}').remove()"></button>\
      </div>\
      <div class="toast-body">\
        ${n.message}\
        <div style="margin-top:.5rem"><a class="verperfil" data-id="${n.id}" href="/artist/profile/${encodeURIComponent(n.artist_name)}/">Ver perfil</a></div>\
      </div>`;
    container.appendChild(div);

    // Agregar ver perfil click handler, para marcar como leído y luego navegar
    const link = div.querySelector('.verperfil');
    if(link){
      link.addEventListener('click', function(e){
        e.preventDefault();
        const notifId = this.dataset.id;
        markRead([notifId]).then(()=>{
          window.location.href = this.href;
        }).catch(()=>{
          // navegar incluso si marcar como leído por alguna razon falla
          window.location.href = this.href;
        });
      });
    }

    setTimeout(()=>{ const e = document.getElementById(id); if(e) e.remove(); }, 12000);
  }

  async function markRead(ids){
    try{
      if(!window.MARK_URL) return;
      const token = getCookie('csrftoken');
      const form = new URLSearchParams();
      ids.forEach(i => form.append('ids[]', i));
      await fetch(window.MARK_URL, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'X-CSRFToken': token, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString()
      });
    }catch(e){ /* para ignorar */ }
  }

  document.addEventListener('DOMContentLoaded', function(){
    fetchNotifs();
    setInterval(fetchNotifs, POLL_INTERVAL);
  });
})();
