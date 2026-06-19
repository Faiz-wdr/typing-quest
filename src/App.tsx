import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BottomNav } from '@/components/layout/BottomNav';
import { Home } from '@/pages/Home';
import { Progress } from '@/pages/Progress';
import { Challenge } from '@/pages/Challenge';
import { Profile } from '@/pages/Profile';
import { Practice } from '@/pages/Practice';
import { Log } from '@/pages/Log';
import { AnimatePresence } from 'framer-motion';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground pb-24 font-sans selection:bg-primary/20">
        <div className="max-w-md mx-auto relative min-h-screen shadow-2xl bg-background overflow-hidden">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/challenge" element={<Challenge />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/log" element={<Log />} />
            </Routes>
          </AnimatePresence>
          <BottomNav />
        </div>
      </div>
    </Router>
  );
}

export default App;
