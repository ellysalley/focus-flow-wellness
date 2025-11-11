import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChallengeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  duration: string;
  xp: number;
  completed?: boolean;
  onStart?: () => void;
}

const ChallengeCard = ({
  icon: Icon,
  title,
  description,
  duration,
  xp,
  completed = false,
  onStart,
}: ChallengeCardProps) => {
  return (
    <Card
      className={cn(
        "p-6 border-2 transition-all hover:shadow-md",
        completed
          ? "border-accent bg-success-light"
          : "border-border bg-card"
      )}
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className={cn(
            "p-3 rounded-full",
            completed ? "bg-accent" : "bg-primary"
          )}
        >
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {completed && (
          <Check className="h-6 w-6 text-accent" />
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
            <Clock className="h-3 w-3" />
            {duration}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            +{xp} XP
          </span>
        </div>
        
        {!completed && (
          <Button onClick={onStart} className="bg-primary hover:bg-primary/90">
            Start Challenge
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ChallengeCard;
