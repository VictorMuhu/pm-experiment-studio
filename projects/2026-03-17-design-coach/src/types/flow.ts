export interface FlowNode {
  id: string;
  label: string;
  description: string;
  status: 'defined' | 'in-progress' | 'validated' | 'gap';
  type: 'step' | 'edge-case' | 'failure';
  x: number;
  y: number;
  parentId?: string;
  committed?: boolean;
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

export interface EdgeCase {
  id: string;
  nodeId: string;
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

export interface Tradeoff {
  id: string;
  left: string;
  right: string;
  value: number; // 0-100
  impact: string;
}

export interface ProblemDefinition {
  hypothesis: string;
  targetUser: string;
  successMetrics: string;
}

export interface ProjectFlow {
  id: string;
  name: string;
  description: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  edgeCases: EdgeCase[];
  tradeoffs: Tradeoff[];
  problemDefinition: ProblemDefinition;
  createdAt: string;
}
