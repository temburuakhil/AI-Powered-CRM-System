import { Button } from "@/components/ui/button";
import { RefreshCw, Settings2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RefreshControlProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  interval: number;
  onIntervalChange: (interval: number) => void;
}

export const RefreshControl = ({
  onRefresh,
  isRefreshing,
  interval,
  onIntervalChange,
}: RefreshControlProps) => {
  const intervals = [
    { value: 10000, label: "10 seconds" },
    { value: 30000, label: "30 seconds" },
    { value: 60000, label: "1 minute" },
    { value: 300000, label: "5 minutes" },
  ];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Settings2 className="h-4 w-4 text-muted-foreground" />
        <Select value={interval.toString()} onValueChange={(v) => onIntervalChange(Number(v))}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Refresh interval" />
          </SelectTrigger>
          <SelectContent>
            {intervals.map((int) => (
              <SelectItem key={int.value} value={int.value.toString()}>
                {int.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
  );
};
