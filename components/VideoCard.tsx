import React, { useState } from 'react';
import { Video } from '../types';
import CircularProgressBar from './CircularProgressBar';

interface VideoCardProps {
  video: Video;
  onUpdate: (updatedVideo: Video) => void;
  onDelete: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [watchedMinutes, setWatchedMinutes] = useState(0);

  const progress = video.totalDuration > 0 ? (video.watchedDuration / video.totalDuration) * 100 : 0;
  const remainingDuration = video.totalDuration - video.watchedDuration;

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleAddWatchTime = () => {
    if (watchedMinutes > 0) {
      const newWatchedDuration = Math.min(
        video.watchedDuration + (watchedMinutes * 60),
        video.totalDuration
      );
      
      const today = new Date().toISOString().split('T')[0];
      const updatedTimestamps = video.trackStreak && !video.sessionTimestamps.includes(today)
        ? [...video.sessionTimestamps, today]
        : video.sessionTimestamps;

      onUpdate({
        ...video,
        watchedDuration: newWatchedDuration,
        sessionTimestamps: updatedTimestamps
      });
      setWatchedMinutes(0);
    }
  };

  const handleMarkComplete = () => {
    const today = new Date().toISOString().split('T')[0];
    const updatedTimestamps = video.trackStreak && !video.sessionTimestamps.includes(today)
      ? [...video.sessionTimestamps, today]
      : video.sessionTimestamps;

    onUpdate({
      ...video,
      watchedDuration: video.totalDuration,
      sessionTimestamps: updatedTimestamps
    });
  };

  const calculateStreak = (): number => {
    if (!video.trackStreak) return 0;
    
    const sortedDates = [...new Set(video.sessionTimestamps)]
      .map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());
    
    if (sortedDates.length === 0) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    let currentDate = new Date();

    const isTodayCompleted = sortedDates.some(d => d.toISOString().split('T')[0] === today);
    if (isTodayCompleted) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterdayCompleted = sortedDates.some(d => 
        d.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]
      );
      if (!isYesterdayCompleted && sortedDates.length > 0) return 0;
    }
    
    for (let i = isTodayCompleted ? 1 : 0; i < sortedDates.length; i++) {
      const date = sortedDates[i];
      const expectedDate = new Date(currentDate);
      if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  return (
    <div className="bg-card rounded-lg shadow-lg p-6 border border-card-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${video.color}`}></div>
          <h3 className="text-xl font-bold text-card-text">{video.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <CircularProgressBar 
            percentage={progress} 
            color={video.color.replace('bg-', 'text-')} 
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
        <div className="flex justify-between text-sm text-subtle-text mb-2">
          <span>Watched: {formatDuration(video.watchedDuration)}</span>
          <span>Total: {formatDuration(video.totalDuration)}</span>
        </div>
        <div className="w-full bg-subtle rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${video.color}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        {remainingDuration > 0 && (
          <p className="text-xs text-subtle-text mt-1">
            {formatDuration(remainingDuration)} remaining
          </p>
        )}
      </div>

      {video.trackStreak && (
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{currentStreak}</div>
            <div className="text-xs text-subtle-text">Day Streak</div>
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-subtle-border">
          {video.description && (
            <div>
              <h4 className="font-semibold text-card-text mb-2">Description</h4>
              <p className="text-sm text-subtle-text">{video.description}</p>
            </div>
          )}

          {video.link && (
            <div>
              <h4 className="font-semibold text-card-text mb-2">Link</h4>
              <a 
                href={video.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline break-all"
              >
                {video.link}
              </a>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-card-text mb-2">Add Watch Time</h4>
            <div className="flex gap-2">
              <input
                type="number"
                value={watchedMinutes}
                onChange={(e) => setWatchedMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="Minutes watched"
                className="form-input flex-grow bg-interactive rounded-md p-2 text-sm focus:ring-2 focus:ring-primary border-transparent"
                min="0"
              />
              <button
                onClick={handleAddWatchTime}
                disabled={watchedMinutes <= 0}
                className="bg-primary text-primary-text px-4 py-2 rounded-md text-sm hover:bg-primary-hover disabled:opacity-50"
              >
                Add Time
              </button>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleMarkComplete}
              disabled={progress >= 100}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
            >
              Mark Complete
            </button>
            <button
              onClick={onDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
            >
              Delete Video
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCard;