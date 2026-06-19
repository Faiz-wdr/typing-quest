import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { CircularProgress } from '@/components/ui/circular-progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Trophy, Target, ArrowRight, PenSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const navigate = useNavigate();
  const progress = useLiveQuery(() => db.progress.get(1));
  const settings = useLiveQuery(() => db.settings.get(1));
  const today = new Date().toISOString().split('T')[0];
  const todaysLog = useLiveQuery(() => db.logs.where('date').equals(today).first());

  const allLogs = useLiveQuery(() => db.logs.orderBy('timestamp').reverse().toArray());

  if (!progress || !settings || !allLogs) return null;

  const isCompletedToday = !!todaysLog;
  
  // Adaptive Goal Logic: Average WPM of last 5 sessions + 2
  const recentLogs = allLogs.filter(l => l.date !== today).slice(0, 5);
  let adaptiveGoalWpm = settings.dailyGoalWpm; // default fallback
  
  if (recentLogs.length > 0) {
    const sumWpm = recentLogs.reduce((acc, log) => acc + log.wpm, 0);
    adaptiveGoalWpm = Math.round(sumWpm / recentLogs.length) + 2;
  }

  // Calculate goal progress based on today's WPM vs Adaptive Goal
  const currentWpm = todaysLog?.wpm || 0;
  const progressPercentage = isCompletedToday ? Math.min((currentWpm / adaptiveGoalWpm) * 100, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 pb-28 pt-12 space-y-8"
    >
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Ready to type?</h1>
        <p className="text-muted-foreground mt-1 text-lg">
          {isCompletedToday ? "You're doing great today!" : "Complete your daily practice."}
        </p>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-3xl border-0 shadow-sm bg-card">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-2xl font-bold">{progress.currentStreak}</span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Day Streak</span>
          </CardContent>
        </Card>
        
        <Card className="rounded-3xl border-0 shadow-sm bg-card">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-2xl font-bold">Lvl {progress.level}</span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{progress.xp} XP</span>
          </CardContent>
        </Card>
      </div>

      {/* Daily Goal Ring */}
      <Card className="rounded-[2rem] border-0 shadow-md bg-card overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-blue-400 opacity-20" />
        <CardContent className="p-8 flex flex-col items-center">
          <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" /> Today's Goal
          </h2>
          
          <CircularProgress 
            progress={progressPercentage} 
            size={180} 
            strokeWidth={16}
            color={isCompletedToday && currentWpm >= adaptiveGoalWpm ? 'var(--success)' : 'var(--primary)'}
          >
            <span className="text-4xl font-black tracking-tighter">
              {currentWpm}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              / {adaptiveGoalWpm} WPM
            </span>
          </CircularProgress>

          <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
            {isCompletedToday 
              ? (currentWpm >= adaptiveGoalWpm ? "Daily goal smashed! 🔥" : "Practice completed. Keep pushing!") 
              : `Beat your adaptive target of ${adaptiveGoalWpm} WPM!`}
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {!isCompletedToday && (
          <Button 
            size="lg" 
            className="w-full rounded-2xl h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
            onClick={() => navigate('/practice')}
          >
            Start 15 Min Practice
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
        
        <Button 
          size="lg" 
          variant={isCompletedToday ? "default" : "secondary"}
          className={`w-full rounded-2xl h-14 text-lg font-semibold ${isCompletedToday ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
          onClick={() => navigate('/log')}
        >
          <PenSquare className="w-5 h-5 mr-2" />
          {isCompletedToday ? "Edit Today's Result" : "Log Today's Result"}
        </Button>
      </div>

      {/* Target Breakdown Table */}
      <div className="pt-4">
        <h3 className="text-lg font-bold mb-3 tracking-tight">Daily Targets Breakdown</h3>
        <Card className="rounded-[2rem] border-0 shadow-sm bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-secondary/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-5 py-4 font-semibold">Metric</th>
                  <th className="px-5 py-4 font-semibold">Target</th>
                  <th className="px-5 py-4 font-semibold">Current</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-4 font-medium flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" /> Speed (WPM)
                  </td>
                  <td className="px-5 py-4 font-bold">{adaptiveGoalWpm}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-md font-medium text-xs ${currentWpm >= adaptiveGoalWpm ? 'bg-success/20 text-success' : 'bg-secondary text-foreground'}`}>
                      {currentWpm}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-4 font-medium flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" /> Accuracy (%)
                  </td>
                  <td className="px-5 py-4 font-bold">{settings.dailyGoalAccuracy}%</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-md font-medium text-xs ${(todaysLog?.accuracy || 0) >= settings.dailyGoalAccuracy ? 'bg-success/20 text-success' : 'bg-secondary text-foreground'}`}>
                      {todaysLog?.accuracy || 0}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

    </motion.div>
  );
}
