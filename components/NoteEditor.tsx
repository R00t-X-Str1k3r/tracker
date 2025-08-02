import React, { useState, useRef, useEffect } from 'react';
import { rewriteNotesWithAI } from '../services/geminiService';

interface NoteEditorProps {
  onSave: (newNote: string) => void;
  onCancel: () => void;
  initialNote: string;
  apiKey: string;
}

// --- ICONS ---
const BoldIcon = () => <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M6 12h8a4 4 0 010 8H6v-8zm0-8h6a4 4 0 010 8H6V4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>;
const ItalicIcon = () => <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M10 4h8m-6 16h8M14 4l-4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>;
const StrikethroughIcon = () => <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5"><path d="M16.5 8c-1.333-1.333-2.833-2-4.5-2C9.5 6 8 7 7 8.5M4 12h16m-10 4c0 1 .5 1.5 1.5 1.5s1.5-.5 1.5-1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>;
const LinkIcon = () => <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.72M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.72-1.72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>;
const ListUlIcon = () => <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M8 6h11M8 12h11M8 18h11M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>;
const ListOlIcon = () => <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M8 6h11M8 12h11M8 18h11M4.9 18H4.2c-.3 0-.5-.3-.5-.6v-1.8c0-.3.2-.6.5-.6h.7c.3 0 .5.3.5.6v1.8c0 .3-.2.6-.5.6zM4.5 12H5m-1-1v2.5m-1-2.2v.1a.8.8 0 00.8.8h.2M3 6.25A1.25 1.25 0 014.25 5h.5A1.25 1.25 0 016 6.25v.25A1.25 1.25 0 014.75 7.75h-.5A1.25 1.25 0 013 6.5V6.25z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>;
const ChecklistIcon = () => <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>;
const QuoteIcon = () => <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M10 12H5V7h5m7 5h-5V7h5m-6 10v-5h-5v5h5zm7 0v-5h-5v5h5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>;
const DividerIcon = () => <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>;
const CodeIcon = () => <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M9 8l-4 4 4 4m6-8l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>;
const CodeBlockIcon = () => <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M17 17l4-4-4-4m-10 8l-4-4 4-4M14 4l-4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>;


const ToolbarButton: React.FC<{ onClick: () => void; children: React.ReactNode; }> = ({ onClick, children }) => (
  <button type="button" onClick={onClick} className="p-2 rounded text-subtle-text hover:bg-subtle-hover transition-colors">
    {children}
  </button>
);


const NoteEditor: React.FC<NoteEditorProps> = ({ onSave, onCancel, initialNote, apiKey }) => {
  const [note, setNote] = useState(initialNote);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setNote(initialNote);
    setAiResponse('');
    setAiPrompt('');
  }, [initialNote]);
  
  const applyFormat = (type: 'bold' | 'italic' | 'h1' | 'h2' | 'h3' | 'ul' | 'ol' | 'blockquote' | 'code' | 'code-block' | 'strikethrough' | 'link' | 'divider' | 'checklist') => {
    if (!textareaRef.current) return;
    const { selectionStart, selectionEnd, value } = textareaRef.current;
    
    let finalNote = value;
    let newSelectionStart = selectionStart;
    let newSelectionEnd = selectionEnd;

    const wrapSelection = (prefix: string, suffix: string = prefix) => {
      const selected = value.substring(selectionStart, selectionEnd);
      if (selected.startsWith(prefix) && selected.endsWith(suffix)) {
          const unwrapped = selected.substring(prefix.length, selected.length - suffix.length);
          finalNote = value.substring(0, selectionStart) + unwrapped + value.substring(selectionEnd);
          newSelectionStart = selectionStart;
          newSelectionEnd = selectionStart + unwrapped.length;
      } else {
          finalNote = value.substring(0, selectionStart) + prefix + selected + suffix + value.substring(selectionEnd);
          newSelectionStart = selectionStart + prefix.length;
          newSelectionEnd = newSelectionStart + selected.length;
      }
    };
    
    const prefixLines = (prefix: string) => {
        const lines = value.substring(selectionStart, selectionEnd).split('\n');
        const allPrefixed = lines.every(line => line.trim().startsWith(prefix.trim()));
        
        const transformedLines = allPrefixed
            ? lines.map(line => line.replace(prefix, '')).join('\n')
            : lines.map(line => line ? `${prefix}${line}` : line).join('\n');
            
        finalNote = value.substring(0, selectionStart) + transformedLines + value.substring(selectionEnd);
        newSelectionStart = selectionStart;
        newSelectionEnd = selectionStart + transformedLines.length;
    };

    switch (type) {
      case 'h1': prefixLines('# '); break;
      case 'h2': prefixLines('## '); break;
      case 'h3': prefixLines('### '); break;
      case 'blockquote': prefixLines('> '); break;
      case 'ul': prefixLines('- '); break;
      case 'checklist': prefixLines('- [ ] '); break;
      case 'ol': {
        const lines = value.substring(selectionStart, selectionEnd).split('\n');
        const allNumbered = lines.every(line => /^\d+\. /.test(line.trim()));
        const transformedLines = allNumbered
            ? lines.map(line => line.replace(/^\d+\. /, '')).join('\n')
            : lines.map((line, i) => line ? `${i+1}. ${line}` : line).join('\n');
        finalNote = value.substring(0, selectionStart) + transformedLines + value.substring(selectionEnd);
        newSelectionEnd = selectionStart + transformedLines.length;
        break;
      }
      case 'bold': wrapSelection('**'); break;
      case 'italic': wrapSelection('*'); break;
      case 'code': wrapSelection('`'); break;
      case 'strikethrough': wrapSelection('~~'); break;
      case 'link': {
        const url = prompt("Enter URL:", "https://");
        if (url) {
            const selectedText = value.substring(selectionStart, selectionEnd);
            if (selectedText) {
                wrapSelection('[', `](${url})`);
            } else {
                const linkText = 'link text';
                finalNote = value.substring(0, selectionStart) + `[${linkText}](${url})` + value.substring(selectionEnd);
                newSelectionStart = selectionStart + 1;
                newSelectionEnd = selectionStart + 1 + linkText.length;
            }
        }
        break;
      }
      case 'divider': {
        const textToInsert = (selectionStart > 0 && value[selectionStart-1] !== '\n' ? '\n' : '') + '---\n';
        finalNote = value.substring(0, selectionStart) + textToInsert + value.substring(selectionStart);
        newSelectionStart = newSelectionEnd = selectionStart + textToInsert.length;
        break;
      }
      case 'code-block': wrapSelection('```\n', '\n```'); break;
      default: break;
    }

    setNote(finalNote);
    setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(newSelectionStart, newSelectionEnd);
    }, 0);
  };

  const handleRewrite = async () => {
    if (!aiPrompt.trim() || !note.trim()) {
      alert("Please provide some text in your notes and a prompt for the AI.");
      return;
    }
    setIsLoading(true);
    setAiResponse('');
    const result = await rewriteNotesWithAI(note, aiPrompt, apiKey);
    setAiResponse(result);
    setIsLoading(false);
  };

  const handleReplace = () => {
    setNote(aiResponse);
    setAiResponse('');
  };
  
  const handleSave = () => {
    onSave(note);
  };

  return (
    <div className="border border-card-border rounded-lg bg-card">
        <div className="p-1 border-b border-card-border flex flex-wrap items-center gap-1">
            <ToolbarButton onClick={() => applyFormat('h1')}><span className="font-bold">H1</span></ToolbarButton>
            <ToolbarButton onClick={() => applyFormat('h2')}><span className="font-bold">H2</span></ToolbarButton>
            <ToolbarButton onClick={() => applyFormat('h3')}><span className="font-bold">H3</span></ToolbarButton>
            <div className="w-px h-5 bg-subtle-border mx-1"></div>
            <ToolbarButton onClick={() => applyFormat('bold')}><BoldIcon/></ToolbarButton>
            <ToolbarButton onClick={() => applyFormat('italic')}><ItalicIcon/></ToolbarButton>
            <ToolbarButton onClick={() => applyFormat('strikethrough')}><StrikethroughIcon/></ToolbarButton>
            <ToolbarButton onClick={() => applyFormat('link')}><LinkIcon/></ToolbarButton>
            <div className="w-px h-5 bg-subtle-border mx-1"></div>
            <ToolbarButton onClick={() => applyFormat('ul')}><ListUlIcon/></ToolbarButton>
            <ToolbarButton onClick={() => applyFormat('ol')}><ListOlIcon/></ToolbarButton>
            <ToolbarButton onClick={() => applyFormat('checklist')}><ChecklistIcon/></ToolbarButton>
            <div className="w-px h-5 bg-subtle-border mx-1"></div>
            <ToolbarButton onClick={() => applyFormat('blockquote')}><QuoteIcon/></ToolbarButton>
            <ToolbarButton onClick={() => applyFormat('divider')}><DividerIcon/></ToolbarButton>
            <ToolbarButton onClick={() => applyFormat('code')}><CodeIcon/></ToolbarButton>
            <ToolbarButton onClick={() => applyFormat('code-block')}><CodeBlockIcon/></ToolbarButton>
        </div>
        <textarea
            ref={textareaRef}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Start writing..."
            className="w-full h-48 bg-transparent p-3 text-base leading-relaxed resize-y focus:outline-none text-card-text"
        ></textarea>
        <div className="p-2 border-t border-card-border">
          {showAi && (
            <div className="p-2 mb-2 bg-interactive rounded-md">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder='e.g., "Summarize this into three bullet points"'
                  className="w-full h-20 bg-card rounded-md p-2 text-sm resize-none border border-card-border"
                />
                <button onClick={handleRewrite} disabled={isLoading || !apiKey} className="w-full mt-2 bg-primary text-primary-text font-bold py-1.5 px-3 text-sm rounded-md hover:bg-primary-hover disabled:opacity-50 flex justify-center">
                    {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Generate'}
                </button>
                {aiResponse && !isLoading && (
                  <div className="mt-2 p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                    <p className="text-sm max-h-32 overflow-y-auto whitespace-pre-wrap p-2 bg-card rounded-md">{aiResponse}</p>
                    <div className="flex gap-2 mt-2">
                        <button onClick={handleReplace} className="flex-1 bg-green-500 text-white text-xs font-semibold py-1 px-2 rounded-md hover:bg-green-600">Replace</button>
                        <button onClick={() => setAiResponse('')} className="flex-1 text-xs text-subtle-text hover:underline">Dismiss</button>
                    </div>
                  </div>
                )}
            </div>
          )}
          <div className="flex justify-between items-center">
             <button onClick={() => setShowAi(!showAi)} className="text-xs font-semibold text-primary hover:underline" disabled={!apiKey}>
               {apiKey ? (showAi ? 'Hide AI ✨' : 'Rewrite with AI ✨') : 'AI disabled'}
             </button>
             <div className="flex gap-2">
                <button onClick={onCancel} className="bg-subtle text-subtle-text font-bold py-1.5 px-4 rounded-md text-sm hover:bg-subtle-hover transition-colors">Cancel</button>
                <button onClick={handleSave} className="bg-green-600 text-white font-bold py-1.5 px-4 rounded-md text-sm hover:bg-green-700 transition-colors">Save</button>
             </div>
          </div>
        </div>
    </div>
  );
};

export default NoteEditor;