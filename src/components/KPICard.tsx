import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  iconColor?: string;
}

export const KPICard = ({ title, value, change, icon: Icon, trend = "neutral", iconColor }: KPICardProps) => {
  const trendColor = {
    up: "text-success",
    down: "text-destructive",
    neutral: "text-muted-foreground",
  }[trend];

  const iconBgColor = iconColor || "bg-primary/10";

  return (
    <Card className="card-hover border-border/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {change !== undefined && (
              <p className={cn("text-sm font-medium", trendColor)}>
                {change > 0 ? "+" : ""}
                {change}%
              </p>
            )}
          </div>
          <div className={cn("p-3 rounded-xl", iconBgColor)}>
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
