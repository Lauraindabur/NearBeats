function setFiltro(inputId, value, event, label) {
  // 1) evita comportamiento por defecto del <a>
  if (event) event.preventDefault();

  // 2) localizar el contenedor relacionado con el elemento clicado
  let container = null;
  if (event && event.target) {
    // container = event.target.closest('.dropdown, .offcanvas, .offcanvas-body, .list-group, form');
    container = event.target.closest('.dropdownHome');
  }
  

  // 3) intentar localizar el input oculto DENTRO del contenedor; si no, hacer fallback local por id
  let input = null;
  if (container) {
    try {
      input = container.querySelector('#' + inputId);
    } catch (e) {
      // si el id tiene caracteres raros que rompen querySelector, ignoramos
      input = null;
    }
  }

  if (!input) {
    // fallback seguro: getElementById (global) solo si no hay contenedor o no se encontró localmente
    input = document.getElementById(inputId);
  }

  if (!input) {
    console.warn(`No se encontró input con id "${inputId}"`);
    return;
  }
  input.value = value;

  // 3) determinar el texto que vamos a poner en el botón
  //    si se pasó label lo usamos, si no, tomamos el texto del elemento clicado (event.target)
  let labelText = typeof label === 'string' && label.length ? label : null;
  if (!labelText && event && event.target) {
    labelText = event.target.textContent.trim();
  }

  // 4) encontrar el botón del dropdown correspondiente
  //    Priorizar buscar el botón DENTRO del mismo contenedor o asociado al input.
  let btn = null;
  // preferir botón dentro del mismo contenedor
  if (container) {
    btn = container.querySelector('.dropdown-toggle');
  }

  // si no está, intentar buscar el .dropdown que contiene el input
  if (!btn) {
    const inputDropdown = input.closest('.dropdownHome');
    if (inputDropdown) btn = inputDropdown.querySelector('.dropdown-toggle');
  }

  // Nota: NO hacemos fallback a document.querySelector('.dropdown-toggle') para evitar
  // modificar el navbar u otros dropdowns globales por accidente.

  // 5) si encontramos el botón y tenemos labelText, actualizar su texto de forma segura
  if (btn && labelText) {
    // Preferimos actualizar un <span> interno si existe (evita borrar iconos o children)
    const innerSpan = btn.querySelector('#filtroSeleccionado') || btn.querySelector('span');
    if (innerSpan) innerSpan.textContent = labelText;
    else btn.textContent = labelText;
  }

  // 6) marcar visualmente el item activo dentro del menú (solo en el mismo dropdown)
  const menu = input.closest('.dropdownHome') ? input.closest('.dropdownHome').querySelector('.dropdown-menu') : (container ? container.querySelector('.dropdown-menu') : null);
  if (menu && event && event.target) {
    menu.querySelectorAll('.dropdown-item').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');
  }

  // 7) logging opcional para depuración
  console.log(`Filtro asignado: ${inputId} = ${value} (label: ${labelText})`, { container: container, input: input, btn: btn });

  // 8) logging opcional para depuración
  console.log(`Filtro asignado: ${inputId} = ${value} (label: ${labelText})`);
}
