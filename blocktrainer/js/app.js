const AppState = {
    currentView: "workouts"
};

function setActiveNav(view) {
    const buttons =
        document.querySelectorAll(".nav-btn");

    buttons.forEach(button => {
        button.classList.remove("active");

        if (
            button.dataset.view === view
        ) {
            button.classList.add("active");
        }
    });
}

function navigateTo(view) {
    AppState.currentView = view;

    setActiveNav(view);
    if (typeof clearAllTimers === 'function') {
        clearAllTimers();
    }

    switch (view) {
        case "stats":
            renderStatsView();
            break;

        case "workouts":
        default:
            renderWorkoutsView();
            break;
    }
}

function setupNavigation() {
    const buttons =
        document.querySelectorAll(".nav-btn");

    buttons.forEach(button => {
        button.addEventListener(
            "click",
            () => {
                const view =
                    button.dataset.view;

                navigateTo(view);
            }
        );
    });
}

function seedDemoData() {
    const templates =
        getTemplates();

    if (templates.length > 0) {
        return;
    }

    saveTemplate({
        id: uuid(),
        title:
            "Control de Balón",
        description:
            "Trabajo técnico de manejo y control de balón.",
        createdAt:
            new Date().toISOString(),
        exercises: [
            {
                id: uuid(),
                name: "Dribling",
                detail: "10 min"
            },
            {
                id: uuid(),
                name: "Tiros",
                detail: "40 min"
            },
            {
                id: uuid(),
                name: "Control de balón",
                detail: "15 min"
            }
        ]
    });
}

function initializeApp() {
    setupNavigation();

    // Initialize theme before rendering views
    if (typeof initTheme === 'function') {
        initTheme();
    }

    navigateTo(AppState.currentView);
    if (typeof refreshIcons === 'function') {
        refreshIcons();
    }
}

document.addEventListener(
    "DOMContentLoaded",
    () => {
        initializeApp();
    }
);