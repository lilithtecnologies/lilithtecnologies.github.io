function uuid() {
    return crypto.randomUUID();
}

function formatDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleDateString("es-CR", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);

    return date.toLocaleString("es-CR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getDateKey(dateString) {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getTodayKey() {
    return getDateKey(new Date());
}

function escapeHtml(text) {
    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}

function countCompletedByDay(workouts) {
    const result = {};

    workouts.forEach(workout => {
        const key = getDateKey(workout.completedAt || workout.date);

        result[key] = (result[key] || 0) + 1;
    });

    return result;
}

function groupWorkoutsByWeek(workouts) {
    const weeks = {};

    workouts.forEach(workout => {
        const date = new Date(
            workout.completedAt || workout.date
        );

        const firstDay = new Date(
            date.getFullYear(),
            0,
            1
        );

        const days =
            Math.floor(
                (date - firstDay) / 86400000
            );

        const week =
            Math.ceil(
                (days + firstDay.getDay() + 1) / 7
            );

        const key =
            `${date.getFullYear()}-S${week}`;

        weeks[key] = (weeks[key] || 0) + 1;
    });

    return weeks;
}

function getCurrentMonthWorkouts(workouts) {
    const now = new Date();

    return workouts.filter(workout => {
        const date = new Date(
            workout.completedAt || workout.date
        );

        return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
        );
    });
}

function getUniqueWorkoutDays(workouts) {
    const days = new Set();

    workouts.forEach(workout => {
        days.add(
            getDateKey(
                workout.completedAt || workout.date
            )
        );
    });

    return [...days];
}

function calculateCurrentStreak(workouts) {
    const uniqueDays = getUniqueWorkoutDays(workouts)
        .sort()
        .reverse();

    if (uniqueDays.length === 0) {
        return 0;
    }

    const today = new Date();
    const current = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    let streak = 0;

    for (let i = 0; i < uniqueDays.length; i++) {
        const workoutDate = new Date(
            `${uniqueDays[i]}T00:00:00`
        );

        const diffDays = Math.floor(
            (current - workoutDate) / 86400000
        );

        if (diffDays === streak) {
            streak++;
        } else if (
            streak === 0 &&
            diffDays === 1
        ) {
            current.setDate(
                current.getDate() - 1
            );

            streak++;
        } else {
            break;
        }
    }

    return streak;
}

function calculateLongestStreak(workouts) {
    const days = getUniqueWorkoutDays(workouts)
        .sort();

    if (days.length === 0) {
        return 0;
    }

    let longest = 1;
    let current = 1;

    for (let i = 1; i < days.length; i++) {
        const previous = new Date(
            `${days[i - 1]}T00:00:00`
        );

        const next = new Date(
            `${days[i]}T00:00:00`
        );

        const diffDays = Math.floor(
            (next - previous) / 86400000
        );

        if (diffDays === 1) {
            current++;
            longest = Math.max(
                longest,
                current
            );
        } else {
            current = 1;
        }
    }

    return longest;
}

function sortCompletedWorkouts(workouts) {
    return [...workouts].sort(
        (a, b) =>
            new Date(
                b.completedAt || b.date
            ) -
            new Date(
                a.completedAt || a.date
            )
    );
}

function createElement(html) {
    const template =
        document.createElement("template");

    template.innerHTML = html.trim();

    return template.content.firstElementChild;
}

/**
 * Parse duration from text like "10 min" or "15min" and return seconds or null
 */
function parseDurationFromText(text) {
    if (!text || typeof text !== 'string') return null;

    const m = text.match(/(\d+)\s*(?:min|m|minutes|minutos)\b/i);

    if (m) {
        const minutes = parseInt(m[1], 10);
        if (!isNaN(minutes) && minutes > 0) {
            return minutes * 60;
        }
    }

    // try formats like 00:10 or 5:00
    const mm = text.match(/^(\d{1,2}):(\d{2})$/);

    if (mm) {
        const mins = parseInt(mm[1], 10);
        const secs = parseInt(mm[2], 10);

        return mins * 60 + secs;
    }

    return null;
}

function showToast(message, type = 'info') {
    try {
        const root = document.getElementById('toast-root') || (function() {
            const d = document.createElement('div');
            d.id = 'toast-root';
            document.body.appendChild(d);
            return d;
        })();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        root.appendChild(toast);

        // trigger enter
        requestAnimationFrame(() => toast.classList.add('show'));

        // auto hide
        const DURATION = 3000;

        const hide = () => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            setTimeout(() => {
                toast.remove();
            }, 250);
        };

        const timeoutId = setTimeout(hide, DURATION);

        // allow manual dismiss on click
        toast.addEventListener('click', () => {
            clearTimeout(timeoutId);
            hide();
        });
    } catch (e) {
        // fail silently
        console.error('showToast error', e);
    }
}

/* Theme management */

function refreshIcons() {
    try {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    } catch (e) {
        console.error('refreshIcons error', e);
    }
}

function applyTheme(isLight) {
    try {
        if (isLight) {
            document.body.setAttribute('data-theme', 'light');
        } else {
            document.body.removeAttribute('data-theme');
        }

        if (typeof consistencyChart !== 'undefined' && consistencyChart) {
            const canvas = document.getElementById("consistencyChart");
            if (canvas) {
                const workouts = getCompletedWorkouts();
                renderConsistencyChart(workouts);
            }
        }
    } catch (e) {
        console.error('applyTheme error', e);
    }
}

function initTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    applyTheme(mediaQuery.matches);
    
    mediaQuery.addEventListener('change', (e) => {
        applyTheme(e.matches);
    });
}