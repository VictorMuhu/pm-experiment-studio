import { useApp } from '@/context/AppContext';
import { Shield, Activity, GitBranch, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';
import { FlowNode } from '@/types/flow';

export function UtilityBar() {
  const { getActiveFlow, stressTestActive, toggleStressTest, flows, setActiveFlow, activeFlowId, getClarityScore, addNode } = useApp();
  const flow = getActiveFlow();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [nodeType, setNodeType] = useState<FlowNode['type']>('step');
  const [connectFrom, setConnectFrom] = useState('');

  const handleAdd = () => {
    if (!activeFlowId || !label.trim()) return;
    addNode(activeFlowId, {
      label: label.trim(),
      description: description.trim(),
      type: nodeType,
      status: 'defined',
      connectFrom: connectFrom || undefined,
    });
    setLabel('');
    setDescription('');
    setNodeType('step');
    setConnectFrom('');
    setOpen(false);
  };

  return (
    <header className="h-11 flex items-center justify-between px-4 surface-machined border-b border-border/50">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <GitBranch className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono-system text-label text-muted-foreground">Design Coach</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <select
          value={activeFlowId || ''}
          onChange={(e) => setActiveFlow(e.target.value)}
          className="bg-transparent text-foreground text-sm font-medium outline-none cursor-pointer"
        >
          {flows.map(f => (
            <option key={f.id} value={f.id} className="bg-card">{f.name}</option>
          ))}
        </select>
        <div className="w-px h-4 bg-border" />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-150">
              <Plus className="w-3.5 h-3.5" />
              Add Node
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <div className="p-3 border-b border-border/50">
              <span className="font-mono-system text-label text-muted-foreground">NEW NODE</span>
            </div>
            <div className="p-3 space-y-3">
              <div>
                <label className="font-mono-system text-[10px] text-muted-foreground block mb-1">LABEL</label>
                <input
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder="e.g. Email Verification"
                  className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="font-mono-system text-[10px] text-muted-foreground block mb-1">DESCRIPTION</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What happens at this step?"
                  rows={2}
                  className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 resize-none"
                />
              </div>
              <div>
                <label className="font-mono-system text-[10px] text-muted-foreground block mb-1">TYPE</label>
                <select
                  value={nodeType}
                  onChange={e => setNodeType(e.target.value as FlowNode['type'])}
                  className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary/50"
                >
                  <option value="step">Step</option>
                  <option value="edge-case">Edge Case</option>
                  <option value="failure">Failure</option>
                </select>
              </div>
              {flow && (
                <div>
                  <label className="font-mono-system text-[10px] text-muted-foreground block mb-1">CONNECT FROM</label>
                  <select
                    value={connectFrom}
                    onChange={e => setConnectFrom(e.target.value)}
                    className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary/50"
                  >
                    <option value="">None</option>
                    {flow.nodes.map(n => (
                      <option key={n.id} value={n.id}>{n.label}</option>
                    ))}
                  </select>
                </div>
              )}
              <button
                onClick={handleAdd}
                disabled={!label.trim()}
                className="w-full py-1.5 rounded text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Add to Flow
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-4">
        {flow && (
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-mono-system text-label text-muted-foreground">
              Clarity: <span className="text-foreground">{getClarityScore(flow)}/100</span>
            </span>
            <span className="font-mono-system text-label text-muted-foreground">
              · {flow.edgeCases.filter(e => !e.resolved).length} unresolved
            </span>
          </div>
        )}
        <div className="w-px h-4 bg-border" />
        <button
          onClick={toggleStressTest}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all duration-150 ${
            stressTestActive
              ? 'bg-warning/15 text-warning'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Stress Test
        </button>
      </div>
    </header>
  );
}
