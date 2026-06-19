import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export function Progress() {
  const logs = useLiveQuery(() => db.logs.orderBy('date').toArray());
  const progress = useLiveQuery(() => db.progress.get(1));

  if (!logs || !progress) return null;

  // Transform logs for recharts
  const chartData = logs.map(log => ({
    name: format(new Date(log.date), 'MMM d'),
    wpm: log.wpm,
    accuracy: log.accuracy,
    fullDate: log.date
  }));

  // Heatmap data generation (last 30 days)
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 29);
  const dateRange = eachDayOfInterval({ start: thirtyDaysAgo, end: today });

  const activityMap = new Map(logs.map(l => [l.date, true]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 pb-28 pt-12 space-y-6"
    >
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-lg">Your typing journey.</p>
      </header>

      {/* Speed Trend */}
      <Card className="rounded-3xl border-0 shadow-sm bg-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Typing Speed (WPM)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[200px] w-full pt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="wpm" 
                    stroke="var(--primary)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorWpm)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Not enough data yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Accuracy Trend */}
      <Card className="rounded-3xl border-0 shadow-sm bg-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Accuracy %</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[200px] w-full pt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} 
                    dy={10}
                  />
                  <YAxis 
                    domain={[80, 100]}
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="var(--success)" 
                    strokeWidth={3}
                    dot={{ fill: 'var(--success)', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Not enough data yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Heatmap */}
      <Card className="rounded-3xl border-0 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Last 30 Days Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {dateRange.map(date => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const isActive = activityMap.has(dateStr);
              return (
                <div 
                  key={dateStr}
                  className={`aspect-square rounded-md ${isActive ? 'bg-primary' : 'bg-secondary'}`}
                  title={dateStr}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

    </motion.div>
  );
}
