import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface LeadCounterProps {
  count: number;
}

export const LeadCounter = ({ count }: LeadCounterProps) => {
  const [displayCount, setDisplayCount] = useState(count);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (count !== displayCount) {
      setIsAnimating(true);
      
      // Animate the counter
      const duration = 500;
      const steps = 20;
      const increment = (count - displayCount) / steps;
      let current = displayCount;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current += increment;
        
        if (step >= steps) {
          setDisplayCount(count);
          clearInterval(timer);
          setTimeout(() => setIsAnimating(false), 300);
        } else {
          setDisplayCount(Math.round(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [count, displayCount]);

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#1c2128] border border-[#30363d] hover:border-[#3fb950] transition-all duration-200 group">
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className={`w-8 h-8 rounded-md bg-[#3fb950]/10 flex items-center justify-center transition-all duration-300 ${isAnimating ? 'scale-110 bg-[#3fb950]/20' : 'scale-100'}`}>
            <CheckCircle2 className={`w-4 h-4 text-[#3fb950] transition-transform duration-300 ${isAnimating ? 'rotate-12' : 'rotate-0'}`} />
          </div>
          {displayCount > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#3fb950] rounded-full animate-pulse"></div>
          )}
        </div>
        <div className="text-left">
          <p className="text-xs font-medium text-[#7d8590] group-hover:text-[#8b949e] transition-colors">Completed Leads</p>
          <p className={`text-lg font-bold text-[#e6edf3] tabular-nums tracking-tight transition-all duration-300 ${isAnimating ? 'scale-110 text-[#3fb950]' : 'scale-100'}`}>
            {displayCount.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};
