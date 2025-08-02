import React, { useState } from 'react';
import { Profile, Subject, Habit, Video, TrackableItem, TodoList } from '../types';
import { themes, Theme } from '../themes';

interface SettingsPageProps {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  theme: string;
  setTheme: (themeId: string) => void;
  subjects: Subject[];
  habits: Habit[];
  videos: Video[];
  todos: TodoList[];
  deleteItems: (collectionName: 'subjects' | 'habits' | 'videos' | 'todos', ids: string[]) => void;
  onViewSubjectNotes: (subject: Subject) => void;
}

type ManageTab = 'Subjects' | 'Habits' | 'Videos' | 'Todos';

const SettingsPage: React.FC<SettingsPageProps> = ({
  profile, setProfile, apiKey, setApiKey, theme, setTheme,
  subjects, habits, videos, todos, deleteItems,
  onViewSubjectNotes
}) => {
  const [activeSetting, setActiveSetting] = useState('Appearance');
  const [nameInput, setNameInput] = useState(profile.name);
  const [keyInput, setKeyInput] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  
  const [itemsToDelete, setItemsToDelete] = useState<Set<string>>(new Set());
  const [manageTab, setManageTab] = useState<ManageTab>('Subjects');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile({ ...profile, avatar: event.target?.result as string });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleProfileSave = () => {
    setProfile({ ...profile, name: nameInput });
    alert('Profile updated!');
  };

  const handleApiKeySave = () => {
    setApiKey(keyInput);
    alert('API Key saved!');
  };

  const getChildProjectIds = (projectId: string, allProjects: TodoList[]): string[] => {
    let children: string[] = [];
    const directChildren = allProjects.filter(p => p.parentId === projectId);
    for (const child of directChildren) {
      children.push(child.id);
      children = [...children, ...getChildProjectIds(child.id, allProjects)];
    }
    return children;
  };
  
  const handleToggleItemForDeletion = (id: string) => {
    setItemsToDelete(prev => {
        const newSet = new Set(prev);
        const childIds = manageTab === 'Todos' ? getChildProjectIds(id, todos) : [];
        
        if (newSet.has(id)) {
            newSet.delete(id);
            childIds.forEach(childId => newSet.delete(childId));
        } else {
            newSet.add(id);
            childIds.forEach(childId => newSet.add(childId));
        }
        return newSet;
    });
  };

  const handleBulkDelete = async () => {
    const noun = manageTab === 'Todos' ? 'project' : 'item';
    const confirmationMessage = `Are you sure you want to delete ${itemsToDelete.size} ${noun}(s)? This will also delete any nested projects and tasks. This action cannot be undone.`;

    if (window.confirm(confirmationMessage)) {
        const idsToDeleteArr = Array.from(itemsToDelete);
        let collectionName: 'subjects' | 'habits' | 'videos' | 'todos' = 'subjects';
        switch (manageTab) {
            case 'Subjects': collectionName = 'subjects'; break;
            case 'Habits': collectionName = 'habits'; break;
            case 'Videos': collectionName = 'videos'; break;
            case 'Todos': collectionName = 'todos'; break;
        }
        deleteItems(collectionName, idsToDeleteArr);
        setItemsToDelete(new Set());
        alert(`${idsToDeleteArr.length} ${noun}(s) deleted successfully.`);
    }
  };

  const settingsOptions = ['Appearance', 'Profile', 'API Key', 'Manage Data', 'View Notes'];

  const renderProjectForDeletion = (project: TodoList, allProjects: TodoList[], level = 0) => {
    const children = allProjects.filter(p => p.parentId === project.id);
    return (
      <div key={project.id} style={{ marginLeft: `${level * 1.5}rem`}}>
        <div className="flex items-center gap-3 p-2 rounded-md bg-interactive has-[:checked]:bg-primary-100 dark:has-[:checked]:bg-primary-900/50">
          <input type="checkbox" id={`del-${project.id}`} checked={itemsToDelete.has(project.id)} onChange={() => handleToggleItemForDeletion(project.id)} className="form-checkbox h-5 w-5 rounded border-subtle-border text-primary focus:ring-primary" />
          <label htmlFor={`del-${project.id}`} className="flex-1 cursor-pointer text-card-text">{project.name}</label>
        </div>
        {children.map(child => renderProjectForDeletion(child, allProjects, level + 1))}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSetting) {
      case 'Appearance':
        return (
          <div>
            <h3 className="text-xl font-bold text-card-text mb-4">Appearance</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes.map((t) => (
                <div key={t.id} onClick={() => setTheme(t.id)} className="cursor-pointer">
                  <div className={`w-full aspect-video rounded-lg flex items-center justify-center p-2 border-2 transition-all ${theme === t.id ? 'border-primary' : 'border-subtle-border hover:border-subtle-text'}`} style={{backgroundColor: t.colors["card-bg"]}}>
                      <div className="flex space-x-2">
                        <div className="w-4 h-8 rounded" style={{backgroundColor: t.colors["primary-500"]}}></div>
                        <div className="w-4 h-8 rounded opacity-70" style={{backgroundColor: t.colors["primary-500"]}}></div>
                        <div className="w-4 h-8 rounded opacity-50" style={{backgroundColor: t.colors["primary-500"]}}></div>
                      </div>
                  </div>
                  <p className={`text-center text-sm mt-2 ${theme === t.id ? 'text-primary font-semibold' : 'text-subtle-text'}`}>{t.name}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Profile':
        const completedTasks = todos.flatMap(list => list.items).filter(item => item.completed).length;

        return (
          <div>
            <h3 className="text-xl font-bold text-card-text mb-6">Profile Settings</h3>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <img src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(nameInput)}&background=random`} alt="Avatar" className="h-20 w-20 rounded-full object-cover bg-subtle" />
                  <div>
                    <label htmlFor="avatar-upload" className="cursor-pointer bg-primary text-primary-text font-bold py-2 px-4 rounded-md hover:bg-primary-hover transition-colors text-sm">
                      Upload Photo
                    </label>
                    <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-card-text">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="form-input mt-1 w-full p-2 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent"
                  />
                </div>
                <button onClick={handleProfileSave} className="bg-primary text-primary-text font-bold py-2 px-4 rounded-md hover:bg-primary-hover transition-colors">Save Profile</button>
            </div>

            <div className="mt-8 pt-6 border-t border-subtle-border">
                <h3 className="text-lg font-bold text-card-text mb-4">Your Stats</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-interactive p-4 rounded-lg">
                        <p className="text-2xl font-bold text-primary">{subjects.length}</p>
                        <p className="text-sm text-subtle-text">Subjects</p>
                    </div>
                    <div className="bg-interactive p-4 rounded-lg">
                        <p className="text-2xl font-bold text-primary">{habits.length}</p>
                        <p className="text-sm text-subtle-text">Habits</p>
                    </div>
                     <div className="bg-interactive p-4 rounded-lg">
                        <p className="text-2xl font-bold text-primary">{videos.length}</p>
                        <p className="text-sm text-subtle-text">Videos</p>
                    </div>
                    <div className="bg-interactive p-4 rounded-lg">
                        <p className="text-2xl font-bold text-primary">{completedTasks}</p>
                        <p className="text-sm text-subtle-text">Tasks Done</p>
                    </div>
                </div>
            </div>
          </div>
        );
      case 'API Key':
        return (
          <div>
            <h3 className="text-xl font-bold text-card-text mb-4">Gemini API Key</h3>
            <p className="text-sm text-subtle-text mb-4">Your API key is stored locally and is required for AI features.</p>
            <div className="space-y-4">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-card-text">API Key</label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    id="apiKey"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    className="form-input mt-1 w-full p-2 pr-10 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent"
                  />
                  <button onClick={() => setShowKey(!showKey)} className="absolute inset-y-0 right-0 px-3 text-subtle-text">
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <button onClick={handleApiKeySave} className="bg-primary text-primary-text font-bold py-2 px-4 rounded-md hover:bg-primary-hover transition-colors">Save Key</button>
            </div>
          </div>
        );
      case 'Manage Data':
        let currentItems: TrackableItem[] = [];
        if (manageTab === 'Subjects') currentItems = subjects;
        else if (manageTab === 'Habits') currentItems = habits;
        else if (manageTab === 'Videos') currentItems = videos;
        
        return (
           <div>
            <h3 className="text-xl font-bold text-card-text mb-4">Manage Data</h3>
            <div className="border-b border-card-border">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    {(['Subjects', 'Habits', 'Videos', 'Todos'] as const).map(tab => (
                        <button key={tab} onClick={() => { setManageTab(tab); setItemsToDelete(new Set()); }} className={`${manageTab === tab ? 'border-primary text-primary' : 'border-transparent text-subtle-text hover:text-main-text hover:border-subtle-border'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}>
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto p-1">
              {manageTab === 'Todos' ? (
                todos.filter(p => !p.parentId).length > 0 ? (
                  todos.filter(p => !p.parentId).map(project => renderProjectForDeletion(project, todos))
                ) : (
                  <p className="text-center text-subtle-text py-8">No Projects to manage.</p>
                )
              ) : (
                currentItems.length > 0 ? currentItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-md bg-interactive has-[:checked]:bg-primary-100 dark:has-[:checked]:bg-primary-900/50">
                    <input type="checkbox" id={`del-${item.id}`} checked={itemsToDelete.has(item.id)} onChange={() => handleToggleItemForDeletion(item.id)} className="form-checkbox h-5 w-5 rounded border-subtle-border text-primary focus:ring-primary" />
                    <label htmlFor={`del-${item.id}`} className="flex-1 cursor-pointer text-card-text">{item.name}</label>
                  </div>
                )) : <p className="text-center text-subtle-text py-8">No {manageTab} to manage.</p>
              )}
            </div>
             <button onClick={handleBulkDelete} disabled={itemsToDelete.size === 0} className="w-full mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400 dark:disabled:bg-red-800 disabled:cursor-not-allowed">
              Delete Selected ({itemsToDelete.size})
            </button>
          </div>
        )
      case 'View Notes':
        return (
          <div>
            <h3 className="text-xl font-bold text-card-text mb-4">View Subject Notes</h3>
            <div className="space-y-2">
              {subjects.map(subject => (
                <button key={subject.id} onClick={() => onViewSubjectNotes(subject)} className="w-full text-left p-3 rounded-md bg-interactive hover:bg-subtle-hover">
                  <span className="font-semibold text-card-text">{subject.name}</span>
                </button>
              ))}
              {subjects.length === 0 && <p className="text-center text-subtle-text py-8">No subjects to view notes from.</p>}
            </div>
          </div>
        )
      default:
        return null;
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 border border-card-border">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-1/3 lg:w-1/4">
          <h2 className="text-2xl font-bold text-card-text mb-4">Settings</h2>
          <nav className="space-y-1">
            {settingsOptions.map(opt => (
              <button
                key={opt}
                onClick={() => setActiveSetting(opt)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeSetting === opt
                    ? 'bg-primary-500/10 text-primary'
                    : 'text-subtle-text hover:bg-subtle-hover'
                }`}
              >
                {opt}
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 md:w-2/3 lg:w-3/4 bg-interactive p-6 rounded-lg">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;