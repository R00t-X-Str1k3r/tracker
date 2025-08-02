export interface Theme {
  id: string;
  name: string;
  isDark: boolean;
  colors: {
    // Main layout
    'main-bg': string;
    'main-text': string;
    // Cards, Modals
    'card-bg': string;
    'card-text': string;
    'card-border': string;
    // Subtle elements
    'subtle-bg': string;
    'subtle-text': string;
    'subtle-border': string;
    'subtle-hover-bg': string;
    // Interactive elements
    'interactive-bg': string;
    'interactive-text': string;
    // Primary color scale
    'primary-50': string;
    'primary-100': string;
    'primary-200': string;
    'primary-300': string;
    'primary-400': string;
    'primary-500': string;
    'primary-600': string;
    'primary-700': string;
    'primary-800': string;
    'primary-900': string;
    'primary-950': string;
    // Prose styles for Markdown
    'prose-body': string;
    'prose-headings': string;
    'prose-links': string;
    'prose-bold': string;
    'prose-code': string;
    'prose-pre': string;
    'prose-pre-bg': string;
    'prose-blockquote': string;
  };
  special?: {
    glassy?: boolean;
    font?: string;
    animation?: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'light',
    name: 'Default Light',
    isDark: false,
    colors: {
      'main-bg': '#f3f4f6', 'main-text': '#1f2937',
      'card-bg': '#ffffff', 'card-text': '#1f2937', 'card-border': '#e5e7eb',
      'subtle-bg': '#e5e7eb', 'subtle-text': '#4b5563', 'subtle-border': '#d1d5db', 'subtle-hover-bg': '#d1d5db',
      'interactive-bg': '#f9fafb', 'interactive-text': '#111827',
      'primary-50': '#eff6ff', 'primary-100': '#dbeafe', 'primary-200': '#bfdbfe', 'primary-300': '#93c5fd', 'primary-400': '#60a5fa', 'primary-500': '#3b82f6', 'primary-600': '#2563eb', 'primary-700': '#1d4ed8', 'primary-800': '#1e40af', 'primary-900': '#1e3a8a', 'primary-950': '#172554',
      'prose-body': '#374151', 'prose-headings': '#111827', 'prose-links': '#2563eb', 'prose-bold': '#111827', 'prose-code': '#111827', 'prose-pre': '#e5e7eb', 'prose-pre-bg': '#f3f4f6', 'prose-blockquote': '#6b7280',
    },
  },
  {
    id: 'midnight-pulse',
    name: 'Midnight Pulse',
    isDark: true,
    colors: {
      'main-bg': '#0d1117', 'main-text': '#c9d1d9',
      'card-bg': '#161b22', 'card-text': '#c9d1d9', 'card-border': '#30363d',
      'subtle-bg': '#21262d', 'subtle-text': '#8b949e', 'subtle-border': '#30363d', 'subtle-hover-bg': '#30363d',
      'interactive-bg': '#0d1117', 'interactive-text': '#c9d1d9',
      'primary-50': '#f0f6fc', 'primary-100': '#cce3ff', 'primary-200': '#a8ceff', 'primary-300': '#7ab8ff', 'primary-400': '#539dff', 'primary-500': '#3688ff', 'primary-600': '#2176ff', 'primary-700': '#1765e6', 'primary-800': '#1254bf', 'primary-900': '#10499f', 'primary-950': '#0c3066',
      'prose-body': '#c9d1d9', 'prose-headings': '#f0f6fc', 'prose-links': '#58a6ff', 'prose-bold': '#f0f6fc', 'prose-code': '#c9d1d9', 'prose-pre': '#c9d1d9', 'prose-pre-bg': '#21262d', 'prose-blockquote': '#8b949e',
    },
  },
    {
    id: 'hacker-terminal',
    name: 'Hacker Terminal',
    isDark: true,
    colors: {
      'main-bg': '#000000', 'main-text': '#00ff00',
      'card-bg': '#0a0a0a', 'card-text': '#00ff00', 'card-border': '#003300',
      'subtle-bg': '#0f172a', 'subtle-text': '#00cc00', 'subtle-border': '#004d00', 'subtle-hover-bg': '#004d00',
      'interactive-bg': '#0a0a0a', 'interactive-text': '#00ff00',
      'primary-50': '#f0fdf4', 'primary-100': '#dcfce7', 'primary-200': '#bbf7d0', 'primary-300': '#86efac', 'primary-400': '#4ade80', 'primary-500': '#22c55e', 'primary-600': '#16a34a', 'primary-700': '#15803d', 'primary-800': '#166534', 'primary-900': '#14532d', 'primary-950': '#052e16',
      'prose-body': '#00ff00', 'prose-headings': '#33ff33', 'prose-links': '#66ff66', 'prose-bold': '#99ff99', 'prose-code': '#00ff00', 'prose-pre': '#00ff00', 'prose-pre-bg': '#001a00', 'prose-blockquote': '#00cc00',
    },
    special: { font: 'font-mono' }
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    isDark: true,
    colors: {
      'main-bg': '#010413', 'main-text': '#e0e0e0',
      'card-bg': '#120c2a', 'card-text': '#e0e0e0', 'card-border': '#3a1f7a',
      'subtle-bg': '#1e144a', 'subtle-text': '#a0a0c0', 'subtle-border': '#3a1f7a', 'subtle-hover-bg': '#3a1f7a',
      'interactive-bg': '#120c2a', 'interactive-text': '#e0e0e0',
      'primary-50': '#f5f3ff', 'primary-100': '#ede9fe', 'primary-200': '#ddd6fe', 'primary-300': '#c4b5fd', 'primary-400': '#a78bfa', 'primary-500': '#8b5cf6', 'primary-600': '#7c3aed', 'primary-700': '#6d28d9', 'primary-800': '#5b21b6', 'primary-900': '#4c1d95', 'primary-950': '#2e1065',
      'prose-body': '#e0e0e0', 'prose-headings': '#f87171', 'prose-links': '#d946ef', 'prose-bold': '#a78bfa', 'prose-code': '#e0e0e0', 'prose-pre': '#e0e0e0', 'prose-pre-bg': '#1e144a', 'prose-blockquote': '#a0a0c0',
    },
  },
  {
    id: 'solar-void',
    name: 'Solar Void',
    isDark: true,
    colors: {
      'main-bg': '#000000', 'main-text': '#e2e2e2',
      'card-bg': '#121212', 'card-text': '#e2e2e2', 'card-border': '#2a2a2a',
      'subtle-bg': '#1f1f1f', 'subtle-text': '#a0a0a0', 'subtle-border': '#2a2a2a', 'subtle-hover-bg': '#2a2a2a',
      'interactive-bg': '#000000', 'interactive-text': '#e2e2e2',
      'primary-50': '#fff7ed', 'primary-100': '#ffedd5', 'primary-200': '#fed7aa', 'primary-300': '#fdbb74', 'primary-400': '#fb923c', 'primary-500': '#f97316', 'primary-600': '#ea580c', 'primary-700': '#c2410c', 'primary-800': '#9a3412', 'primary-900': '#7c2d12', 'primary-950': '#431407',
      'prose-body': '#e2e2e2', 'prose-headings': '#fb923c', 'prose-links': '#f97316', 'prose-bold': '#fed7aa', 'prose-code': '#e2e2e2', 'prose-pre': '#e2e2e2', 'prose-pre-bg': '#1f1f1f', 'prose-blockquote': '#a0a0a0',
    },
  },
  {
    id: 'twilight-forest',
    name: 'Twilight Forest',
    isDark: true,
    colors: {
      'main-bg': '#111827', 'main-text': '#d1d5db',
      'card-bg': '#1f2937', 'card-text': '#d1d5db', 'card-border': '#374151',
      'subtle-bg': '#374151', 'subtle-text': '#9ca3af', 'subtle-border': '#4b5563', 'subtle-hover-bg': '#4b5563',
      'interactive-bg': '#111827', 'interactive-text': '#d1d5db',
      'primary-50': '#f0fdf4', 'primary-100': '#dcfce7', 'primary-200': '#bbf7d0', 'primary-300': '#86efac', 'primary-400': '#4ade80', 'primary-500': '#22c55e', 'primary-600': '#16a34a', 'primary-700': '#15803d', 'primary-800': '#166534', 'primary-900': '#14532d', 'primary-950': '#052e16',
      'prose-body': '#d1d5db', 'prose-headings': '#bbf7d0', 'prose-links': '#86efac', 'prose-bold': '#d1d5db', 'prose-code': '#d1d5db', 'prose-pre': '#d1d5db', 'prose-pre-bg': '#374151', 'prose-blockquote': '#9ca3af',
    },
  },
  {
    id: 'nightfall-blue',
    name: 'Nightfall Blue',
    isDark: true,
    colors: {
      'main-bg': '#0f172a', 'main-text': '#e2e8f0',
      'card-bg': 'rgba(30, 41, 59, 0.7)', 'card-text': '#e2e8f0', 'card-border': 'rgba(51, 65, 85, 0.7)',
      'subtle-bg': '#334155', 'subtle-text': '#94a3b8', 'subtle-border': '#475569', 'subtle-hover-bg': '#475569',
      'interactive-bg': '#1e293b', 'interactive-text': '#e2e8f0',
      'primary-50': '#f0f9ff', 'primary-100': '#e0f2fe', 'primary-200': '#bae6fd', 'primary-300': '#7dd3fc', 'primary-400': '#38bdf8', 'primary-500': '#0ea5e9', 'primary-600': '#0284c7', 'primary-700': '#0369a1', 'primary-800': '#075985', 'primary-900': '#0c4a6e', 'primary-950': '#082f49',
      'prose-body': '#e2e8f0', 'prose-headings': '#e2e8f0', 'prose-links': '#7dd3fc', 'prose-bold': '#e2e8f0', 'prose-code': '#e2e8f0', 'prose-pre': '#e2e8f0', 'prose-pre-bg': '#1e293b', 'prose-blockquote': '#94a3b8',
    },
    special: { glassy: true },
  },
  {
    id: 'dracula-inspired',
    name: 'Dracula Inspired',
    isDark: true,
    colors: {
      'main-bg': '#282a36', 'main-text': '#f8f8f2',
      'card-bg': '#44475a', 'card-text': '#f8f8f2', 'card-border': '#6272a4',
      'subtle-bg': '#6272a4', 'subtle-text': '#bd93f9', 'subtle-border': '#bd93f9', 'subtle-hover-bg': '#6272a4',
      'interactive-bg': '#282a36', 'interactive-text': '#f8f8f2',
      'primary-50': '#f5f3ff', 'primary-100': '#ede9fe', 'primary-200': '#ddd6fe', 'primary-300': '#c4b5fd', 'primary-400': '#a78bfa', 'primary-500': '#ff79c6', 'primary-600': '#ff55b8', 'primary-700': '#ff2ea1', 'primary-800': '#e6007e', 'primary-900': '#b30062', 'primary-950': '#800046',
      'prose-body': '#f8f8f2', 'prose-headings': '#50fa7b', 'prose-links': '#8be9fd', 'prose-bold': '#f1fa8c', 'prose-code': '#f8f8f2', 'prose-pre': '#f8f8f2', 'prose-pre-bg': '#282a36', 'prose-blockquote': '#6272a4',
    },
  },
  {
    id: 'obsidian-black',
    name: 'Obsidian Black',
    isDark: true,
    colors: {
      'main-bg': '#000000', 'main-text': '#d0d0d0',
      'card-bg': '#0a0a0a', 'card-text': '#d0d0d0', 'card-border': '#1a1a1a',
      'subtle-bg': '#1f1f1f', 'subtle-text': '#888888', 'subtle-border': '#2a2a2a', 'subtle-hover-bg': '#2a2a2a',
      'interactive-bg': '#000000', 'interactive-text': '#d0d0d0',
      'primary-50': '#f7fafc', 'primary-100': '#edf2f7', 'primary-200': '#e2e8f0', 'primary-300': '#cbd5e0', 'primary-400': '#a0aec0', 'primary-500': '#718096', 'primary-600': '#4a5568', 'primary-700': '#2d3748', 'primary-800': '#1a202c', 'primary-900': '#171923', 'primary-950': '#080a0e',
      'prose-body': '#d0d0d0', 'prose-headings': '#e0e0e0', 'prose-links': '#a0aec0', 'prose-bold': '#ffffff', 'prose-code': '#d0d0d0', 'prose-pre': '#d0d0d0', 'prose-pre-bg': '#1f1f1f', 'prose-blockquote': '#888888',
    },
  },
  {
    id: 'grayscale-pro',
    name: 'Grayscale Pro',
    isDark: true,
    colors: {
      'main-bg': '#111111', 'main-text': '#ffffff',
      'card-bg': '#222222', 'card-text': '#ffffff', 'card-border': '#333333',
      'subtle-bg': '#333333', 'subtle-text': '#bbbbbb', 'subtle-border': '#444444', 'subtle-hover-bg': '#444444',
      'interactive-bg': '#111111', 'interactive-text': '#ffffff',
      'primary-50': '#fafafa', 'primary-100': '#f5f5f5', 'primary-200': '#e5e5e5', 'primary-300': '#d4d4d4', 'primary-400': '#a3a3a3', 'primary-500': '#737373', 'primary-600': '#525252', 'primary-700': '#404040', 'primary-800': '#262626', 'primary-900': '#171717', 'primary-950': '#0a0a0a',
      'prose-body': '#ffffff', 'prose-headings': '#ffffff', 'prose-links': '#e5e5e5', 'prose-bold': '#ffffff', 'prose-code': '#ffffff', 'prose-pre': '#ffffff', 'prose-pre-bg': '#333333', 'prose-blockquote': '#bbbbbb',
    },
  },
  {
    id: 'aurora-mist',
    name: 'Aurora Mist',
    isDark: true,
    colors: {
      'main-bg': '#020617', 'main-text': '#e2e8f0',
      'card-bg': '#0f172a', 'card-text': '#e2e8f0', 'card-border': '#1e293b',
      'subtle-bg': '#1e293b', 'subtle-text': '#94a3b8', 'subtle-border': '#334155', 'subtle-hover-bg': '#334155',
      'interactive-bg': '#0f172a', 'interactive-text': '#e2e8f0',
      'primary-50': '#ecfdf5', 'primary-100': '#d1fae5', 'primary-200': '#a7f3d0', 'primary-300': '#6ee7b7', 'primary-400': '#34d399', 'primary-500': '#10b981', 'primary-600': '#059669', 'primary-700': '#047857', 'primary-800': '#065f46', 'primary-900': '#064e3b', 'primary-950': '#022c22',
      'prose-body': '#e2e8f0', 'prose-headings': '#e2e8f0', 'prose-links': '#6ee7b7', 'prose-bold': '#a7f3d0', 'prose-code': '#e2e8f0', 'prose-pre': '#e2e8f0', 'prose-pre-bg': '#1e293b', 'prose-blockquote': '#94a3b8',
    },
  },
   {
    id: 'quantum-glass',
    name: 'Quantum Glass',
    isDark: true,
    colors: {
      'main-bg': '#0A0F1E', 'main-text': '#E0E6F1',
      'card-bg': 'rgba(15, 23, 42, 0.6)', 'card-text': '#E0E6F1', 'card-border': 'rgba(30, 41, 59, 0.5)',
      'subtle-bg': '#1E293B', 'subtle-text': '#94A3B8', 'subtle-border': '#334155', 'subtle-hover-bg': '#475569',
      'interactive-bg': '#1E293B', 'interactive-text': '#E0E6F1',
      'primary-50': '#e0f2fe', 'primary-100': '#bae6fd', 'primary-200': '#7dd3fc', 'primary-300': '#38bdf8', 'primary-400': '#0ea5e9', 'primary-500': '#0284c7', 'primary-600': '#0369a1', 'primary-700': '#075985', 'primary-800': '#0c4a6e', 'primary-900': '#082f49', 'primary-950': '#082f49',
      'prose-body': '#E0E6F1', 'prose-headings': '#FFFFFF', 'prose-links': '#7dd3fc', 'prose-bold': '#E0E6F1', 'prose-code': '#E0E6F1', 'prose-pre': '#E0E6F1', 'prose-pre-bg': '#1E293B', 'prose-blockquote': '#94A3B8',
    },
    special: { glassy: true }
  },
];

export const folderColors = [
  'bg-gray-400', 'bg-red-400', 'bg-orange-400', 'bg-amber-400', 
  'bg-yellow-400', 'bg-lime-400', 'bg-green-400', 'bg-emerald-400', 
  'bg-teal-400', 'bg-cyan-400', 'bg-sky-400', 'bg-blue-400', 
  'bg-indigo-400', 'bg-violet-400', 'bg-purple-400', 'bg-fuchsia-400', 
  'bg-pink-400', 'bg-rose-400'
];
