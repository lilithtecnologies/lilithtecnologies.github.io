// Script principal que inicializa la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el tema
    theme.init();
    
    // Inicializar la interfaz de usuario
    ui.init();
    
    // Mostrar la sección de resumen por defecto
    ui.showSection('resumen-section');
    
    // Renderizar la aplicación
    ui.render();
});