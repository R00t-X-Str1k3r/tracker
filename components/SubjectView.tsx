import React, { useState } from 'react';
import { Subject, SubjectLevel } from '../types';
import SubjectCard from './SubjectCard';
import Modal from './Modal';

interface SubjectViewProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  apiKey: string;
}

const SubjectView: React.FC<SubjectViewProps> = ({ subjects, setSubjects, apiKey }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectLevel, setNewSubjectLevel] = useState<SubjectLevel>(SubjectLevel.Medium);
  const [newSubjectColor, setNewSubjectColor] = useState('bg-blue-500');

  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
    'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;

    const newSubject: Subject = {
      id: `subject-${Date.now()}`,
      name: newSubjectName.trim(),
      color: newSubjectColor,
      level: newSubjectLevel,
      notes: '',
      topics: [],
      sessionTimestamps: [],
      trackStreak: true
    };

    setSubjects(prev => [...prev, newSubject]);
    setNewSubjectName('');
    setNewSubjectLevel(SubjectLevel.Medium);
    setNewSubjectColor('bg-blue-500');
    setIsModalOpen(false);
  };

  const handleUpdateSubject = (updatedSubject: Subject) => {
    setSubjects(prev => prev.map(subject => 
      subject.id === updatedSubject.id ? updatedSubject : subject
    ));
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (window.confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
      setSubjects(prev => prev.filter(subject => subject.id !== subjectId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-card-text">Subjects</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-text px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
        >
          Add Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-subtle-text mb-4">No subjects added yet.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-primary-text px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors"
          >
            Add Your First Subject
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {subjects.map(subject => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onUpdate={handleUpdateSubject}
              onDelete={() => handleDeleteSubject(subject.id)}
              apiKey={apiKey}
            />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Subject">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-text mb-2">Subject Name</label>
            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="Enter subject name..."
              className="form-input w-full p-2 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-text mb-2">Difficulty Level</label>
            <select
              value={newSubjectLevel}
              onChange={(e) => setNewSubjectLevel(e.target.value as SubjectLevel)}
              className="form-select w-full p-2 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent"
            >
              {Object.values(SubjectLevel).map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-text mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setNewSubjectColor(color)}
                  className={`w-8 h-8 rounded-full ${color} border-2 transition-all ${
                    newSubjectColor === color ? 'border-primary scale-110' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-subtle text-subtle-text px-4 py-2 rounded-md hover:bg-subtle-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSubject}
              disabled={!newSubjectName.trim()}
              className="bg-primary text-primary-text px-4 py-2 rounded-md hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              Add Subject
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SubjectView;