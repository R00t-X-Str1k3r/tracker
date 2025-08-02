import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const parsedContent = React.useMemo(() => {
    if (!content) return '';
    let html = content;

    // Process blocks first
    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, (_match, p1) => {
        const code = p1.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
        return `<pre class="prose-pre-bg text-prose-pre rounded p-3 my-2 overflow-x-auto"><code class="font-mono text-sm">${code}</code></pre>`;
    });

    // Horizontal Rule
    html = html.replace(/^\s*---*\s*$/gm, '<hr class="my-4 border-subtle-border">');

    // Blockquotes
    html = html.replace(/^\s*>\s?(.*)/gm, '<blockquote class="border-l-4 border-subtle-border text-prose-blockquote pl-4 italic my-2">$1</blockquote>');
    html = html.replace(/<\/blockquote>\n<blockquote/g, '<blockquote');

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-1 text-prose-headings">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-5 mb-2 text-prose-headings">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-3 text-prose-headings">$1</h1>');
    
    // Checklists
    html = html.replace(/^\s*[-*] \[[xX]\] (.*)/gm, '<div class="flex items-center gap-2 my-1"><svg class="w-4 h-4 text-primary flex-shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" /><path fill-rule="evenodd" d="M14 1H2a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V2a1 1 0 00-1-1zM2 0a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2H2z" clip-rule="evenodd" /></svg><span class="text-subtle-text line-through">$1</span></div>');
    html = html.replace(/^\s*[-*] \[ \] (.*)/gm, '<div class="flex items-center gap-2 my-1"><svg class="w-4 h-4 text-subtle-text flex-shrink-0" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M14 1H2a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V2a1 1 0 00-1-1zM2 0a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2H2z" clip-rule="evenodd" /></svg><span>$1</span></div>');
    html = html.replace(/(<\/div>)\n(<div class="flex items-center gap-2">)/g, '$1$2');

    // Unordered Lists
    html = html.replace(/^\s*[-*] (.*)/gm, '<ul class="list-disc list-inside my-2"><li>$1</li></ul>');
    html = html.replace(/<\/ul>\n<ul>/g, '');

    // Ordered Lists
    html = html.replace(/^\s*\d+\. (.*)/gm, '<ol class="list-decimal list-inside my-2"><li>$1</li></ol>');
    html = html.replace(/<\/ol>\n<ol>/g, '');

    // Process inline elements
    // Link
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-prose-links hover:underline">$1</a>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-prose-bold">$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong class="text-prose-bold">$1</strong>');

    // Strikethrough
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-subtle text-prose-code rounded px-1.5 py-1 font-mono text-sm">$1</code>');
    
    // Paragraphs and line breaks
    html = html.split('\n').map(line => {
      if (line.trim() === '') return '';
      if (line.match(/<\/?(h[1-3]|ul|ol|li|blockquote|pre|code|hr|div)/)) {
        return line;
      }
      return `<p>${line}</p>`;
    }).join('').replace(/<\/p><p>/g, '</p><p>');

    return html;
  }, [content]);

  return <div className="prose prose-sm max-w-none text-prose-body leading-relaxed" dangerouslySetInnerHTML={{ __html: parsedContent }} />;
};

export default MarkdownRenderer;