// Clase para manejar las transacciones
class Transaction {
    constructor(id, type, category, amount, description, date, frequency = "one-time", dayOfMonth = null, daysOfWeek = null) {
        this.id = id;
        this.type = type; // "income" o "expense"
        this.category = category;
        this.amount = parseFloat(amount);
        this.description = description || "";
        this.date = new Date(date);
        this.frequency = frequency; // "one-time", "daily", "weekly", "monthly"
        this.dayOfMonth = dayOfMonth; // Para gastos mensuales
        this.daysOfWeek = daysOfWeek; // Para gastos semanales
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
            // Para gastos semanales con días específicos
            if (this.daysOfWeek && this.daysOfWeek.length > 0) {
                return this.daysOfWeek.includes(checkDate.getDay());
            }
            // Fallback: mismo día de la semana
            return this.date.getDay() === checkDate.getDay();
        }
        
        if (this.frequency === "monthly") {
            // Para gastos mensuales con día específico
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
                
                // Siguiente semana
                currentDate.setDate(currentDate.getDate() + 7);
            }
        }
        
        if (this.frequency === "monthly") {
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
                
                // Siguiente mes
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        }
        
        return occurrences;
    }
}

// Clase para manejar la aplicación
class OasisApp {
    constructor() {
        this.transactions = [];
        this.nextId = 1;
        this.currentFilter = "all";
        this.transactionToDelete = null;
        
        // Inicializar la aplicación
        this.init();
    }
    
    init() {
        // Cargar transacciones del localStorage
        this.loadTransactions();
        
        // Inicializar campos dinámicos de gastos
        this.updateExpenseDynamicFields('one-time');
        
        // Configurar la fecha actual en la sección de saldo
        const currentDateElement = document.getElementById('current-date');
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElement.textContent = now.toLocaleDateString('es-ES', options);
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Configurar navegación
        this.setupNavigation();
        
        // Configurar tema
        this.setupTheme();
        
        // Renderizar la aplicación
        this.render();
    }
    
    setupEventListeners() {
        // Formulario de ingreso
        document.getElementById('income-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction('income');
        });
        
        // Formulario de gasto
        document.getElementById('expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction('expense');
        });
        
        // Cambio en la frecuencia de gastos para mostrar campos dinámicos
        document.getElementById('expense-frequency').addEventListener('change', (e) => {
            this.updateExpenseDynamicFields(e.target.value);
        });
        
        // Filtros del historial
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.setFilter(filter);
            });
        });
        
        // Botón de cambio de tema
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Modal de eliminación
        document.getElementById('cancel-delete').addEventListener('click', () => {
            this.closeDeleteModal();
        });
        
        document.getElementById('confirm-delete').addEventListener('click', () => {
            this.confirmDelete();
        });
        
        // Modal de restablecimiento
        document.getElementById('cancel-reset').addEventListener('click', () => {
            this.closeResetModal();
        });
        
        document.getElementById('confirm-reset').addEventListener('click', () => {
            this.confirmReset();
        });
        
        // Restablecer datos
        document.getElementById('reset-data').addEventListener('click', () => {
            this.openResetModal();
        });
        
        // Cerrar modal al hacer clic fuera
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }
    
    updateExpenseDynamicFields(frequency) {
        const container = document.getElementById('expense-dynamic-fields');
        container.innerHTML = '';
        
        if (frequency === 'monthly') {
            // Mostrar calendario para seleccionar día del mes
            container.innerHTML = `
                <div class="form-group">
                    <label for="expense-day-month">Día del mes</label>
                    <div class="day-picker-month">
                        <div id="month-calendar" class="month-calendar"></div>
                    </div>
                </div>
            `;
            this.renderMonthCalendar();
        } else if (frequency === 'weekly') {
            // Mostrar lista de días de la semana
            container.innerHTML = `
                <div class="form-group">
                    <label>Días de la semana</label>
                    <div class="days-of-week-picker">
                        <label><input type="checkbox" name="day-week" value="1"> Lunes</label>
                        <label><input type="checkbox" name="day-week" value="2"> Martes</label>
                        <label><input type="checkbox" name="day-week" value="3"> Miércoles</label>
                        <label><input type="checkbox" name="day-week" value="4"> Jueves</label>
                        <label><input type="checkbox" name="day-week" value="5"> Viernes</label>
                        <label><input type="checkbox" name="day-week" value="6"> Sábado</label>
                        <label><input type="checkbox" name="day-week" value="0"> Domingo</label>
                    </div>
                </div>
            `;
        } else if (frequency === 'daily') {
            // No hay configuración adicional para diario
            container.innerHTML = '';
        } else {
            // Para "one-time", no se muestra nada adicional
            container.innerHTML = '';
        }
    }
    
    renderMonthCalendar() {
        const calendar = document.getElementById('month-calendar');
        calendar.innerHTML = '';
        
        // Crear números del 1 al 31
        for (let day = 1; day <= 31; day++) {
            const dayButton = document.createElement('button');
            dayButton.type = 'button';
            dayButton.className = 'calendar-day-btn';
            dayButton.textContent = day;
            dayButton.dataset.day = day;
            dayButton.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.calendar-day-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });
                dayButton.classList.add('selected');
            });
            calendar.appendChild(dayButton);
        }
    }
    
    getExpenseFrequencyData() {
        const frequency = document.getElementById('expense-frequency').value;
        
        if (frequency === 'monthly') {
            const selected = document.querySelector('.calendar-day-btn.selected');
            if (!selected) {
                alert('Por favor, selecciona un día del mes.');
                return null;
            }
            return {
                frequency,
                day: parseInt(selected.dataset.day)
            };
        } else if (frequency === 'weekly') {
            const selected = Array.from(document.querySelectorAll('input[name="day-week"]:checked')).map(cb => parseInt(cb.value));
            if (selected.length === 0) {
                alert('Por favor, selecciona al menos un día de la semana.');
                return null;
            }
            return {
                frequency,
                days: selected
            };
        } else if (frequency === 'one-time') {
            // Para gastos únicos, solo retornar la frecuencia
            return { frequency };
        }
        
        // Para diario y otros
        return { frequency };
    }
    
    setupNavigation() {
        // Navegación por el menú inferior
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = item.dataset.section;
                this.showSection(sectionId);
                
                // Actualizar estado activo del menú
                document.querySelectorAll('.nav-item').forEach(navItem => {
                    navItem.classList.remove('active');
                });
                item.classList.add('active');
            });
        });
    }
    
    showSection(sectionId) {
        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Mostrar la sección seleccionada
        document.getElementById(sectionId).classList.add('active');
        
        // Si es la sección de historial, renderizar el historial
        if (sectionId === 'historial-section') {
            this.renderHistory();
        }
    }
    
    setupTheme() {
        // Verificar si hay una preferencia guardada
        const savedTheme = localStorage.getItem('oasis-theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
            this.updateThemeIcon(savedTheme);
        } else {
            // Verificar preferencia del sistema
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = prefersDark ? 'dark' : 'light';
            document.body.setAttribute('data-theme', theme);
            this.updateThemeIcon(theme);
        }
    }
    
    updateThemeIcon(theme) {
        const themeIcon = document.querySelector('#theme-toggle i');
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }
    
    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('oasis-theme', newTheme);
        this.updateThemeIcon(newTheme);
    }
    
    addTransaction(type) {
        let category, amount, description, frequency;
        let frequencyData = { frequency: 'one-time' };
        
        if (type === 'income') {
            category = document.getElementById('income-category').value;
            amount = document.getElementById('income-amount').value;
            description = document.getElementById('income-description').value;
            frequency = document.getElementById('income-frequency').value;
        } else {
            category = document.getElementById('expense-category').value;
            amount = document.getElementById('expense-amount').value;
            description = document.getElementById('expense-description').value;
            frequency = document.getElementById('expense-frequency').value;
            
            // Validar y obtener datos adicionales para gastos
            frequencyData = this.getExpenseFrequencyData();
            if (!frequencyData) {
                return;
            }
            frequency = frequencyData.frequency;
        }
        
        // Validar campos
        if (!category || !amount) {
            alert('Por favor, completa todos los campos requeridos.');
            return;
        }
        
        // Obtener la fecha actual del sistema
        const today = new Date();
        const dateStr = today.toISOString();
        
        // Crear nueva transacción
        const transaction = new Transaction(
            this.nextId++,
            type,
            category,
            amount,
            description,
            dateStr,
            frequency,
            frequencyData.day || null,
            frequencyData.days || null
        );
        
        // Agregar a la lista
        this.transactions.push(transaction);
        
        // Guardar en localStorage
        this.saveTransactions();
        
        // Renderizar la aplicación
        this.render();
        
        // Limpiar formulario
        if (type === 'income') {
            document.getElementById('income-form').reset();
        } else {
            document.getElementById('expense-form').reset();
            this.updateExpenseDynamicFields('one-time');
        }
        
        // Mostrar mensaje de éxito
        this.showNotification(`${type === 'income' ? 'Ingreso' : 'Gasto'} agregado correctamente`);
        
        // Regresar a la sección de resumen
        this.showSection('resumen-section');
        document.querySelectorAll('.nav-item').forEach(navItem => {
            navItem.classList.remove('active');
            if (navItem.dataset.section === 'resumen-section') {
                navItem.classList.add('active');
            }
        });
    }
    
    deleteTransaction(id) {
        // Buscar la transacción
        const index = this.transactions.findIndex(t => t.id === id);
        
        if (index !== -1) {
            // Eliminar la transacción y todas sus ocurrencias generadas
            const parentId = this.transactions[index].id;
            this.transactions = this.transactions.filter(t => 
                t.id !== id && t.parentId !== parentId
            );
            
            // Guardar en localStorage
            this.saveTransactions();
            
            // Renderizar la aplicación
            this.render();
            
            // Mostrar mensaje de éxito
            this.showNotification('Transacción eliminada correctamente');
        }
    }
    
    openDeleteModal(transactionId) {
        this.transactionToDelete = transactionId;
        document.getElementById('delete-modal').classList.add('active');
    }
    
    closeDeleteModal() {
        this.transactionToDelete = null;
        document.getElementById('delete-modal').classList.remove('active');
    }
    
    confirmDelete() {
        if (this.transactionToDelete) {
            this.deleteTransaction(this.transactionToDelete);
            this.closeDeleteModal();
        }
    }
    
    openResetModal() {
        document.getElementById('reset-modal').classList.add('active');
    }
    
    closeResetModal() {
        document.getElementById('reset-modal').classList.remove('active');
    }
    
    confirmReset() {
        // Restablecer datos
        this.transactions = [];
        this.nextId = 1;
        localStorage.removeItem('oasis-transactions');
        localStorage.removeItem('oasis-next-id');
        
        // Renderizar la aplicación
        this.render();
        
        // Cerrar modal
        this.closeResetModal();
        
        // Mostrar mensaje
        this.showNotification('Datos restablecidos correctamente');
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Actualizar botones activos
        document.querySelectorAll('.filter-btn').forEach(button => {
            if (button.dataset.filter === filter) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Renderizar el historial
        this.renderHistory();
    }
    
    calculateBalance() {
        let balance = 0;
        const today = new Date();
        
        // Obtener todas las transacciones hasta la fecha actual (incluyendo recurrentes generadas)
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
    
    // Obtener todas las ocurrencias de transacciones hasta una fecha específica
    getAllTransactionOccurrences(untilDate) {
        const allOccurrences = [];
        
        // Para cada transacción, generar ocurrencias hasta la fecha límite
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
    
    getUpcomingExpenses() {
        const upcoming = [];
        const today = new Date();
        
        // Calcular los próximos 7 días
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            // Buscar gastos programados para esta fecha
            const expensesOnDate = this.transactions.filter(t => 
                t.type === 'expense' && t.occursOnDate(date)
            );
            
            expensesOnDate.forEach(expense => {
                upcoming.push({
                    date: date,
                    transaction: expense
                });
            });
        }
        
        // Ordenar por fecha
        upcoming.sort((a, b) => a.date - b.date);
        
        return upcoming;
    }
    
    getFilteredTransactions() {
        const today = new Date();
        const allOccurrences = this.getAllTransactionOccurrences(today);
        
        if (this.currentFilter === 'all') {
            return allOccurrences;
        } else {
            return allOccurrences.filter(t => t.type === this.currentFilter);
        }
    }
    
    saveTransactions() {
        localStorage.setItem('oasis-transactions', JSON.stringify(this.transactions));
        localStorage.setItem('oasis-next-id', this.nextId.toString());
    }
    
    loadTransactions() {
        const savedTransactions = localStorage.getItem('oasis-transactions');
        const savedNextId = localStorage.getItem('oasis-next-id');
        
        if (savedTransactions) {
            const parsedTransactions = JSON.parse(savedTransactions);
            
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
        }
        
        if (savedNextId) {
            this.nextId = parseInt(savedNextId);
        } else {
            // Si no hay ID guardado, establecerlo basado en las transacciones cargadas
            this.nextId = this.transactions.length > 0 
                ? Math.max(...this.transactions.map(t => t.id)) + 1
                : 1;
        }
    }
    
    render() {
        // Actualizar saldo
        const balance = this.calculateBalance();
        const balanceElement = document.getElementById('balance-amount');
        balanceElement.textContent = `$${balance.toFixed(2)}`;
        
        // Actualizar color del saldo
        if (balance < 0) {
            balanceElement.style.color = 'var(--expense-color)';
        } else if (balance === 0) {
            balanceElement.style.color = 'var(--text-color)';
        } else {
            balanceElement.style.color = 'var(--income-color)';
        }
        
        // Renderizar próximos gastos
        this.renderUpcoming();
    }
    
    renderUpcoming() {
        const upcomingList = document.getElementById('upcoming-list');
        const upcomingExpenses = this.getUpcomingExpenses();
        
        if (upcomingExpenses.length === 0) {
            upcomingList.innerHTML = `
                <div class="empty-upcoming">
                    <i class="fas fa-calendar-day"></i>
                    <p>No hay gastos programados para los próximos 7 días</p>
                </div>
            `;
            return;
        }
        
        // Limitar a 6 elementos para no saturar la vista
        const limitedExpenses = upcomingExpenses.slice(0, 6);
        
        upcomingList.innerHTML = limitedExpenses.map(item => {
            const dateStr = item.date.toLocaleDateString('es-ES', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
            
            return `
                <div class="upcoming-item">
                    <div class="upcoming-date">${dateStr}</div>
                    <div class="upcoming-description">${item.transaction.getCategoryName()}</div>
                    <div class="upcoming-amount">-$${item.transaction.amount.toFixed(2)}</div>
                </div>
            `;
        }).join('');
    }
    
    renderHistory() {
        const historyList = document.getElementById('history-list');
        const filteredTransactions = this.getFilteredTransactions();
        
        if (filteredTransactions.length === 0) {
            historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-receipt"></i>
                    <p>No hay transacciones registradas</p>
                </div>
            `;
            return;
        }
        
        // Ordenar por fecha (más reciente primero)
        const sortedTransactions = [...filteredTransactions].sort((a, b) => b.date - a.date);
        
        historyList.innerHTML = sortedTransactions.map(transaction => {
            const dateStr = transaction.date.toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            
            const frequencyText = transaction.isGenerated ? 
                (transaction.frequency === 'one-time' ? '' : 
                 transaction.frequency === 'daily' ? ' (Diario)' :
                 transaction.frequency === 'weekly' ? ' (Semanal)' : ' (Mensual)') : 
                (transaction.frequency === 'one-time' ? 'Una vez' : 
                 transaction.frequency === 'daily' ? 'Diario' :
                 transaction.frequency === 'weekly' ? 'Semanal' : 'Mensual');
            
            return `
                <div class="history-item ${transaction.type}">
                    <div class="history-info">
                        <div class="history-category">
                            <i class="${transaction.getCategoryIcon()}"></i>
                            ${transaction.getCategoryName()}
                            ${transaction.isGenerated ? '<span class="recurring-badge">Auto</span>' : ''}
                        </div>
                        <div class="history-description">${transaction.description || ''}</div>
                        <div class="history-date">${dateStr} • ${frequencyText}</div>
                    </div>
                    <div class="history-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                    </div>
                    ${!transaction.isGenerated ? `
                    <div class="history-actions">
                        <button class="delete-btn" data-id="${transaction.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    ` : ''}
                </div>
            `;
        }).join('');
        
        // Agregar eventos a los botones de eliminar
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.delete-btn').dataset.id);
                this.openDeleteModal(id);
            });
        });
        
        // Agregar estilos para la insignia de recurrente
        if (!document.getElementById('recurring-styles')) {
            const style = document.createElement('style');
            style.id = 'recurring-styles';
            style.textContent = `
                .recurring-badge {
                    background-color: var(--secondary-color);
                    color: white;
                    font-size: 0.7rem;
                    padding: 0.1rem 0.4rem;
                    border-radius: 10px;
                    margin-left: 0.5rem;
                    font-weight: 600;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    showNotification(message) {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: calc(var(--bottom-nav-height) + 20px);
            right: 20px;
            background-color: var(--primary-color);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 1001;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;
        
        // Estilos de animación
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        // Agregar al DOM
        document.body.appendChild(notification);
        
        // Eliminar después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
                document.head.removeChild(style);
            }, 300);
        }, 3000);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new OasisApp();
});