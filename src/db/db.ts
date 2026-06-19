import Dexie, { type EntityTable } from 'dexie';

export interface DailyLog {
  id?: number;
  date: string; // YYYY-MM-DD
  wpm: number;
  accuracy: number;
  keyboardDependency: 'Never' | 'Rarely' | 'Sometimes' | 'Often' | 'Always';
  notes?: string;
  timestamp: number;
}

export interface ProgressState {
  id: number; // Always 1
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate?: string;
}

export interface SettingsState {
  id: number; // Always 1
  dailyGoalWpm: number;
  dailyGoalAccuracy: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: number | null;
}

const db = new Dexie('TypeQuestDB') as Dexie & {
  logs: EntityTable<DailyLog, 'id'>;
  progress: EntityTable<ProgressState, 'id'>;
  settings: EntityTable<SettingsState, 'id'>;
  achievements: EntityTable<Achievement, 'id'>;
};

db.version(1).stores({
  logs: '++id, date, wpm, accuracy, timestamp',
  progress: 'id',
  settings: 'id',
  achievements: 'id, unlockedAt'
});

export const initDb = async () => {
  // Initialize progress if empty
  const p = await db.progress.get(1);
  if (!p) {
    await db.progress.add({
      id: 1,
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
    });
  }

  // Initialize settings if empty
  const s = await db.settings.get(1);
  if (!s) {
    await db.settings.add({
      id: 1,
      dailyGoalWpm: 20,
      dailyGoalAccuracy: 95,
    });
  }

  // Initialize achievements if empty
  const a = await db.achievements.count();
  if (a === 0) {
    const defaultAchievements: Achievement[] = [
      { id: 'first_practice', title: 'First Practice', description: 'Complete your first practice session.', unlockedAt: null },
      { id: 'streak_3', title: '3 Day Streak', description: 'Practice for 3 days in a row.', unlockedAt: null },
      { id: 'streak_7', title: '7 Day Streak', description: 'Practice for 7 days in a row.', unlockedAt: null },
      { id: 'streak_14', title: '14 Day Streak', description: 'Practice for 14 days in a row.', unlockedAt: null },
      { id: 'streak_30', title: '30 Day Challenge Completed', description: 'Complete the 30-day TypeQuest challenge.', unlockedAt: null },
      { id: 'wpm_25', title: '25 WPM Achieved', description: 'Reach 25 Words Per Minute.', unlockedAt: null },
      { id: 'wpm_50', title: '50 WPM Achieved', description: 'Reach 50 Words Per Minute.', unlockedAt: null },
      { id: 'acc_95', title: '95% Accuracy Achieved', description: 'Achieve 95% accuracy in a session.', unlockedAt: null },
      { id: 'logs_100', title: '100 Logs Recorded', description: 'Record 100 practice sessions.', unlockedAt: null },
    ];
    await db.achievements.bulkAdd(defaultAchievements);
  }
};

export { db };
