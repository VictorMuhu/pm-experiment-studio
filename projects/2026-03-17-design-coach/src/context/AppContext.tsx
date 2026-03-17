import React, { createContext, useContext, useState, useCallback } from 'react';
import { ProjectFlow, FlowNode, EdgeCase, ProblemDefinition } from '@/types/flow';
import { DEMO_FLOWS } from '@/data/demo-flows';

interface AppState {
  flows: ProjectFlow[];
  activeFlowId: string | null;
  selectedNodeId: string | null;
  stressTestActive: boolean;
  setActiveFlow: (id: string) => void;
  selectNode: (id: string | null) => void;
  toggleStressTest: () => void;
  commitEdgeCase: (flowId: string, edgeCaseId: string) => void;
  resolveEdgeCase: (flowId: string, edgeCaseId: string) => void;
  getActiveFlow: () => ProjectFlow | null;
  getClarityScore: (flow: ProjectFlow) => number;
  addNode: (flowId: string, node: { label: string; description: string; type: FlowNode['type']; status: FlowNode['status']; connectFrom?: string }) => void;
  updateProblemDefinition: (flowId: string, pd: Partial<ProblemDefinition>) => void;
  updateNodePosition: (flowId: string, nodeId: string, x: number, y: number) => void;
  updateTradeoffValue: (flowId: string, tradeoffId: string, value: number) => void;
}

const fallbackFlow = DEMO_FLOWS[0] ?? null;
const AppContext = createContext<AppState>({
  flows: DEMO_FLOWS,
  activeFlowId: fallbackFlow?.id ?? null,
  selectedNodeId: null,
  stressTestActive: false,
  setActiveFlow: () => undefined,
  selectNode: () => undefined,
  toggleStressTest: () => undefined,
  commitEdgeCase: () => undefined,
  resolveEdgeCase: () => undefined,
  getActiveFlow: () => fallbackFlow,
  getClarityScore: () => 0,
  addNode: () => undefined,
  updateProblemDefinition: () => undefined,
  updateNodePosition: () => undefined,
  updateTradeoffValue: () => undefined,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [flows, setFlows] = useState<ProjectFlow[]>(DEMO_FLOWS);
  const [activeFlowId, setActiveFlowId] = useState<string | null>('onboarding-flow');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [stressTestActive, setStressTestActive] = useState(false);
  const [resolvedEdgeCases, setResolvedEdgeCases] = useState<Set<string>>(new Set());

  const setActiveFlow = useCallback((id: string) => {
    setActiveFlowId(id);
    setSelectedNodeId(null);
    setStressTestActive(false);
  }, []);

  const selectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id);
  }, []);

  const toggleStressTest = useCallback(() => {
    setStressTestActive(prev => !prev);
  }, []);

  const commitEdgeCase = useCallback((_flowId: string, edgeCaseId: string) => {
    setResolvedEdgeCases(prev => new Set([...prev, edgeCaseId]));
  }, []);

  const resolveEdgeCase = useCallback((_flowId: string, edgeCaseId: string) => {
    setResolvedEdgeCases(prev => new Set([...prev, edgeCaseId]));
  }, []);

  const addNode = useCallback((flowId: string, nodeData: { label: string; description: string; type: FlowNode['type']; status: FlowNode['status']; connectFrom?: string }) => {
    setFlows(prev => prev.map(flow => {
      if (flow.id !== flowId) return flow;
      const maxX = flow.nodes.reduce((max, n) => Math.max(max, n.x), 0);
      const newNode: FlowNode = {
        id: `node-${Date.now()}`,
        label: nodeData.label,
        description: nodeData.description,
        status: nodeData.status,
        type: nodeData.type,
        x: maxX + 240,
        y: 120,
      };
      const newEdges = nodeData.connectFrom
        ? [...flow.edges, { from: nodeData.connectFrom, to: newNode.id }]
        : flow.edges;
      return { ...flow, nodes: [...flow.nodes, newNode], edges: newEdges };
    }));
  }, []);

  const updateProblemDefinition = useCallback((flowId: string, pd: Partial<ProblemDefinition>) => {
    setFlows(prev => prev.map(flow => {
      if (flow.id !== flowId) return flow;
      return { ...flow, problemDefinition: { ...flow.problemDefinition, ...pd } };
    }));
  }, []);

  const updateNodePosition = useCallback((flowId: string, nodeId: string, x: number, y: number) => {
    setFlows(prev => prev.map(flow => {
      if (flow.id !== flowId) return flow;
      return {
        ...flow,
        nodes: flow.nodes.map(n => n.id === nodeId ? { ...n, x, y } : n),
      };
    }));
  }, []);

  const updateTradeoffValue = useCallback((flowId: string, tradeoffId: string, value: number) => {
    setFlows(prev => prev.map(flow => {
      if (flow.id !== flowId) return flow;
      return {
        ...flow,
        tradeoffs: flow.tradeoffs.map(t => t.id === tradeoffId ? { ...t, value } : t),
      };
    }));
  }, []);

  const getActiveFlow = useCallback(() => {
    if (!activeFlowId) return null;
    const flow = flows.find(f => f.id === activeFlowId);
    if (!flow) return null;
    return {
      ...flow,
      edgeCases: flow.edgeCases.map(ec => ({
        ...ec,
        resolved: resolvedEdgeCases.has(ec.id),
      })),
    };
  }, [activeFlowId, flows, resolvedEdgeCases]);

  const getClarityScore = useCallback((flow: ProjectFlow) => {
    const totalNodes = flow.nodes.length;
    const validatedNodes = flow.nodes.filter(n => n.status === 'validated').length;
    const totalEdgeCases = flow.edgeCases.length;
    const resolvedCount = flow.edgeCases.filter(ec => resolvedEdgeCases.has(ec.id)).length;
    const tradeoffsDefined = flow.tradeoffs.length;

    const nodeScore = totalNodes > 0 ? (validatedNodes / totalNodes) * 30 : 0;
    const edgeCaseScore = totalEdgeCases > 0 ? (resolvedCount / totalEdgeCases) * 50 : 0;
    const tradeoffScore = Math.min(tradeoffsDefined * 7, 20);

    return Math.round(nodeScore + edgeCaseScore + tradeoffScore);
  }, [resolvedEdgeCases]);

  return (
    <AppContext.Provider value={{
      flows,
      activeFlowId,
      selectedNodeId,
      stressTestActive,
      setActiveFlow,
      selectNode,
      toggleStressTest,
      commitEdgeCase,
      resolveEdgeCase,
      getActiveFlow,
      getClarityScore,
      addNode,
      updateProblemDefinition,
      updateNodePosition,
      updateTradeoffValue,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
