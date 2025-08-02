import React, { useState, useEffect } from 'react';
import { TodoItem, PriorityLevel, Subtask } from '../types';

interface TaskItemProps {
  task: TodoItem & { projectColor?: string };
  onUpdateTask: (updatedTask: TodoItem) => void;
  onDeleteTask: () => void;
  onEdit: () => void;
  onContextMenu: (event: React.MouseEvent) => void;
}

const priorityStyles: Record<PriorityLevel, string> = {
  [PriorityLevel.P1]: 'border-red-500',
  [PriorityLevel.P2]: 'border-orange-500',
  [PriorityLevel.P3]: 'border-blue-500',
  [PriorityLevel.P4]: 'border-gray-400',
};

const getDueDateInfo = (dueDate: string | null) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    date.setUTCHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);

    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-500 font-semibold' };
    if (diffDays === 0) return { text: 'Today', color: 'text-green-500 font-semibold' };
    if (diffDays === 1) return { text: 'Tomorrow', color: 'text-blue-500' };
    
    return { text: new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' }), color: 'text-subtle-text' };
};

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const MoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg>;

const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdateTask, onDeleteTask, onEdit, onContextMenu }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');

  const handleToggleComplete = () => {
    onUpdateTask({ ...task, completed: !task.completed });
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map(st => 
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdateTask({ ...task, subtasks: updatedSubtasks });
  };
  
  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    const subtask: Subtask = {
        id: `sub-${Date.now()}`,
        text: newSubtask.trim(),
        completed: false
    };
    onUpdateTask({ ...task, subtasks: [...task.subtasks, subtask] });
    setNewSubtask('');
  };

  const dueDateInfo = getDueDateInfo(task.dueDate);
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;

  return (
    <div 
      className={`bg-interactive rounded-lg shadow-sm border-l-4 ${priorityStyles[task.priority]} transition-all duration-200 group`}
      onContextMenu={onContextMenu}
    >
      <div className="flex items-start gap-3 p-3">
        <input 
            type="checkbox" 
            checked={task.completed} 
            onChange={handleToggleComplete}
            onClick={(e) => e.stopPropagation()}
            className={`form-checkbox h-5 w-5 mt-0.5 flex-shrink-0 rounded-full text-primary focus:ring-primary border-subtle-border bg-interactive`}
        />
        <div className="flex-grow cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <p className={`${task.completed ? 'line-through text-subtle-text' : 'text-card-text'}`}>{task.title}</p>
            <div className="flex items-center gap-4 text-xs mt-1 text-subtle-text">
                {dueDateInfo && !task.completed && <span className={dueDateInfo.color}>{dueDateInfo.text}</span>}
                {task.description && <span>📝</span>}
                {task.subtasks.length > 0 && <span>{completedSubtasks}/{task.subtasks.length}</span>}
                {task.image && <span>🖼️</span>}
            </div>
        </div>
        <div className="flex items-center">
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="text-subtle-text hover:text-primary p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
              <EditIcon />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onContextMenu(e); }} className="text-subtle-text hover:text-primary p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity md:hidden">
              <MoreIcon />
            </button>
        </div>
      </div>

      {isExpanded && (
        <div className="pb-3 px-4 pl-11 space-y-4 border-t border-subtle-border">
           {task.image && <img src={task.image} alt="Task image" className="rounded-md mt-2 max-h-48 w-auto" />}
           
           {task.description && (
                <div>
                    <label className="text-xs font-semibold text-subtle-text">Description</label>
                    <p className="text-sm text-card-text whitespace-pre-wrap mt-1">{task.description}</p>
                </div>
           )}
            
            {task.subtasks.length > 0 && (
                 <div>
                    <label className="text-xs font-semibold text-subtle-text">Sub-tasks</label>
                    <div className="space-y-1 mt-1">
                        {task.subtasks.map(st => (
                            <div key={st.id} className="flex items-center gap-2">
                                <input type="checkbox" checked={st.completed} onChange={() => handleSubtaskToggle(st.id)} className="form-checkbox h-4 w-4 rounded text-primary focus:ring-primary" />
                                <span className={`flex-grow text-sm ${st.completed ? 'line-through text-subtle-text' : 'text-card-text'}`}>{st.text}</span>
                            </div>
                        ))}
                    </div>
                 </div>
            )}

            <form onSubmit={handleAddSubtask} className="flex gap-2">
                <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add a sub-task..."
                    className="form-input flex-grow bg-subtle/50 rounded-md p-2 text-sm focus:ring-2 focus:ring-primary border-transparent"
                />
                 <button type="submit" className="bg-subtle px-3 rounded-md text-sm font-semibold hover:bg-subtle-hover">+</button>
            </form>

            <div className="flex justify-end pt-2 border-t border-subtle-border">
                <button onClick={onDeleteTask} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded-md hover:bg-red-500/10">
                    <TrashIcon />
                    Delete Task
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;