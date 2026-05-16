import React, { useState } from 'react';

const STATUS_COLORS = {
  planning: 'bg-blue-100 text-blue-700 border-blue-200',
  preparing: 'bg-purple-100 text-purple-700 border-purple-200',
  submitted: 'bg-green-100 text-green-700 border-green-200',
  waiting: 'bg-amber-100 text-amber-700 border-amber-200',
  result: 'bg-slate-200 text-slate-700 border-slate-300'
};

export function ApplicationCalendar({ apps, isUrgent }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  // Calendar logic
  let firstDayOfMonth = new Date(year, month, 1).getDay();
  // Adjust to make Monday the first day of the week (1-7 instead of 0-6)
  if (firstDayOfMonth === 0) firstDayOfMonth = 7;
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const paddingDays = firstDayOfMonth - 1; // Start Monday
  
  const days = [];
  for (let i = 0; i < paddingDays; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const getAppsForDate = (date) => {
    if (!date) return [];
    // Date formats local time, so we should build the string manually to avoid timezone shift
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateStr = `${date.getFullYear()}-${m}-${d}`;
    return apps.filter(a => a.deadline === dateStr);
  };

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-slate-800 font-outfit">
          {year}年 {month + 1}月
        </h3>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 transition-colors">&lt;</button>
          <button onClick={handleToday} className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 transition-colors font-medium">今天</button>
          <button onClick={handleNextMonth} className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 transition-colors">&gt;</button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="grid grid-cols-7 border-b border-slate-200">
          {weekDays.map(d => (
            <div key={d} className="py-2 text-center font-bold text-slate-500 text-sm">{d}</div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 auto-rows-fr gap-px bg-slate-200 border-l border-slate-200">
          {days.map((date, idx) => {
            const dayApps = getAppsForDate(date);
            const isToday = date && date.toDateString() === new Date().toDateString();
            
            return (
              <div key={idx} className={`bg-white p-2 flex flex-col gap-1 overflow-y-auto ${!date ? 'bg-slate-50/50' : ''}`}>
                {date && (
                  <div className={`text-right text-sm font-semibold mb-1 ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <span className={isToday ? 'bg-indigo-100 rounded-full w-6 h-6 inline-flex items-center justify-center' : ''}>
                      {date.getDate()}
                    </span>
                  </div>
                )}
                {dayApps.map(app => {
                  const urgent = isUrgent(app);
                  return (
                    <div 
                      key={app.id} 
                      title={app.programs?.title || app.program_name}
                      className={`text-xs px-2 py-1 rounded truncate border cursor-default transition-all
                        ${STATUS_COLORS[app.status]} 
                        ${urgent ? 'ring-2 ring-red-400 ring-offset-1 font-bold animate-pulse' : ''}
                      `}
                    >
                      {urgent && <span className="mr-1">⚠️</span>}
                      {app.programs?.title || app.program_name}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
