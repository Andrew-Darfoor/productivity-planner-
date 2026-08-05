import { useState } from "react";
function DailyPlanner({ tasks, setTasks }) {
  const todayTasks = tasks.filter(t => t.status === "today");

  // ⭐ Local preview state (fixes invisible drag + upward drag bug)
  const [dragPreview, setDragPreview] = useState({});

  function findValidStartTime(task, proposedStart, availableTasks, originalStart) {
    const sorted = availableTasks
      .filter(t => t.id !== task.id)
      .sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0));

    let newStart = proposedStart;

    if (newStart < 0) {
      newStart = originalStart;
    }

    let changed = true;

    while (changed) {
      changed = false;

      for (const other of sorted) {
        const otherStart = other.startTime ?? 0;
        const otherEnd = otherStart + other.estimatedMinutes;
        const movingEnd = newStart + task.estimatedMinutes;

        const overlaps =
          newStart < otherEnd &&
          movingEnd > otherStart;

        if (!overlaps) continue;

        newStart = otherEnd;

        if (newStart > 1440 - task.estimatedMinutes) {
          newStart = originalStart;
        }

        changed = true;
        break;
      }
    }

    return newStart;
  }

  // ⭐ DRAG HANDLING (React-safe)
  function handleMouseDown(e, task) {
    e.preventDefault();

    const startY = e.clientY;
    const originalStart = task.startTime ?? 0;

    function handleMouseMove(event) {
      const deltaY = event.clientY - startY;

      let newStart = originalStart + deltaY;
      newStart = Math.round(newStart / 15) * 15;

      const previewStart = findValidStartTime(
        task,
        newStart,
        todayTasks,
        originalStart
      );

      // ⭐ Update preview in React state (NOT the DOM)
      setDragPreview(prev => ({
        ...prev,
        [task.id]: previewStart
      }));
    }

    function handleMouseUp() {
  const finalStart = dragPreview[task.id] ?? originalStart;

  setTasks(old => {
    // 1. Apply the new start time
    const updated = old.map(t =>
      t.id === task.id
        ? { ...t, startTime: finalStart }
        : t
    );

    // 2. Recalculate collisions using UPDATED tasks
    const movedTask = updated.find(t => t.id === task.id);
    const freshToday = updated.filter(t => t.status === "today");

    const correctedStart = findValidStartTime(
      movedTask,
      finalStart,
      freshToday,
      originalStart
    );

    // 3. Save corrected position
    return updated.map(t =>
      t.id === task.id
        ? { ...t, startTime: correctedStart }
        : t
    );
  });

  // 4. Clear preview
  setDragPreview(prev => {
    const copy = { ...prev };
    delete copy[task.id];
    return copy;
  });

  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseup", handleMouseUp);
}


    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  return (
    <div className="daily-planner">
      <h2>Daily Planner</h2>

      <div className="timeline">
        <div className="hours">
          {Array.from({ length: 24 }).map((_, hour) => (
            <div className="hour" key={hour}>
              {hour}:00
            </div>
          ))}
        </div>

        <div className="tasks-layer">
          {todayTasks.map(task => {
            const height = task.estimatedMinutes;
            const scale = Math.max(0.4, Math.min(1, height / 60));

            const top = dragPreview[task.id] ?? (task.startTime ?? 0);

            return (
              <div
                key={task.id}
                id={`planner-${task.id}`}
                className={`schedule-task ${task.isGoalTask ? "goal-task" : ""}`}
                onMouseDown={e => handleMouseDown(e, task)}
                style={{
                  top: `${top}px`,
                  height: `${task.estimatedMinutes}px`
                }}
              >
                <div
                  className="task-content"
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    width: `${100 / scale}%`,
                    height: `${100 / scale}%`
                  }}
                >
                  <strong>{task.title}</strong>
                  <p>{task.estimatedMinutes} min</p>

                  <button
                    className="complete-btn"
                    onClick={e => {
                      e.stopPropagation();
                      setTasks(old =>
                        old.map(t =>
                          t.id === task.id
                            ? {
                                ...t,
                                status: "done",
                                startTime: null,
                                completedAt: Date.now()
                              }
                            : t
                        )
                      );
                    }}
                  >
                    Complete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DailyPlanner;

