import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle2, Zap, ArrowRight, Target, Users, BarChart3, Lightbulb } from 'lucide-react';
import { ClarityScore } from './ClarityScore';
import { TradeoffSlider } from './TradeoffSlider';
import { useState } from 'react';

function EditableField({ label, icon: Icon, value, onChange }: { label: string; icon: React.ElementType; value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    setEditing(false);
    if (draft.trim() !== value) onChange(draft.trim());
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3 h-3 text-primary/70" />
        <span className="font-mono-system text-[10px] text-muted-foreground">{label}</span>
      </div>
      {editing ? (
        <textarea
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit(); } }}
          rows={2}
          className="w-full bg-background border border-primary/30 rounded px-2 py-1.5 text-[11px] text-foreground outline-none resize-none leading-tight"
        />
      ) : (
        <p
          onClick={() => { setDraft(value); setEditing(true); }}
          className="text-[11px] text-foreground/80 leading-tight cursor-text hover:bg-accent/30 rounded px-1 py-0.5 -mx-1 transition-colors"
        >
          {value || <span className="text-muted-foreground/50 italic">Click to define…</span>}
        </p>
      )}
    </div>
  );
}

export function InspectorPanel() {
  const { getActiveFlow, selectedNodeId, selectNode, stressTestActive, resolveEdgeCase, getClarityScore, updateProblemDefinition, updateTradeoffValue } = useApp();
  const flow = getActiveFlow();

  if (!flow) return null;

  const selectedNode = selectedNodeId ? flow.nodes.find(n => n.id === selectedNodeId) : null;
  const nodeEdgeCases = selectedNode
    ? flow.edgeCases.filter(ec => ec.nodeId === selectedNode.id)
    : flow.edgeCases;

  const unresolvedCount = flow.edgeCases.filter(ec => !ec.resolved).length;
  const score = getClarityScore(flow);

  const severityColors: Record<string, string> = {
    low: 'text-muted-foreground',
    medium: 'text-warning',
    high: 'text-warning',
    critical: 'text-destructive',
  };

  const pd = flow.problemDefinition;

  return (
    <motion.aside
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="w-[320px] min-w-[320px] h-full overflow-y-auto surface-machined border-l border-border/30"
    >
      {/* Problem Definition */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center gap-1.5 mb-3">
          <Lightbulb className="w-3.5 h-3.5 text-primary" />
          <span className="text-label text-muted-foreground">Problem Definition</span>
        </div>
        <div className="space-y-3">
          <EditableField
            label="HYPOTHESIS"
            icon={Target}
            value={pd.hypothesis}
            onChange={v => updateProblemDefinition(flow.id, { hypothesis: v })}
          />
          <EditableField
            label="TARGET USER"
            icon={Users}
            value={pd.targetUser}
            onChange={v => updateProblemDefinition(flow.id, { targetUser: v })}
          />
          <EditableField
            label="SUCCESS METRICS"
            icon={BarChart3}
            value={pd.successMetrics}
            onChange={v => updateProblemDefinition(flow.id, { successMetrics: v })}
          />
        </div>
      </div>

      {/* Clarity Score Header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <span className="text-label text-muted-foreground">Flow Integrity</span>
          <ClarityScore score={score} />
        </div>
        <div className="flex gap-2 text-[11px]">
          <span className="font-mono-system text-muted-foreground">
            {flow.nodes.length} steps
          </span>
          <span className="text-border">·</span>
          <span className="font-mono-system text-muted-foreground">
            {flow.edgeCases.length} edge cases
          </span>
          <span className="text-border">·</span>
          <span className={`font-mono-system ${unresolvedCount > 0 ? 'text-warning' : 'text-success'}`}>
            {unresolvedCount} gaps
          </span>
        </div>
      </div>

      {/* Selected Node Info */}
      <AnimatePresence mode="wait">
        {selectedNode && (
          <motion.div
            key={selectedNode.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.12 }}
            className="p-4 border-b border-border/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-label text-primary">Selected Node</span>
              <button onClick={() => selectNode(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="text-sm font-medium mb-1">{selectedNode.label}</h3>
            <p className="text-[11px] text-muted-foreground mb-2">{selectedNode.description}</p>
            <div className="flex items-center gap-2">
              <span className="font-mono-system text-[10px] text-muted-foreground/60">ID: {selectedNode.id}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edge Cases */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center gap-1.5 mb-3">
          <AlertTriangle className="w-3.5 h-3.5 text-warning" />
          <span className="text-label text-muted-foreground">
            {selectedNode ? `Edge Cases · ${selectedNode.label}` : 'All Edge Cases'}
          </span>
        </div>

        <div className="space-y-2">
          {nodeEdgeCases.length === 0 ? (
            <div className="surface-inner p-3">
              <p className="text-[11px] text-muted-foreground">No edge cases identified for this node.</p>
            </div>
          ) : (
            nodeEdgeCases.map(ec => (
              <div
                key={ec.id}
                className={`edge-case-card p-3 transition-all duration-150 ${ec.resolved ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-medium">{ec.label}</span>
                  <span className={`font-mono-system text-[10px] ${severityColors[ec.severity]}`}>
                    {ec.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight mb-2">{ec.description}</p>
                {!ec.resolved ? (
                  <button
                    onClick={() => resolveEdgeCase(flow.id, ec.id)}
                    className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Resolve
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-success font-mono-system">
                    <CheckCircle2 className="w-3 h-3" />
                    DOCUMENTED
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tradeoffs */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center gap-1.5 mb-3">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-label text-muted-foreground">Tradeoff Panel</span>
        </div>
        <div className="space-y-4">
          {flow.tradeoffs.map(tr => (
            <TradeoffSlider key={tr.id} tradeoff={tr} onChange={(v) => updateTradeoffValue(flow.id, tr.id, v)} />
          ))}
        </div>
      </div>

      {/* Failure Modes */}
      {stressTestActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4"
        >
          <div className="flex items-center gap-1.5 mb-3">
            <ArrowRight className="w-3.5 h-3.5 text-destructive" />
            <span className="text-label text-destructive">Failure Mode Analysis</span>
          </div>
          <div className="space-y-2">
            {flow.edgeCases.filter(ec => ec.severity === 'critical' && !ec.resolved).map(ec => (
              <div key={ec.id} className="surface-inner p-3 border-l-2 border-destructive">
                <span className="text-xs font-medium">{ec.label}</span>
                <p className="text-[11px] text-muted-foreground mt-1">{ec.description}</p>
                <p className="text-[10px] text-destructive font-mono-system mt-1.5">UNHANDLED FAILURE STATE</p>
              </div>
            ))}
            {flow.edgeCases.filter(ec => ec.severity === 'critical' && !ec.resolved).length === 0 && (
              <div className="surface-inner p-3">
                <p className="text-[11px] text-success font-mono-system">ALL CRITICAL PATHS DOCUMENTED</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
}
