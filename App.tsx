import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { TrackingMode, Subject, SubTopic, Topic, Habit, Video, SubjectLevel, Attachment, Profile, TodoList, AppData } from './types';
import CircularProgressBar from './components/CircularProgressBar';
import Modal from './components/Modal';
import AiAssistant from './components/AiAssistant';
import NoteEditor from './components/NoteEditor';
import SubjectNotesView from './components/SubjectNotesView';
import SettingsPage from './components/SettingsPage';
import MarkdownRenderer from './components/MarkdownRenderer';
import TodoView from './components/TodoView';
import { themes } from './themes';

const initialAppData: AppData = {
  profile: { name: 'Chiru' },
  apiKey: process.env.API_KEY || '',
  theme: 'midnight-pulse',
  subjects: [],
  habits: [],
  videos: [],
  todos: [],
};

const colorOptions = [
  'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500',
  'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
];

const levelStyles: Record<SubjectLevel, string> = {
  [SubjectLevel.Small]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [SubjectLevel.Medium]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [SubjectLevel.Large]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  [SubjectLevel.Insane]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const todayStr = new Date().toISOString().split('T')[0];

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
);
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;


interface HeaderProps {
  activeMode: TrackingMode;
  onModeChange: (mode: TrackingMode) => void;
  profileName: string;
  avatar?: string;
}

const Header: React.FC<HeaderProps> = ({ activeMode, onModeChange, profileName, avatar }) => (
  <header className="bg-card/70 backdrop-blur-lg sticky top-0 z-30 shadow-sm border-b border-card-border">
    <div className="container mx-auto px-4 py-3 flex justify-between items-center">
       <div className="flex items-center gap-3">
        {avatar ? (
          <img src={avatar} alt="Profile" className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-text font-bold text-lg">
            {profileName.charAt(0)}
          </div>
        )}
        <h1 className="text-xl font-bold text-main-text hidden sm:block">{profileName}</h1>
      </div>
      <div className="hidden sm:flex items-center space-x-2 bg-subtle/50 p-1 rounded-full">
        {Object.values(TrackingMode).map(mode => (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
              activeMode === mode ? 'bg-card text-primary shadow-sm' : 'text-subtle-text hover:bg-subtle-hover'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
       <div className="sm:hidden flex-1 flex justify-end">
            <select
              value={activeMode}
              onChange={(e) => onModeChange(e.target.value as TrackingMode)}
              className="w-full max-w-xs bg-subtle text-subtle-text p-2 rounded-md border-subtle-border focus:ring-primary focus:border-primary"
            >
              {Object.values(TrackingMode).map(mode => <option key={mode} value={mode}>{mode}</option>)}
            </select>
      </div>
    </div>
  </header>
);

const calculateStreak = (timestamps: readonly string[]): number => {
    const dates = [...new Set(timestamps)].map(d => new Date(d)).sort((a,b) => b.getTime() - a.getTime());
    if(dates.length === 0) return 0;
    let currentStreak = 0;
    let currentDate = new Date();
    const todayStr = currentDate.toISOString().split('T')[0];
    const lastSessionStr = dates[0].toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (lastSessionStr !== todayStr && lastSessionStr !== yesterdayStr) return 0;
    if (lastSessionStr !== todayStr) currentDate.setDate(currentDate.getDate() - 1);
    for (const date of dates) {
        const expectedDateStr = currentDate.toISOString().split('T')[0];
        if(date.toISOString().split('T')[0] === expectedDateStr) {
            currentStreak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }
    return currentStreak;
};

const AttachmentIcon = ({type}: {type: Attachment['type']}) => {
    switch (type) {
        case 'image': return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>;
        case 'pdf': return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a1.5 1.5 0 01.526 2.923l-4.16 1.664A1.5 1.5 0 014.5 6.5v-1A1.5 1.5 0 016 4h.5a1.5 1.5 0 011.5 1.5v.039l2-1.001A1.5 1.5 0 0110 3.5zM15.5 8a1.5 1.5 0 00-1.5 1.5v1a1.5 1.5 0 00.105.555l-4.16 1.664A1.5 1.5 0 008.5 13.5v-1A1.5 1.5 0 007 11h-.5a1.5 1.5 0 00-1.5 1.5v.039l-2-1.001A1.5 1.5 0 004.5 10H4a2 2 0 00-2 2v2.5a.5.5 0 001 0V12a1 1 0 011-1h.5a.5.5 0 00.5-.5V10a.5.5 0 00-.5-.5h-1a.5.5 0 00-.5.5v.083l-1.5 3A.5.5 0 003 14h14a.5.5 0 00.447-.724L15 8.5A1.5 1.5 0 0015.5 8z" /></svg>;
        default: return null;
    }
};

interface TopicItemProps {
    topic: Topic;
    color: string;
    onToggleSubtopic: (topicId: string, subtopicId: string) => void;
    onAddSubtopic: (topicId: string, subtopicName: string) => void;
    onAddAttachment: (topicId: string, attachment: Omit<Attachment, 'id'>) => void;
    onUpdateTopicNote: (note: string) => void;
    isEditing: boolean;
    onEditClick: () => void;
    onCancelEdit: () => void;
    apiKey: string;
}

const TopicItem: React.FC<TopicItemProps> = ({ topic, color, onToggleSubtopic, onAddSubtopic, onAddAttachment, onUpdateTopicNote, isEditing, onEditClick, onCancelEdit, apiKey }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [newSubtopic, setNewSubtopic] = useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleAddSubtopic = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSubtopic.trim()) {
            onAddSubtopic(topic.id, newSubtopic.trim());
            setNewSubtopic('');
        }
    };
    
    const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file){
            const type = file.type.includes('pdf') ? 'pdf' : 'image';
            onAddAttachment(topic.id, { name: file.name, type });
            alert(`Attached "${file.name}". File attachment is a simulation in this web version.`);
        }
    };
    
    const handleAttachmentClick = (attachment: Attachment) => {
        alert(`This is a placeholder for "${attachment.name}".`);
    };

    return (
        <div className="my-2 bg-interactive rounded-md">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex justify-between items-center p-2 text-left">
                <h4 className="font-semibold text-card-text">{topic.name}</h4>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform text-subtle-text ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isExpanded && (
                <div className="p-3 border-t border-subtle-border">
                    {topic.subTopics.map(st => (
                        <div key={st.id} className="flex items-center space-x-2 my-1">
                            <input type="checkbox" checked={st.completed} onChange={() => onToggleSubtopic(topic.id, st.id)} className={`form-checkbox h-5 w-5 rounded text-primary focus:ring-primary ${color.replace('bg-','accent-')}`}/>
                            <span className={`text-card-text ${st.completed && 'line-through text-subtle-text'}`}>{st.name}</span>
                        </div>
                    ))}
                    <form onSubmit={handleAddSubtopic} className="flex gap-2 mt-2">
                        <input type="text" value={newSubtopic} onChange={e => setNewSubtopic(e.target.value)} placeholder="New sub-topic..." className="form-input flex-grow bg-subtle/50 rounded-md p-2 text-sm focus:ring-2 focus:ring-primary border-transparent"/>
                        <button type="submit" className="bg-primary text-primary-text rounded-md px-3 text-sm font-semibold hover:bg-primary-hover transition-colors">+</button>
                    </form>

                    <div className="mt-4 pt-3 border-t border-subtle-border">
                        <div className="flex justify-between items-center mb-2">
                           <h5 className="text-xs font-bold text-subtle-text uppercase">Topic Resources</h5>
                           <div className="flex gap-2 text-xs">
                             { !isEditing && <button onClick={onEditClick} className="bg-subtle px-2 py-1 rounded-md hover:bg-subtle-hover">{topic.notes ? 'Edit Note' : 'Add Note'}</button> }
                             <button onClick={() => fileInputRef.current?.click()} className="bg-subtle px-2 py-1 rounded-md hover:bg-subtle-hover">Attach File</button>
                             <input type="file" ref={fileInputRef} onChange={handleFileAttach} className="hidden" accept="image/*,.pdf" />
                           </div>
                        </div>

                        {isEditing ? (
                             <NoteEditor initialNote={topic.notes} onSave={onUpdateTopicNote} onCancel={onCancelEdit} apiKey={apiKey} />
                        ) : (
                            <>
                                {topic.notes ? <MarkdownRenderer content={topic.notes} /> : <p className="text-sm text-subtle-text italic">No note for this topic yet.</p>}
                                {topic.attachments.length > 0 && (
                                    <div className="space-y-1 mt-2">
                                        {topic.attachments.map(att => (
                                            <button key={att.id} onClick={() => handleAttachmentClick(att)} className="w-full text-left flex items-center gap-2 p-1.5 rounded-md hover:bg-subtle-hover">
                                                <AttachmentIcon type={att.type} />
                                                <span className="text-sm text-card-text truncate">{att.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

interface SubjectCardProps {
  subject: Subject;
  updateSubject: (updatedSubject: Subject) => void;
  onViewNotes: (subject: Subject) => void;
  onEditSubject: (subject: Subject) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  editingTarget: { subjectId: string; targetId: string | 'subject' | null; } | null;
  setEditingTarget: (target: { subjectId: string; targetId: string | 'subject' | null; } | null) => void;
  handleSaveNote: (subjectId: string, targetId: string | 'subject' | null, newNote: string) => void;
  apiKey: string;
  isGlassy: boolean;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, updateSubject, onViewNotes, onEditSubject, isExpanded, onToggleExpand, editingTarget, setEditingTarget, handleSaveNote, apiKey, isGlassy }) => {
    const [newTopic, setNewTopic] = useState('');

    const { progress, totalSubtopics, completedSubtopics } = useMemo(() => {
        const allSubtopics = subject.topics.flatMap(t => t.subTopics);
        const completed = allSubtopics.filter(st => st.completed).length;
        const total = allSubtopics.length;
        return {
            progress: total === 0 ? 0 : (completed / total) * 100,
            totalSubtopics: total,
            completedSubtopics: completed
        };
    }, [subject.topics]);

    const streak = useMemo(() => calculateStreak(subject.sessionTimestamps), [subject.sessionTimestamps]);
    
    const isEditingSubjectNote = editingTarget?.subjectId === subject.id && editingTarget.targetId === 'subject';

    const handleToggleSubtopic = (topicId: string, subtopicId: string) => {
        const newTopics = subject.topics.map(t => {
            if (t.id === topicId) {
                const newSubTopics = t.subTopics.map(st => st.id === subtopicId ? { ...st, completed: !st.completed } : st);
                return { ...t, subTopics: newSubTopics };
            }
            return t;
        });
        updateSubject({ ...subject, topics: newTopics });
    };

    const handleAddSubtopic = (topicId: string, subtopicName: string) => {
        const newTopics = subject.topics.map(t => {
            if (t.id === topicId) {
                const newSubTopic: SubTopic = { id: `st-${Date.now()}`, name: subtopicName, completed: false };
                return { ...t, subTopics: [...t.subTopics, newSubTopic] };
            }
            return t;
        });
        updateSubject({ ...subject, topics: newTopics });
    };
    
    const handleAddAttachment = (topicId: string, attachment: Omit<Attachment, 'id'>) => {
        const newTopics = subject.topics.map(t => {
            if (t.id === topicId) {
                const newAttachment: Attachment = { ...attachment, id: `att-${Date.now()}` };
                return { ...t, attachments: [...t.attachments, newAttachment] };
            }
            return t;
        });
        updateSubject({ ...subject, topics: newTopics });
    };

    const handleAddTopic = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTopic.trim()){
            const newTopicItem: Topic = { id: `topic-${Date.now()}`, name: newTopic.trim(), notes: '', subTopics: [], attachments: [] };
            updateSubject({ ...subject, topics: [...subject.topics, newTopicItem] });
            setNewTopic('');
        }
    };
    
    const logSession = () => {
      const todayString = new Date().toISOString().split('T')[0];
      if (!subject.sessionTimestamps.includes(todayString)) {
        updateSubject({ ...subject, sessionTimestamps: [...subject.sessionTimestamps, todayString] });
      }
    };

    return (
        <div className={`bg-card rounded-lg shadow p-4 flex flex-col relative transition-all duration-300 border border-card-border ${isGlassy ? 'glassy' : ''}`}>
            <div className="flex justify-between items-start mb-2 cursor-pointer" onClick={onToggleExpand}>
                <div className="pr-8">
                    <h3 className={`font-bold text-lg ${subject.color.replace('bg-', 'text-')}`}>{subject.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${levelStyles[subject.level]}`}>{subject.level}</span>
                      <button onClick={(e) => { e.stopPropagation(); onViewNotes(subject); }} className="text-xs text-subtle-text hover:underline">View Notes</button>
                      <button onClick={(e) => { e.stopPropagation(); onEditSubject(subject); }} className="text-xs text-subtle-text hover:underline">Edit</button>
                    </div>
                </div>
                <div className="flex-shrink-0 text-center">
                    <CircularProgressBar percentage={progress} color={subject.color.replace('bg-', 'text-').replace('-500', '')} />
                    {subject.trackStreak && (
                        <div className="mt-1 flex items-center justify-center gap-1 text-orange-400">
                            <span>🔥</span>
                            <span className="text-xs font-bold text-subtle-text">{streak}</span>
                        </div>
                    )}
                </div>
            </div>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[4000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pt-2 mt-2 border-t border-subtle-border">
                     <div className="mb-4 p-3 bg-interactive rounded-md">
                        <div className="flex justify-between items-center mb-2">
                             <h4 className="text-sm font-bold uppercase text-subtle-text">General Notes</h4>
                             {!isEditingSubjectNote && (
                                <button onClick={() => setEditingTarget({ subjectId: subject.id, targetId: 'subject'})} className="text-xs bg-subtle px-2 py-1 rounded-md hover:bg-subtle-hover">Edit</button>
                             )}
                        </div>
                        {isEditingSubjectNote ? (
                           <NoteEditor 
                             initialNote={subject.notes}
                             onSave={(newNote) => { handleSaveNote(subject.id, 'subject', newNote); setEditingTarget(null); }}
                             onCancel={() => setEditingTarget(null)}
                             apiKey={apiKey}
                           />
                        ) : (
                           subject.notes ? <MarkdownRenderer content={subject.notes} /> : <p className="text-sm text-subtle-text italic">No general notes for this subject yet.</p>
                        )}
                     </div>

                    <p className="text-sm text-subtle-text mb-2">{completedSubtopics}/{totalSubtopics} sub-topics</p>
                    
                    <div className="flex-grow mb-3">
                      {subject.topics.map(topic => (
                        <TopicItem 
                            key={topic.id} 
                            topic={topic} 
                            color={subject.color} 
                            onToggleSubtopic={handleToggleSubtopic} 
                            onAddSubtopic={handleAddSubtopic} 
                            onAddAttachment={handleAddAttachment}
                            onUpdateTopicNote={(newNote) => { handleSaveNote(subject.id, topic.id, newNote); setEditingTarget(null); }}
                            isEditing={editingTarget?.subjectId === subject.id && editingTarget.targetId === topic.id}
                            onEditClick={() => setEditingTarget({ subjectId: subject.id, targetId: topic.id })}
                            onCancelEdit={() => setEditingTarget(null)}
                            apiKey={apiKey}
                        />
                      ))}
                    </div>
                     <form onSubmit={handleAddTopic} className="flex gap-2 mt-2">
                        <input type="text" value={newTopic} onChange={e => setNewTopic(e.target.value)} placeholder="New topic..." className="form-input flex-grow bg-interactive rounded-md p-2 text-sm focus:ring-2 focus:ring-primary border-transparent"/>
                        <button type="submit" className="bg-primary text-primary-text rounded-md px-3 text-sm font-semibold hover:bg-primary-hover transition-colors">Add Topic</button>
                    </form>
                     {subject.trackStreak && (
                      <div className="mt-4 pt-4 border-t border-subtle-border flex justify-between items-center text-sm">
                          <div className="flex items-center space-x-1 text-orange-500">
                              <span>🔥</span>
                              <span className="font-bold">{streak}</span>
                              <span className="text-subtle-text">day streak</span>
                          </div>
                          <button onClick={logSession} disabled={subject.sessionTimestamps.includes(todayStr)} className="bg-green-600/20 text-green-700 dark:text-green-300 text-xs font-bold py-1 px-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
                            {subject.sessionTimestamps.includes(todayStr) ? 'Session Logged' : 'Log Session'}
                          </button>
                      </div>
                     )}
                </div>
            </div>
        </div>
    );
}

interface HabitCardProps {
    habit: Habit;
    updateHabit: (updatedHabit: Habit) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
    isGlassy: boolean;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, updateHabit, isExpanded, onToggleExpand, isGlassy }) => {
    const todayCompleted = useMemo(() => habit.completedDates.includes(todayStr), [habit.completedDates]);
    const streak = useMemo(() => calculateStreak(habit.completedDates), [habit.completedDates]);

    const handleToggleComplete = () => {
        const updatedDates = todayCompleted 
            ? habit.completedDates.filter(d => d !== todayStr)
            : [...habit.completedDates, todayStr];
        updateHabit({ ...habit, completedDates: updatedDates });
    };

    const calendarDays = useMemo(() => {
        const days = [];
        const endDate = new Date();
        for (let i = 34; i >= 0; i--) {
            const date = new Date();
            date.setDate(endDate.getDate() - i);
            days.push({
                dateStr: date.toISOString().split('T')[0],
                isCompleted: habit.completedDates.includes(date.toISOString().split('T')[0])
            });
        }
        return days;
    }, [habit.completedDates]);

    return (
        <div className={`bg-card rounded-lg shadow p-4 flex flex-col relative transition-all duration-300 border border-card-border ${isGlassy ? 'glassy' : ''}`}>
             <div className="flex justify-between items-start cursor-pointer" onClick={onToggleExpand}>
                <div className="pr-8">
                    <h3 className={`font-bold text-lg ${habit.color.replace('bg-', 'text-')}`}>{habit.name}</h3>
                    <p className="text-sm text-subtle-text">{habit.category}</p>
                </div>
                 <div className="flex items-center space-x-2 text-orange-500">
                    <span className={`text-2xl transition-transform ${streak > 0 ? 'scale-110' : 'grayscale'}`}>🔥</span>
                    <span className="font-bold text-2xl">{streak}</span>
                </div>
            </div>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map(({dateStr, isCompleted}) => (
                        <div key={dateStr} className={`w-full aspect-square rounded-sm ${isCompleted ? habit.color : 'bg-subtle'}`}></div>
                    ))}
                </div>
            </div>
            <button onClick={handleToggleComplete} className={`w-full mt-4 py-2 rounded-md font-semibold text-white transition ${todayCompleted ? `bg-gray-400 dark:bg-gray-600 hover:bg-gray-500` : `${habit.color} hover:opacity-90`}`}>
                {todayCompleted ? 'Completed Today!' : 'Mark as Complete'}
            </button>
        </div>
    );
}

interface VideoCardProps {
    video: Video;
    updateVideo: (updatedVideo: Video) => void;
    onEditVideo: (video: Video) => void;
    isGlassy: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, updateVideo, onEditVideo, isGlassy }) => {
    const [hours, setHours] = useState(Math.floor(video.watchedDuration / 3600));
    const [minutes, setMinutes] = useState(Math.floor((video.watchedDuration % 3600) / 60));

    const progress = useMemo(() => video.totalDuration > 0 ? (video.watchedDuration / video.totalDuration) * 100 : 0, [video]);
    const streak = useMemo(() => calculateStreak(video.sessionTimestamps), [video.sessionTimestamps]);
    
    const formatDuration = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    const handleTimeUpdate = () => {
        const newWatchedDuration = (hours * 3600) + (minutes * 60);
        updateVideo({ ...video, watchedDuration: Math.min(newWatchedDuration, video.totalDuration) });
    };
    
    const logSession = () => {
      const todayString = new Date().toISOString().split('T')[0];
      if (!video.sessionTimestamps.includes(todayString)) {
        updateVideo({ ...video, sessionTimestamps: [...video.sessionTimestamps, todayString] });
      }
    };

    useEffect(() => {
        setHours(Math.floor(video.watchedDuration / 3600));
        setMinutes(Math.floor((video.watchedDuration % 3600) / 60));
    }, [video.watchedDuration]);

    return (
        <div className={`bg-card rounded-lg shadow p-4 flex flex-col relative transition-transform duration-200 hover:-translate-y-1 border border-card-border ${isGlassy ? 'glassy' : ''}`}>
             <div className="flex justify-between items-start">
                <div>
                    <h3 className={`font-bold text-lg ${video.color.replace('bg-', 'text-')}`}>{video.name}</h3>
                    <p className="text-sm text-subtle-text">
                        {formatDuration(video.watchedDuration)} / {formatDuration(video.totalDuration)}
                    </p>
                </div>
                 <div className="flex items-center gap-2">
                    {video.link && (
                        <a href={video.link} target="_blank" rel="noopener noreferrer" className="text-subtle-text hover:text-primary p-1.5 rounded-full hover:bg-subtle-hover">
                           <LinkIcon />
                        </a>
                    )}
                    <button onClick={() => onEditVideo(video)} className="text-subtle-text hover:text-primary p-1.5 rounded-full hover:bg-subtle-hover">
                        <EditIcon />
                    </button>
                 </div>
            </div>
            
            {video.description && (
                <p className="text-sm text-card-text my-2 p-2 bg-interactive rounded-md">{video.description}</p>
            )}

            <div className="w-full bg-subtle rounded-full h-2.5 my-3">
                <div className={`${video.color} h-2.5 rounded-full transition-all duration-300`} style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex items-center gap-2 text-sm">
                <input type="number" value={hours} onChange={e => setHours(Number(e.target.value))} min="0" className="form-input w-16 bg-interactive rounded-md p-2 focus:ring-2 focus:ring-primary border-transparent" /> <span className="text-subtle-text">h</span>
                <input type="number" value={minutes} onChange={e => setMinutes(Number(e.target.value))} min="0" max="59" className="form-input w-16 bg-interactive rounded-md p-2 focus:ring-2 focus:ring-primary border-transparent" /> <span className="text-subtle-text">m</span>
                <button onClick={handleTimeUpdate} className="ml-auto bg-primary text-primary-text rounded-md px-3 py-2 font-semibold hover:bg-primary-hover transition-colors">Update</button>
            </div>
             {video.trackStreak && (
              <div className="mt-4 pt-2 border-t border-subtle-border flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-1 text-orange-500">
                      <span>🔥</span>
                      <span className="font-bold">{streak}</span>
                      <span className="text-subtle-text">day streak</span>
                  </div>
                  <button onClick={logSession} disabled={video.sessionTimestamps.includes(todayStr)} className="bg-green-600/20 text-green-700 dark:text-green-300 text-xs font-bold py-1 px-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
                    {video.sessionTimestamps.includes(todayStr) ? 'Session Logged' : 'Log Session'}
                  </button>
              </div>
             )}
        </div>
    );
};

const NoItemsMessage = ({ showCompleted, mode }: { showCompleted: boolean, mode: TrackingMode }) => (
    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 px-6 bg-card rounded-lg shadow border border-card-border">
        <h3 className="text-xl font-semibold text-card-text">
            {showCompleted ? `No Completed ${mode}` : `No Active ${mode}`}
        </h3>
        <p className="mt-2 text-subtle-text">
            {showCompleted ? `Completed items will appear here.` : `Click "+ Add New" to get started!`}
        </p>
    </div>
);


// MAIN APP COMPONENT
export default function App() {
  const [data, setData] = useLocalStorage<AppData>('zenith-app-data', initialAppData);
  const { profile, apiKey, theme, subjects, habits, videos, todos } = data;

  const [activeMode, setActiveMode] = useState<TrackingMode>(TrackingMode.Subject);
  const [showCompleted, setShowCompleted] = useState(false);
  const [subjectLevelFilter, setSubjectLevelFilter] = useState<SubjectLevel | 'All'>('All');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  // Forms
  const [editFormState, setEditFormState] = useState<Subject | null>(null);
  const [editVideoFormState, setEditVideoFormState] = useState<Video | null>(null);
  const [newItem, setNewItem] = useState({ name: '', color: colorOptions[0], category: '', totalHours: 0, totalMinutes: 0, trackStreak: true, level: SubjectLevel.Medium, notes: '', link: '', description: '' });

  // UI State
  const [editingTarget, setEditingTarget] = useState<{ subjectId: string; targetId: string | 'subject' | null; } | null>(null);
  const [viewingSubjectNotes, setViewingSubjectNotes] = useState<Subject | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());


  // This effect runs once on mount to correct an invalid theme in localStorage.
  useEffect(() => {
    const themeIsValid = themes.some(t => t.id === data.theme);
    if (!themeIsValid) {
      setData(d => ({ ...d, theme: 'midnight-pulse' }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentTheme = useMemo(() => themes.find(t => t.id === theme) || themes.find(t => t.id === 'midnight-pulse')!, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', currentTheme.id);
    root.classList.toggle('dark', currentTheme.isDark);
    
    // Clean up previous special fonts before adding a new one.
    document.body.classList.remove('font-mono');

    if(currentTheme.special?.font){
        document.body.classList.add(currentTheme.special.font)
    }
  }, [currentTheme]);
  
  useEffect(() => {
    setShowCompleted(false);
    setExpandedItems(new Set());
    setSubjectLevelFilter('All');
  }, [activeMode]);
  
  useEffect(() => {
    if (editingSubject) setEditFormState(editingSubject);
  }, [editingSubject]);

  useEffect(() => {
    if (editingVideo) setEditVideoFormState(editingVideo);
  }, [editingVideo]);
  
  const handleToggleExpand = useCallback((id: string) => {
    setExpandedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
  }, []);
  
  const setProfile = (newProfile: Profile) => setData(d => ({ ...d, profile: newProfile }));
  const setApiKey = (newKey: string) => setData(d => ({ ...d, apiKey: newKey }));
  const setTheme = (themeId: string) => setData(d => ({ ...d, theme: themeId }));
  
  const setSubjects = (updater: React.SetStateAction<Subject[]>) => setData(d => ({ ...d, subjects: updater instanceof Function ? updater(d.subjects) : updater }));
  const setHabits = (updater: React.SetStateAction<Habit[]>) => setData(d => ({ ...d, habits: updater instanceof Function ? updater(d.habits) : updater }));
  const setVideos = (updater: React.SetStateAction<Video[]>) => setData(d => ({ ...d, videos: updater instanceof Function ? updater(d.videos) : updater }));
  const setTodos = (updater: React.SetStateAction<TodoList[]>) => setData(d => ({ ...d, todos: updater instanceof Function ? updater(d.todos) : updater }));


  const deleteItems = (collectionName: 'subjects' | 'habits' | 'videos' | 'todos', ids: string[]) => {
      setData(prevData => {
        const oldCollection = prevData[collectionName] as (Subject[] | Habit[] | Video[] | TodoList[]);
        const newCollection = oldCollection.filter(item => !ids.includes(item.id));
        return { ...prevData, [collectionName]: newCollection };
    });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, color, category, totalHours, totalMinutes, trackStreak, level, notes, link, description } = newItem;
    if (!name.trim()) return;
    
    const id = `item-${Date.now()}`;

    switch (activeMode) {
      case TrackingMode.Subject:
        const newSubject: Subject = { id, name: name.trim(), color, level, notes, topics: [], sessionTimestamps: [], trackStreak };
        setSubjects(s => [...s, newSubject]);
        break;
      case TrackingMode.Habit:
        const newHabit: Habit = { id, name: name.trim(), color, category: category || 'General', completedDates: [] };
        setHabits(h => [...h, newHabit]);
        break;
      case TrackingMode.Video:
        const newVideo: Video = { id, name: name.trim(), color, totalDuration: (totalHours * 3600) + (totalMinutes * 60), watchedDuration: 0, trackStreak, sessionTimestamps: [], link, description };
        setVideos(v => [...v, newVideo]);
        break;
      case TrackingMode.Todo:
        break;
    }
    setIsAddModalOpen(false);
    setNewItem({ name: '', color: colorOptions[0], category: '', totalHours: 0, totalMinutes: 0, trackStreak: true, level: SubjectLevel.Medium, notes: '', link: '', description: '' });
  };
  
  const handleUpdateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormState) return;
    setSubjects(prev => prev.map(s => s.id === editFormState.id ? editFormState : s));
    setEditingSubject(null);
  };
  
  const handleUpdateVideo = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editVideoFormState) return;
      setVideos(prev => prev.map(v => v.id === editVideoFormState.id ? editVideoFormState : v));
      setEditingVideo(null);
  };

  const handleSaveNote = (subjectId: string, targetId: string | 'subject' | null, newNote: string) => {
    setSubjects(prevSubjects => {
        return prevSubjects.map(s => {
          if (s.id === subjectId) {
            if (targetId === 'subject') {
                return { ...s, notes: newNote };
            }
            return {
              ...s,
              topics: s.topics.map(t => t.id === targetId ? { ...t, notes: newNote } : t)
            };
          }
          return s;
        });
    });
  };

  const renderContent = () => {
    const isGlassy = !!currentTheme.special?.glassy;
    switch (activeMode) {
      case TrackingMode.Subject:
        const filteredSubjects = subjects
          .filter(s => {
            const allSubtopics = s.topics.flatMap(t => t.subTopics);
            if (allSubtopics.length === 0) return !showCompleted;
            const progress = (allSubtopics.filter(st => st.completed).length / allSubtopics.length) * 100;
            return showCompleted ? progress === 100 : progress < 100;
          })
          .filter(s => {
            if (subjectLevelFilter === 'All') return true;
            return s.level === subjectLevelFilter;
          });
        if (filteredSubjects.length === 0) return <NoItemsMessage showCompleted={showCompleted} mode={activeMode} />;
        return filteredSubjects.map(s => <SubjectCard key={s.id} subject={s} updateSubject={(sub) => setSubjects(all => all.map(i => i.id === sub.id ? sub : i))} onViewNotes={setViewingSubjectNotes} onEditSubject={setEditingSubject} isExpanded={expandedItems.has(s.id)} onToggleExpand={() => handleToggleExpand(s.id)} editingTarget={editingTarget} setEditingTarget={setEditingTarget} handleSaveNote={handleSaveNote} apiKey={apiKey} isGlassy={isGlassy}/>);
      case TrackingMode.Habit:
        if (showCompleted) return <NoItemsMessage showCompleted={showCompleted} mode={activeMode} />;
        if (habits.length === 0) return <NoItemsMessage showCompleted={false} mode={activeMode} />;
        return habits.map(h => <HabitCard key={h.id} habit={h} updateHabit={(hab) => setHabits(all => all.map(i => i.id === hab.id ? hab : i))} isExpanded={expandedItems.has(h.id)} onToggleExpand={() => handleToggleExpand(h.id)} isGlassy={isGlassy} />);
      case TrackingMode.Video:
        const filteredVideos = videos.filter(v => {
            const progress = v.totalDuration > 0 ? (v.watchedDuration / v.totalDuration) * 100 : 0;
            return showCompleted ? progress >= 100 : progress < 100;
        });
        if (filteredVideos.length === 0) return <NoItemsMessage showCompleted={showCompleted} mode={activeMode} />;
        return filteredVideos.map(v => <VideoCard key={v.id} video={v} updateVideo={(vid) => setVideos(all => all.map(i => i.id === vid.id ? vid : i))} onEditVideo={setEditingVideo} isGlassy={isGlassy} />);
      case TrackingMode.Todo:
        return <TodoView todos={todos} setTodos={setTodos} isGlassy={isGlassy} />;
      case TrackingMode.Settings:
        return (
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <SettingsPage
                  profile={profile}
                  setProfile={setProfile}
                  apiKey={apiKey}
                  setApiKey={setApiKey}
                  theme={theme}
                  setTheme={setTheme}
                  subjects={subjects}
                  habits={habits}
                  videos={videos}
                  todos={todos}
                  deleteItems={deleteItems}
                  onViewSubjectNotes={setViewingSubjectNotes}
              />
          </div>
        );
      default: return null;
    }
  };

  const renderAddModalContent = () => (
    <form onSubmit={handleAddItem} className="space-y-4">
        <input type="text" placeholder="Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="form-input w-full p-2 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent"/>
        {activeMode === TrackingMode.Subject && (
          <>
            <div>
              <label className="text-sm font-medium text-card-text">Level</label>
              <select value={newItem.level} onChange={e => setNewItem({...newItem, level: e.target.value as SubjectLevel})} className="form-select w-full p-2 mt-1 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent">
                {Object.values(SubjectLevel).map(level => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>
            <textarea placeholder="General Notes (optional)..." value={newItem.notes} onChange={e => setNewItem({...newItem, notes: e.target.value})} className="form-textarea w-full p-2 h-24 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent"/>
          </>
        )}
        {activeMode === TrackingMode.Habit && <input type="text" placeholder="Category (e.g., Health)" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="form-input w-full p-2 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent"/>}
        {activeMode === TrackingMode.Video && (
            <>
                <div className="flex items-center gap-2"><input type="number" placeholder="H" value={newItem.totalHours} onChange={e => setNewItem({...newItem, totalHours: Number(e.target.value)})} className="form-input w-full p-2 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent"/><span className="text-subtle-text">h</span><input type="number" placeholder="M" value={newItem.totalMinutes} onChange={e => setNewItem({...newItem, totalMinutes: Number(e.target.value)})} className="form-input w-full p-2 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent"/><span className="text-subtle-text">m</span></div>
                <input type="text" placeholder="Video Link (optional)" value={newItem.link} onChange={e => setNewItem({...newItem, link: e.target.value})} className="form-input w-full p-2 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent"/>
                <textarea placeholder="Description (optional)..." value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="form-textarea w-full p-2 h-20 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent"/>
            </>
        )}
        {(activeMode === TrackingMode.Subject || activeMode === TrackingMode.Video) && (
            <label htmlFor="trackStreak" className="flex items-center justify-between bg-interactive p-3 rounded-md cursor-pointer">
              <span className="text-sm font-medium text-card-text">Track daily streak?</span>
              <div className="relative inline-flex items-center">
                  <input type="checkbox" id="trackStreak" className="sr-only peer" checked={newItem.trackStreak} onChange={e => setNewItem({ ...newItem, trackStreak: e.target.checked })} />
                  <div className="w-11 h-6 bg-subtle peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </div>
            </label>
        )}
        <div className="flex flex-wrap gap-2">{colorOptions.map(color => (<button type="button" key={color} onClick={() => setNewItem({...newItem, color})} className={`w-8 h-8 rounded-full ${color} transition transform hover:scale-110 ${newItem.color === color ? 'ring-2 ring-offset-2 ring-primary dark:ring-offset-card' : ''}`}></button>))}</div>
        <button type="submit" className="w-full bg-primary text-primary-text font-bold py-2 px-4 rounded-md hover:bg-primary-hover transition-colors">Add {activeMode.slice(0, -1)}</button>
    </form>
  );

  const renderEditModalContent = () => {
    if (!editFormState) return null;

    const handleFormChange = (updates: Partial<Subject>) => {
        setEditFormState(prev => prev ? { ...prev, ...updates } : null);
    };

    return (
        <form onSubmit={handleUpdateSubject} className="space-y-4">
            <div>
                <label className="text-sm font-medium text-card-text">Name</label>
                <input type="text" value={editFormState.name} onChange={e => handleFormChange({ name: e.target.value })} className="form-input w-full p-2 mt-1 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent" />
            </div>
            
            <div>
              <label className="text-sm font-medium text-card-text">Level</label>
              <select value={editFormState.level} onChange={e => handleFormChange({ level: e.target.value as SubjectLevel })} className="form-select w-full p-2 mt-1 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent">
                {Object.values(SubjectLevel).map(level => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>

            <div>
                <label className="text-sm font-medium text-card-text">General Notes</label>
                <textarea value={editFormState.notes} onChange={e => handleFormChange({ notes: e.target.value })} className="form-textarea w-full p-2 mt-1 h-24 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent"/>
            </div>

            <label htmlFor="editTrackStreak" className="flex items-center justify-between bg-interactive p-3 rounded-md cursor-pointer">
              <span className="text-sm font-medium text-card-text">Track daily streak?</span>
              <div className="relative inline-flex items-center">
                  <input type="checkbox" id="editTrackStreak" className="sr-only peer" checked={editFormState.trackStreak} onChange={e => handleFormChange({ trackStreak: e.target.checked })} />
                  <div className="w-11 h-6 bg-subtle peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </div>
            </label>

            <div className="flex flex-wrap gap-2">{colorOptions.map(color => (<button type="button" key={color} onClick={() => handleFormChange({ color })} className={`w-8 h-8 rounded-full ${color} transition transform hover:scale-110 ${editFormState.color === color ? 'ring-2 ring-offset-2 ring-primary dark:ring-offset-card' : ''}`}></button>))}</div>
            
            <button type="submit" className="w-full bg-primary text-primary-text font-bold py-2 px-4 rounded-md hover:bg-primary-hover transition-colors">Save Changes</button>
        </form>
    );
  };
  
    const renderEditVideoModalContent = () => {
    if (!editVideoFormState) return null;

    const handleFormChange = (updates: Partial<Video>) => {
        setEditVideoFormState(prev => prev ? { ...prev, ...updates } : null);
    };

    return (
        <form onSubmit={handleUpdateVideo} className="space-y-4">
            <input type="text" placeholder="Name" value={editVideoFormState.name} onChange={e => handleFormChange({ name: e.target.value })} className="form-input w-full p-2 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent"/>
            <input type="text" placeholder="Video Link (optional)" value={editVideoFormState.link || ''} onChange={e => handleFormChange({ link: e.target.value })} className="form-input w-full p-2 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent"/>
            <textarea placeholder="Description (optional)..." value={editVideoFormState.description || ''} onChange={e => handleFormChange({ description: e.target.value })} className="form-textarea w-full p-2 h-20 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent"/>
            <div className="flex flex-wrap gap-2">{colorOptions.map(color => (<button type="button" key={color} onClick={() => handleFormChange({ color })} className={`w-8 h-8 rounded-full ${color} transition transform hover:scale-110 ${editVideoFormState.color === color ? 'ring-2 ring-offset-2 ring-primary dark:ring-offset-card' : ''}`}></button>))}</div>
            <button type="submit" className="w-full bg-primary text-primary-text font-bold py-2 px-4 rounded-md hover:bg-primary-hover transition-colors">Save Changes</button>
        </form>
    );
  };


  return (
    <div className={`bg-main-bg text-main-text min-h-screen transition-colors duration-300 font-sans`}>
      <Header activeMode={activeMode} onModeChange={setActiveMode} profileName={profile.name} avatar={profile.avatar} />
      <main className="container mx-auto p-4">
        {activeMode !== TrackingMode.Settings && (
          <div className="mb-6">
              <h2 className="text-4xl font-extrabold text-main-text">Welcome back, {profile.name}!</h2>
          </div>
        )}

        {activeMode !== TrackingMode.Settings && <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-2xl font-bold">{activeMode === 'Todo' ? 'To-do' : activeMode}</h2>
            {(activeMode === TrackingMode.Subject || activeMode === TrackingMode.Video) && (
                <div className="flex items-center space-x-1 bg-subtle p-1 rounded-full text-sm font-medium"><button onClick={() => setShowCompleted(false)} className={`px-3 py-1 rounded-full transition-colors ${!showCompleted ? 'bg-card text-primary shadow-sm' : 'text-subtle-text'}`}>Active</button><button onClick={() => setShowCompleted(true)} className={`px-3 py-1 rounded-full transition-colors ${showCompleted ? 'bg-card text-primary shadow-sm' : 'text-subtle-text'}`}>Completed</button></div>
            )}
            {activeMode === TrackingMode.Subject && (
                <div className="flex items-center space-x-1 bg-subtle p-1 rounded-full text-sm font-medium">
                    {(['All', ...Object.values(SubjectLevel)] as const).map(level => (
                       <button key={level} onClick={() => setSubjectLevelFilter(level)} className={`px-3 py-1 rounded-full transition-colors ${subjectLevelFilter === level ? 'bg-card text-primary shadow-sm' : 'text-subtle-text'}`}>{level}</button>
                    ))}
                </div>
            )}
          </div>
           <div className="flex items-center gap-2">
            <button onClick={() => setIsAddModalOpen(true)} disabled={activeMode === TrackingMode.Todo} className="bg-primary text-primary-text font-bold py-2 px-4 rounded-full hover:bg-primary-hover transition transform hover:scale-105 shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><PlusIcon /><span>Add New</span></button>
          </div>
        </div>}
        <div className={activeMode === TrackingMode.Todo ? '' : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
          {renderContent()}
        </div>
      </main>
      
      {activeMode !== TrackingMode.Todo && <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={`Add New ${activeMode.slice(0, -1)}`}>{renderAddModalContent()}</Modal>}
      
      <Modal isOpen={!!editingSubject} onClose={() => setEditingSubject(null)} title="Edit Subject">
        {renderEditModalContent()}
      </Modal>

      <Modal isOpen={!!editingVideo} onClose={() => setEditingVideo(null)} title="Edit Video">
        {renderEditVideoModalContent()}
      </Modal>

      <AiAssistant subjects={subjects} habits={habits} videos={videos} todos={todos} apiKey={apiKey} />
            
      <SubjectNotesView 
        isOpen={!!viewingSubjectNotes}
        onClose={() => setViewingSubjectNotes(null)}
        subject={viewingSubjectNotes}
      />

    </div>
  );
}