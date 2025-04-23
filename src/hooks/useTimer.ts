import { useState, useEffect, useRef, useCallback } from 'react';

export enum TimerStatus {
  Initial = 'initial',
  Running = 'running',
  Paused = 'paused',
  Finished = 'finished',
}

interface UseTimerReturn {
  status: TimerStatus;
  remainingSeconds: number;
  totalSeconds: number;
  setTotalDuration: (seconds: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
}

export const useTimer = (initialTotalSeconds: number): UseTimerReturn => {
  const [totalSeconds, setTotalSecondsState] = useState<number>(initialTotalSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(initialTotalSeconds);
  const [status, setStatus] = useState<TimerStatus>(TimerStatus.Initial);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('Timer interval cleared.');
    }
  }, []);

  useEffect(() => {
    if (status === TimerStatus.Running) {
      clearTimerInterval();
      console.log('Starting timer interval...');
      intervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearTimerInterval();
            setStatus(TimerStatus.Finished);
            console.log('Timer reached zero.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearTimerInterval();
    }
    return clearTimerInterval;
  }, [status, clearTimerInterval]);

   useEffect(() => {
       let timeoutId: NodeJS.Timeout | null = null;
       if (status === TimerStatus.Finished) {
           console.log('Setting timeout to reset timer after finish...');
           timeoutId = setTimeout(() => {
               console.log('Resetting timer after finish...');
               setRemainingSeconds(totalSeconds);
               setStatus(TimerStatus.Initial);
           }, 3000);
       }
       return () => {
           if (timeoutId) {
               clearTimeout(timeoutId);
               console.log('Cleared reset timeout.');
           }
       };
   }, [status, totalSeconds]);

  const setTotalDuration = useCallback((seconds: number) => {
    if (seconds > 0 && status !== TimerStatus.Running) {
      setTotalSecondsState(seconds);
      setRemainingSeconds(seconds);
      setStatus(TimerStatus.Initial);
      clearTimerInterval();
      console.log(`Total duration set to ${seconds} seconds.`);
    }
  }, [status, clearTimerInterval]);

  const startTimer = useCallback(() => {
    if (status === TimerStatus.Initial || status === TimerStatus.Paused) {
      setStatus(TimerStatus.Running);
       console.log('Timer start requested.');
    }
  }, [status]);

  const pauseTimer = useCallback(() => {
    if (status === TimerStatus.Running) {
      setStatus(TimerStatus.Paused);
      console.log('Timer pause requested.');
    }
  }, [status]);

  // --- ИСПРАВЛЕНО ЗДЕСЬ ---
  const stopTimer = useCallback(() => {
    if (status !== TimerStatus.Initial) {
      setStatus(TimerStatus.Initial);
      setRemainingSeconds(totalSeconds); // totalSeconds используется
      console.log('Timer stop requested.');
    }
  }, [status, totalSeconds]); // <-- totalSeconds добавлен в зависимости
  // -----------------------

  return {
    status,
    remainingSeconds,
    totalSeconds,
    setTotalDuration,
    startTimer,
    pauseTimer,
    stopTimer,
  };
};
