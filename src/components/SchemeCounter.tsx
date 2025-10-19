import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

interface SchemeCounterProps {
  count: number;
}

export const SchemeCounter = ({ count }: SchemeCounterProps) => {
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
    <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30 transition-all duration-300 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
      <div className="flex items-center gap-2">
        <TrendingUp className={`w-5 h-5 text-white transition-transform duration-300 ${isAnimating ? 'rotate-12' : 'rotate-0'}`} />
        <div className="text-left">
          <p className="text-xs font-medium text-white/80">Registration Completed</p>
          <p className={`text-2xl font-bold text-white tabular-nums tracking-tight transition-all duration-300 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
            {displayCount}
          </p>
        </div>
      </div>
    </div>
  );
};
