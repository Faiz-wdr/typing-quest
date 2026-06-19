import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, RotateCcw, PartyPopper } from 'lucide-react';
import { CircularProgress } from '@/components/ui/circular-progress';

const PRACTICE_TIME = 15 * 60; // 15 minutes in seconds

export function Practice() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(PRACTICE_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const playCompletionSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.5); // C6

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 1);
    } catch (e) {
      console.warn("AudioContext not supported or blocked", e);
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    setIsCompleted(true);
    if (timerRef.current) clearInterval(timerRef.current);
    
    playCompletionSound();

    // Haptic feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 500]);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(PRACTICE_TIME);
    setIsCompleted(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((PRACTICE_TIME - timeLeft) / PRACTICE_TIME) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="p-6 h-screen flex flex-col bg-background relative"
    >
      <header className="flex items-center gap-4 pt-12">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Focus</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center -mt-20">
        <AnimatePresence mode="wait">
          {!isCompleted ? (
            <motion.div 
              key="timer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center"
            >
              <CircularProgress 
                progress={progressPercentage} 
                size={280} 
                strokeWidth={16}
                color="var(--primary)"
                backgroundColor="var(--secondary)"
              >
                <div className="flex flex-col items-center">
                  <span className="text-6xl font-black tracking-tighter tabular-nums text-foreground">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground mt-2 uppercase tracking-widest">
                    Remaining
                  </span>
                </div>
              </CircularProgress>

              <div className="flex items-center gap-6 mt-16">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="w-16 h-16 rounded-full bg-card shadow-sm border-0"
                  onClick={resetTimer}
                >
                  <RotateCcw className="w-6 h-6 text-muted-foreground" />
                </Button>
                
                <Button 
                  size="icon" 
                  className="w-20 h-20 rounded-full shadow-xl shadow-primary/25 bg-primary hover:bg-primary/90"
                  onClick={toggleTimer}
                >
                  {isActive ? (
                    <Pause className="w-8 h-8 fill-primary-foreground" />
                  ) : (
                    <Play className="w-8 h-8 ml-1 fill-primary-foreground" />
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="celebration"
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="flex flex-col items-center text-center px-4"
            >
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6"
              >
                <PartyPopper className="w-12 h-12 text-orange-500" />
              </motion.div>
              <h2 className="text-3xl font-black mb-3">Great Job!</h2>
              <p className="text-lg text-muted-foreground mb-12">
                You've completed your 15 minutes of focused practice.
              </p>
              
              <Button 
                size="lg" 
                className="w-full rounded-2xl h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                onClick={() => navigate('/log')}
              >
                Log Result Now
              </Button>
              <Button 
                variant="ghost" 
                className="w-full mt-4 h-14 rounded-2xl text-lg font-medium"
                onClick={() => navigate('/')}
              >
                Maybe Later
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
