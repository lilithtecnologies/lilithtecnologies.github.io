function renderCalendar(workouts) {
    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(
        year,
        month,
        1
    );

    const lastDay = new Date(
        year,
        month + 1,
        0
    );

    const startWeekDay =
        firstDay.getDay();

    const totalDays =
        lastDay.getDate();

    const workoutDays =
        countCompletedByDay(workouts);

    let html = `
        <div class="card">

            <h3 style="margin-bottom:16px;">
                ${getMonthName(month)}
                ${year}
            </h3>

            <div
                class="calendar"
                id="calendar-grid"
            >
    `;

    for (
        let i = 0;
        i < startWeekDay;
        i++
    ) {
        html += `
            <div
                class="calendar-day"
                style="
                    visibility:hidden;
                "
            ></div>
        `;
    }

    for (
        let day = 1;
        day <= totalDays;
        day++
    ) {
        const dateKey =
            `${year}-${String(
                month + 1
            ).padStart(2, "0")}-${String(
                day
            ).padStart(2, "0")}`;

        const hasWorkout =
            workoutDays[dateKey];

        html += `
            <div
                class="
                    calendar-day
                    ${
                        hasWorkout
                            ? "active"
                            : ""
                    }
                "
                ${
                    hasWorkout
                        ? `
                            onclick="
                                showDayDetails(
                                    '${dateKey}'
                                )
                            "
                        `
                        : ""
                }
            >
                ${day}
            </div>
        `;
    }

    html += `
            </div>

        </div>
    `;

    return html;
}

function showDayDetails(dateKey) {
    const workouts =
        getCompletedWorkouts();

    const matches =
        workouts.filter(
            workout =>
                getDateKey(
                    workout.completedAt ||
                    workout.date
                ) === dateKey
        );

    if (matches.length === 0) {
        return;
    }

    let html = `
        <div class="modal-overlay">

            <div class="modal">

                <h2>
                    ${formatDate(dateKey)}
                </h2>
    `;

    matches.forEach(workout => {
        html += `
            <div
                class="history-item"
                style="
                    margin-top:12px;
                "
            >
                <strong>
                    ${escapeHtml(
                        workout.templateTitle
                    )}
                </strong>

                <div
                    class="history-date"
                >
                    ${formatDateTime(
                        workout.completedAt ||
                        workout.date
                    )}
                </div>

                ${
                    workout.note
                        ? `
                            <div
                                class="
                                    history-note
                                "
                            >
                                ${escapeHtml(
                                    workout.note
                                )}
                            </div>
                        `
                        : ""
                }
            </div>
        `;
    });

    html += `
                <div
                    class="modal-actions"
                >
                    <button
                        class="
                            btn
                            btn-primary
                            btn-full
                        "
                        onclick="
                            closeCalendarModal()
                        "
                    >
                        Cerrar
                    </button>
                </div>

            </div>

        </div>
    `;

    document.getElementById(
        "modal-root"
    ).innerHTML = html;
}

function closeCalendarModal() {
    document.getElementById(
        "modal-root"
    ).innerHTML = "";
}

function getMonthName(monthIndex) {
    const months = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"
    ];

    return months[monthIndex];
}