import { Tradeoff } from '@/types/flow';

interface TradeoffSliderProps {
  tradeoff: Tradeoff;
  onChange: (value: number) => void;
}

export function TradeoffSlider({ tradeoff, onChange }: TradeoffSliderProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-muted-foreground">{tradeoff.left}</span>
        <span className="text-[11px] text-muted-foreground">{tradeoff.right}</span>
      </div>
      <div className="relative">
        <div
          className="h-1.5 rounded-full"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)), hsl(var(--muted)) 40%, hsl(var(--muted)) 60%, hsl(var(--warning)))`,
          }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={tradeoff.value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: '12px', top: '-3px' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-foreground border-2 border-background pointer-events-none"
          style={{ left: `calc(${tradeoff.value}% - 6px)`, top: '3px' }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground/70 leading-tight font-mono-system">
        {tradeoff.impact}
      </p>
    </div>
  );
}
