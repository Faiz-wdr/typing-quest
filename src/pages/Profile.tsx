import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, Trash2, Trophy, Medal, Star, Target, Palette } from 'lucide-react';
import { importDB, exportDB } from 'dexie-export-import';
import { useTheme } from '@/components/theme-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function Profile() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();
  
  const progress = useLiveQuery(() => db.progress.get(1));
  const logs = useLiveQuery(() => db.logs.toArray());
  const achievements = useLiveQuery(() => db.achievements.toArray());

  if (!progress || !logs || !achievements) return null;

  const bestWpm = logs.length > 0 ? Math.max(...logs.map(l => l.wpm)) : 0;
  const bestAccuracy = logs.length > 0 ? Math.max(...logs.map(l => l.accuracy)) : 0;
  const totalDays = new Set(logs.map(l => l.date)).size;

  const handleExport = async () => {
    try {
      const blob = await exportDB(db, { prettyJson: true });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `typequest-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (confirm('Importing will overwrite your current data. Are you sure?')) {
        await db.delete();
        await db.open();
        await importDB(file);
        window.location.reload();
      }
    } catch (error) {
      console.error("Import failed:", error);
      alert('Failed to import data. Please ensure it is a valid TypeQuest backup file.');
    }
  };

  const handleReset = async () => {
    if (confirm('Are you absolutely sure you want to reset all your progress? This cannot be undone.')) {
      await db.delete();
      window.location.reload();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 pb-28 pt-12 space-y-6"
    >
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-1 text-lg">Level {progress.level} Typist</p>
        </div>
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-3xl border-0 shadow-sm bg-card">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <Target className="w-6 h-6 text-blue-500 mb-2" />
            <span className="text-2xl font-bold">{bestWpm}</span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Best WPM</span>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-0 shadow-sm bg-card">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <Medal className="w-6 h-6 text-green-500 mb-2" />
            <span className="text-2xl font-bold">{bestAccuracy}%</span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Best Accuracy</span>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-0 shadow-sm bg-card">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <Star className="w-6 h-6 text-orange-500 mb-2" />
            <span className="text-2xl font-bold">{progress.longestStreak}</span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Longest Streak</span>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-0 shadow-sm bg-card">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <Trophy className="w-6 h-6 text-purple-500 mb-2" />
            <span className="text-2xl font-bold">{totalDays}</span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Days</span>
          </CardContent>
        </Card>
      </div>

      {/* Achievements (Simplified) */}
      <Card className="rounded-3xl border-0 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {achievements.map(a => (
              <div key={a.id} className="flex items-center gap-4 p-3 rounded-2xl bg-secondary/50">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${a.unlockedAt ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Medal className="w-6 h-6" />
                </div>
                <div>
                  <h4 className={`font-semibold ${a.unlockedAt ? 'text-foreground' : 'text-muted-foreground'}`}>{a.title}</h4>
                  <p className="text-sm text-muted-foreground leading-tight">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="rounded-3xl border-0 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" /> Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Select value={theme} onValueChange={(v: any) => setTheme(v)}>
              <SelectTrigger className="h-14 rounded-2xl text-lg bg-secondary/50 border-0 focus:ring-primary">
                <SelectValue placeholder="Select Theme" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-0 shadow-xl">
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="theme-midnight">Midnight</SelectItem>
                <SelectItem value="theme-ocean">Ocean</SelectItem>
                <SelectItem value="theme-sunset">Sunset</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="rounded-3xl border-0 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start h-14 rounded-2xl text-base border-0 bg-secondary/50" onClick={handleExport}>
            <Download className="w-5 h-5 mr-3" />
            Export Backup
          </Button>
          
          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImport} 
          />
          <Button variant="outline" className="w-full justify-start h-14 rounded-2xl text-base border-0 bg-secondary/50" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-5 h-5 mr-3" />
            Import Backup
          </Button>
          
          <Button variant="destructive" className="w-full justify-start h-14 rounded-2xl text-base" onClick={handleReset}>
            <Trash2 className="w-5 h-5 mr-3" />
            Reset All Data
          </Button>
        </CardContent>
      </Card>

    </motion.div>
  );
}
