import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  current: number;
  max: number;
  label: string;
}

const ProgressBar = ({ current, max, label }: ProgressBarProps) => {
  const percentage = (current / max) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">{label}</h3>
        <p className="text-sm text-muted-foreground">
          {current} / {max} XP
        </p>
      </div>
      <Progress value={percentage} className="h-3" />
      <p className="text-xs text-muted-foreground text-right">
        {max - current} XP to next level
      </p>
    </div>
  );
};

export default ProgressBar;
