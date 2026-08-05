function DailyPlanner({ tasks, setTasks }) {
  const todayTasks = tasks.filter(t => t.status === "today");

  // --- CORE NON-OVERLAP LOGIC ---
  function findValidStartTime(task, proposedStart, availableTasks, originalStart) {
    // Sort all other tasks by startTime
    const sorted = availableTasks
      .filter(t => t.id !== task.id)
      .sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0));

    let newStart = proposedStart;

    // If dragging above the top, DO NOT clamp to 0.
    // Clamp to originalStart instead.
    if (newStart < 0) {
      newStart = originalStart;
    }

    let changed = true;

    // --- ITERATIVE COLLISION RESOLUTION LOOP ---
    // This loop continues until NO collisions remain.
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

        // Always push downward until clear
        newStart = otherEnd;

        // If pushing downward goes out of range, fall back to originalStart
        if (newStart > 1440 - task.estimatedMinutes) {
          newStart = originalStart;
        }

        // We changed newStart, so we must re-check all tasks again
        changed = true;
        break;
      }
    }

    return newStart;
  }

  // --- DRAG HANDLING ---
  function handleMouseDown(e, task) {
  e.preventDefault();

  const startY = e.clientY;
  const originalStart = task.startTime ?? 0;
  let previewStart = originalStart; // temporary value

  function handleMouseMove(event) {
    const deltaY = event.clientY - startY;

    let newStart = originalStart + deltaY;

    // Snap to 15-minute increments
    newStart = Math.round(newStart / 15) * 15;

    // Apply non-overlap logic
    previewStart = findValidStartTime(task, newStart, todayTasks, originalStart);

    // ⭐ DO NOT CALL setTasks HERE
    // Instead, update the DOM element directly for preview
    const el = document.getElementById(`planner-${task.id}`);
    if (el) {
      el.style.top = `${previewStart}px`;
    }
  }

  function handleMouseUp() {
    // ⭐ NOW we update React state ONCE
    setTasks(oldTasks =>
      oldTasks.map(t =>
        t.id === task.id
          ? { ...t, startTime: previewStart }
          : t
      )
    );

    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);
}


  // --- RENDER ---
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
          {todayTasks.map((task) => {
            const height = task.estimatedMinutes;
            const scale = Math.max(0.4, Math.min(1, height / 60));

            return (
              <div
  key={task.id}
  className={`schedule-task ${task.isGoalTask ? "goal-task" : ""}`}

                onMouseDown={(e) => handleMouseDown(e, task)}
                style={{
                  top: `${task.startTime ?? 0}px`,
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
  onClick={(e) => {
    e.stopPropagation();
    setTasks(old =>
      old.map(t =>
        t.id === task.id
          ? { 
              ...t, 
              status: "done", 
              startTime: null,
              completedAt: Date.now()   // ⭐ add this
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
