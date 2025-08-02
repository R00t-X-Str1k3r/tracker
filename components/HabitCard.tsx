import React, { useState } from 'react';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  onUpdate: (updatedHabit: Habit) => void;
  onDelete: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.completedDates.includes(today);

  const calculateStreak = (): number => {
    const sortedDates = [...new Set(habit.completedDates)]
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());
    
    if (sortedDates.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();

    if (isCompletedToday) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterdayCompleted = sortedDates.some(d => 
        d.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]
      );
      if (!isYesterdayCompleted && sortedDates.length > 0) return 0;
    }
    
    for (let i = isCompletedToday ? 1 : 0; i < sortedDates.length; i++) {
      const date = sortedDates[i];
      const expectedDate = new Date(currentDate);
      if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const handleToggleToday = () => {
    if (isCompletedToday) {
      onUpdate({
        ...habit,
        completedDates: habit.completedDates.filter(date => date !== today)
      });
    } else {
      onUpdate({
        ...habit,
        completedDates: [...habit.completedDates, today]
      });
    }
  };

  const getWeekData = () => {
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      week.push({
        date: dateStr,
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        completed: habit.completedDates.includes(dateStr)
      });
    }
    return week;
  };

  const currentStreak = calculateStreak();
  const weekData = getWeekData();

  return (
    <div className="bg-card rounded-lg shadow-lg p-6 border border-card-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${habit.color}`}></div>
          <h3 className="text-xl font-bold text-card-text">{habit.name}</h3>
          <span className="text-sm bg-subtle text-subtle-text px-2 py-1 rounded-full">
            {habit.category}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-subtle-text hover:text-primary transition-colors"
        >
          <svg className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{currentStreak}</div>
          <div className="text-sm text-subtle-text">Day Streak</div>
        </div>
        <button
          onClick={handleToggleToday}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isCompletedToday
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-primary text-primary-text hover:bg-primary-hover'
          }`}
        >
          {isCompletedToday ? 'Completed Today ✓' : 'Mark Complete'}
        </button>
      </div>

      {/* Week View */}
      <div className="flex justify-between mb-4">
        {weekData.map((day, index) => (
          <div key={index} className="text-center">
            <div className="text-xs text-subtle-text mb-1">{day.day}</div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              day.completed 
                ? 'bg-green-500 text-white' 
                : 'bg-subtle text-subtle-text'
            }`}>
              {day.completed ? '✓' : new Date(day.date).getDate()}
            </div>
          </div>
        ))}
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-subtle-border">
          <div>
            <h4 className="font-semibold text-card-text mb-2">Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-interactive p-3 rounded-md">
                <div className="text-lg font-bold text-primary">{habit.completedDates.length}</div>
                <div className="text-sm text-subtle-text">Total Days</div>
              </div>
              <div className="bg-interactive p-3 rounded-md">
                <div className="text-lg font-bold text-primary">
                  {habit.completedDates.length > 0 ? Math.round((habit.completedDates.length / ((Date.now() - new Date(habit.completedDates[0]).getTime()) / (1000 * 60 * 60 * 24) + 1)) * 100) : 0}%
                </div>
                <div className="text-sm text-subtle-text">Success Rate</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
            >
              Delete Habit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitCard;