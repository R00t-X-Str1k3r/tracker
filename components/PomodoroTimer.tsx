import React, { useState, useEffect, useRef } from 'react';

const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ResetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 12A8 8 0 1013 5.23M20 5l-7 7" /></svg>;
const MusicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>;

const PomodoroTimer: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [title, setTitle] = useState('Focus Session');
  const [alarmSrc, setAlarmSrc] = useState<string | null>(null);

  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        if (seconds > 0) {
          setSeconds(s => s - 1);
        } else if (minutes > 0) {
          setMinutes(m => m - 1);
          setSeconds(59);
        } else {
          // Timer finished
          if (audioRef.current) {
            audioRef.current.play();
          }
          setIsActive(false);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, minutes, seconds]);
  
  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (alarmSrc) {
        URL.revokeObjectURL(alarmSrc);
      }
    };
  }, [alarmSrc]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
  };

  const handleSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (alarmSrc) URL.revokeObjectURL(alarmSrc); // Revoke old URL
      const url = URL.createObjectURL(file);
      setAlarmSrc(url);
    }
  };

  return (
    <div className="bg-interactive p-3 rounded-lg">
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="form-input w-full bg-card rounded-md p-1.5 text-sm text-center font-semibold text-card-text focus:ring-2 focus:ring-primary border-transparent mb-2"
        placeholder="Session Title"
      />
      <div className="text-4xl font-mono font-bold text-center text-main-text my-2">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="flex justify-center items-center gap-4">
        <button onClick={resetTimer} className="p-2 text-subtle-text hover:text-primary transition-colors">
          <ResetIcon />
        </button>
        <button
          onClick={toggleTimer}
          className="p-2 text-subtle-text hover:text-primary transition-colors text-4xl"
        >
          {isActive ? <PauseIcon /> : <PlayIcon />}
        </button>
        <label className="p-2 text-subtle-text hover:text-primary transition-colors cursor-pointer">
          <MusicIcon />
          <input type="file" accept="audio/*" onChange={handleSoundUpload} className="hidden" />
        </label>
      </div>
      {alarmSrc && <audio ref={audioRef} src={alarmSrc} preload="auto" />}
    </div>
  );
};

export default PomodoroTimer;