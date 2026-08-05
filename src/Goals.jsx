import React, { useState, useEffect } from "react";

export default function Goals({ goals, setGoals, tasks, setTasks }) {
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDesc, setNewGoalDesc] = useState("");

  // Save goals to localStorage safely
  useEffect(() => {
    localStorage.setItem("plannerGoals", JSON.stringify(goals));
  }, [goals]);

  function addGoal(e) {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const newGoal = {
      id: "goal-" + Date.now(),
      title: newGoalTitle,
      description: newGoalDesc,
      createdAt: Date.now(),
      tasks: [] // stores task IDs
    };

    setGoals(old => [...old, newGoal]);
    setNewGoalTitle("");
    setNewGoalDesc("");
  }

  function deleteGoal(goalId) {
    // Remove all tasks tied to this goal
    setTasks(old => old.filter(t => t.goalId !== goalId));

    // Remove the goal itself
    setGoals(old => old.filter(g => g.id !== goalId));
  }

  return (
    <section className="goals-panel">
      <h2>Goals</h2>

      {/* Add Goal Form */}
      <form className="add-goal-form" onSubmit={addGoal}>
        <input
          type="text"
          placeholder="Goal title"
          value={newGoalTitle}
          onChange={e => setNewGoalTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newGoalDesc}
          onChange={e => setNewGoalDesc(e.target.value)}
        />
        <button type="submit">Add Goal</button>
      </form>

      {/* Goal List */}
      <div className="goal-list">
        {goals.length === 0 && <p>No goals yet.</p>}

        {goals.map(goal => (
          <div key={goal.id} className="goal-card">
            <h3>{goal.title}</h3>
            <p>{goal.description}</p>

            <p className="goal-hint">
              Use the Add Task form above to create tasks for this goal.
            </p>

            <button
              className="delete-goal-btn"
              onClick={() => deleteGoal(goal.id)}
            >
              Delete Goal
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
