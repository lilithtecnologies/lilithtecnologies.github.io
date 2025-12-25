// Módulo para manejar la interfaz de usuario
class UIManager {
    constructor() {
        this.currentFilter = 'all';
        this.transactionToDelete = null;
    }

    // Inicializar eventos de la interfaz
    init() {
        this.setupFormEventListeners();
        this.setupNavigationEventListeners();
        this.setupModalEventListeners();
        this.setupFilterEventListeners();
        this.setupThemeToggle();
        this.setupResetButton();
        this.setCurrentDate();
    }

    // Configurar eventos de formularios
    setupFormEventListeners() {
        // Formulario de ingreso
        const incomeForm = document.getElementById('income-form');
        if (incomeForm) {
            incomeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addIncomeTransaction();
            });
        }

        // Cambio en frecuencia de ingresos
        const incomeFreq = document.getElementById('income-frequency');
        if (incomeFreq) {
            incomeFreq.addEventListener('change', (e) => {
                this.updateIncomeDynamicFields(e.target.value);
            });
        }

        // Formulario de gasto
        const expenseForm = document.getElementById('expense-form');
        if (expenseForm) {
            expenseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addExpenseTransaction();
            });
        }

        // Cambio en frecuencia de gastos
        const expenseFreq = document.getElementById('expense-frequency');
        if (expenseFreq) {
            expenseFreq.addEventListener('change', (e) => {
                this.updateExpenseDynamicFields(e.target.value);
            });
        }
    }

    // Actualizar campos dinámicos para ingresos
    updateIncomeDynamicFields(frequency) {
        const container = document.getElementById('income-dynamic-fields');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (frequency === 'monthly') {
            // Mostrar calendario para seleccionar día del mes
            container.innerHTML = `
                <div class="form-group">
                    <label for="income-day-month">Día del mes</label>
                    <div class="day-picker-month">
                        <div id="income-month-calendar" class="month-calendar"></div>
                    </div>
                </div>
            `;
            this.renderMonthCalendar('income-month-calendar');
        } else if (frequency === 'weekly') {
            // Mostrar lista de días de la semana
            container.innerHTML = `
                <div class="form-group">
                    <label>Días de la semana</label>
                    <div class="days-of-week-picker">
                        <label><input type="checkbox" name="income-day-week" value="1"> Lunes</label>
                        <label><input type="checkbox" name="income-day-week" value="2"> Martes</label>
                        <label><input type="checkbox" name="income-day-week" value="3"> Miércoles</label>
                        <label><input type="checkbox" name="income-day-week" value="4"> Jueves</label>
                        <label><input type="checkbox" name="income-day-week" value="5"> Viernes</label>
                        <label><input type="checkbox" name="income-day-week" value="6"> Sábado</label>
                        <label><input type="checkbox" name="income-day-week" value="0"> Domingo</label>
                    </div>
                </div>
            `;
        }
    }

    // Actualizar campos dinámicos para gastos
    updateExpenseDynamicFields(frequency) {
        const container = document.getElementById('expense-dynamic-fields');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (frequency === 'monthly') {
            // Mostrar calendario para seleccionar día del mes
            container.innerHTML = `
                <div class="form-group">
                    <label for="expense-day-month">Día del mes</label>
                    <div class="day-picker-month">
                        <div id="expense-month-calendar" class="month-calendar"></div>
                    </div>
                </div>
            `;
            this.renderMonthCalendar('expense-month-calendar');
        } else if (frequency === 'weekly') {
            // Mostrar lista de días de la semana
            container.innerHTML = `
                <div class="form-group">
                    <label>Días de la semana</label>
                    <div class="days-of-week-picker">
                        <label><input type="checkbox" name="expense-day-week" value="1"> Lunes</label>
                        <label><input type="checkbox" name="expense-day-week" value="2"> Martes</label>
                        <label><input type="checkbox" name="expense-day-week" value="3"> Miércoles</label>
                        <label><input type="checkbox" name="expense-day-week" value="4"> Jueves</label>
                        <label><input type="checkbox" name="expense-day-week" value="5"> Viernes</label>
                        <label><input type="checkbox" name="expense-day-week" value="6"> Sábado</label>
                        <label><input type="checkbox" name="expense-day-week" value="0"> Domingo</label>
                    </div>
                </div>
            `;
        }
    }

    // Renderizar calendario de mes
    renderMonthCalendar(calendarId) {
        const calendar = document.getElementById(calendarId);
        if (!calendar) return;
        
        calendar.innerHTML = '';
        
        for (let day = 1; day <= 31; day++) {
            const dayButton = document.createElement('button');
            dayButton.type = 'button';
            dayButton.className = 'calendar-day-btn';
            dayButton.textContent = day;
            dayButton.dataset.day = day;
            dayButton.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll(`#${calendarId} .calendar-day-btn`).forEach(btn => {
                    btn.classList.remove('selected');
                });
                dayButton.classList.add('selected');
            });
            calendar.appendChild(dayButton);
        }
    }

    // Obtener datos de frecuencia de ingresos
    getIncomeFrequencyData() {
        const frequency = document.getElementById('income-frequency').value;
        
        if (frequency === 'monthly') {
            const selected = document.querySelector('#income-month-calendar .calendar-day-btn.selected');
            if (!selected) {
                alert('Por favor, selecciona un día del mes.');
                return null;
            }
            return {
                frequency,
                day: parseInt(selected.dataset.day)
            };
        } else if (frequency === 'weekly') {
            const selected = Array.from(document.querySelectorAll('input[name="income-day-week"]:checked')).map(cb => parseInt(cb.value));
            if (selected.length === 0) {
                alert('Por favor, selecciona al menos un día de la semana.');
                return null;
            }
            return {
                frequency,
                days: selected
            };
        }
        
        return { frequency };
    }

    // Obtener datos de frecuencia de gastos
    getExpenseFrequencyData() {
        const frequency = document.getElementById('expense-frequency').value;
        
        if (frequency === 'monthly') {
            const selected = document.querySelector('#expense-month-calendar .calendar-day-btn.selected');
            if (!selected) {
                alert('Por favor, selecciona un día del mes.');
                return null;
            }
            return {
                frequency,
                day: parseInt(selected.dataset.day)
            };
        } else if (frequency === 'weekly') {
            const selected = Array.from(document.querySelectorAll('input[name="expense-day-week"]:checked')).map(cb => parseInt(cb.value));
            if (selected.length === 0) {
                alert('Por favor, selecciona al menos un día de la semana.');
                return null;
            }
            return {
                frequency,
                days: selected
            };
        }
        
        return { frequency };
    }

    // Agregar transacción de ingreso
    addIncomeTransaction() {
        const category = document.getElementById('income-category').value;
        const amount = document.getElementById('income-amount').value;
        const description = document.getElementById('income-description').value;
        const frequency = document.getElementById('income-frequency').value;
        
        if (!category || !amount) {
            alert('Por favor, completa todos los campos requeridos.');
            return;
        }

        const frequencyData = this.getIncomeFrequencyData();
        if (!frequencyData) {
            return;
        }

        transactionManager.addTransaction(
            'income',
            category,
            amount,
            description,
            frequencyData.frequency,
            frequencyData.day || null,
            frequencyData.days || null
        );

        this.showNotification('Ingreso agregado correctamente');
        this.render();
        
        document.getElementById('income-form').reset();
        this.updateIncomeDynamicFields('one-time');
        this.showSection('resumen-section');
    }

    // Agregar transacción de gasto
    addExpenseTransaction() {
        const category = document.getElementById('expense-category').value;
        const amount = document.getElementById('expense-amount').value;
        const description = document.getElementById('expense-description').value;
        const frequency = document.getElementById('expense-frequency').value;
        
        if (!category || !amount) {
            alert('Por favor, completa todos los campos requeridos.');
            return;
        }

        const frequencyData = this.getExpenseFrequencyData();
        if (!frequencyData) {
            return;
        }

        transactionManager.addTransaction(
            'expense',
            category,
            amount,
            description,
            frequencyData.frequency,
            frequencyData.day || null,
            frequencyData.days || null
        );

        this.showNotification('Gasto agregado correctamente');
        this.render();
        
        document.getElementById('expense-form').reset();
        this.updateExpenseDynamicFields('one-time');
        this.showSection('resumen-section');
    }

    // Configurar eventos de navegación
    setupNavigationEventListeners() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = item.dataset.section;
                this.showSection(sectionId);
                
                document.querySelectorAll('.nav-item').forEach(navItem => {
                    navItem.classList.remove('active');
                });
                item.classList.add('active');
            });
        });
    }

    // Mostrar sección
    showSection(sectionId) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('active');
            
            if (sectionId === 'historial-section') {
                this.renderHistory();
            }
        }
    }

    // Configurar eventos de filtros
    setupFilterEventListeners() {
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.filter;
                
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                
                this.renderHistory();
            });
        });
    }

    // Configurar eventos de modal
    setupModalEventListeners() {
        document.getElementById('cancel-delete')?.addEventListener('click', () => {
            this.closeDeleteModal();
        });
        
        document.getElementById('confirm-delete')?.addEventListener('click', () => {
            this.confirmDelete();
        });
        
        document.getElementById('cancel-reset')?.addEventListener('click', () => {
            this.closeResetModal();
        });
        
        document.getElementById('confirm-reset')?.addEventListener('click', () => {
            this.confirmReset();
        });
        
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    // Abrir modal de eliminación
    openDeleteModal(transactionId) {
        this.transactionToDelete = transactionId;
        document.getElementById('delete-modal')?.classList.add('active');
    }

    // Cerrar modal de eliminación
    closeDeleteModal() {
        this.transactionToDelete = null;
        document.getElementById('delete-modal')?.classList.remove('active');
    }

    // Confirmar eliminación
    confirmDelete() {
        if (this.transactionToDelete) {
            transactionManager.deleteTransaction(this.transactionToDelete);
            this.closeDeleteModal();
            this.showNotification('Transacción eliminada correctamente');
            this.render();
        }
    }

    // Abrir modal de restablecimiento
    openResetModal() {
        document.getElementById('reset-modal')?.classList.add('active');
    }

    // Cerrar modal de restablecimiento
    closeResetModal() {
        document.getElementById('reset-modal')?.classList.remove('active');
    }

    // Confirmar restablecimiento
    confirmReset() {
        transactionManager.clearAll();
        this.closeResetModal();
        this.showNotification('Datos restablecidos correctamente');
        this.render();
    }

    // Configurar botón de tema
    setupThemeToggle() {
        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            theme.toggleTheme();
        });
    }

    // Configurar botón de reinicio
    setupResetButton() {
        const resetBtn = document.getElementById('reset-data');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.openResetModal();
            });
        }
    }

    // Establecer fecha actual
    setCurrentDate() {
        const currentDateElement = document.getElementById('current-date');
        if (currentDateElement) {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            currentDateElement.textContent = now.toLocaleDateString('es-ES', options);
        }
    }

    // Renderizar saldo y próximos gastos
    render() {
        this.renderBalance();
        this.renderUpcoming();
    }

    // Renderizar saldo
    renderBalance() {
        const balance = transactionManager.calculateBalance();
        const balanceElement = document.getElementById('balance-amount');
        
        if (balanceElement) {
            balanceElement.textContent = `$${balance.toFixed(2)}`;
            
            if (balance < 0) {
                balanceElement.style.color = 'var(--expense-color)';
            } else if (balance === 0) {
                balanceElement.style.color = 'var(--text-color)';
            } else {
                balanceElement.style.color = 'var(--income-color)';
            }
        }
    }

    // Renderizar próximas transacciones
    renderUpcoming() {
        const upcomingList = document.getElementById('upcoming-list');
        if (!upcomingList) return;
        
        const upcomingExpenses = transactionManager.getUpcomingTransactions(7, 'expense');
        
        if (upcomingExpenses.length === 0) {
            upcomingList.innerHTML = `
                <div class="empty-upcoming">
                    <i class="fas fa-calendar-day"></i>
                    <p>No hay gastos programados para los próximos 7 días</p>
                </div>
            `;
            return;
        }
        
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

    // Renderizar historial
    renderHistory() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;
        
        const filteredTransactions = transactionManager.getFilteredTransactions(this.currentFilter);
        
        if (filteredTransactions.length === 0) {
            historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-receipt"></i>
                    <p>No hay transacciones registradas</p>
                </div>
            `;
            return;
        }
        
        const sortedTransactions = [...filteredTransactions].sort((a, b) => b.date - a.date);
        
        historyList.innerHTML = sortedTransactions.map(transaction => {
            const dateStr = transaction.date.toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            
            const frequencyText = transaction.isGenerated ? 
                '' : transaction.getFrequencyText(true);
            
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

    // Mostrar notificación
    showNotification(message) {
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
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
                document.head.removeChild(style);
            }, 300);
        }, 3000);
    }
}

// Crear instancia global del UI manager
const ui = new UIManager();
