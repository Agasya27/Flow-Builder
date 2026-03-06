import { Node, Edge } from 'reactflow';

export type NodeType = 'start' | 'condition' | 'action' | 'delay';

export interface StartNodeData {
  type: 'start';
  label: string;
}

export interface ConditionNodeData {
  type: 'condition';
  label: string;
  expression: string;
}

// Action types available for the Action node
export type ActionType =
  | 'log_message'
  | 'send_email'
  | 'http_request'
  | 'set_variable'
  | 'transform_data';

export interface ActionNodeData {
  type: 'action';
  label: string;
  message: string;
  actionType: ActionType;
  // Optional fields based on actionType
  url?: string;           // for http_request
  method?: string;        // for http_request (GET, POST, PUT, DELETE)
  variableName?: string;  // for set_variable
  variableValue?: string; // for set_variable
  recipient?: string;     // for send_email
  subject?: string;       // for send_email
}

export interface DelayNodeData {
  type: 'delay';
  label: string;
  duration: number;
}

export type WorkflowNodeData = StartNodeData | ConditionNodeData | ActionNodeData | DelayNodeData;

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

export interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface SimulationState {
  isRunning: boolean;
  activeNodeId: string | null;
  visitedNodeIds: string[];
  log: string[];
}
