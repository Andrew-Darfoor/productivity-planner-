import { useState, useRef } from "react";
function DailyPlanner({ tasks, setTasks }) {
  console.log(">>> THIS DailyPlanner.jsx IS LIVE <<<");
  const todayTasks = tasks.filter(t => t.status === "today");

  // ⭐ Local preview state (fixes invisible drag + upward drag bug)
  const [dragPreview, setDragPreview] = useState({});
  const dragPreviewRef = useRef({});

function findValidStartTime(task, proposedStart, availableTasks, originalStart) {
  const sorted = availableTasks
    .filter(t => t.id !== task.id)
    .sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0));

  let newStart = proposedStart;

  // ⭐ clamp instead of snapping back
  if (newStart < 0) {
    newStart = 0;
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

      // ⭐ clamp to end of day instead of snapping back
      if (newStart > 1440 - task.estimatedMinutes) {
        newStart = 1440 - task.estimatedMinutes;
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

  let proposedStart = originalStart + deltaY;

  // Snap to 15 minute intervals
  proposedStart = Math.round(proposedStart / 15) * 15;


  // Prevent going outside the day
  proposedStart = Math.max(
    0,
    Math.min(
      proposedStart,
      1440 - task.estimatedMinutes
    )
  );

  const validStart = findValidStartTime(
    task,
    proposedStart,
    todayTasks,
    originalStart
  );

  dragPreviewRef.current[task.id] = validStart;

  setDragPreview(prev => ({
    ...prev,
    [task.id]: validStart
  }));
}
  function handleMouseUp() {
    const finalStart =
      dragPreviewRef.current[task.id] ?? originalStart;

    setTasks(old =>
      old.map(t =>
        t.id === task.id
          ? { ...t, startTime: finalStart }
          : t
      )
    );


    delete dragPreviewRef.current[task.id];

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

