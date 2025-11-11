import { LucideIcon } from "lucide-react";

interface AchievementBadgeProps {
  icon: LucideIcon;
  title: string;
}

const AchievementBadge = ({ icon: Icon, title }: AchievementBadgeProps) => {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-[hsl(35,100%,85%)] to-[hsl(35,100%,70%)] border border-[hsl(35,100%,70%)]">
      <Icon className="h-5 w-5 text-[hsl(35,80%,30%)]" />
      <span className="text-sm font-medium text-[hsl(35,80%,30%)]">{title}</span>
    </div>
  );
};

export default AchievementBadge;
