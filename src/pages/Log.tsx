import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db } from '@/db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';

export function Log() {
  const navigate = useNavigate();
  const [wpm, setWpm] = useState('');
  const [accuracy, setAccuracy] = useState('');
  const [keyboardDependency, setKeyboardDependency] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [existingId, setExistingId] = useState<number | null>(null);
  const progress = useLiveQuery(() => db.progress.get(1));

  useEffect(() => {
    const fetchTodaysLog = async () => {
      const today = new Date().toISOString().split('T')[0];
      const log = await db.logs.where('date').equals(today).first();
      if (log) {
        setExistingId(log.id!);
        setWpm(log.wpm.toString());
        setAccuracy(log.accuracy.toString());
        setKeyboardDependency(log.keyboardDependency);
        setNotes(log.notes || '');
      }
    };
    fetchTodaysLog();
  }, []);

  const handleSave = async () => {
    if (!wpm || !accuracy || !keyboardDependency) return;

    const today = new Date().toISOString().split('T')[0];
    
    if (existingId) {
      await db.logs.update(existingId, {
        wpm: parseInt(wpm),
        accuracy: parseInt(accuracy),
        keyboardDependency: keyboardDependency as any,
        notes,
        timestamp: Date.now(),
      });
    } else {
      await db.logs.add({
        date: today,
        wpm: parseInt(wpm),
        accuracy: parseInt(accuracy),
        keyboardDependency: keyboardDependency as any,
        notes,
        timestamp: Date.now(),
      });
    }

    if (progress && !existingId) {
      // Basic XP and streak logic (only on new log creation)
      const lastPractice = progress.lastPracticeDate;
      let newStreak = progress.currentStreak;
      
      if (lastPractice !== today) {
        newStreak += 1;
      }

      const newXp = progress.xp + 10;
      const newLevel = Math.floor(newXp / 100) + 1;

      await db.progress.update(1, {
        xp: newXp,
        level: newLevel,
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, progress.longestStreak),
        lastPracticeDate: today
      });
    }

    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 pb-28 pt-12 space-y-6"
    >
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Log Result</h1>
      </header>

      <Card className="rounded-3xl border-0 shadow-md bg-card">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="wpm" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Speed (WPM)</Label>
            <Input 
              id="wpm" 
              type="number" 
              placeholder="e.g. 65" 
              value={wpm} 
              onChange={(e) => setWpm(e.target.value)}
              className="h-14 rounded-2xl text-lg bg-secondary/50 border-0 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="accuracy" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Accuracy (%)</Label>
            <Input 
              id="accuracy" 
              type="number" 
              placeholder="e.g. 98" 
              value={accuracy} 
              onChange={(e) => setAccuracy(e.target.value)}
              className="h-14 rounded-2xl text-lg bg-secondary/50 border-0 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Looked at keyboard?</Label>
            <Select value={keyboardDependency} onValueChange={setKeyboardDependency}>
              <SelectTrigger className="h-14 rounded-2xl text-lg bg-secondary/50 border-0 focus:ring-primary">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-0 shadow-xl">
                <SelectItem value="Never">Never</SelectItem>
                <SelectItem value="Rarely">Rarely</SelectItem>
                <SelectItem value="Sometimes">Sometimes</SelectItem>
                <SelectItem value="Often">Often</SelectItem>
                <SelectItem value="Always">Always</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="notes" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Notes (Optional)</Label>
            <Input 
              id="notes" 
              placeholder="How did it feel?" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              className="h-14 rounded-2xl text-lg bg-secondary/50 border-0 focus-visible:ring-primary"
            />
          </div>

        </CardContent>
      </Card>

      <Button 
        size="lg" 
        className="w-full rounded-2xl h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
        onClick={handleSave}
        disabled={!wpm || !accuracy || !keyboardDependency}
      >
        <Save className="w-5 h-5 mr-2" />
        Save Result
      </Button>
    </motion.div>
  );
}
