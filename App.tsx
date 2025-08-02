import React, { useState, useEffect } from 'react';
import { TrackingMode, Subject, Habit, Video, TodoList, Profile, AppData } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { themes } from './themes';
import AiAssistant from './components/AiAssistant';
import SettingsPage from './components/SettingsPage';
import SubjectNotesView from './components/SubjectNotesView';
import TodoView from './components/TodoView';
import SubjectView from './components/SubjectView';
import HabitView from './components/HabitView';
import VideoView from './components/VideoView';

const App: React.FC = () => {
  // Load data from localStorage with defaults
  const [appData, setAppData] = useLocalStorage<AppData>('zenith-app-data', {
    profile: { name: 'User' },
    apiKey: '',
    theme: 'midnight-pulse',
    subjects: [],
    habits: [],
    videos: [],
    todos: []
  });

  const [activeMode, setActiveMode] = useState<TrackingMode>(TrackingMode.Todo);
  const [notesViewSubject, setNotesViewSubject] = useState<Subject | null>(null);

  // Apply theme to document
  useEffect(() => {
    const theme = themes.find(t => t.id === appData.theme) || themes[1];
    document.documentElement.setAttribute('data-theme', theme.id);
    document.documentElement.className = theme.isDark ? 'dark' : '';
  }, [appData.theme]);

  const updateAppData = (updates: Partial<AppData>) => {
    setAppData(prev => ({ ...prev, ...updates }));
  };

  const setProfile = (profile: Profile) => updateAppData({ profile });
  const setApiKey = (apiKey: string) => updateAppData({ apiKey });
  const setTheme = (theme: string) => updateAppData({ theme });
  const setSubjects = (subjects: Subject[]) => updateAppData({ subjects });
  const setHabits = (habits: Habit[]) => updateAppData({ habits });
  const setVideos = (videos: Video[]) => updateAppData({ videos });
  const setTodos = (todos: TodoList[]) => updateAppData({ todos });

  const deleteItems = (collectionName: 'subjects' | 'habits' | 'videos' | 'todos', ids: string[]) => {
    const idsSet = new Set(ids);
    switch (collectionName) {
      case 'subjects':
        setSubjects(appData.subjects.filter(item => !idsSet.has(item.id)));
        break;
      case 'habits':
        setHabits(appData.habits.filter(item => !idsSet.has(item.id)));
        break;
      case 'videos':
        setVideos(appData.videos.filter(item => !idsSet.has(item.id)));
        break;
      case 'todos':
        setTodos(appData.todos.filter(item => !idsSet.has(item.id)));
        break;
    }
  };

  const currentTheme = themes.find(t => t.id === appData.theme) || themes[1];
  const isGlassy = currentTheme.special?.glassy || false;

  const renderContent = () => {
    switch (activeMode) {
      case TrackingMode.Subject:
        return (
          <SubjectView
            subjects={appData.subjects}
            setSubjects={setSubjects}
            apiKey={appData.apiKey}
          />
        );
      case TrackingMode.Habit:
        return (
          <HabitView
            habits={appData.habits}
            setHabits={setHabits}
          />
        );
      case TrackingMode.Video:
        return (
          <VideoView
            videos={appData.videos}
            setVideos={setVideos}
          />
        );
      case TrackingMode.Settings:
        return (
          <SettingsPage
            profile={appData.profile}
            setProfile={setProfile}
            apiKey={appData.apiKey}
            setApiKey={setApiKey}
            theme={appData.theme}
            setTheme={setTheme}
            subjects={appData.subjects}
            habits={appData.habits}
            videos={appData.videos}
            todos={appData.todos}
            deleteItems={deleteItems}
            onViewSubjectNotes={setNotesViewSubject}
          />
        );
      case TrackingMode.Todo:
        return (
          <TodoView
            todos={appData.todos}
            setTodos={setTodos}
            isGlassy={isGlassy}
          />
        );
      default:
        return (
          <TodoView
            todos={appData.todos}
            setTodos={setTodos}
            isGlassy={isGlassy}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-main-bg text-main-text">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-main-text">
                Chiru
              </h1>
              <p className="text-subtle-text mt-1">
                Welcome back, {appData.profile.name}!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <img
                src={appData.profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(appData.profile.name)}&background=random`}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex flex-wrap gap-2">
            {Object.values(TrackingMode).map((mode) => (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeMode === mode
                    ? 'bg-primary text-primary-text'
                    : 'bg-card text-card-text hover:bg-subtle-hover border border-card-border'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main>
          {renderContent()}
        </main>

        {/* AI Assistant */}
        {appData.apiKey && (
          <AiAssistant
            subjects={appData.subjects}
            habits={appData.habits}
            videos={appData.videos}
            todos={appData.todos}
            apiKey={appData.apiKey}
          />
        )}

        {/* Subject Notes Modal */}
        <SubjectNotesView
          isOpen={!!notesViewSubject}
          onClose={() => setNotesViewSubject(null)}
          subject={notesViewSubject}
        />
      </div>
    </div>
  );
};

export default App;