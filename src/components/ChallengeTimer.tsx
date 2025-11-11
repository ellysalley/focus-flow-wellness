import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface ChallengeTimerProps {
  duration: string; // e.g., "5 min", "10 min"
  onComplete: () => void;
  isStarted: boolean;
}

const ChallengeTimer = ({ duration, onComplete, isStarted }: ChallengeTimerProps) => {
  const parseDuration = (durationStr: string): number => {
    const match = durationStr.match(/(\d+)\s*(min|mins|minute|minutes|sec|secs|second|seconds|hr|hrs|hour|hours)/i);
    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    if (unit.startsWith('min')) return value * 60;
    if (unit.startsWith('sec')) return value;
    if (unit.startsWith('hr') || unit.startsWith('hour')) return value * 3600;

    return 0;
  };

  const totalSeconds = parseDuration(duration);
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isStarted) {
      setRemainingSeconds(totalSeconds);
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      // Auto-start timer when challenge is started
      setIsRunning(true);
    }
  }, [isStarted, totalSeconds]);

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, remainingSeconds]);

  useEffect(() => {
    if (remainingSeconds === 0 && totalSeconds > 0 && isStarted) {
      // Timer completed - auto complete the challenge
      setTimeout(() => {
        onComplete();
      }, 500);
    }
  }, [remainingSeconds, totalSeconds, isStarted, onComplete]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  if (!isStarted || totalSeconds === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
      <div className="flex items-center justify-between mb-3">
        <div className="text-3xl font-bold text-primary font-mono">
          {formatTime(remainingSeconds)}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={toggleTimer}
            className="h-8 w-8 p-0"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={resetTimer}
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {remainingSeconds === 0 && (
        <p className="text-sm text-accent font-medium mt-2 text-center animate-pulse">
          Time's up! Completing challenge...
        </p>
      )}
    </div>
  );
};

export default ChallengeTimer;
