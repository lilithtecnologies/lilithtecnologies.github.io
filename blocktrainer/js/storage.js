const STORAGE_KEYS = {
    TEMPLATES: "workoutTemplates",
    COMPLETED: "completedWorkouts"
};

function initializeStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
        localStorage.setItem(
            STORAGE_KEYS.TEMPLATES,
            JSON.stringify([])
        );
    }

    if (!localStorage.getItem(STORAGE_KEYS.COMPLETED)) {
        localStorage.setItem(
            STORAGE_KEYS.COMPLETED,
            JSON.stringify([])
        );
    }
}

function getTemplates() {
    try {
        return JSON.parse(
            localStorage.getItem(STORAGE_KEYS.TEMPLATES)
        ) || [];
    } catch {
        return [];
    }
}

function saveTemplates(templates) {
    localStorage.setItem(
        STORAGE_KEYS.TEMPLATES,
        JSON.stringify(templates)
    );
}

function getTemplateById(id) {
    return getTemplates().find(
        template => template.id === id
    );
}

function saveTemplate(template) {
    const templates = getTemplates();

    templates.push(template);

    saveTemplates(templates);

    return template;
}

function updateTemplate(updatedTemplate) {
    const templates = getTemplates();

    const index = templates.findIndex(
        template => template.id === updatedTemplate.id
    );

    if (index === -1) {
        return false;
    }

    templates[index] = updatedTemplate;

    saveTemplates(templates);

    return true;
}

function deleteTemplate(id) {
    const templates = getTemplates().filter(
        template => template.id !== id
    );

    saveTemplates(templates);
}

function getCompletedWorkouts() {
    try {
        return JSON.parse(
            localStorage.getItem(STORAGE_KEYS.COMPLETED)
        ) || [];
    } catch {
        return [];
    }
}

function saveCompletedWorkouts(workouts) {
    localStorage.setItem(
        STORAGE_KEYS.COMPLETED,
        JSON.stringify(workouts)
    );
}

function saveCompletedWorkout(workout) {
    const workouts = getCompletedWorkouts();

    workouts.push(workout);

    saveCompletedWorkouts(workouts);

    return workout;
}

function deleteCompletedWorkout(id) {
    const workouts = getCompletedWorkouts().filter(
        workout => workout.id !== id
    );

    saveCompletedWorkouts(workouts);
}

function clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.TEMPLATES);
    localStorage.removeItem(STORAGE_KEYS.COMPLETED);

    initializeStorage();
}

function exportData() {
    try {
        const data = {
            templates: getTemplates(),
            completed: getCompletedWorkouts()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `block_trainer_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Backup exportado con éxito', 'success');
    } catch (e) {
        showToast('Error al exportar datos', 'error');
        console.error(e);
    }
}

function importData(file, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!data || typeof data !== 'object') {
                throw new Error('Formato inválido');
            }
            if (!Array.isArray(data.templates) || !Array.isArray(data.completed)) {
                throw new Error('Estructura de backup incorrecta');
            }
            
            const isValidTemplate = data.templates.every(t => t && t.id && t.title && Array.isArray(t.exercises));
            if (!isValidTemplate && data.templates.length > 0) {
                throw new Error('Estructura de plantillas inválida');
            }
            
            saveTemplates(data.templates);
            saveCompletedWorkouts(data.completed);
            
            showToast('Datos importados con éxito', 'success');
            if (typeof callback === 'function') {
                callback();
            }
        } catch (err) {
            showToast('Error al importar backup: ' + err.message, 'error');
            console.error(err);
        }
    };
    reader.readAsText(file);
}

initializeStorage();