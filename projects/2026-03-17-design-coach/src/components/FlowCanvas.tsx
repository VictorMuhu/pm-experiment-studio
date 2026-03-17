import { useApp } from '@/context/AppContext';
import { FlowNodeCard } from './FlowNodeCard';
import { useMemo, useState, useRef, useCallback, useEffect } from 'react';

export function FlowCanvas() {
  const { getActiveFlow, selectedNodeId, selectNode, stressTestActive, activeFlowId, updateNodePosition } = useApp();
  const flow = getActiveFlow();

  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);

  // Node dragging state
  const draggingNodeId = useRef<string | null>(null);
  const dragStartNodePos = useRef({ x: 0, y: 0 });
  const dragStartMouse = useRef({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState<{ id: string; dx: number; dy: number } | null>(null);

  useEffect(() => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, [activeFlowId]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.92 : 1.08;
    setZoom(prev => Math.min(3, Math.max(0.25, prev * delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || draggingNodeId.current) return;
    isPanning.current = true;
    didDrag.current = false;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Node dragging takes priority
    if (draggingNodeId.current) {
      const dx = (e.clientX - dragStartMouse.current.x) / zoom;
      const dy = (e.clientY - dragStartMouse.current.y) / zoom;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didDrag.current = true;
      setDragOffset({ id: draggingNodeId.current, dx, dy });
      return;
    }
    if (!isPanning.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didDrag.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  }, [zoom]);

  const handleMouseUp = useCallback(() => {
    if (draggingNodeId.current && dragOffset && activeFlowId) {
      const newX = dragStartNodePos.current.x + dragOffset.dx;
      const newY = dragStartNodePos.current.y + dragOffset.dy;
      updateNodePosition(activeFlowId, draggingNodeId.current, Math.round(newX), Math.round(newY));
      draggingNodeId.current = null;
      setDragOffset(null);
      return;
    }
    isPanning.current = false;
  }, [dragOffset, activeFlowId, updateNodePosition]);

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string, nodeX: number, nodeY: number) => {
    e.stopPropagation();
    draggingNodeId.current = nodeId;
    didDrag.current = false;
    dragStartMouse.current = { x: e.clientX, y: e.clientY };
    dragStartNodePos.current = { x: nodeX, y: nodeY };
  }, []);

  // Compute effective node positions (applying drag offset for the dragged node)
  const getNodePos = useCallback((node: { id: string; x: number; y: number }) => {
    if (dragOffset && dragOffset.id === node.id) {
      return {
        x: dragStartNodePos.current.x + dragOffset.dx,
        y: dragStartNodePos.current.y + dragOffset.dy,
      };
    }
    return { x: node.x, y: node.y };
  }, [dragOffset]);

  const nodeEdgeCaseMap = useMemo(() => {
    if (!flow) return new Map<string, boolean>();
    const map = new Map<string, boolean>();
    flow.edgeCases.forEach(ec => {
      if (!ec.resolved) {
        map.set(ec.nodeId, true);
      }
    });
    return map;
  }, [flow]);

  if (!flow) {
    return (
      <div className="flex-1 canvas-grid flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Select a project to begin</p>
      </div>
    );
  }

  const connectors = flow.edges.map(edge => {
    const fromNode = flow.nodes.find(n => n.id === edge.from);
    const toNode = flow.nodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) return null;

    const fromPos = getNodePos(fromNode);
    const toPos = getNodePos(toNode);
    const fromX = fromPos.x + 180;
    const fromY = fromPos.y + 40;
    const toX = toPos.x;
    const toY = toPos.y + 40;
    const midX = (fromX + toX) / 2;

    return {
      key: `${edge.from}-${edge.to}`,
      path: `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`,
      label: edge.label,
      labelX: midX,
      labelY: (fromY + toY) / 2 - 8,
      isActive: selectedNodeId === edge.from || selectedNodeId === edge.to,
    };
  }).filter(Boolean);

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      ref={containerRef}
      className={`flex-1 canvas-grid relative overflow-hidden ${stressTestActive ? 'opacity-80' : ''}`}
      style={{ cursor: draggingNodeId.current ? 'grabbing' : isPanning.current ? 'grabbing' : 'grab' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          willChange: 'transform',
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: 1400, minHeight: 500 }}>
          {connectors.map(c => c && (
            <g key={c.key}>
              <path
                d={c.path}
                fill="none"
                className={c.isActive ? 'connector-line active' : 'connector-line'}
              />
              {c.label && (
                <text
                  x={c.labelX}
                  y={c.labelY}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  style={{ fontSize: '10px', fontFamily: 'Geist Mono, monospace' }}
                >
                  {c.label}
                </text>
              )}
            </g>
          ))}
        </svg>

        <div className="relative" style={{ minWidth: 1400, minHeight: 500 }}>
          {flow.nodes.map(node => {
            const pos = getNodePos(node);
            const isDragging = dragOffset?.id === node.id;
            return (
              <div
                key={node.id}
                className="absolute"
                style={{
                  left: pos.x,
                  top: pos.y,
                  zIndex: isDragging ? 50 : 1,
                  cursor: 'default',
                  transition: isDragging ? 'none' : 'left 0.15s ease, top 0.15s ease',
                }}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id, node.x, node.y)}
              >
                <FlowNodeCard
                  node={node}
                  isSelected={selectedNodeId === node.id}
                  stressTestActive={stressTestActive}
                  hasUnresolvedEdgeCases={nodeEdgeCaseMap.has(node.id)}
                  onClick={() => {
                    if (!didDrag.current) {
                      selectNode(selectedNodeId === node.id ? null : node.id);
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 surface-inner px-2 py-1 rounded opacity-60 hover:opacity-100 transition-opacity select-none">
        <button
          onClick={(e) => { e.stopPropagation(); setZoom(prev => Math.max(0.25, prev * 0.85)); }}
          className="font-mono-system text-[10px] text-muted-foreground hover:text-foreground w-4 h-4 flex items-center justify-center"
        >
          −
        </button>
        <span className="font-mono-system text-[10px] text-muted-foreground min-w-[32px] text-center">{zoomPercent}%</span>
        <button
          onClick={(e) => { e.stopPropagation(); setZoom(prev => Math.min(3, prev * 1.15)); }}
          className="font-mono-system text-[10px] text-muted-foreground hover:text-foreground w-4 h-4 flex items-center justify-center"
        >
          +
        </button>
        <div className="w-px h-3 bg-border mx-0.5" />
        <button
          onClick={(e) => { e.stopPropagation(); setPan({ x: 0, y: 0 }); setZoom(1); }}
          className="font-mono-system text-[10px] text-muted-foreground hover:text-foreground"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
