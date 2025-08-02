import React, { useState } from 'react';
import { Video } from '../types';
import VideoCard from './VideoCard';
import Modal from './Modal';

interface VideoViewProps {
  videos: Video[];
  setVideos: React.Dispatch<React.SetStateAction<Video[]>>;
}

const VideoView: React.FC<VideoViewProps> = ({ videos, setVideos }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVideoName, setNewVideoName] = useState('');
  const [newVideoLink, setNewVideoLink] = useState('');
  const [newVideoDescription, setNewVideoDescription] = useState('');
  const [newVideoTotalDuration, setNewVideoTotalDuration] = useState(0);
  const [newVideoColor, setNewVideoColor] = useState('bg-blue-500');
  const [newVideoTrackStreak, setNewVideoTrackStreak] = useState(true);

  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
    'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];

  const handleAddVideo = () => {
    if (!newVideoName.trim() || newVideoTotalDuration <= 0) return;

    const newVideo: Video = {
      id: `video-${Date.now()}`,
      name: newVideoName.trim(),
      color: newVideoColor,
      totalDuration: newVideoTotalDuration * 60, // Convert minutes to seconds
      watchedDuration: 0,
      trackStreak: newVideoTrackStreak,
      sessionTimestamps: [],
      link: newVideoLink.trim() || undefined,
      description: newVideoDescription.trim() || undefined
    };

    setVideos(prev => [...prev, newVideo]);
    setNewVideoName('');
    setNewVideoLink('');
    setNewVideoDescription('');
    setNewVideoTotalDuration(0);
    setNewVideoColor('bg-blue-500');
    setNewVideoTrackStreak(true);
    setIsModalOpen(false);
  };

  const handleUpdateVideo = (updatedVideo: Video) => {
    setVideos(prev => prev.map(video => 
      video.id === updatedVideo.id ? updatedVideo : video
    ));
  };

  const handleDeleteVideo = (videoId: string) => {
    if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      setVideos(prev => prev.filter(video => video.id !== videoId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-card-text">Videos</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-text px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
        >
          Add Video
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-subtle-text mb-4">No videos added yet.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-primary-text px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors"
          >
            Add Your First Video
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {videos.map(video => (
            <VideoCard
              key={video.id}
              video={video}
              onUpdate={handleUpdateVideo}
              onDelete={() => handleDeleteVideo(video.id)}
            />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Video">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-text mb-2">Video Name</label>
            <input
              type="text"
              value={newVideoName}
              onChange={(e) => setNewVideoName(e.target.value)}
              placeholder="Enter video name..."
              className="form-input w-full p-2 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-text mb-2">Total Duration (minutes)</label>
            <input
              type="number"
              value={newVideoTotalDuration}
              onChange={(e) => setNewVideoTotalDuration(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="Enter total duration in minutes..."
              className="form-input w-full p-2 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-text mb-2">Video Link (optional)</label>
            <input
              type="url"
              value={newVideoLink}
              onChange={(e) => setNewVideoLink(e.target.value)}
              placeholder="https://..."
              className="form-input w-full p-2 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-text mb-2">Description (optional)</label>
            <textarea
              value={newVideoDescription}
              onChange={(e) => setNewVideoDescription(e.target.value)}
              placeholder="Enter video description..."
              rows={3}
              className="form-textarea w-full p-2 bg-interactive rounded-md focus:ring-2 focus:ring-primary border-transparent resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-text mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setNewVideoColor(color)}
                  className={`w-8 h-8 rounded-full ${color} border-2 transition-all ${
                    newVideoColor === color ? 'border-primary scale-110' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="trackStreak"
              checked={newVideoTrackStreak}
              onChange={(e) => setNewVideoTrackStreak(e.target.checked)}
              className="form-checkbox h-4 w-4 text-primary focus:ring-primary rounded"
            />
            <label htmlFor="trackStreak" className="text-sm text-card-text">
              Track daily viewing streak
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-subtle text-subtle-text px-4 py-2 rounded-md hover:bg-subtle-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddVideo}
              disabled={!newVideoName.trim() || newVideoTotalDuration <= 0}
              className="bg-primary text-primary-text px-4 py-2 rounded-md hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              Add Video
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VideoView;