import { NavLink } from 'react-router-dom';
import { Home, LineChart, Map, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function BottomNav() {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/progress', icon: LineChart, label: 'Progress' },
    { to: '/challenge', icon: Map, label: 'Challenge' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-card border-t border-border pb-safe flex justify-around items-center px-2 z-50 rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 bg-primary/10 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn("w-6 h-6 mb-1 relative z-10", isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium relative z-10">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}
