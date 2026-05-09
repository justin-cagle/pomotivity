import { useState, useEffect, useRef } from 'react';

export function useTimer(settings) {
  // states: 'IDLE', 'WORK', 'BREAK', 'PAUSED_WORK', 'PAUSED_BREAK'
  const [timerState, setTimerState] = useState('IDLE');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  
  const intervalRef = useRef(null);

  // Update timeleft if idle and settings change
  useEffect(() => {
    if (timerState === 'IDLE') {
      setTimeLeft(settings.workDuration * 60);
    }
  }, [settings.workDuration, timerState]);

  const startTimer = () => {
    if (timerState === 'IDLE' || timerState === 'PAUSED_WORK') {
      setTimerState('WORK');
    } else if (timerState === 'PAUSED_BREAK') {
      setTimerState('BREAK');
    }
  };

  const pauseTimer = () => {
    if (timerState === 'WORK') setTimerState('PAUSED_WORK');
    if (timerState === 'BREAK') setTimerState('PAUSED_BREAK');
  };

  const resetTimer = () => {
    setTimerState('IDLE');
    setTimeLeft(settings.workDuration * 60);
  };

  const skipPhase = () => {
    if (timerState === 'WORK' || timerState === 'PAUSED_WORK' || timerState === 'IDLE') {
      setTimerState('BREAK');
      setTimeLeft(settings.breakDuration * 60);
    } else {
      if (settings.autoStartWork) {
        setTimerState('WORK');
      } else {
        setTimerState('IDLE');
      }
      setTimeLeft(settings.workDuration * 60);
    }
  };

  const skipBreak = () => {
    if (settings.autoStartWork) {
      setTimerState('WORK');
    } else {
      setTimerState('IDLE');
    }
    setTimeLeft(settings.workDuration * 60);
  };

  useEffect(() => {
    if (timerState === 'WORK' || timerState === 'BREAK') {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            // Auto transition
            if (timerState === 'WORK') {
              setTimerState('BREAK');
              return settings.breakDuration * 60;
            } else {
              if (settings.autoStartWork) {
                setTimerState('WORK');
              } else {
                setTimerState('IDLE');
              }
              return settings.workDuration * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [timerState, settings.workDuration, settings.breakDuration, settings.autoStartWork]);

  // Derived state for UI
  const totalDuration = (timerState === 'BREAK' || timerState === 'PAUSED_BREAK') 
    ? settings.breakDuration * 60 
    : settings.workDuration * 60;
  
  const progress = 1 - (timeLeft / totalDuration);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return {
    timerState,
    timeLeft,
    progress,
    formattedTime: formatTime(timeLeft),
    startTimer,
    pauseTimer,
    resetTimer,
    skipPhase,
    skipBreak,
    setTimerState
  };
}
