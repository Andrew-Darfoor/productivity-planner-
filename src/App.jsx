import { useEffect, useState } from "react";

import {
  DragDropContext,
  Draggable,
  Droppable,
} from "@hello-pangea/dnd";
import "./App.css";
import DailyPlanner from "./DailyPlanner";
import { useStatistics, StatisticsPanel } from "./Statistics";
import Goals from "./Goals";

const initialTasks = [
  {
    id: "1",
    title: "Build the Kanban layout",
    status: "backlog",
    type: "Coding",
    priority: "None",
    estimatedMinutes: 60,
  },
  {
    id: "2",
    title: "Learn React state",
    status: "today",
    type: "Coding",
    priority: "None",
    estimatedMinutes: 45,
  },
  {
    id: "3",
    title: "Add drag and drop",
    status: "inProgress",
    type: "Coding",
    priority: "None",
    estimatedMinutes: 90,
  },
  {
    id: "4",
    title: "Create the Vite project",
    status: "done",
    type: "Coding",
    priority: "None",
    estimatedMinutes: 30,
  },
];
const TASK_TYPES = {
  Communication: {
    estimatedMinutes: 15,
    keywords: [
      "email",
      "reply",
      "call",
      "phone",
      "message",
      "text",
      "contact",
      "schedule",
      "appointment",
      "meeting invite",
      "zoom"
    ]
  },

  Reading: {
    estimatedMinutes: 30,
    keywords: [
      "read",
      "chapter",
      "article",
      "book",
      "documentation",
      "manual",
      "notes",
      "paper",
      "journal",
      "review"
    ]
  },

  Studying: {
    estimatedMinutes: 60,
    keywords: [
      "study",
      "practice",
      "homework",
      "assignment",
      "exam",
      "quiz",
      "midterm",
      "final",
      "lecture",
      "flashcards",
      "memorize",
      "revise",
      "course"
    ]
  },

  Writing: {
    estimatedMinutes: 75,
    keywords: [
      "write",
      "essay",
      "report",
      "draft",
      "outline",
      "proposal",
      "documentation",
      "resume",
      "cover letter"
    ]
  },

  Coding: {
    estimatedMinutes: 120,
    keywords: [
      "code",
      "program",
      "develop",
      "build",
      "implement",
      "debug",
      "refactor",
      "react",
      "javascript",
      "typescript",
      "python",
      "java",
      "c++",
      "godot",
      "unity",
      "database",
      "sql",
      "api",
      "github",
      "deploy"
    ]
  },

  Research: {
    estimatedMinutes: 80,
    keywords: [
      "research",
      "investigate",
      "compare",
      "analyze",
      "evaluate",
      "explore",
      "survey",
      "collect data"
    ]
  },

  Household: {
    estimatedMinutes: 50,
    keywords: [
      "clean",
      "laundry",
      "vacuum",
      "mop",
      "cook",
      "dishes",
      "trash",
      "yard",
      "garden",
      "organize"
    ]
  },

  Shopping: {
    estimatedMinutes: 60,
    keywords: [
      "buy",
      "purchase",
      "grocery",
      "groceries",
      "shopping",
      "order"
    ]
  },

  Exercise: {
    estimatedMinutes: 40,
    keywords: [
      "gym",
      "exercise",
      "workout",
      "run",
      "walk",
      "bike",
      "cycling",
      "swim",
      "weights",
      "cardio",
      "stretch",
      "yoga"
    ]
  },

  Creative: {
    estimatedMinutes: 75,
    keywords: [
      "draw",
      "paint",
      "design",
      "animate",
      "compose",
      "music",
      "edit",
      "pixel art",
      "sprite",
      "blender"
    ]
  },

  Planning: {
    estimatedMinutes: 20,
    keywords: [
      "plan",
      "organize",
      "schedule",
      "roadmap",
      "brainstorm",
      "outline project"
    ]
  },

  Travel: {
    estimatedMinutes: 60,
    keywords: [
      "drive",
      "travel",
      "commute",
      "flight",
      "airport",
      "bus",
      "train"
    ]
  },

  Meeting: {
    estimatedMinutes: 30,
    keywords: [
      "meeting",
      "conference",
      "standup",
      "sync"
    ]
  },

  Entertainment: {
    estimatedMinutes: 120,
    keywords: [
      "movie",
      "game",
      "watch",
      "tv",
      "stream"
    ]
  },
  Other: {
  estimatedMinutes: 30,
  keywords: []
}
};
function placeTaskWithoutConflict(task, tasks) {
  const todayTasks = tasks
    .filter(t => t.status === "today" && t.id !== task.id)
    .sort((a, b) => a.startTime - b.startTime);

  let start = 0;

  for (const other of todayTasks) {
    const otherEnd = other.startTime + other.estimatedMinutes;

    if (start + task.estimatedMinutes <= other.startTime) {
      return start;
    }

    start = otherEnd;
  }

  return Math.min(1440 - task.estimatedMinutes, start);
}
function normalizeTodayTasks(tasks) {
  const today = tasks.filter(t => t.status === "today");
  const others = tasks.filter(t => t.status !== "today");

  let sorted = [...today].sort((a, b) => a.estimatedMinutes - b.estimatedMinutes);

  let currentStart = 0;

  const arranged = sorted.map(t => {
    const startTime = currentStart;
    currentStart += t.estimatedMinutes;
    return { ...t, startTime };
  });

  return [...others, ...arranged];
}

function App() {
  
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("kanbanTasks");

    const loaded = savedTasks ? JSON.parse(savedTasks) : initialTasks;
return loaded;

  });

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskMinutes, setNewTaskMinutes] = useState("");
  const [newTaskType, setNewTaskType] = useState("Auto Detect");
  const [newTaskPriority, setNewTaskPriority] = useState("None");
  const [taskTypeFilter, setTaskTypeFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All"); 
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [sortOption, setSortOption] = useState("None");
  const stats = useStatistics(tasks);
  // ⭐ Persistent Badges
const savedBadges = JSON.parse(localStorage.getItem("plannerBadges"));
const [badges, setBadges] = useState(savedBadges || []);

// ⭐ Persistent Theme
const savedTheme = localStorage.getItem("plannerTheme");
const [theme, setTheme] = useState(savedTheme || "default");
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem("plannerGoals");
    return saved ? JSON.parse(saved) : [];
  });
  const [newTaskGoalId, setNewTaskGoalId] = useState("");
  useEffect(() => {
  localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
}, [tasks]);

 // ⭐ run once only
// ⭐ Save badges when they change
useEffect(() => {
  localStorage.setItem("plannerBadges", JSON.stringify(badges));
}, [badges]);

// ⭐ Save theme when it changes
useEffect(() => {
  localStorage.setItem("plannerTheme", theme);
}, [theme]);

  function deleteTask(taskId) {
  const task = tasks.find(t => t.id === taskId);

  if (task?.isGoalTask) {
    alert("Goal-related tasks cannot be deleted. Delete the goal instead.");
    return;
  }

  setTasks(tasks.filter(t => t.id !== taskId));
}
// ⭐ Award a badge safely
function awardBadge(badgeName) {
  setBadges(old => {
    if (old.includes(badgeName)) return old; // avoid duplicates
    return [...old, badgeName];
  });
}

// ⭐ Change theme safely
function changeTheme(newTheme) {
  setTheme(newTheme);
}

  function resetTasks() {
  setTasks(old =>
    old.map(t =>
      t.isGoalTask
        ? { ...t, status: "backlog", startTime: null }
        : { ...t, status: "backlog", startTime: null }
    )
  );
}

function detectTaskType(title) {
  const lowerTitle = title.toLowerCase();

  for (const type of Object.keys(TASK_TYPES)) {
    const keywords = TASK_TYPES[type].keywords;

    for (const keyword of keywords) {
      if (lowerTitle.includes(keyword.toLowerCase())) {
        return type;
      }
    }
  }

  return "Other";
}
function isOverdue(task) {
  if (!task.dueDate) {
    return false;
  }

  const today = new Date();
  const due = new Date(task.dueDate);

  return due < today && task.status !== "done";
}
  function addTask(event) {
    event.preventDefault();

    if (
  newTaskTitle.trim() === "" ||
  (newTaskMinutes !== "" && Number(newTaskMinutes) <= 0)
) {
  return;
}

const detectedType =
  newTaskType === "Auto Detect"
    ? detectTaskType(newTaskTitle)
    : newTaskType;

const estimatedTime =
  newTaskMinutes === ""
    ? TASK_TYPES[detectedType].estimatedMinutes
    : Number(newTaskMinutes);
const newTask = {
  id: Date.now().toString(),
  title: newTaskTitle,
  type: detectedType,
  priority: newTaskPriority,
  dueDate: newTaskDueDate,
  status: "backlog",
  estimatedMinutes: estimatedTime,
  startTime: null,
  goalId: newTaskGoalId || null,
  isGoalTask: newTaskGoalId ? true : false
};

    setTasks(old => {
  const startTime =
    newTask.status === "today"
      ? placeTaskWithoutConflict(newTask, old)
      : null;

  return [...old, { ...newTask, startTime }];
});
if (newTaskGoalId) {
    setGoals(old =>
      old.map(g =>
        g.id === newTaskGoalId
          ? { ...g, tasks: [...g.tasks, newTask.id] }
          : g
      )
    );
  }

    setNewTaskTitle("");
    setNewTaskMinutes("");
    setNewTaskType("Auto Detect");
    setNewTaskPriority("None");
    setNewTaskDueDate("");
  }

function handleDragEnd(result) {
  const { destination, draggableId } = result;

  if (!destination) return;
  if (destination.droppableId === "planner") return;

  setTasks(old => {
    const updated = old.map(task =>
      task.id === draggableId
        ? { ...task, status: destination.droppableId }
        : task
    );

    
 if (destination.droppableId === "today") {
  const movedTask = updated.find(t => t.id === draggableId);
  const startTime = placeTaskWithoutConflict(movedTask, updated);

  return updated.map(t =>
    t.id === draggableId
      ? {
          ...t,
          status: "today",
          startTime,
          enteredTodayAt: Date.now()   // ⭐ timestamp added here
        }
      : t
  );
}

    return updated;
  });
}


  

  function renderColumn(title, status) {
  let columnTasks = tasks.filter(
    (task) =>
      task.status === status &&
      (taskTypeFilter === "All" ||
        task.type === taskTypeFilter) &&
      (priorityFilter === "All" ||
        task.priority === priorityFilter)
  );

  if (sortOption === "Urgency") {
    columnTasks.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;

      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }


    return (
      <Droppable droppableId={status}>
        {(provided) => (
          <div
            className="column"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <h2>{title}</h2>

            {columnTasks.map((task, index) => (
              <Draggable
                key={task.id}
                draggableId={task.id}
                index={index}
              >
                {(provided) => (
                  <div
className={`task ${task.isGoalTask ? "goal-task" : ""} ${isOverdue(task) ? "overdue" : ""}`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                   <p>{task.title}</p>
                   <p>Type: {task.type}</p>
                   <p>Priority: {task.priority}</p>
                   <p>Due Date: {task.dueDate}</p>

<p className="task-time">
  Estimated: {task.estimatedMinutes ?? 0} minutes
</p>

<button onClick={() => deleteTask(task.id)}>
  Delete
</button>
                  </div>
                )}
              </Draggable>
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  }

  return (
    <main className="app">
      <h1>My Productivity Planner</h1>
    
      <form className="add-task-form" onSubmit={addTask}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(event) => setNewTaskTitle(event.target.value)}
          placeholder="Enter a new task"
        />
        <select
  value={newTaskGoalId}
  onChange={(e) => setNewTaskGoalId(e.target.value)}
>
  <option value="">No Goal</option>
  {goals.map(goal => (
    <option key={goal.id} value={goal.id}>
      {goal.title}
    </option>
  ))}
</select>
        <input
  type="number"
  value={newTaskMinutes}
  onChange={(event) => setNewTaskMinutes(event.target.value)}
  placeholder="Estimated minutes"
  min="1"
/>
<input
  type="date"
  value={newTaskDueDate}
  onChange={(event) => setNewTaskDueDate(event.target.value)}
/>
<select
  value={newTaskPriority}
  onChange={(event) => setNewTaskPriority(event.target.value)}
>
  <option value="None">No Priority</option>
  <option value="High">High</option>
  <option value="Medium">Medium</option>
  <option value="Low">Low</option>
</select>
<select
  value={newTaskType}
  onChange={(event) => setNewTaskType(event.target.value)}
>
  <option value="Auto Detect">Auto Detect</option>
  {Object.keys(TASK_TYPES).map((type) => (
  <option key={type} value={type}>
    {type}
  </option>
))}
</select>
<select
  value={sortOption}
  onChange={(event) => setSortOption(event.target.value)}
>
  <option value="None">No Sorting</option>
  <option value="Urgency">Urgency</option>
</select>
        <button type="submit">Add Task</button>
      </form>
<select
  value={taskTypeFilter}
  onChange={(event) => setTaskTypeFilter(event.target.value)}
>
  <option value="All">All Types</option>

  {Object.keys(TASK_TYPES).map((type) => (
    <option key={type} value={type}>
      {type}
    </option>
  ))}
</select>
<select
  value={priorityFilter}
  onChange={(event) => setPriorityFilter(event.target.value)}
>
  <option value="All">All Priorities</option>
  <option value="High">High</option>
  <option value="Medium">Medium</option>
  <option value="Low">Low</option>
  <option value="None">No Priority</option>
</select>
<button type="button" onClick={resetTasks}>
  Reset to Default Tasks
</button>
      <DragDropContext onDragEnd={handleDragEnd}>

  <section className="board">
    {renderColumn("Backlog", "backlog")}
    {renderColumn("Today", "today")}
    {renderColumn("In Progress", "inProgress")}
    {renderColumn("Done", "done")}
  </section>
   <Goals
        goals={goals}
        setGoals={setGoals}
        tasks={tasks}
        setTasks={setTasks}
      />
  <DailyPlanner
  tasks={tasks}
  setTasks={setTasks}
/>

</DragDropContext>
<StatisticsPanel stats={stats} />
    </main>
  );
}


export default App;