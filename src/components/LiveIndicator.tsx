import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
  isLive: boolean;
  lastUpdated?: Date;
  className?: string;
}

export const LiveIndicator = ({ isLive, lastUpdated, className }: LiveIndicatorProps) => {
  const getTimeAgo = (date?: Date) => {
    if (!date) return "Never";
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 10) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex items-center">
        <Circle
          className={cn(
            "h-2 w-2 fill-current",
            isLive ? "text-success animate-pulse-soft" : "text-muted-foreground"
          )}
        />
        {isLive && (
          <Circle className="absolute h-2 w-2 animate-ping text-success fill-current opacity-50" />
        )}
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        {isLive ? "Live" : "Offline"} • Updated {getTimeAgo(lastUpdated)}
      </span>
    </div>
  );
};
