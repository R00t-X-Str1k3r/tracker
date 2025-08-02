import React, { useState } from 'react';
import { Habit } from '../types';
import HabitCard from './HabitCard';
import Modal from './Modal';

interface HabitViewProps {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
}

const HabitView: React.FC<HabitViewProps> = ({ habits, setHabits }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('bg-blue-500');

  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
    'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];

  const categories = [
    'Health', 'Fitness', 'Learning', 'Productivity', 'Mindfulness', 
    'Social', 'Creative', 'Personal', 'Other'
  ];

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name: newHabitName.trim(),
      color: newHabitColor,
      category: newHabitCategory || 'Other',
      completedDates: []
    };

    setHabits(prev => [...prev, newHabit]);
    setNewHabitName('');
    setNewHabitCategory('');
    setNewHabitColor('bg-blue-500');
    setIsModalOpen(false);
  };

  const handleUpdateHabit = (updatedHabit: Habit) => {
    setHabits(prev => prev.map(habit => 
      habit.id === updatedHabit.id ? updatedHabit : habit
    ));
  };

  const handleDeleteHabit = (habitId: string) => {
    if (window.confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      setHabits(prev => prev.filter(habit => habit.id !== habitId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-card-text">Habits</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-text px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
        >
          Add Habit
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-subtle-text mb-4">No habits added yet.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-primary-text px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors"
          >
            Add Your First Habit
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onUpdate={handleUpdateHabit}
              onDelete={() => handleDeleteHabit(habit.id)}
            />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Habit">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-text mb-2">Habit Name</label>
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Enter habit name..."
              className="form-input w-full p-2 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-text mb-2">Category</label>
            <select
              value={newHabitCategory}
              onChange={(e) => setNewHabitCategory(e.target.value)}
              className="form-select w-full p-2 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent"
            >
              <option value="">Select a category...</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-text mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setNewHabitColor(color)}
                  className={`w-8 h-8 rounded-full ${color} border-2 transition-all ${
                    newHabitColor === color ? 'border-primary scale-110' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-subtle text-subtle-text px-4 py-2 rounded-md hover:bg-subtle-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddHabit}
              disabled={!newHabitName.trim()}
              className="bg-primary text-primary-text px-4 py-2 rounded-md hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              Add Habit
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HabitView;