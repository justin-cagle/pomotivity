import { useState, useEffect, useRef } from 'react';

export function useTimer(settings) {
  // states: 'IDLE', 'WORK', 'BREAK', 'PAUSED_WORK', 'PAUSED_BREAK'
  const [timerState, setTimerState] = useState('IDLE');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);

  // Tracks the duration the current phase was started with, so progress bar
  // doesn't jump when settings change mid-session.
  const phaseDurationRef = useRef(settings.workDuration * 60);

  const intervalRef = useRef(null);

  // Update timeLeft and phaseDuration if idle and settings change
  useEffect(() => {
    if (timerState === 'IDLE') {
      phaseDurationRef.current = settings.workDuration * 60;
      setTimeLeft(settings.workDuration * 60);
    }
  }, [settings.workDuration, timerState]);

  const startTimer = () => {
    if (timerState === 'IDLE') {
      phaseDurationRef.current = settings.workDuration * 60;
      setTimerState('WORK');
    } else if (timerState === 'PAUSED_WORK') {
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
    phaseDurationRef.current = settings.workDuration * 60;
    setTimerState('IDLE');
    setTimeLeft(settings.workDuration * 60);
  };

  const skipPhase = () => {
    if (timerState === 'WORK' || timerState === 'PAUSED_WORK' || timerState === 'IDLE') {
      phaseDurationRef.current = settings.breakDuration * 60;
      setTimerState('BREAK');
      setTimeLeft(settings.breakDuration * 60);
    } else {
      phaseDurationRef.current = settings.workDuration * 60;
      if (settings.autoStartWork) {
        setTimerState('WORK');
      } else {
        setTimerState('IDLE');
      }
      setTimeLeft(settings.workDuration * 60);
    }
  };

  const skipBreak = () => {
    phaseDurationRef.current = settings.workDuration * 60;
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
          if (prev <= 0) {
            clearInterval(intervalRef.current);
            // Auto transition
            if (timerState === 'WORK') {
              phaseDurationRef.current = settings.breakDuration * 60;
              setTimerState('BREAK');
              return settings.breakDuration * 60;
            } else {
              phaseDurationRef.current = settings.workDuration * 60;
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

  const progress = 1 - (timeLeft / phaseDurationRef.current);

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
