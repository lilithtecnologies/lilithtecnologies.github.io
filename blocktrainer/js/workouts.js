// ---- View State and Helpers ----
const WorkoutsViewState = {
    searchQuery: "",
    currentFilter: "all" // "all", "favorites", "most-used", "recent"
};

function setWorkoutsFilter(filter) {
    WorkoutsViewState.currentFilter = filter;
    renderWorkoutsView();
}

function getTemplateUsageCounts() {
    const completed = getCompletedWorkouts();
    const counts = {};
    completed.forEach(w => {
        if (w.templateId) {
            counts[w.templateId] = (counts[w.templateId] || 0) + 1;
        }
    });
    return counts;
}

function toggleFavoriteTemplate(id, event) {
    if (event) event.stopPropagation();
    const template = getTemplateById(id);
    if (template) {
        template.favorite = !template.favorite;
        updateTemplate(template);
        renderWorkoutsView();
        showToast(template.favorite ? 'Añadido a favoritos' : 'Quitado de favoritos', 'success');
    }
}

function duplicateWorkoutTemplate(id, event) {
    if (event) event.stopPropagation();
    const template = getTemplateById(id);
    if (template) {
        const cloned = JSON.parse(JSON.stringify(template));
        cloned.id = uuid();
        cloned.title = `Copia de ${cloned.title}`;
        cloned.createdAt = new Date().toISOString();
        cloned.favorite = false;
        
        if (cloned.exercises) {
            cloned.exercises.forEach(ex => {
                ex.id = uuid();
            });
        }
        
        saveTemplate(cloned);
        renderWorkoutsView();
        showToast('Entreno duplicado', 'success');
    }
}

function filterWorkoutCardsInDOM(query) {
    const term = query.toLowerCase().trim();
    const cards = document.querySelectorAll('#workouts-list .card');
    let hasVisible = false;
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const desc = card.querySelector('p').textContent.toLowerCase();
        if (title.includes(term) || desc.includes(term)) {
            card.style.display = 'block';
            hasVisible = true;
        } else {
            card.style.display = 'none';
        }
    });

    const emptySearch = document.getElementById('search-empty-state');
    if (emptySearch) {
        emptySearch.style.display = hasVisible ? 'none' : 'block';
    }
}

// ---- Timers for execution view ----
const ExerciseTimers = {};
let WorkoutSessionStopwatch = { intervalId: null, seconds: 0 };

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function clearAllTimers() {
    Object.keys(ExerciseTimers).forEach(key => {
        const t = ExerciseTimers[key];
        if (t && t.intervalId) {
            clearInterval(t.intervalId);
        }
    });

    for (const k in ExerciseTimers) delete ExerciseTimers[k];

    if (WorkoutSessionStopwatch.intervalId) {
        clearInterval(WorkoutSessionStopwatch.intervalId);
        WorkoutSessionStopwatch.intervalId = null;
    }
    WorkoutSessionStopwatch.seconds = 0;
}

function startTimer(exerciseId) {
    const key = exerciseId;
    const el = document.getElementById(`timer-display-${key}`);
    const progressBar = document.getElementById(`timer-progress-${key}`);
    if (!el) return;

    if (!ExerciseTimers[key]) {
        const initial = parseInt(el.dataset.initial, 10) || 0;
        ExerciseTimers[key] = {
            remaining: initial,
            initial,
            intervalId: null
        };
    }

    const timer = ExerciseTimers[key];

    if (timer.intervalId) return; // already running

    updateTimerUI(exerciseId, true);

    timer.intervalId = setInterval(() => {
        if (timer.remaining <= 0) {
            clearInterval(timer.intervalId);
            timer.intervalId = null;
            updateTimerUI(exerciseId, false);
            
            showToast('Bloque completado', 'success');
            
            const item = document.querySelector(`.exercise-item[data-exercise-id="${exerciseId}"]`);
            if (item) {
                item.classList.add('block-completed-anim');
                setTimeout(() => item.classList.remove('block-completed-anim'), 1000);
                
                const checkbox = item.querySelector('.execution-checkbox');
                if (checkbox && !checkbox.checked) {
                    checkbox.checked = true;
                    updateWorkoutProgress();
                }
            }
            return;
        }

        timer.remaining -= 1;
        el.textContent = formatTime(timer.remaining);
        
        if (progressBar) {
            const pct = (timer.remaining / timer.initial) * 100;
            progressBar.style.width = `${pct}%`;
        }
    }, 1000);
}

function pauseTimer(exerciseId) {
    const key = exerciseId;
    const timer = ExerciseTimers[key];
    if (timer && timer.intervalId) {
        clearInterval(timer.intervalId);
        timer.intervalId = null;
        updateTimerUI(exerciseId, false);
    }
}

function resetTimer(exerciseId) {
    const key = exerciseId;
    const el = document.getElementById(`timer-display-${key}`);
    const progressBar = document.getElementById(`timer-progress-${key}`);
    if (!el) return;

    const initial = parseInt(el.dataset.initial, 10) || 0;

    if (ExerciseTimers[key] && ExerciseTimers[key].intervalId) {
        clearInterval(ExerciseTimers[key].intervalId);
    }

    ExerciseTimers[key] = {
        remaining: initial,
        initial,
        intervalId: null
    };

    el.textContent = formatTime(initial);
    if (progressBar) {
        progressBar.style.width = '100%';
    }
    updateTimerUI(exerciseId, false);
}

function updateTimerUI(exerciseId, isRunning) {
    const item = document.querySelector(`.exercise-item[data-exercise-id="${exerciseId}"]`);
    if (!item) return;
    
    const playBtn = item.querySelector('.btn-timer-play');
    const pauseBtn = item.querySelector('.btn-timer-pause');
    
    if (playBtn && pauseBtn) {
        if (isRunning) {
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-flex';
        } else {
            playBtn.style.display = 'inline-flex';
            pauseBtn.style.display = 'none';
        }
    }
}

// ---- Render Views ----

function renderWorkoutsView() {
    clearAllTimers();
    const app = document.getElementById("app");
    let templates = getTemplates();

    // Apply Filter Tab
    if (WorkoutsViewState.currentFilter === 'favorites') {
        templates = templates.filter(t => t.favorite === true);
    } else if (WorkoutsViewState.currentFilter === 'most-used') {
        const counts = getTemplateUsageCounts();
        templates = templates.sort((a, b) => {
            const countA = counts[a.id] || 0;
            const countB = counts[b.id] || 0;
            return countB - countA;
        });
    } else if (WorkoutsViewState.currentFilter === 'recent') {
        templates = templates.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA;
        });
    }

    let html = `
        <section class="fade-in">
            <h2 class="section-title">Entrenos</h2>

            <div class="workouts-controls" style="margin-bottom: 24px; display: flex; flex-direction: column; gap: 14px;">
                <div style="position: relative; width: 100%;">
                    <input type="text" id="search-workouts" placeholder="Buscar entrenos..." style="padding-left: 44px; height: 46px;" />
                    <i data-lucide="search" style="position: absolute; left: 14px; top: 14px; width: 18px; height: 18px; color: var(--text-secondary);"></i>
                </div>
                <div class="filter-tabs" style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none;">
                    <button class="btn btn-secondary ${WorkoutsViewState.currentFilter === 'all' ? 'active' : ''}" onclick="setWorkoutsFilter('all')" style="white-space: nowrap; padding: 8px 14px; font-size: 0.85rem;">
                        <i data-lucide="list" style="width: 14px; height: 14px;"></i> Todos
                    </button>
                    <button class="btn btn-secondary ${WorkoutsViewState.currentFilter === 'favorites' ? 'active' : ''}" onclick="setWorkoutsFilter('favorites')" style="white-space: nowrap; padding: 8px 14px; font-size: 0.85rem;">
                        <i data-lucide="star" style="width: 14px; height: 14px;"></i> Favoritos
                    </button>
                    <button class="btn btn-secondary ${WorkoutsViewState.currentFilter === 'most-used' ? 'active' : ''}" onclick="setWorkoutsFilter('most-used')" style="white-space: nowrap; padding: 8px 14px; font-size: 0.85rem;">
                        <i data-lucide="flame" style="width: 14px; height: 14px;"></i> Más usados
                    </button>
                    <button class="btn btn-secondary ${WorkoutsViewState.currentFilter === 'recent' ? 'active' : ''}" onclick="setWorkoutsFilter('recent')" style="white-space: nowrap; padding: 8px 14px; font-size: 0.85rem;">
                        <i data-lucide="clock" style="width: 14px; height: 14px;"></i> Recientes
                    </button>
                </div>
            </div>

            <div id="workouts-list">
    `;

    if (templates.length === 0) {
        html += `
            <div class="empty-state">
                <i data-lucide="dumbbell" style="width: 48px; height: 48px; color: var(--text-secondary); margin-bottom: 12px;"></i>
                <h3>No hay entrenos</h3>
                <p>Usa el botón + para añadir un entrenamiento o cambia de filtro.</p>
            </div>
        `;
    } else {
        templates.forEach(template => {
            const isFav = template.favorite === true;
            html += `
                <div class="card fade-in">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom: 8px;">
                        <h3 style="margin: 0; flex:1; font-size: 1.25rem;">${escapeHtml(template.title)}</h3>
                        <button onclick="toggleFavoriteTemplate('${template.id}', event)" title="Favorito" style="color: ${isFav ? 'var(--primary)' : 'var(--text-secondary)'}; background: transparent; padding: 4px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s;">
                            <i data-lucide="star" style="width: 20px; height: 20px; fill: ${isFav ? 'var(--primary)' : 'transparent'}; color: ${isFav ? 'var(--primary)' : 'var(--text-secondary)'};"></i>
                        </button>
                    </div>

                    <p style="margin-bottom: 12px; font-size: 0.9rem; color: var(--text-secondary);">
                        ${escapeHtml(template.description || "Sin descripción")}
                    </p>

                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <span style="font-size:0.8rem; color:var(--text-secondary); display:flex; align-items:center; gap:6px;">
                            <i data-lucide="layers" style="width: 14px; height: 14px;"></i> ${template.exercises.length} bloques
                        </span>
                        
                        <div class="card-actions" style="margin-top: 0; display: flex; gap: 6px;">
                            <button
                                class="btn btn-primary"
                                onclick="renderWorkoutExecutionView('${template.id}')"
                                style="padding: 8px 12px; font-size: 0.85rem;"
                            >
                                <i data-lucide="play" style="width: 14px; height: 14px; fill: currentColor;"></i> Iniciar
                            </button>

                            <button
                                class="btn btn-secondary"
                                onclick="renderCreateWorkoutView('${template.id}')"
                                style="padding: 8px 12px; font-size: 0.85rem;"
                                title="Editar"
                            >
                                <i data-lucide="edit" style="width: 14px; height: 14px;"></i>
                            </button>

                            <button
                                class="btn btn-secondary"
                                onclick="duplicateWorkoutTemplate('${template.id}', event)"
                                style="padding: 8px 12px; font-size: 0.85rem;"
                                title="Duplicar"
                            >
                                <i data-lucide="copy" style="width: 14px; height: 14px;"></i>
                            </button>

                            <button
                                class="btn btn-danger"
                                onclick="deleteWorkoutTemplate('${template.id}')"
                                style="padding: 8px 12px; font-size: 0.85rem;"
                                title="Eliminar"
                            >
                                <i data-lucide="trash" style="width: 14px; height: 14px;"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    html += `
            </div>
            <div id="search-empty-state" class="empty-state" style="display: none;">
                <i data-lucide="search-code" style="width: 48px; height: 48px; color: var(--text-secondary); margin-bottom: 12px;"></i>
                <h3>No hay resultados</h3>
                <p>Prueba con otra palabra clave.</p>
            </div>
        </section>

        <button
            class="create-workout-btn"
            onclick="renderCreateWorkoutView()"
            aria-label="Crear entreno"
        >
            <i data-lucide="plus" style="width: 24px; height: 24px; color: #000;"></i>
        </button>
    `;

    app.innerHTML = html;
    refreshIcons();

    // Bind real-time search
    const searchInput = document.getElementById('search-workouts');
    if (searchInput) {
        searchInput.focus();
        searchInput.addEventListener('input', (e) => {
            WorkoutsViewState.searchQuery = e.target.value;
            filterWorkoutCardsInDOM(e.target.value);
        });
    }
}

function renderCreateWorkoutView(templateId = null) {
    const app = document.getElementById("app");
    let template = null;

    if (templateId) {
        template = getTemplateById(templateId);
    }

    const exercises = template?.exercises || [];
    let exercisesHtml = "";

    exercises.forEach(exercise => {
        exercisesHtml += createExerciseEditor(
            exercise.id,
            exercise.name,
            exercise.detail
        );
    });

    app.innerHTML = `
        <section class="fade-in">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                <button class="btn btn-secondary" onclick="renderWorkoutsView()" style="padding: 8px; border-radius: 50%;">
                    <i data-lucide="arrow-left" style="width: 20px; height: 20px;"></i>
                </button>
                <h2 class="section-title" style="margin: 0;">
                    ${template ? "Editar entreno" : "Nuevo entreno"}
                </h2>
            </div>

            <div class="form-group">
                <label>Título</label>
                <input
                    id="workout-title"
                    value="${template ? escapeHtml(template.title) : ""}"
                    placeholder="Ej. Rutina de Fuerza, Cardio..."
                >
            </div>

            <div class="form-group">
                <label>Descripción</label>
                <textarea id="workout-description" placeholder="Describe brevemente este entrenamiento...">${
                    template ? escapeHtml(template.description) : ""
                }</textarea>
            </div>

            <h3 style="margin: 24px 0 12px; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
                <i data-lucide="layers" style="width: 20px; height: 20px; color: var(--primary);"></i> Bloques de Trabajo
            </h3>

            <div id="exercise-list">
                ${exercisesHtml}
            </div>

            <div class="card-actions" style="margin-top: 16px;">
                <button
                    class="btn btn-secondary btn-full"
                    onclick="addExerciseEditor()"
                >
                    <i data-lucide="plus" style="width: 18px; height: 18px;"></i> Agregar bloque
                </button>
            </div>

            <div class="card-actions" style="margin-top:24px;">
                <button
                    class="btn btn-primary btn-full"
                    onclick="saveWorkoutForm('${templateId || ""}')"
                >
                    <i data-lucide="check" style="width: 18px; height: 18px; fill: currentColor;"></i> Guardar entrenamiento
                </button>
            </div>
        </section>
    `;
    updateExerciseControls();
    refreshIcons();
}

function createExerciseEditor(
    id = uuid(),
    name = "",
    detail = ""
) {
    return `
        <div
            class="exercise-item"
            data-exercise-id="${id}"
        >
            <div class="form-group">
                <label>Nombre del bloque</label>
                <input
                    class="exercise-name"
                    value="${escapeHtml(name)}"
                    placeholder="Ej. Dribling, Estiramientos, Tiros..."
                >
            </div>

            <div class="form-group">
                <label>Duración / Detalle</label>
                <input
                    class="exercise-detail-input"
                    value="${escapeHtml(detail)}"
                    placeholder="Ej. 10 min, 15 min, 3 series de 10..."
                >
            </div>

            <div class="exercise-controls" style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; gap: 8px;">
                <div style="display: flex; gap: 6px;">
                    <button
                        class="btn btn-icon btn-up"
                        onclick="moveExerciseUp(this)"
                        title="Subir bloque"
                    >
                        <i data-lucide="chevron-up" style="width: 18px; height: 18px;"></i>
                    </button>

                    <button
                        class="btn btn-icon btn-down"
                        onclick="moveExerciseDown(this)"
                        title="Bajar bloque"
                    >
                        <i data-lucide="chevron-down" style="width: 18px; height: 18px;"></i>
                    </button>
                </div>

                <button
                    class="btn btn-danger"
                    onclick="removeExerciseEditor(this)"
                    style="padding: 8px 12px; font-size: 0.85rem;"
                >
                    <i data-lucide="trash" style="width: 16px; height: 16px;"></i> Eliminar
                </button>
            </div>
        </div>
    `;
}

function addExerciseEditor() {
    const container = document.getElementById("exercise-list");
    container.insertAdjacentHTML(
        "beforeend",
        createExerciseEditor()
    );
    updateExerciseControls();
    refreshIcons();
}

function removeExerciseEditor(button) {
    button.closest(".exercise-item").remove();
    updateExerciseControls();
}

function moveExerciseUp(button) {
    const item = button.closest('.exercise-item');
    if (!item) return;
    const prev = item.previousElementSibling;
    if (prev) {
        item.parentNode.insertBefore(item, prev);
        updateExerciseControls();
    }
}

function moveExerciseDown(button) {
    const item = button.closest('.exercise-item');
    if (!item) return;
    const next = item.nextElementSibling;
    if (next) {
        item.parentNode.insertBefore(next, item);
        updateExerciseControls();
    }
}

function updateExerciseControls() {
    const items = Array.from(document.querySelectorAll('.exercise-item'));
    items.forEach((item, idx) => {
        const up = item.querySelector('.btn-up');
        const down = item.querySelector('.btn-down');
        if (up) up.disabled = idx === 0;
        if (down) down.disabled = idx === items.length - 1;
    });
}

function saveWorkoutForm(templateId = "") {
    const title = document.getElementById("workout-title").value.trim();
    const description = document.getElementById("workout-description").value.trim();

    if (!title) {
        showToast("Debes ingresar un título", 'error');
        return;
    }

    const exerciseElements = document.querySelectorAll(".exercise-item");
    const exercises = [];

    exerciseElements.forEach(item => {
        const id = item.dataset.exerciseId;
        const name = item.querySelector(".exercise-name").value.trim();
        const detail = item.querySelector(".exercise-detail-input").value.trim();

        if (!name) return;

        exercises.push({ id, name, detail });
    });

    if (exercises.length === 0) {
        showToast("Debes agregar al menos un bloque de ejercicio", 'error');
        return;
    }

    if (templateId) {
        const existing = getTemplateById(templateId);
        updateTemplate({
            ...existing,
            title,
            description,
            exercises
        });
        showToast('Entreno actualizado', 'success');
    } else {
        saveTemplate({
            id: uuid(),
            title,
            description,
            createdAt: new Date().toISOString(),
            favorite: false,
            exercises
        });
        showToast('Entreno creado con éxito', 'success');
    }

    renderWorkoutsView();
}

function deleteWorkoutTemplate(id) {
    const confirmed = confirm("¿Estás seguro de que deseas eliminar este entrenamiento?");
    if (!confirmed) return;

    deleteTemplate(id);
    renderWorkoutsView();
    showToast('Entreno eliminado', 'success');
}

// ---- Workout Active Execution ----

function renderWorkoutExecutionView(templateId) {
    const template = getTemplateById(templateId);
    if (!template) {
        renderWorkoutsView();
        return;
    }

    const app = document.getElementById("app");

    let html = `
        <section class="fade-in">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <button class="btn btn-secondary" onclick="renderWorkoutsView()" style="padding: 8px; border-radius: 50%;">
                    <i data-lucide="arrow-left" style="width: 20px; height: 20px;"></i>
                </button>
                <h2 class="section-title" style="margin: 0; font-size: 1.5rem; flex: 1;">
                    Ejecución: ${escapeHtml(template.title)}
                </h2>
            </div>

            <!-- Session Global Stopwatch -->
            <div class="session-timer-card" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: var(--surface-light); border: 1px solid var(--border); padding: 14px 18px; border-radius: var(--radius); box-shadow: var(--shadow);">
                <span style="font-weight: 700; display: flex; align-items: center; gap: 8px; color: var(--text);">
                    <i data-lucide="clock" style="width: 18px; height: 18px; color: var(--primary);"></i> Duración total:
                </span>
                <span id="session-stopwatch-display" style="font-family: monospace; font-size: 1.4rem; font-weight: 800; color: var(--primary); font-variant-numeric: tabular-nums;">00:00</span>
            </div>

            <p style="color: var(--text-secondary); margin-bottom: 20px;">
                ${escapeHtml(template.description || "Sin descripción")}
            </p>

            <div id="execution-list" style="margin-top:20px;">
    `;

    template.exercises.forEach(exercise => {
        const duration = parseDurationFromText(exercise.detail);

        html += `
            <div class="exercise-item fade-in" data-exercise-id="${exercise.id}">
                <div class="checkbox-row" style="align-items: flex-start;">
                    <input
                        type="checkbox"
                        class="execution-checkbox"
                        data-name="${escapeHtml(exercise.name)}"
                        data-exercise-id="${exercise.id}"
                        onchange="updateWorkoutProgress()"
                        style="margin-top: 2px;"
                    >

                    <div style="flex: 1;">
                        <strong style="font-size: 1.05rem;">
                            ${escapeHtml(exercise.name)}
                        </strong>

                        <div class="exercise-detail" style="margin-bottom: 8px;">
                            ${escapeHtml(exercise.detail)}
                        </div>

                        ${duration ? `
                            <div class="exercise-timer" style="margin-top: 12px;">
                                <div class="timer-display-wrapper" style="width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px;">
                                    <div class="timer-display" id="timer-display-${exercise.id}" data-initial="${duration}" style="flex: 1;">${formatTime(duration)}</div>
                                    <div class="timer-actions-wrapper" style="display: flex; gap: 6px;">
                                        <button class="btn btn-icon btn-timer-play" onclick="startTimer('${exercise.id}')" title="Iniciar">
                                            <i data-lucide="play" style="width: 16px; height: 16px; fill: currentColor;"></i>
                                        </button>
                                        <button class="btn btn-icon btn-timer-pause" onclick="pauseTimer('${exercise.id}')" title="Pausar" style="display: none;">
                                            <i data-lucide="pause" style="width: 16px; height: 16px; fill: currentColor;"></i>
                                        </button>
                                        <button class="btn btn-icon" onclick="resetTimer('${exercise.id}')" title="Reiniciar">
                                            <i data-lucide="rotate-ccw" style="width: 16px; height: 16px;"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="progress-bar-container" style="width: 100%; height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; position: relative;">
                                    <div class="progress-bar-fill" id="timer-progress-${exercise.id}" style="width: 100%; height: 100%; background: var(--primary); transition: width 0.25s linear;"></div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    html += `
            </div>

            <div
                id="workout-progress"
                class="workout-progress"
                style="margin: 24px 0 16px;"
            >
                0 / ${template.exercises.length}
            </div>

            <button
                id="finish-workout-btn"
                class="btn btn-primary btn-full"
                style="display:none; height: 48px; font-size: 1.05rem;"
                onclick="openFinishWorkoutModal('${template.id}')"
            >
                <i data-lucide="award" style="width: 18px; height: 18px; fill: currentColor;"></i> Terminar entreno
            </button>

        </section>
    `;

    app.innerHTML = html;
    refreshIcons();
    
    // Start session stopwatch
    startSessionStopwatch();
}

function startSessionStopwatch() {
    if (WorkoutSessionStopwatch.intervalId) {
        clearInterval(WorkoutSessionStopwatch.intervalId);
    }
    WorkoutSessionStopwatch.seconds = 0;
    
    const display = document.getElementById('session-stopwatch-display');
    WorkoutSessionStopwatch.intervalId = setInterval(() => {
        WorkoutSessionStopwatch.seconds += 1;
        if (display) {
            display.textContent = formatTime(WorkoutSessionStopwatch.seconds);
        }
    }, 1000);
}

function updateWorkoutProgress() {
    const checkboxes = document.querySelectorAll(".execution-checkbox");
    const completed = [...checkboxes].filter(checkbox => checkbox.checked).length;

    document.getElementById("workout-progress").textContent = `${completed} / ${checkboxes.length}`;

    const finishButton = document.getElementById("finish-workout-btn");
    if (finishButton) {
        finishButton.style.display = (completed === checkboxes.length && checkboxes.length > 0) ? "flex" : "none";
        // smooth scroll to finish button when showing
        if (completed === checkboxes.length) {
            finishButton.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }
}

function openFinishWorkoutModal(templateId) {
    const modalRoot = document.getElementById("modal-root");

    modalRoot.innerHTML = `
        <div class="modal-overlay">
            <div class="modal fade-in-scale">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="background: var(--primary-glow); width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; border: 1px solid var(--primary);">
                        <i data-lucide="trophy" style="width: 32px; height: 32px; color: var(--primary);"></i>
                    </div>
                    <h2>¡Entrenamiento Completado!</h2>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">Registra tu sesión de hoy.</p>
                </div>

                <div class="form-group">
                    <label>Añadir notas / observaciones</label>
                    <textarea
                        id="workout-note"
                        placeholder="¿Cómo te sentiste hoy? Ej. Gran energía, dolor leve en rodilla..."
                        style="min-height: 80px;"
                    ></textarea>
                </div>

                <div class="modal-actions">
                    <button
                        class="btn btn-secondary"
                        onclick="closeModal()"
                        style="flex: 1;"
                    >
                        Cancelar
                    </button>

                    <button
                        class="btn btn-primary"
                        onclick="finishWorkout('${templateId}')"
                        style="flex: 1;"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    `;
    refreshIcons();
}

function closeModal() {
    document.getElementById("modal-root").innerHTML = "";
}

function finishWorkout(templateId) {
    const template = getTemplateById(templateId);
    if (!template) return;

    const note = document.getElementById("workout-note").value.trim();
    const completedExercises = [...document.querySelectorAll(".execution-checkbox:checked")]
        .map(checkbox => checkbox.dataset.name);

    // Stop stopwatch and grab seconds
    if (WorkoutSessionStopwatch.intervalId) {
        clearInterval(WorkoutSessionStopwatch.intervalId);
        WorkoutSessionStopwatch.intervalId = null;
    }
    const sessionDuration = WorkoutSessionStopwatch.seconds;

    saveCompletedWorkout({
        id: uuid(),
        templateId: template.id,
        templateTitle: template.title,
        completedAt: new Date().toISOString(),
        note: note,
        completedExercises: completedExercises,
        duration: sessionDuration // Save total seconds
    });

    showToast('Entrenamiento guardado', 'success');
    closeModal();
    renderWorkoutsView();
}