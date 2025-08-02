import React, { useState, useCallback } from 'react';
import { Subject, Habit, Video, TodoList } from '../types';
import { generateRecommendation } from '../services/geminiService';
import Modal from './Modal';

interface AiAssistantProps {
  subjects: Subject[];
  habits: Habit[];
  videos: Video[];
  todos: TodoList[];
  apiKey: string;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ subjects, habits, videos, todos, apiKey }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recommendation, setRecommendation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGetInsight = useCallback(async () => {
    setIsLoading(true);
    setRecommendation('');
    const result = await generateRecommendation(subjects, habits, videos, todos, apiKey);
    setRecommendation(result);
    setIsLoading(false);
  }, [subjects, habits, videos, todos, apiKey]);

  const openModal = () => {
    setIsModalOpen(true);
    handleGetInsight();
  };

  return (
    <>
      <button
        onClick={openModal}
        className="fixed bottom-6 right-6 bg-primary text-primary-text rounded-full p-4 shadow-lg transition transform hover:scale-110 hover:bg-primary-hover z-40"
        aria-label="Get AI Insight"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Your AI Productivity Coach">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-48">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
             <p className="mt-4 text-subtle-text">Zenith is thinking...</p>
          </div>
        )}
        {!isLoading && recommendation && (
            <div className="prose prose-sm max-w-none text-card-text" dangerouslySetInnerHTML={{ __html: recommendation.replace(/\n/g, '<br />') }}></div>
        )}
      </Modal>
    </>
  );
};

export default AiAssistant;