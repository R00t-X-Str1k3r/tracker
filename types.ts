export enum TrackingMode {
  Subject = 'Subjects',
  Habit = 'Habits',
  Video = 'Videos',
  Todo = 'Todo',
  Settings = 'Settings',
}

export enum SubjectLevel {
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large',
  Insane = 'Insane',
}

export enum PriorityLevel {
  P1 = 'P1', // Urgent
  P2 = 'P2', // High
  P3 = 'P3', // Medium
  P4 = 'P4', // Low
}

export interface Profile {
  name: string;
  email?: string;
  avatar?: string; // Base64 data URL for profile picture
  notificationsEnabled?: boolean;
  cloudSyncEnabled?: boolean;
  lastSyncTimestamp?: number; // Store as a timestamp (Date.now())
}

// An Attachment is a reference to an image or PDF file.
export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'pdf';
}

// A SubTopic is the smallest trackable item within a Topic.
export interface SubTopic {
  id: string;
  name:string;
  completed: boolean;
}

// A Topic is a collection of SubTopics within a Subject and has its own notes.
export interface Topic {
  id: string;
  name: string;
  notes: string; // For structured notes (e.g., Markdown)
  subTopics: SubTopic[];
  attachments: Attachment[];
}

// The Subject interface is updated to contain a list of Topics.
export interface Subject {
  id:string;
  name: string;
  color: string;
  level: SubjectLevel;
  notes: string;
  topics: Topic[];
  sessionTimestamps: string[];
  trackStreak: boolean;
}

export interface Habit {
  id: string;
  name: string;
  color: string;
  category: string;
  completedDates: string[]; // Store dates as "YYYY-MM-DD"
}

export interface Video {
  id: string;
  name: string;
  color: string;
  totalDuration: number; // in seconds
  watchedDuration: number; // in seconds
  trackStreak: boolean;
  sessionTimestamps: string[];
  link?: string;
  description?: string;
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface TodoItem {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    priority: PriorityLevel;
    dueDate: string | null; // "YYYY-MM-DD"
    subtasks: Subtask[];
    createdAt: string;
    image?: string; // Base64 data URL
}

export interface TodoList {
    id: string;
    name: string;
    color: string;
    items: TodoItem[];
    parentId?: string;
    image?: string; // Base64 data URL
}

export type TrackableItem = Subject | Habit | Video | TodoList;

export interface AppData {
  profile: Profile;
  apiKey: string;
  theme: string;
  subjects: Subject[];
  habits: Habit[];
  videos: Video[];
  todos: TodoList[];
}