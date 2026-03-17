import { useApp } from '@/context/AppContext';
import { FlowNode as FlowNodeType } from '@/types/flow';
import { motion } from 'framer-motion';

function StatusTag({ status }: { status: FlowNodeType['status'] }) {
  const colors: Record<string, string> = {
    validated: 'bg-success/15 text-success',
    defined: 'bg-primary/15 text-primary',
    'in-progress': 'bg-warning/15 text-warning',
    gap: 'bg-destructive/15 text-destructive',
  };

  return (
    <span className={`font-mono-system text-[10px] px-1.5 py-0.5 rounded-sm ${colors[status] || colors.defined}`}>
      {status.toUpperCase()}
    </span>
  );
}

interface FlowNodeProps {
  node: FlowNodeType;
  isSelected: boolean;
  stressTestActive: boolean;
  hasUnresolvedEdgeCases: boolean;
  onClick: () => void;
}

export function FlowNodeCard({ node, isSelected, stressTestActive, hasUnresolvedEdgeCases, onClick }: FlowNodeProps) {
  const isGhost = node.type === 'edge-case' || node.type === 'failure';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={`flow-node p-0 select-none ${isSelected ? 'selected' : ''} ${isGhost && !node.committed ? 'ghost' : ''} ${isGhost && node.committed ? 'ghost committed' : ''} ${stressTestActive && hasUnresolvedEdgeCases ? 'gap-pulse' : ''}`}
      onClick={onClick}
    >
      <div className="px-3 py-2 border-b border-border/30">
        <span className="text-xs font-medium text-foreground">{node.label}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2">{node.description}</p>
      </div>
      <div className="px-3 py-1.5 flex justify-between items-center">
        <StatusTag status={node.status} />
        <span className="font-mono-system text-[10px] text-muted-foreground/50">{node.id.slice(0, 8)}</span>
      </div>
    </motion.div>
  );
}
