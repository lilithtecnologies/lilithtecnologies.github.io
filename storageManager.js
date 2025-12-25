// Módulo para manejar localStorage y persistencia de datos
class StorageManager {
    constructor() {
        this.TRANSACTIONS_KEY = 'oasis-transactions';
        this.NEXT_ID_KEY = 'oasis-next-id';
        this.THEME_KEY = 'oasis-theme';
    }

    // Guardar transacciones en localStorage
    saveTransactions(transactions) {
        localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions));
    }

    // Cargar transacciones desde localStorage
    loadTransactions() {
        const saved = localStorage.getItem(this.TRANSACTIONS_KEY);
        return saved ? JSON.parse(saved) : [];
    }

    // Guardar el siguiente ID
    saveNextId(nextId) {
        localStorage.setItem(this.NEXT_ID_KEY, nextId.toString());
    }

    // Cargar el siguiente ID
    loadNextId() {
        const saved = localStorage.getItem(this.NEXT_ID_KEY);
        return saved ? parseInt(saved) : null;
    }

    // Guardar tema
    saveTheme(theme) {
        localStorage.setItem(this.THEME_KEY, theme);
    }

    // Cargar tema
    loadTheme() {
        return localStorage.getItem(this.THEME_KEY);
    }

    // Limpiar todos los datos
    clearAll() {
        localStorage.removeItem(this.TRANSACTIONS_KEY);
        localStorage.removeItem(this.NEXT_ID_KEY);
        localStorage.removeItem(this.THEME_KEY);
    }

    // Eliminar solo transacciones
    clearTransactions() {
        localStorage.removeItem(this.TRANSACTIONS_KEY);
        localStorage.removeItem(this.NEXT_ID_KEY);
    }
}

// Crear instancia global del storage manager
const storage = new StorageManager();
