import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  iconColor?: string;
}

const StatCard = ({ icon: Icon, value, label, iconColor = "text-primary" }: StatCardProps) => {
  return (
    <Card className="p-4 flex flex-col items-center gap-2 border-border shadow-sm hover:shadow-md transition-shadow">
      <Icon className={`h-6 w-6 ${iconColor}`} />
      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  );
};

export default StatCard;
