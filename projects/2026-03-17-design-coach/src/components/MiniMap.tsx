import { useApp } from '@/context/AppContext';
import { useMemo } from 'react';

export function MiniMap() {
  const { getActiveFlow } = useApp();
  const flow = getActiveFlow();

  const paths = useMemo(() => {
    if (!flow) return { nodes: [], lines: [] };

    const maxX = Math.max(...flow.nodes.map(n => n.x)) + 180;
    const maxY = Math.max(...flow.nodes.map(n => n.y)) + 80;
    const scaleX = 120 / maxX;
    const scaleY = 60 / maxY;

    const nodes = flow.nodes.map(n => ({
      x: n.x * scaleX + 8,
      y: n.y * scaleY + 8,
      w: 180 * scaleX,
      h: 40 * scaleY,
    }));

    const lines = flow.edges.map(e => {
      const from = flow.nodes.find(n => n.id === e.from);
      const to = flow.nodes.find(n => n.id === e.to);
      if (!from || !to) return null;
      return {
        x1: (from.x + 180) * scaleX + 8,
        y1: (from.y + 40) * scaleY + 8,
        x2: to.x * scaleX + 8,
        y2: (to.y + 40) * scaleY + 8,
      };
    }).filter(Boolean);

    return { nodes, lines };
  }, [flow]);

  if (!flow) return null;

  return (
    <div className="absolute bottom-3 left-3 w-[136px] h-[76px] surface-inner p-1 opacity-40 hover:opacity-70 transition-opacity">
      <svg className="w-full h-full" viewBox="0 0 136 76">
        {paths.lines.map((l, i) => l && (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="hsl(240, 5%, 30%)" strokeWidth="0.5" />
        ))}
        {paths.nodes.map((n, i) => (
          <rect key={i} x={n.x} y={n.y} width={n.w} height={n.h} fill="none" stroke="hsl(240, 5%, 35%)" strokeWidth="0.5" rx="1" />
        ))}
      </svg>
    </div>
  );
}
