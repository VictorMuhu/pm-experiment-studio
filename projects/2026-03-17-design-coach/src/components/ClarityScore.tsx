import { useMemo } from 'react';

interface ClarityScoreProps {
  score: number;
}

export function ClarityScore({ score }: ClarityScoreProps) {
  const color = useMemo(() => {
    if (score >= 80) return 'hsl(142, 71%, 45%)';
    if (score >= 50) return 'hsl(217, 91%, 60%)';
    if (score >= 30) return 'hsl(38, 92%, 50%)';
    return 'hsl(0, 84%, 60%)';
  }, [score]);

  const circumference = 2 * Math.PI * 18;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-10 h-10">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
          <circle
            cx="20" cy="20" r="18"
            fill="none"
            stroke="hsl(240, 4%, 16%)"
            strokeWidth="2.5"
          />
          <circle
            cx="20" cy="20" r="18"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 300ms ease, stroke 300ms ease' }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center font-mono-system text-[11px] font-medium"
          style={{ color }}
        >
          {score}
        </span>
      </div>
    </div>
  );
}
