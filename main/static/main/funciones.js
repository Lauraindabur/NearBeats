function setFiltro(inputId, value, event) {
    if (event) event.preventDefault(); // Evita que el enlace recargue la página
    const input = document.getElementById(inputId);
    if (input) {
      input.value = value;
      console.log(`Filtro asignado: ${inputId} = ${value}`);
    }
}