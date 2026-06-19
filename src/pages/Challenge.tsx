import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { Lock, Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Challenge() {
  const logs = useLiveQuery(() => db.logs.orderBy('date').uniqueKeys());
  
  if (!logs) return null;

  const daysCompleted = logs.length;
  const totalDays = 30;

  const nodes = Array.from({ length: totalDays }).map((_, i) => {
    const day = i + 1;
    const isCompleted = day <= daysCompleted;
    const isCurrent = day === daysCompleted + 1;
    const isLocked = day > daysCompleted + 1;

    return { day, isCompleted, isCurrent, isLocked };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 pb-32 pt-12"
    >
      <header className="mb-8 text-center sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4">
        <h1 className="text-3xl font-bold tracking-tight">30 Day Challenge</h1>
        <p className="text-muted-foreground mt-1 text-lg">You are on day {daysCompleted + 1}</p>
      </header>

      <div className="flex flex-col items-center space-y-8 relative">
        {/* Connection Line */}
        <div className="absolute top-8 bottom-8 w-2 bg-secondary rounded-full -z-10" />
        <div 
          className="absolute top-8 w-2 bg-primary rounded-full -z-10 transition-all duration-1000"
          style={{ height: `${(Math.min(daysCompleted, totalDays) / totalDays) * 100}%` }}
        />

        {nodes.map((node, index) => {
          // Add some horizontal offset for the curvy path look
          const offset = Math.sin(index * 0.8) * 40;

          return (
            <motion.div 
              key={node.day}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              style={{ transform: `translateX(${offset}px)` }}
              className="relative group"
            >
              <div 
                className={cn(
                  "w-20 h-20 rounded-full border-[6px] flex items-center justify-center shadow-lg transition-all duration-300",
                  node.isCompleted ? "bg-primary border-primary text-white" : 
                  node.isCurrent ? "bg-background border-primary text-primary scale-110 shadow-primary/30" : 
                  "bg-secondary border-secondary text-muted-foreground opacity-60"
                )}
              >
                {node.isCompleted ? (
                  <Check className="w-8 h-8" strokeWidth={3} />
                ) : node.isCurrent ? (
                  <Star className="w-8 h-8 fill-primary" />
                ) : (
                  <Lock className="w-6 h-6" />
                )}
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-bold text-sm text-foreground">
                Day {node.day}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
