import { create } from 'zustand';
import {
  Connection,
  EdgeChange,
  NodeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from 'reactflow';
import {
  WorkflowNode,
  WorkflowEdge,
  WorkflowNodeData,
  SimulationState,
} from '../types/workflowTypes';
import { v4 as uuidv4 } from 'uuid';

// Undo/Redo history entry
interface HistoryEntry {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

interface WorkflowStore {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  simulation: SimulationState;
  isDarkMode: boolean;

  // Undo/Redo
  history: HistoryEntry[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: WorkflowNodeData['type'], position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNodeId: (id: string | null) => void;

  startSimulation: () => void;
  stopSimulation: () => void;
  setActiveNode: (id: string | null) => void;
  addVisitedNode: (id: string) => void;
  addLogEntry: (entry: string) => void;

  exportWorkflow: () => string;
  importWorkflow: (json: string) => boolean;
  clearWorkflow: () => void;

  toggleDarkMode: () => void;

  // Undo/Redo actions
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
}

const getDefaultNodeData = (type: WorkflowNodeData['type']): WorkflowNodeData => {
  switch (type) {
    case 'start':
      return { type: 'start', label: 'Start' };
    case 'condition':
      return { type: 'condition', label: 'Condition', expression: 'value > 0' };
    case 'action':
      return { type: 'action', label: 'Action', message: 'Perform action', actionType: 'log_message' };
    case 'delay':
      return { type: 'delay', label: 'Delay', duration: 2 };
  }
};

// Load dark mode preference
function getInitialDarkMode(): boolean {
  try {
    const stored = localStorage.getItem('flowbuilder-theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

const MAX_HISTORY = 50;

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isDarkMode: getInitialDarkMode(),
  simulation: {
    isRunning: false,
    activeNodeId: null,
    visitedNodeIds: [],
    log: [],
  },

  // Undo/Redo state
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as WorkflowNode[] });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    const state = get();
    state.pushHistory();

    const sourceNode = state.nodes.find((n) => n.id === connection.source);
    let label = '';
    if (sourceNode?.data.type === 'condition') {
      if (connection.sourceHandle === 'true') label = 'True';
      else if (connection.sourceHandle === 'false') label = 'False';
    }

    // Color-code condition branch edges
    let strokeColor = 'hsl(var(--muted-foreground) / 0.4)';
    if (label === 'True') strokeColor = 'hsl(152, 60%, 45%)';
    else if (label === 'False') strokeColor = 'hsl(0, 70%, 55%)';

    const newEdge: WorkflowEdge = {
      ...connection,
      id: uuidv4(),
      type: 'smoothstep',
      animated: false,
      label,
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
      style: { strokeWidth: 2.5, stroke: strokeColor },
      labelStyle: { fontWeight: 600, fontSize: 11 },
    } as WorkflowEdge;

    set({ edges: addEdge(newEdge, get().edges) });
  },

  addNode: (type, position) => {
    get().pushHistory();
    const newNode: WorkflowNode = {
      id: uuidv4(),
      type,
      position,
      data: getDefaultNodeData(type),
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } as WorkflowNodeData }
          : node
      ),
    });
  },

  deleteNode: (nodeId) => {
    get().pushHistory();
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    });
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  startSimulation: () =>
    set({
      simulation: {
        isRunning: true,
        activeNodeId: null,
        visitedNodeIds: [],
        log: [],
      },
    }),

  stopSimulation: () =>
    set({
      simulation: {
        isRunning: false,
        activeNodeId: null,
        visitedNodeIds: get().simulation.visitedNodeIds,
        log: get().simulation.log,
      },
    }),

  setActiveNode: (id) =>
    set((state) => ({
      simulation: { ...state.simulation, activeNodeId: id },
    })),

  addVisitedNode: (id) =>
    set((state) => ({
      simulation: {
        ...state.simulation,
        visitedNodeIds: [...state.simulation.visitedNodeIds, id],
      },
    })),

  addLogEntry: (entry) =>
    set((state) => ({
      simulation: {
        ...state.simulation,
        log: [...state.simulation.log, entry],
      },
    })),

  exportWorkflow: () => {
    const { nodes, edges } = get();
    return JSON.stringify({ nodes, edges }, null, 2);
  },

  importWorkflow: (json) => {
    try {
      const data = JSON.parse(json);
      if (!data.nodes || !Array.isArray(data.nodes) || !data.edges || !Array.isArray(data.edges)) {
        throw new Error('Invalid workflow format: missing nodes or edges arrays');
      }
      get().pushHistory();
      set({
        nodes: data.nodes,
        edges: data.edges,
        selectedNodeId: null,
      });
      return true;
    } catch (e) {
      console.error('Failed to import workflow:', e);
      return false;
    }
  },

  clearWorkflow: () =>
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      simulation: {
        isRunning: false,
        activeNodeId: null,
        visitedNodeIds: [],
        log: [],
      },
    }),

  toggleDarkMode: () => {
    const newMode = !get().isDarkMode;
    localStorage.setItem('flowbuilder-theme', newMode ? 'dark' : 'light');
    set({ isDarkMode: newMode });
  },

  // Undo/Redo implementation
  pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    // Truncate any future history beyond current index
    const truncated = history.slice(0, historyIndex + 1);
    const newHistory = [...truncated, { nodes: structuredClone(nodes), edges: structuredClone(edges) }];
    // Keep history bounded
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: true,
      canRedo: false,
    });
  },

  undo: () => {
    const { history, historyIndex, nodes, edges } = get();
    if (historyIndex < 0) return;

    const entry = history[historyIndex];
    // If we're at the latest point, save current state so we can redo to it
    const isAtEnd = historyIndex === history.length - 1;
    let newHistory = history;
    if (isAtEnd) {
      newHistory = [...history, { nodes: structuredClone(nodes), edges: structuredClone(edges) }];
    }

    set({
      nodes: structuredClone(entry.nodes),
      edges: structuredClone(entry.edges),
      history: newHistory,
      historyIndex: historyIndex - 1,
      canUndo: historyIndex - 1 >= 0,
      canRedo: true,
      selectedNodeId: null,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    const nextIndex = historyIndex + 2; // +2 because we go one past the current
    if (nextIndex >= history.length) return;

    const entry = history[nextIndex];
    set({
      nodes: structuredClone(entry.nodes),
      edges: structuredClone(entry.edges),
      historyIndex: historyIndex + 1,
      canUndo: true,
      canRedo: nextIndex + 1 < history.length,
      selectedNodeId: null,
    });
  },
}));
