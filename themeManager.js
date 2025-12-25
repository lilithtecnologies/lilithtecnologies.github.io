// Módulo para manejar temas (modo claro/oscuro)
class ThemeManager {
    constructor() {
        this.DARK_THEME = 'dark';
        this.LIGHT_THEME = 'light';
    }

    // Inicializar el tema
    init() {
        const savedTheme = storage.loadTheme();
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // Verificar preferencia del sistema
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = prefersDark ? this.DARK_THEME : this.LIGHT_THEME;
            this.setTheme(theme);
        }
    }

    // Establecer tema
    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        storage.saveTheme(theme);
        this.updateThemeIcon(theme);
    }

    // Obtener tema actual
    getCurrentTheme() {
        return document.body.getAttribute('data-theme') || this.LIGHT_THEME;
    }

    // Cambiar tema
    toggleTheme() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === this.DARK_THEME ? this.LIGHT_THEME : this.DARK_THEME;
        this.setTheme(newTheme);
    }

    // Actualizar icono del tema
    updateThemeIcon(theme) {
        const themeIcon = document.querySelector('#theme-toggle i');
        if (themeIcon) {
            if (theme === this.DARK_THEME) {
                themeIcon.className = 'fas fa-sun';
            } else {
                themeIcon.className = 'fas fa-moon';
            }
        }
    }
}

// Crear instancia global del tema manager
const theme = new ThemeManager();
