import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { TodoList, TodoItem, PriorityLevel, Subtask } from '../types';
import TaskItem from './TaskItem';
import Modal from './Modal';
import { folderColors } from '../themes';
import PomodoroTimer from './PomodoroTimer';

interface TodoViewProps {
  todos: TodoList[];
  setTodos: React.Dispatch<React.SetStateAction<TodoList[]>>;
  isGlassy: boolean;
}

type ActiveView = 'today' | 'upcoming' | 'completed' | string; // string is project ID

// --- ICONS ---
const TodayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>;
const UpcomingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11 6a3 3 0 11-6 0 3 3 0 016 0z" /><path fillRule="evenodd" d="M0 8a8 8 0 1116 0A8 8 0 010 8zm8-7a7 7 0 00-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 008 1z" clipRule="evenodd" /></svg>;
const CompletedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const FolderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>;
const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className || ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;
const MoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const ColorSwatchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm12 14H4V4h12v12zM6 6a2 2 0 100 4 2 2 0 000-4zm-2 2a4 4 0 118 0 4 4 0 01-8 0z" clipRule="evenodd" /></svg>;

type ContextMenuItem =
  | {
      label: string;
      action: (...args: any[]) => void;
      danger?: boolean;
      subMenu?: React.ReactNode;
    }
  | { type: 'divider' };

// --- COMPONENT: TodoView ---
const TodoView: React.FC<TodoViewProps> = ({ todos, setTodos, isGlassy }) => {
  const [activeView, setActiveView] = useState<ActiveView>('today');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string; type: 'task' | 'folder' } | null>(null);
  
  // Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<(TodoItem & { projectId: string }) | null>(null);
  const [defaultProjectId, setDefaultProjectId] = useState<string | null>(null);
  const [movingTask, setMovingTask] = useState<(TodoItem & { projectId: string }) | null>(null);

  // Inline Editing State
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // --- HANDLERS ---
  const handleUpdateTask = (updatedTask: TodoItem, projectId: string) => {
    setTodos(prevTodos => prevTodos.map(project => 
      project.id === projectId 
        ? { ...project, items: project.items.map(item => item.id === updatedTask.id ? updatedTask : item) }
        : project
    ));
  };

  const handleAddTask = (newTask: TodoItem, projectId: string) => {
     setTodos(prevTodos => prevTodos.map(p => 
        p.id === projectId ? { ...p, items: [...p.items, newTask] } : p
    ));
  };
  
  const handleDeleteTask = (taskId: string, projectId: string) => {
     setTodos(prevTodos => prevTodos.map(project => 
      project.id === projectId ? { ...project, items: project.items.filter(item => item.id !== taskId) } : project
     ));
  };
  
  const handleMoveTask = (newProjectId: string) => {
    if (!movingTask || !newProjectId || movingTask.projectId === newProjectId) {
      setMovingTask(null);
      return;
    }

    const { projectId: sourceId, ...taskData } = movingTask;

    setTodos(prev => {
      return prev.map(p => {
        // Remove from source project
        if (p.id === sourceId) {
          return { ...p, items: p.items.filter(item => item.id !== taskData.id) };
        }
        // Add to destination project
        if (p.id === newProjectId) {
          return { ...p, items: [...p.items, taskData] };
        }
        return p;
      });
    });

    setMovingTask(null);
  };
  
  const handleAddProject = (name: string, parentId?: string) => {
      if (!name || !name.trim()) return;
      const newProject: TodoList = {
        id: `proj-${Date.now()}`,
        name,
        color: `bg-gray-400`,
        items: [],
        parentId,
      };
      setTodos(prev => [...prev, newProject]);
      if (parentId) {
        setExpandedFolders(prev => new Set(prev).add(parentId));
      }
  };
  
  const startRenameFolder = (folderId: string) => {
    const folder = todos.find(f => f.id === folderId);
    if (folder) {
      setRenamingFolderId(folderId);
      setRenameValue(folder.name);
    }
  };

  const commitRenameFolder = (folderId: string) => {
    if (renameValue.trim()) {
      setTodos(prev => prev.map(f => f.id === folderId ? { ...f, name: renameValue.trim() } : f));
    }
    setRenamingFolderId(null);
    setRenameValue('');
  };
  
  const handleSetFolderColor = (folderId: string, color: string) => {
      setTodos(prev => prev.map(p => p.id === folderId ? {...p, color} : p));
  };
  
  const handleDeleteProject = (projectId: string) => {
      if (!window.confirm("Are you sure you want to delete this folder and ALL its content (including sub-folders and tasks)? This action cannot be undone.")) return;
      
      const idsToDelete = new Set([projectId]);
      let changed = true;
      while(changed) {
          changed = false;
          todos.forEach(p => {
              if(p.parentId && idsToDelete.has(p.parentId) && !idsToDelete.has(p.id)) {
                  idsToDelete.add(p.id);
                  changed = true;
              }
          });
      }
      
      setTodos(prev => prev.filter(p => !idsToDelete.has(p.id)));
      if (activeView === projectId) setActiveView('today');
  };

  const handleContextMenu = (e: React.MouseEvent, id: string, type: 'task' | 'folder') => {
    e.preventDefault();
    e.stopPropagation();
    
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const menuW = 200; // Estimated menu width
    const menuH = 200; // Estimated menu height
    
    const xPos = e.pageX + menuW > screenW ? screenW - menuW - 10 : e.pageX;
    const yPos = e.pageY + menuH > screenH ? screenH - menuH - 10 : e.pageY;
    
    setContextMenu({ x: xPos, y: yPos, id, type });
  };
  
  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  useEffect(() => {
    document.addEventListener('click', closeContextMenu);
    return () => document.removeEventListener('click', closeContextMenu);
  }, [closeContextMenu]);


  // --- COMPUTED VALUES ---
  const { currentTasks, viewTitle } = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const allTasks = todos.flatMap(p => p.items.map(item => ({ ...item, projectId: p.id, projectColor: p.color })));

    if (activeView === 'today') {
      return {
        viewTitle: 'Today',
        currentTasks: allTasks.filter(t => !t.completed && t.dueDate === todayStr).sort((a,b) => a.priority.localeCompare(b.priority)),
      };
    }
    if (activeView === 'upcoming') {
      return {
        viewTitle: 'Upcoming',
        currentTasks: allTasks.filter(t => !t.completed && t.dueDate && t.dueDate > todayStr).sort((a,b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()),
      };
    }
     if (activeView === 'completed') {
      return {
        viewTitle: 'Completed',
        currentTasks: allTasks.filter(t => t.completed).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      };
    }
    
    const project = todos.find(p => p.id === activeView);
    if (project) {
        const projectTasks = allTasks.filter(t => t.projectId === project.id);
        return {
            viewTitle: project.name,
            currentTasks: projectTasks.sort((a,b) => {
                if(a.completed !== b.completed) return a.completed ? 1 : -1;
                return a.priority.localeCompare(b.priority);
            }),
        }
    }
    setActiveView('today');
    return { viewTitle: 'Today', currentTasks: allTasks.filter(t => !t.completed && t.dueDate === todayStr) };

  }, [activeView, todos]);
  
  const openTaskModalForEdit = (task: TodoItem, projectId: string) => {
    setEditingTask({ ...task, projectId });
    setIsTaskModalOpen(true);
  };
  
  const openTaskModalForNew = (projectId?: string) => {
    setEditingTask(null);
    setDefaultProjectId(projectId || null);
    setIsTaskModalOpen(true);
  };
  
  const renderProjectTree = (parentId?: string, level = 0) => {
      const projects = todos.filter(p => p.parentId === parentId).sort((a,b) => a.name.localeCompare(b.name));
      if (projects.length === 0 && level === 0 && todos.length > 0) {
        const orphans = todos.filter(p => p.parentId && !todos.find(parent => parent.id === p.parentId));
        projects.push(...orphans);
      }
      return projects.map(project => {
        const hasChildren = todos.some(p => p.parentId === project.id);
        const isExpanded = expandedFolders.has(project.id);
        const isRenaming = renamingFolderId === project.id;

        return(
            <div key={project.id} className="relative">
                { level > 0 && <span className="absolute -left-2.5 top-0 bottom-0 w-px bg-subtle-border opacity-50" />}
                <div onContextMenu={(e) => handleContextMenu(e, project.id, 'folder')} className={`group w-full flex items-center gap-1 pr-2 rounded-md text-sm font-medium transition-colors ${ activeView === project.id ? 'bg-primary-500/10 text-primary' : 'text-subtle-text hover:bg-subtle-hover'}`} style={{ paddingLeft: `${level * 1}rem`}}>
                    <button onClick={() => setExpandedFolders(prev => { const next = new Set(prev); next.has(project.id) ? next.delete(project.id) : next.add(project.id); return next; })} className={`p-1 rounded-md ${!hasChildren && 'invisible'}`}>
                        <ChevronRightIcon className={`transform transition-transform ${isExpanded && 'rotate-90'}`} />
                    </button>
                    <div className="flex-grow flex items-center gap-2 text-left py-1.5 cursor-pointer" onClick={() => setActiveView(project.id)}>
                      <span className={`w-2.5 h-2.5 rounded-full ${project.color || 'bg-gray-400'}`}></span>
                      {isRenaming ? (
                        <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => commitRenameFolder(project.id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') commitRenameFolder(project.id);
                                if (e.key === 'Escape') setRenamingFolderId(null);
                            }}
                            className="bg-card border border-primary text-card-text rounded px-1 -my-0.5 w-full"
                            autoFocus
                            onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <span className="flex-grow truncate">{project.name}</span>
                      )}
                    </div>
                     <button onClick={(e) => { e.stopPropagation(); handleContextMenu(e, project.id, 'folder') }} className="opacity-0 group-hover:opacity-100 p-1 md:hidden">
                        <MoreIcon />
                     </button>
                </div>
                {isExpanded && hasChildren && renderProjectTree(project.id, level + 1)}
            </div>
        )
      })
  }
  
  const sidebarContent = (
    <>
      <div className="flex-grow flex flex-col overflow-hidden">
        <nav className="space-y-1">
            <SidebarButton id="today" icon={<TodayIcon />} label="Today" onClick={() => setActiveView('today')} active={activeView === 'today'} />
            <SidebarButton id="upcoming" icon={<UpcomingIcon />} label="Upcoming" onClick={() => setActiveView('upcoming')} active={activeView === 'upcoming'} />
            <SidebarButton id="completed" icon={<CompletedIcon />} label="Completed" onClick={() => setActiveView('completed')} active={activeView === 'completed'} />
        </nav>
        <hr className="my-4 border-subtle-border" />
        <div className="flex justify-between items-center px-2 mb-2">
          <h3 className="text-xs font-semibold text-subtle-text uppercase tracking-wider">Projects</h3>
          <button onClick={() => handleAddProject(prompt("New project name:") || 'New Project')} className="text-primary hover:text-primary-hover font-bold text-lg leading-none p-1">+</button>
        </div>
        <nav className="space-y-1 flex-grow overflow-y-auto -mr-2 pr-2">
            {renderProjectTree()}
            {todos.length === 0 && <p className="text-center text-xs text-subtle-text p-4">Click the '+' to create a project.</p>}
        </nav>
      </div>
       <div className="mt-auto pt-4 border-t border-subtle-border">
          <PomodoroTimer />
       </div>
    </>
  );

  return (
    <div className={`bg-card rounded-lg shadow-lg flex h-[calc(100vh-220px)] min-h-[400px] border border-card-border ${isGlassy ? 'glassy' : ''}`}>
      {/* Sidebar for Desktop */}
      <aside className="w-64 border-r border-subtle-border p-4 flex-col hidden md:flex">
        {sidebarContent}
      </aside>

       {/* Sidebar for Mobile (Modal) */}
      {isSidebarOpen && (
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsSidebarOpen(false)}>
              <aside className={`bg-card w-64 h-full p-4 flex flex-col shadow-xl ${isGlassy ? 'glassy' : ''}`}>
                  {sidebarContent}
              </aside>
          </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 flex flex-col overflow-hidden">
         <div className="flex items-center gap-2 mb-6">
            <button className="md:hidden text-subtle-text" onClick={() => setIsSidebarOpen(true)}>
                <MenuIcon />
            </button>
            <h2 className="text-2xl font-bold text-card-text truncate">{viewTitle}</h2>
         </div>
         <div className="flex-grow space-y-2 overflow-y-auto -mr-3 pr-3">
            {currentTasks.map(task => (
                <TaskItem 
                    key={task.id} 
                    task={task}
                    onUpdateTask={(updated) => handleUpdateTask(updated, task.projectId)} 
                    onDeleteTask={() => handleDeleteTask(task.id, task.projectId)}
                    onEdit={() => openTaskModalForEdit(task, task.projectId)}
                    onContextMenu={(e) => handleContextMenu(e, task.id, 'task')}
                />
            ))}
            {currentTasks.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-subtle-text">No tasks in this view.</p>
                </div>
            )}
         </div>
         <div className="mt-auto pt-4 border-t border-subtle-border">
             <button onClick={() => openTaskModalForNew(typeof activeView === 'string' && !['today', 'upcoming', 'completed'].includes(activeView) ? activeView : undefined)} className={`w-full bg-primary text-primary-text font-bold py-2 px-4 rounded-md hover:bg-primary-hover transition-colors`}>
                Add Task
              </button>
         </div>
      </main>
      
      {contextMenu && (
        <ContextMenu 
            x={contextMenu.x} y={contextMenu.y}
            onClose={closeContextMenu}
            actions={
                contextMenu.type === 'folder' ? [
                    { label: 'New Task...', action: () => openTaskModalForNew(contextMenu.id) },
                    { label: 'New Sub-folder...', action: () => handleAddProject(prompt("Sub-folder name:") || 'New Sub-folder', contextMenu.id) },
                    { type: 'divider' },
                    { label: 'Rename', action: () => startRenameFolder(contextMenu.id) },
                    { label: 'Change Color...', action: () => {}, subMenu: <ColorPicker onSelect={(color) => { handleSetFolderColor(contextMenu.id, color); closeContextMenu(); }} /> },
                    { type: 'divider' },
                    { label: 'Delete Folder', action: () => handleDeleteProject(contextMenu.id), danger: true },
                ] : [ // Task actions
                    { label: 'Edit Task...', action: () => {
                        const task = todos.flatMap(p => p.items.map(i => ({...i, projectId: p.id}))).find(t => t.id === contextMenu.id);
                        if(task) openTaskModalForEdit(task, task.projectId);
                    }},
                    { label: 'Move to...', action: () => {
                         const task = todos.flatMap(p => p.items.map(i => ({...i, projectId: p.id}))).find(t => t.id === contextMenu.id);
                         if (task) setMovingTask(task);
                    }},
                     { type: 'divider' },
                    { label: 'Delete Task', action: () => {
                        const task = todos.flatMap(p => p.items.map(i => ({...i, projectId: p.id}))).find(t => t.id === contextMenu.id);
                        if(task) handleDeleteTask(task.id, task.projectId);
                    }, danger: true },
                ]
            }
        />
      )}
      
      {isTaskModalOpen && (
        <TaskModal 
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            onSave={(task, projectId) => {
                if(editingTask) {
                    handleUpdateTask(task, projectId);
                } else {
                    handleAddTask(task, projectId);
                }
            }}
            taskToEdit={editingTask}
            projects={todos}
            defaultProjectId={defaultProjectId}
        />
      )}

      {movingTask && (
        <Modal isOpen={!!movingTask} onClose={() => setMovingTask(null)} title={`Move "${movingTask.title}"`}>
            <div className="space-y-2">
                <label htmlFor="project-select" className="text-sm font-medium text-card-text">Select a destination folder:</label>
                <select 
                    id="project-select"
                    defaultValue={movingTask.projectId}
                    onChange={(e) => handleMoveTask(e.target.value)}
                    className="form-select w-full p-2 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent"
                >
                    {todos.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
        </Modal>
      )}

    </div>
  );
};

// --- SUB-COMPONENTS ---
const SidebarButton = ({ id, icon, label, onClick, active }: { id: string, icon: React.ReactNode, label: string, onClick: (id: string) => void, active: boolean }) => (
    <button onClick={() => onClick(id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${ active ? 'bg-primary-500/10 text-primary' : 'text-subtle-text hover:bg-subtle-hover'}`}>
        {icon}
        <span className="flex-grow text-left truncate">{label}</span>
    </button>
);

const ColorPicker = ({ onSelect }: { onSelect: (color: string) => void }) => (
    <div className="grid grid-cols-6 gap-2 p-2 w-48">
        {folderColors.map(color => (
            <button key={color} onClick={() => onSelect(color)} className={`w-6 h-6 rounded-full ${color} transition transform hover:scale-110`}></button>
        ))}
    </div>
);

const ContextMenu = ({ x, y, onClose, actions }: { x: number; y: number; onClose: () => void; actions: ContextMenuItem[] }) => {
    const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

    return (
        <div style={{ top: y, left: x }} className="fixed bg-card border border-card-border rounded-md shadow-2xl p-1 z-50 text-sm min-w-[180px] animate-in fade-in duration-100" onClick={(e) => e.stopPropagation()}>
            {actions.map((item, index) => {
                if ('type' in item && item.type === 'divider') {
                    return <hr key={`divider-${index}`} className="my-1 border-subtle-border" />;
                }
                
                const { label, action, danger, subMenu } = item;

                if (subMenu) {
                    return (
                        <div key={label} onMouseEnter={() => setActiveSubMenu(label)} onMouseLeave={() => setActiveSubMenu(null)} className="relative">
                            <button
                                className={`w-full text-left flex justify-between items-center px-3 py-1.5 rounded-sm transition-colors text-card-text hover:bg-primary hover:text-primary-text`}
                            >
                                <span>{label}</span>
                                <ChevronRightIcon />
                            </button>
                            {activeSubMenu === label && (
                                <div className="absolute left-full -top-1 ml-1 bg-card border border-card-border rounded-md shadow-2xl p-1 z-50">
                                    {subMenu}
                                </div>
                            )}
                        </div>
                    );
                }
                return (
                    <button
                        key={label}
                        onClick={() => { action(); onClose(); }}
                        className={`w-full text-left block px-3 py-1.5 rounded-sm transition-colors ${danger ? 'text-red-500 hover:bg-red-500/10' : 'text-card-text hover:bg-primary hover:text-primary-text'}`}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
};

const TaskModal = ({ isOpen, onClose, onSave, taskToEdit, projects, defaultProjectId }: {
    isOpen: boolean,
    onClose: () => void,
    onSave: (task: TodoItem, projectId: string) => void,
    taskToEdit: (TodoItem & { projectId: string }) | null,
    projects: TodoList[],
    defaultProjectId: string | null
}) => {
    const [title, setTitle] = useState(taskToEdit?.title || '');
    const [description, setDescription] = useState(taskToEdit?.description || '');
    const [priority, setPriority] = useState<PriorityLevel>(taskToEdit?.priority || PriorityLevel.P4);
    const [dueDate, setDueDate] = useState(taskToEdit?.dueDate || '');
    const [projectId, setProjectId] = useState(taskToEdit?.projectId || defaultProjectId || '');
    const [image, setImage] = useState(taskToEdit?.image || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const setDateShortcut = (type: 'today' | 'tomorrow') => {
        const date = new Date();
        if (type === 'tomorrow') {
            date.setDate(date.getDate() + 1);
        }
        setDueDate(date.toISOString().split('T')[0]);
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title.trim() || !projectId) {
            alert("Title and project are required.");
            return;
        }

        const taskData: TodoItem = {
            id: taskToEdit?.id || `task-${Date.now()}`,
            title,
            description,
            priority,
            dueDate: dueDate || null,
            image,
            completed: taskToEdit?.completed || false,
            subtasks: taskToEdit?.subtasks || [],
            createdAt: taskToEdit?.createdAt || new Date().toISOString(),
        };

        onSave(taskData, projectId);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={taskToEdit ? 'Edit Task' : 'Add Task'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Task Title" className="form-input w-full p-2 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent" required />
                
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description / Notes..." rows={4} className="form-textarea w-full p-2 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent resize-y" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <select value={projectId} onChange={e => setProjectId(e.target.value)} className="form-select w-full p-2 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent" required>
                         <option value="" disabled>Select a project...</option>
                         {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                     </select>
                     <select value={priority} onChange={e => setPriority(e.target.value as PriorityLevel)} className="form-select w-full p-2 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent">
                         {Object.values(PriorityLevel).map(p => <option key={p} value={p}>{`Priority ${p[1]}`}</option>)}
                     </select>
                </div>

                <div>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="form-input w-full p-2 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent" />
                    <div className="flex gap-2 mt-2 text-xs">
                        <button type="button" onClick={() => setDateShortcut('today')} className="px-2 py-1 bg-subtle rounded-md hover:bg-subtle-hover">Today</button>
                        <button type="button" onClick={() => setDateShortcut('tomorrow')} className="px-2 py-1 bg-subtle rounded-md hover:bg-subtle-hover">Tomorrow</button>
                        <button type="button" onClick={() => setDueDate('')} className="px-2 py-1 bg-subtle rounded-md hover:bg-subtle-hover">No Date</button>
                    </div>
                </div>

                <div>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-primary hover:underline">
                        {image ? 'Change Image' : 'Add Image'}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    {image && <img src={image} alt="Task preview" className="mt-2 rounded-md max-h-40 w-auto" />}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-subtle-border">
                    <button type="button" onClick={onClose} className="bg-subtle text-subtle-text font-bold py-2 px-4 rounded-md text-sm hover:bg-subtle-hover transition-colors">Cancel</button>
                    <button type="submit" className="bg-primary text-primary-text font-bold py-2 px-4 rounded-md text-sm hover:bg-primary-hover transition-colors">Save Task</button>
                </div>
            </form>
        </Modal>
    );
};

export default TodoView;