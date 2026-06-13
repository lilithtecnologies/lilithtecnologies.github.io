let consistencyChart = null;

function renderStatsView() {
    const app = document.getElementById("app");
    const workouts = getCompletedWorkouts();

    // Stats calculations
    const totalWorkouts = workouts.length;
    
    // Month workouts
    const monthWorkouts = getCurrentMonthWorkouts(workouts).length;

    // Week workouts
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0,0,0,0);
    const weekWorkouts = workouts.filter(w => new Date(w.completedAt || w.date) >= startOfWeek).length;

    // Total time trained
    const totalSeconds = workouts.reduce((acc, w) => acc + (w.duration || 0), 0);
    const totalHours = Math.floor(totalSeconds / 3600);
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
    const totalTimeStr = totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : `${totalMinutes}m`;

    const currentStreak = calculateCurrentStreak(workouts);
    const longestStreak = calculateLongestStreak(workouts);

    // Most repeated workout
    const templateCounts = {};
    workouts.forEach(w => {
        const title = w.templateTitle || 'Sin título';
        templateCounts[title] = (templateCounts[title] || 0) + 1;
    });
    let mostRepeated = "Ninguno";
    let maxCount = 0;
    for (const title in templateCounts) {
        if (templateCounts[title] > maxCount) {
            maxCount = templateCounts[title];
            mostRepeated = `${title} (${maxCount}x)`;
        }
    }

    // Favorite most used
    const favTemplates = getTemplates().filter(t => t.favorite === true);
    const favUsage = {};
    favTemplates.forEach(t => {
        favUsage[t.title] = 0;
    });
    workouts.forEach(w => {
        if (w.templateTitle && favUsage[w.templateTitle] !== undefined) {
            favUsage[w.templateTitle]++;
        }
    });
    let mostUsedFav = "Ninguno";
    let maxFavCount = 0;
    for (const title in favUsage) {
        if (favUsage[title] > maxFavCount) {
            maxFavCount = favUsage[title];
            mostUsedFav = `${title} (${maxFavCount}x)`;
        }
    }

    app.innerHTML = `
        <section class="fade-in">
            <h2 class="section-title">Estadísticas</h2>

            <!-- Premium Stats Grid -->
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${totalWorkouts}</h3>
                    <p>Total entrenos</p>
                </div>
                <div class="stat-card">
                    <h3>${weekWorkouts}</h3>
                    <p>Esta semana</p>
                </div>
                <div class="stat-card">
                    <h3>${monthWorkouts}</h3>
                    <p>Este mes</p>
                </div>
                <div class="stat-card">
                    <h3>${totalTimeStr}</h3>
                    <p>Tiempo total</p>
                </div>
                <div class="stat-card">
                    <h3>${currentStreak}</h3>
                    <p>Racha actual</p>
                </div>
                <div class="stat-card">
                    <h3>${longestStreak}</h3>
                    <p>Mejor racha</p>
                </div>
            </div>

            <!-- Best / Most Popular Athlete Stats -->
            <div class="card" style="margin-top: 16px;">
                <h3 style="margin-bottom: 12px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                    <i data-lucide="trending-up" style="width: 18px; height: 18px; color: var(--primary);"></i> Frecuencia y Uso
                </h3>
                <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.95rem;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: 6px;">
                        <span style="color: var(--text-secondary);">Entreno más repetido:</span>
                        <strong style="color: var(--text);">${mostRepeated}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding-bottom: 2px;">
                        <span style="color: var(--text-secondary);">Favorito más usado:</span>
                        <strong style="color: var(--text);">${mostUsedFav}</strong>
                    </div>
                </div>
            </div>

            ${renderCalendar(workouts)}

            <div class="card" style="margin-top:20px;">
                <h3 style="margin-bottom:16px;">Consistencia</h3>
                <canvas id="consistencyChart"></canvas>
            </div>

            <!-- History Section -->
            <div class="card" style="margin-top:20px;">
                <h3 style="margin-bottom:16px; display: flex; align-items: center; gap: 8px;">
                    <i data-lucide="history" style="width: 20px; height: 20px; color: var(--primary);"></i> Historial de Sesiones
                </h3>

                <div class="history-filters" style="margin-bottom:12px; display:flex; gap:8px; flex-wrap:wrap;">
                    <input id="filter-name" placeholder="Filtrar por nombre..." style="flex:1; min-width:140px; padding:8px; border-radius:8px; border:1px solid var(--border); background:var(--surface); color:var(--text);" />
                    <input id="filter-date" type="date" style="padding:8px; border-radius:8px; border:1px solid var(--border); background:var(--surface); color:var(--text);" />
                    <input id="filter-note" placeholder="Filtrar por notas..." style="flex:1; min-width:140px; padding:8px; border-radius:8px; border:1px solid var(--border); background:var(--surface); color:var(--text);" />
                    <button id="filter-clear" class="btn btn-secondary" style="padding: 8px 12px; font-size: 0.9rem;">Limpiar</button>
                </div>

                <div id="history-container"></div>
            </div>

            <!-- Backup & Restore Data -->
            <div class="card" style="margin-top:20px;">
                <h3 style="margin-bottom:12px; display: flex; align-items: center; gap: 8px;">
                    <i data-lucide="database" style="width: 20px; height: 20px; color: var(--primary);"></i> Copia de Seguridad
                </h3>
                <p style="margin-bottom:16px; font-size:0.9rem; color: var(--text-secondary);">Guarda tu progreso local o restaura un backup previo en formato JSON.</p>
                <div style="display:flex; gap:12px; flex-wrap:wrap;">
                    <button class="btn btn-secondary" onclick="exportData()">
                        <i data-lucide="download" style="width: 16px; height: 16px;"></i> Exportar Backup
                    </button>
                    <button class="btn btn-secondary" onclick="triggerImportFileInput()">
                        <i data-lucide="upload" style="width: 16px; height: 16px;"></i> Importar Backup
                    </button>
                    <input type="file" id="import-file-input" style="display:none;" accept=".json" onchange="handleImportFileSelect(event)" />
                </div>
            </div>

        </section>
    `;

    renderConsistencyChart(workouts);
    renderWorkoutHistory(workouts);
    refreshIcons();

    // Setup filters
    const nameInput = document.getElementById('filter-name');
    const dateInput = document.getElementById('filter-date');
    const noteInput = document.getElementById('filter-note');
    const clearBtn = document.getElementById('filter-clear');

    function applyFilters() {
        const name = nameInput.value.trim().toLowerCase();
        const date = dateInput.value;
        const note = noteInput.value.trim().toLowerCase();

        const filtered = workouts.filter(w => {
            let ok = true;
            if (name) {
                ok = ok && (w.templateTitle || '').toLowerCase().includes(name);
            }
            if (note) {
                ok = ok && (w.note || '').toLowerCase().includes(note);
            }
            if (date) {
                const key = getDateKey(w.completedAt || w.date);
                ok = ok && key === date;
            }
            return ok;
        });

        renderWorkoutHistory(filtered);
    }

    [nameInput, dateInput, noteInput].forEach(inp => {
        if (inp) inp.addEventListener('input', applyFilters);
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            nameInput.value = '';
            dateInput.value = '';
            noteInput.value = '';
            renderWorkoutHistory(workouts);
        });
    }
}

function triggerImportFileInput() {
    document.getElementById('import-file-input').click();
}

function handleImportFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        importData(file, () => {
            renderStatsView();
        });
    }
}

function renderConsistencyChart(workouts) {
    const canvas = document.getElementById("consistencyChart");
    if (!canvas) return;

    const weeklyData = groupWorkoutsByWeek(workouts);
    const labels = Object.keys(weeklyData).sort();
    const values = labels.map(label => weeklyData[label]);

    if (consistencyChart) {
        consistencyChart.destroy();
    }

    // Adapt chart colors based on current theme
    const isLight = document.body.getAttribute('data-theme') === 'light';
    const primaryColor = '#ef4444';
    const textColor = isLight ? '#111827' : '#f4f4f5';
    const gridColor = isLight ? '#e5e7eb' : '#1c1c1e';

    consistencyChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "Entrenos",
                    data: values,
                    borderWidth: 0,
                    backgroundColor: primaryColor,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'transparent'
                    },
                    ticks: {
                        color: textColor
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        precision: 0,
                        color: textColor
                    }
                }
            }
        }
    });
}

function renderWorkoutHistory(workouts) {
    const container = document.getElementById("history-container");
    if (!container) return;

    const sorted = sortCompletedWorkouts(workouts);

    if (sorted.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                No hay entrenos registrados todavía
            </div>
        `;
        return;
    }

    let html = "";

    sorted.forEach(workout => {
        const durStr = workout.duration 
            ? `${Math.floor(workout.duration / 60)}m ${workout.duration % 60}s` 
            : 'N/R';

        html += `
            <div class="history-item fade-in" onclick="showHistoryDetail('${workout.id}')" style="cursor: pointer; position: relative;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                    <strong style="font-size: 1.05rem;">
                        ${escapeHtml(workout.templateTitle)}
                    </strong>
                    <span style="font-size: 0.8rem; background: var(--surface); color: var(--primary); padding: 4px 8px; border-radius: 8px; font-family: monospace; border: 1px solid var(--border); white-space: nowrap;">
                        <i data-lucide="stopwatch" style="width: 12px; height: 12px; display: inline; vertical-align: middle; margin-right: 2px;"></i>${durStr}
                    </span>
                </div>

                <div class="history-date" style="display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                    <i data-lucide="calendar" style="width: 12px; height: 12px;"></i>
                    ${formatDateTime(workout.completedAt || workout.date)}
                </div>

                ${workout.note ? `
                    <div class="history-note" style="margin-top: 8px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;">
                        ${escapeHtml(workout.note)}
                    </div>
                ` : ""}
            </div>
        `;
    });

    container.innerHTML = html;
    refreshIcons();
}

function showHistoryDetail(id) {
    const workouts = getCompletedWorkouts();
    const workout = workouts.find(w => w.id === id);
    if (!workout) return;
    
    const durationStr = workout.duration 
        ? `${Math.floor(workout.duration / 60)} min ${workout.duration % 60} seg` 
        : 'No registrada';
        
    const exercisesHtml = workout.completedExercises && workout.completedExercises.length 
        ? `<ul style="list-style: none; padding: 0; margin-top: 12px; display: flex; flex-direction: column; gap: 8px;">
            ${workout.completedExercises.map(ex => `
                <li style="display:flex; align-items:center; gap:8px; font-size:0.95rem; background: var(--surface-light); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border);">
                    <i data-lucide="check" style="width: 16px; height: 16px; color: var(--primary);"></i>
                    ${escapeHtml(ex)}
                </li>
            `).join('')}
           </ul>`
        : '<p style="color: var(--text-secondary); margin-top: 8px;">Ningún bloque completado</p>';

    const modalRoot = document.getElementById("modal-root");
    modalRoot.innerHTML = `
        <div class="modal-overlay">
            <div class="modal fade-in-scale">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:16px;">
                    <h2 style="margin:0;">Detalle de Sesión</h2>
                    <button class="btn btn-secondary" onclick="closeModal()" style="padding: 6px; border-radius: 50%;">
                        <i data-lucide="x" style="width: 20px; height: 20px;"></i>
                    </button>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:14px;">
                    <div>
                        <strong style="font-size:1.2rem; color: var(--primary);">${escapeHtml(workout.templateTitle)}</strong>
                    </div>
                    <div>
                        <span style="font-size:0.8rem; color:var(--text-secondary); display:block; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Fecha y Hora</span>
                        <span style="font-weight:600; font-size:0.95rem;">${formatDateTime(workout.completedAt || workout.date)}</span>
                    </div>
                    <div>
                        <span style="font-size:0.8rem; color:var(--text-secondary); display:block; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Duración de Sesión</span>
                        <span style="font-weight:600; font-size:0.95rem;">${durationStr}</span>
                    </div>
                    ${workout.note ? `
                    <div>
                        <span style="font-size:0.8rem; color:var(--text-secondary); display:block; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Notas</span>
                        <div style="background:var(--surface-light); padding:10px 14px; border-radius:8px; border-left:3px solid var(--primary); font-size:0.95rem; margin-top:4px;">
                            ${escapeHtml(workout.note)}
                        </div>
                    </div>
                    ` : ''}
                    <div>
                        <span style="font-size:0.8rem; color:var(--text-secondary); display:block; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Bloques Completados</span>
                        ${exercisesHtml}
                    </div>
                </div>
                
                <div class="modal-actions" style="margin-top:24px;">
                    <button class="btn btn-danger btn-full" onclick="deleteHistorySession('${workout.id}')">
                        <i data-lucide="trash" style="width: 16px; height: 16px;"></i> Eliminar Registro
                    </button>
                </div>
            </div>
        </div>
    `;
    refreshIcons();
}

function deleteHistorySession(id) {
    const confirmed = confirm("¿Estás seguro de que deseas eliminar esta sesión del historial?");
    if (!confirmed) return;
    deleteCompletedWorkout(id);
    closeModal();
    renderStatsView();
    showToast('Sesión eliminada del historial', 'success');
}