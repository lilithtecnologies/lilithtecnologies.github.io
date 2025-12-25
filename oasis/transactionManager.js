// Módulo para manejar transacciones
class Transaction {
    constructor(id, type, category, amount, description, date, frequency = "one-time", dayOfMonth = null, daysOfWeek = null) {
        this.id = id;
        this.type = type; // "income" o "expense"
        this.category = category;
        this.amount = parseFloat(amount);
        this.description = description || "";
        this.date = new Date(date);
        this.frequency = frequency; // "one-time", "daily", "weekly", "monthly"
        this.dayOfMonth = dayOfMonth; // Para transacciones mensuales
        this.daysOfWeek = daysOfWeek; // Para transacciones semanales
        this.isGenerated = false; // Para identificar transacciones generadas automáticamente
        this.parentId = null; // Para transacciones recurrentes generadas
    }
    
    // Obtener el nombre de la categoría
    getCategoryName() {
        const categoryNames = {
            "beca": "Beca",
            "salario": "Salario",
            "ayuda": "Ayuda familiar",
            "otros-ingresos": "Otros ingresos",
            "comida": "Comida",
            "transporte": "Transporte",
            "ocio": "Ocio",
            "estudio": "Estudio",
            "vivienda": "Vivienda",
            "viaje": "Viaje",
            "otros-gastos": "Otros gastos"
        };
        
        return categoryNames[this.category] || this.category;
    }
    
    // Obtener el ícono de la categoría
    getCategoryIcon() {
        const categoryIcons = {
            "beca": "fas fa-graduation-cap",
            "salario": "fas fa-money-check-alt",
            "ayuda": "fas fa-hands-helping",
            "otros-ingresos": "fas fa-wallet",
            "comida": "fas fa-utensils",
            "transporte": "fas fa-bus",
            "ocio": "fas fa-gamepad",
            "estudio": "fas fa-book",
            "vivienda": "fas fa-home",
            "viaje": "fas fa-plane",
            "otros-gastos": "fas fa-shopping-bag"
        };
        
        return categoryIcons[this.category] || "fas fa-receipt";
    }

    // Obtener texto de frecuencia legible
    getFrequencyText(includeSchedule = true) {
        let text = '';
        
        if (this.frequency === 'one-time') {
            text = 'Una vez';
        } else if (this.frequency === 'daily') {
            text = 'Diario';
        } else if (this.frequency === 'weekly') {
            text = 'Semanal';
            if (includeSchedule && this.daysOfWeek && this.daysOfWeek.length > 0) {
                const daysName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                const dayLabels = this.daysOfWeek.map(d => daysName[d]).join(', ');
                text += ` (${dayLabels})`;
            }
        } else if (this.frequency === 'monthly') {
            text = 'Mensual';
            if (includeSchedule && this.dayOfMonth) {
                text += ` (día ${this.dayOfMonth})`;
            }
        }
        
        return text;
    }
    
    // Verificar si la transacción ocurre en una fecha específica
    occursOnDate(date) {
        const checkDate = new Date(date);
        
        if (this.frequency === "one-time") {
            return this.date.toDateString() === checkDate.toDateString();
        }
        
        if (this.frequency === "daily") {
            return true; // Ocurre todos los días
        }
        
        if (this.frequency === "weekly") {
            // Para transacciones semanales con días específicos
            if (this.daysOfWeek && this.daysOfWeek.length > 0) {
                return this.daysOfWeek.includes(checkDate.getDay());
            }
            // Fallback: mismo día de la semana
            return this.date.getDay() === checkDate.getDay();
        }
        
        if (this.frequency === "monthly") {
            // Para transacciones mensuales con día específico
            if (this.dayOfMonth) {
                return this.dayOfMonth === checkDate.getDate();
            }
            // Fallback: mismo día del mes
            return this.date.getDate() === checkDate.getDate();
        }
        
        return false;
    }
    
    // Generar ocurrencias recurrentes hasta una fecha específica
    generateOccurrences(untilDate) {
        const occurrences = [];
        
        if (this.frequency === "one-time") {
            return [this];
        }
        
        const startDate = new Date(this.date);
        const endDate = new Date(untilDate);
        
        if (this.frequency === "daily") {
            let currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                const occurrence = new Transaction(
                    this.id,
                    this.type,
                    this.category,
                    this.amount,
                    this.description,
                    new Date(currentDate),
                    this.frequency,
                    this.dayOfMonth,
                    this.daysOfWeek
                );
                occurrence.isGenerated = true;
                occurrence.parentId = this.id;
                occurrences.push(occurrence);
                
                // Siguiente día
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        
        if (this.frequency === "weekly") {
            let currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                if (this.daysOfWeek && this.daysOfWeek.includes(currentDate.getDay())) {
                    const occurrence = new Transaction(
                        this.id,
                        this.type,
                        this.category,
                        this.amount,
                        this.description,
                        new Date(currentDate),
                        this.frequency,
                        this.dayOfMonth,
                        this.daysOfWeek
                    );
                    occurrence.isGenerated = true;
                    occurrence.parentId = this.id;
                    occurrences.push(occurrence);
                }
                
                // Siguiente día para verificar
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        
        if (this.frequency === "monthly") {
            let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), this.dayOfMonth || startDate.getDate());
            while (currentDate <= endDate) {
                const occurrence = new Transaction(
                    this.id,
                    this.type,
                    this.category,
                    this.amount,
                    this.description,
                    new Date(currentDate),
                    this.frequency,
                    this.dayOfMonth,
                    this.daysOfWeek
                );
                occurrence.isGenerated = true;
                occurrence.parentId = this.id;
                occurrences.push(occurrence);
                
                // Siguiente mes
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        }
        
        return occurrences;
    }
}

// Clase para manejar transacciones
class TransactionManager {
    constructor() {
        this.transactions = [];
        this.nextId = 1;
        this.loadTransactions();
    }

    // Cargar transacciones del storage
    loadTransactions() {
        const parsedTransactions = storage.loadTransactions();
        
        // Reconstruir objetos Transaction
        this.transactions = parsedTransactions.map(t => 
            new Transaction(
                t.id,
                t.type,
                t.category,
                t.amount,
                t.description,
                t.date,
                t.frequency,
                t.dayOfMonth || null,
                t.daysOfWeek || null
            )
        );
        
        const savedNextId = storage.loadNextId();
        if (savedNextId) {
            this.nextId = savedNextId;
        } else {
            // Si no hay ID guardado, establecerlo basado en las transacciones cargadas
            this.nextId = this.transactions.length > 0 
                ? Math.max(...this.transactions.map(t => t.id)) + 1
                : 1;
        }
    }

    // Guardar transacciones en storage
    saveTransactions() {
        storage.saveTransactions(this.transactions);
        storage.saveNextId(this.nextId);
    }

    // Agregar nueva transacción
    addTransaction(type, category, amount, description, frequency, dayOfMonth = null, daysOfWeek = null) {
        const today = new Date();
        const dateStr = today.toISOString();
        
        const transaction = new Transaction(
            this.nextId++,
            type,
            category,
            amount,
            description,
            dateStr,
            frequency,
            dayOfMonth,
            daysOfWeek
        );
        
        this.transactions.push(transaction);
        this.saveTransactions();
        
        return transaction;
    }

    // Eliminar transacción y sus ocurrencias generadas
    deleteTransaction(id) {
        const parentId = this.transactions.find(t => t.id === id)?.id;
        this.transactions = this.transactions.filter(t => 
            t.id !== id && t.parentId !== parentId
        );
        this.saveTransactions();
    }

    // Obtener todas las ocurrencias de transacciones hasta una fecha específica
    getAllTransactionOccurrences(untilDate) {
        const allOccurrences = [];
        
        this.transactions.forEach(transaction => {
            if (transaction.frequency === "one-time") {
                // Solo agregar transacciones únicas que ya ocurrieron o ocurren hoy
                if (transaction.date <= untilDate) {
                    allOccurrences.push(transaction);
                }
            } else {
                // Generar ocurrencias recurrentes
                const occurrences = transaction.generateOccurrences(untilDate);
                // Filtrar solo las que ya ocurrieron (hasta hoy)
                const pastOccurrences = occurrences.filter(occ => occ.date <= untilDate);
                allOccurrences.push(...pastOccurrences);
            }
        });
        
        return allOccurrences;
    }

    // Obtener transacciones filtradas
    getFilteredTransactions(filter = 'all') {
        const today = new Date();
        const allOccurrences = this.getAllTransactionOccurrences(today);
        
        if (filter === 'all') {
            return allOccurrences;
        } else {
            return allOccurrences.filter(t => t.type === filter);
        }
    }

    // Calcular saldo actual
    calculateBalance() {
        let balance = 0;
        const today = new Date();
        
        const allOccurrences = this.getAllTransactionOccurrences(today);
        
        allOccurrences.forEach(transaction => {
            if (transaction.type === 'income') {
                balance += transaction.amount;
            } else {
                balance -= transaction.amount;
            }
        });
        
        return balance;
    }

    // Obtener próximos gastos/ingresos (7 días)
    getUpcomingTransactions(days = 7, type = null) {
        const upcoming = [];
        const today = new Date();
        
        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const transactionsOnDate = this.transactions.filter(t => 
                (!type || t.type === type) && t.occursOnDate(date)
            );
            
            transactionsOnDate.forEach(trans => {
                upcoming.push({
                    date: date,
                    transaction: trans
                });
            });
        }
        
        // Ordenar por fecha
        upcoming.sort((a, b) => a.date - b.date);
        
        return upcoming;
    }

    // Limpiar todas las transacciones
    clearAll() {
        this.transactions = [];
        this.nextId = 1;
        storage.clearTransactions();
    }
}

// Crear instancia global del transaction manager
const transactionManager = new TransactionManager();
