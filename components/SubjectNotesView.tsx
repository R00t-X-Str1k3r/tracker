import React, { useRef, useState } from 'react';
import { Subject } from '../types';
import Modal from './Modal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import MarkdownRenderer from './MarkdownRenderer';

interface SubjectNotesViewProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
}

const SubjectNotesView: React.FC<SubjectNotesViewProps> = ({ isOpen, onClose, subject }) => {
  const [isExporting, setIsExporting] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  const handleExport = async (format: 'txt' | 'md' | 'pdf') => {
    if (!subject) return;
    setIsExporting(true);

    const title = `Notes for ${subject.name}`;
    const fileName = `${subject.name.replace(/\s/g, '_')}_notes`;

    const downloadFile = (data: string, fullFileName: string, mimeType: string) => {
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fullFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (format === 'txt' || format === 'md') {
        let content = `# ${title}\n\n`;
        if(subject.notes.trim()) {
          content += `## General Subject Notes\n\n${subject.notes}\n\n`;
        }
        subject.topics.forEach(topic => {
            if(topic.notes.trim()) {
              content += `### ${topic.name}\n\n${topic.notes}\n\n`;
            }
        });
        downloadFile(content, `${fileName}.${format}`, format === 'txt' ? 'text/plain' : 'text/markdown');
    } else if (format === 'pdf') {
        const element = printableRef.current;
        if (!element) {
            setIsExporting(false);
            return;
        };

        // Temporarily set a background color for canvas rendering
        const originalBg = element.style.backgroundColor;
        const computedStyle = getComputedStyle(element);
        element.style.backgroundColor = computedStyle.getPropertyValue('--color-card-bg') || '#ffffff';

        const canvas = await html2canvas(element, { 
          scale: 2,
          backgroundColor: element.style.backgroundColor,
          onclone: (document) => {
            // Apply text color to the cloned document for rendering
            const proseElements = document.querySelectorAll('.prose-export');
             proseElements.forEach(el => {
                const htmlEl = el as HTMLElement;
                htmlEl.style.color = getComputedStyle(htmlEl).getPropertyValue('--color-prose-body')
            });
          }
        });
        element.style.backgroundColor = originalBg; // Restore original bg

        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgProps= pdf.getImageProperties(imgData);
        const imgWidth = imgProps.width;
        const imgHeight = imgProps.height;
        
        const ratio = imgHeight / imgWidth;
        let pageHeight = (pdfWidth - 20) * ratio;
        let heightLeft = pageHeight;
        
        let position = 10;
        pdf.addImage(imgData, 'PNG', 10, position, pdfWidth - 20, pageHeight);
        heightLeft -= (pdfHeight - 20);

        while (heightLeft >= 0) {
          position = -heightLeft + 10;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, pdfWidth - 20, pageHeight);
          heightLeft -= (pdfHeight - 20);
        }
        
        pdf.save(`${fileName}.pdf`);
    }
    setIsExporting(false);
  };
  
  if (!subject) return null;

  const hasNotes = subject.topics.some(t => t.notes.trim()) || subject.notes.trim();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Notes for ${subject.name}`}>
      <div className="max-h-[70vh] overflow-y-auto p-1 pr-4 -mr-4">
        <div ref={printableRef} className="p-2 bg-card text-card-text prose-export">
            {hasNotes ? (
                <div className="space-y-6">
                  {subject.notes.trim() && (
                       <div>
                          <h3 className="text-lg font-bold text-primary border-b-2 border-subtle-border pb-1 mb-2">General Subject Notes</h3>
                          <MarkdownRenderer content={subject.notes} />
                       </div>
                   )}
                  {subject.topics.map(topic => (
                    topic.notes.trim() && (
                      <div key={topic.id}>
                        <h3 className="text-lg font-bold text-primary border-b-2 border-subtle-border pb-1 mb-2">{topic.name}</h3>
                        <MarkdownRenderer content={topic.notes} />
                      </div>
                    )
                  ))}
                </div>
            ) : (
              <p className="text-center text-subtle-text py-12">No notes have been added for this subject yet.</p>
            )}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-card-border text-right space-x-2">
          <button 
            onClick={() => handleExport('pdf')}
            disabled={!hasNotes || isExporting}
            className="bg-primary text-primary-text font-bold py-2 px-4 rounded-md hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {isExporting ? '...' : 'PDF'}
          </button>
          <button 
            onClick={() => handleExport('md')} 
            disabled={!hasNotes || isExporting}
            className="bg-subtle text-subtle-text font-bold py-2 px-4 rounded-md hover:bg-subtle-hover disabled:opacity-50 transition-colors"
          >
            {isExporting ? '...' : 'MD'}
          </button>
      </div>
    </Modal>
  );
};

export default SubjectNotesView;