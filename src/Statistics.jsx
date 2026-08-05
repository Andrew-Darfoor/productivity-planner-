import React, { useEffect, useState } from "react";

const INITIAL_STATS = {
  streak: 0,
  lastCompletionDay: null,

  badges: {
    streakDefender: false, // 5-day streak
    streakMaster: false,   // 7-day streak
    taskSlayer: false,     // 6 tasks in 1 day
    earlyBird: false       // task before 9 AM
  },

  themesUnlocked: {
    red: false,
    blue: false,
    green: false,
    yellow: false,
    orange: false,
    purple: false
  },

  dailyCompletions: 0,
  lastResetDay: null
};
const BADGE_INFO = {
  streakDefender: {
    label: "Streak Defender",
    description: "Maintain a 5-day streak",
    color: "#4CAF50",
    icon: "🛡️"
  },
  streakMaster: {
    label: "Streak Master",
    description: "Maintain a 7-day streak",
    color: "#673AB7",
    icon: "👑"
  },
  taskSlayer: {
    label: "Task Slayer",
    description: "Complete 6 tasks in one day",
    color: "#E91E63",
    icon: "⚔️"
  },
  earlyBird: {
    label: "Early Bird",
    description: "Complete a task before 9 AM",
    color: "#03A9F4",
    icon: "🌅"
  }
};

function getTodayString() {
  return new Date().toDateString();
}

function isSameDay(timestamp, dayString) {
  if (!timestamp) return false;
  return new Date(timestamp).toDateString() === dayString;
}

export function useStatistics(tasks) {
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem("plannerStats");
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });

  useEffect(() => {
  const today = getTodayString();

  let updated = { ...stats };
  let changed = false;

  // Reset daily completions if day changed
  if (updated.lastResetDay !== today) {
    updated.dailyCompletions = 0;
    updated.lastResetDay = today;
    changed = true;
  }

  // Count today's completed tasks
  const completedToday = tasks.filter(
    t =>
      t.status === "done" &&
      t.completedAt &&
      isSameDay(t.completedAt, today)
  );

  const completedCount = completedToday.length;

  if (updated.dailyCompletions !== completedCount) {
    updated.dailyCompletions = completedCount;
    changed = true;
  }

  // Streak logic
  const hasCompletionToday = completedCount > 0;

  if (hasCompletionToday && updated.lastCompletionDay !== today) {
    updated.streak += 1;
    updated.lastCompletionDay = today;
    changed = true;
  }

  // Task Slayer badge
  if (completedCount >= 6 && !updated.badges.taskSlayer) {
    updated.badges.taskSlayer = true;
    changed = true;
  }

  // Early Bird badge
  const earlyBirdHit = completedToday.some(t => {
    const d = new Date(t.completedAt);
    return d.getHours() < 9;
  });

  if (earlyBirdHit && !updated.badges.earlyBird) {
    updated.badges.earlyBird = true;
    changed = true;
  }

  // Streak-based rewards
  if (updated.streak >= 3) {
    const allThemesUnlocked =
      Object.values(updated.themesUnlocked).every(v => v);

    if (!allThemesUnlocked) {
      updated.themesUnlocked = {
        red: true,
        blue: true,
        green: true,
        yellow: true,
        orange: true,
        purple: true
      };
      changed = true;
    }
  }

  if (updated.streak >= 5 && !updated.badges.streakDefender) {
    updated.badges.streakDefender = true;
    changed = true;
  }

  if (updated.streak >= 7 && !updated.badges.streakMaster) {
    updated.badges.streakMaster = true;
    changed = true;
  }

  // Only update state if something changed
  if (changed) {
    localStorage.setItem("plannerStats", JSON.stringify(updated));
    setStats(updated);
  }
}, [tasks]);


  return stats;
}

export function StatisticsPanel({ stats }) {
  const { streak, dailyCompletions, badges, themesUnlocked } = stats;

  const unlockedThemes = Object.entries(themesUnlocked)
    .filter(([, v]) => v)
    .map(([name]) => name);

  const earnedBadges = Object.entries(badges)
    .filter(([, v]) => v)
    .map(([name]) => name);

  return (
    <section className="statistics-panel">
      <h2>Statistics & Rewards</h2>

      <p>Current streak: <strong>{streak} days</strong></p>
      <p>Tasks completed today: <strong>{dailyCompletions}</strong></p>

      <div>
        <h3>Unlocked Themes</h3>
        {unlockedThemes.length === 0 ? (
          <p>No themes unlocked yet.</p>
        ) : (
          <ul>
            {unlockedThemes.map(theme => (
              <li key={theme}>{theme}</li>
            ))}
          </ul>
        )}
      </div>

      <div>
  <h3>Badges</h3>

  {earnedBadges.length === 0 ? (
    <p>No badges earned yet.</p>
  ) : (
    <div className="badge-grid">
      {earnedBadges.map(badge => {
        const info = BADGE_INFO[badge];
        return (
          <div
            key={badge}
            className="badge-card"
            style={{ borderColor: info.color }}
          >
            <div className="badge-icon">{info.icon}</div>
            <div className="badge-text">
              <strong>{info.label}</strong>
              <p>{info.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>

    </section>
  );
}
