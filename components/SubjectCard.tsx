import React, { useState } from 'react';
import { Subject, SubjectLevel, Topic, SubTopic } from '../types';
import CircularProgressBar from './CircularProgressBar';
import NoteEditor from './NoteEditor';
import MarkdownRenderer from './MarkdownRenderer';

interface SubjectCardProps {
  subject: Subject;
  onUpdate: (updatedSubject: Subject) => void;
  onDelete: () => void;
  apiKey: string;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onUpdate, onDelete, apiKey }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState<{ type: 'subject' | 'topic'; id?: string } | null>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [newSubTopicName, setNewSubTopicName] = useState('');
  const [addingTopicTo, setAddingTopicTo] = useState<string | null>(null);

  const allSubTopics = subject.topics.flatMap(t => t.subTopics);
  const completedSubTopics = allSubTopics.filter(st => st.completed);
  const progress = allSubTopics.length > 0 ? (completedSubTopics.length / allSubTopics.length) * 100 : 0;

  const handleSubTopicToggle = (topicId: string, subTopicId: string) => {
    const updatedTopics = subject.topics.map(topic => 
      topic.id === topicId 
        ? { ...topic, subTopics: topic.subTopics.map(st => 
            st.id === subTopicId ? { ...st, completed: !st.completed } : st
          )}
        : topic
    );
    onUpdate({ ...subject, topics: updatedTopics });
  };

  const handleAddTopic = () => {
    if (!newTopicName.trim()) return;
    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      name: newTopicName.trim(),
      notes: '',
      subTopics: [],
      attachments: []
    };
    onUpdate({ ...subject, topics: [...subject.topics, newTopic] });
    setNewTopicName('');
  };

  const handleAddSubTopic = (topicId: string) => {
    if (!newSubTopicName.trim()) return;
    const newSubTopic: SubTopic = {
      id: `subtopic-${Date.now()}`,
      name: newSubTopicName.trim(),
      completed: false
    };
    const updatedTopics = subject.topics.map(topic =>
      topic.id === topicId 
        ? { ...topic, subTopics: [...topic.subTopics, newSubTopic] }
        : topic
    );
    onUpdate({ ...subject, topics: updatedTopics });
    setNewSubTopicName('');
    setAddingTopicTo(null);
  };

  const handleNoteSave = (newNote: string) => {
    if (editingNotes?.type === 'subject') {
      onUpdate({ ...subject, notes: newNote });
    } else if (editingNotes?.type === 'topic' && editingNotes.id) {
      const updatedTopics = subject.topics.map(topic =>
        topic.id === editingNotes.id ? { ...topic, notes: newNote } : topic
      );
      onUpdate({ ...subject, topics: updatedTopics });
    }
    setEditingNotes(null);
  };

  const handleStudySession = () => {
    const today = new Date().toISOString().split('T')[0];
    if (!subject.sessionTimestamps.includes(today)) {
      onUpdate({ 
        ...subject, 
        sessionTimestamps: [...subject.sessionTimestamps, today] 
      });
    }
  };

  const levelColors = {
    [SubjectLevel.Small]: 'text-green-500',
    [SubjectLevel.Medium]: 'text-yellow-500',
    [SubjectLevel.Large]: 'text-orange-500',
    [SubjectLevel.Insane]: 'text-red-500',
  };

  return (
    <div className="bg-card rounded-lg shadow-lg p-6 border border-card-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${subject.color}`}></div>
          <h3 className="text-xl font-bold text-card-text">{subject.name}</h3>
          <span className={`text-sm font-medium ${levelColors[subject.level]}`}>
            {subject.level}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CircularProgressBar 
            percentage={progress} 
            color={subject.color.replace('bg-', 'text-')} 
            size={48}
          />
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-subtle-text hover:text-primary transition-colors"
          >
            <svg className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-subtle-text">
          {completedSubTopics.length} of {allSubTopics.length} subtopics completed
        </p>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Subject Notes */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-card-text">Subject Notes</h4>
              <button
                onClick={() => setEditingNotes({ type: 'subject' })}
                className="text-sm text-primary hover:underline"
              >
                {subject.notes ? 'Edit' : 'Add Notes'}
              </button>
            </div>
            {editingNotes?.type === 'subject' ? (
              <NoteEditor
                onSave={handleNoteSave}
                onCancel={() => setEditingNotes(null)}
                initialNote={subject.notes}
                apiKey={apiKey}
              />
            ) : subject.notes ? (
              <div className="bg-interactive p-3 rounded-md">
                <MarkdownRenderer content={subject.notes} />
              </div>
            ) : (
              <p className="text-subtle-text text-sm italic">No notes added yet</p>
            )}
          </div>

          {/* Topics */}
          <div>
            <h4 className="font-semibold text-card-text mb-3">Topics</h4>
            <div className="space-y-3">
              {subject.topics.map(topic => (
                <div key={topic.id} className="bg-interactive p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium text-card-text">{topic.name}</h5>
                    <button
                      onClick={() => setEditingNotes({ type: 'topic', id: topic.id })}
                      className="text-xs text-primary hover:underline"
                    >
                      {topic.notes ? 'Edit Notes' : 'Add Notes'}
                    </button>
                  </div>
                  
                  {editingNotes?.type === 'topic' && editingNotes.id === topic.id ? (
                    <NoteEditor
                      onSave={handleNoteSave}
                      onCancel={() => setEditingNotes(null)}
                      initialNote={topic.notes}
                      apiKey={apiKey}
                    />
                  ) : topic.notes ? (
                    <div className="mb-3">
                      <MarkdownRenderer content={topic.notes} />
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    {topic.subTopics.map(subTopic => (
                      <div key={subTopic.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={subTopic.completed}
                          onChange={() => handleSubTopicToggle(topic.id, subTopic.id)}
                          className="form-checkbox h-4 w-4 text-primary focus:ring-primary rounded"
                        />
                        <span className={`text-sm ${subTopic.completed ? 'line-through text-subtle-text' : 'text-card-text'}`}>
                          {subTopic.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {addingTopicTo === topic.id ? (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={newSubTopicName}
                        onChange={(e) => setNewSubTopicName(e.target.value)}
                        placeholder="Subtopic name..."
                        className="form-input flex-grow bg-card rounded-md p-2 text-sm focus:ring-2 focus:ring-primary border-transparent"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSubTopic(topic.id)}
                      />
                      <button
                        onClick={() => handleAddSubTopic(topic.id)}
                        className="bg-primary text-primary-text px-3 py-1 rounded-md text-sm hover:bg-primary-hover"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setAddingTopicTo(null)}
                        className="bg-subtle text-subtle-text px-3 py-1 rounded-md text-sm hover:bg-subtle-hover"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingTopicTo(topic.id)}
                      className="text-sm text-primary hover:underline mt-2"
                    >
                      + Add Subtopic
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="New topic name..."
                className="form-input flex-grow bg-interactive rounded-md p-2 text-sm focus:ring-2 focus:ring-primary border-transparent"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
              />
              <button
                onClick={handleAddTopic}
                className="bg-primary text-primary-text px-4 py-2 rounded-md text-sm hover:bg-primary-hover"
              >
                Add Topic
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-subtle-border">
            <button
              onClick={handleStudySession}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
            >
              Mark Study Session
            </button>
            <button
              onClick={onDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
            >
              Delete Subject
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectCard;