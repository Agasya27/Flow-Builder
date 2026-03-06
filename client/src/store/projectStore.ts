import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { MarkerType } from 'reactflow';
import { WorkflowNode, WorkflowEdge } from '../types/workflowTypes';

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  nodeCount: number;
  edgeCount: number;
  isDemo?: boolean;
}

const STORAGE_KEY = 'flowbuilder_projects';
const DEMO_PROJECT_ID = 'demo-workflow-project';

// ─── Demo project with a rich multi-node workflow ───
const DEMO_NODES: WorkflowNode[] = [
  {
    id: 'demo-start',
    type: 'start',
    position: { x: 300, y: 40 },
    data: { type: 'start', label: 'User Signs Up' },
  },
  {
    id: 'demo-condition-1',
    type: 'condition',
    position: { x: 300, y: 220 },
    data: { type: 'condition', label: 'Email Verified?', expression: 'user.emailVerified === true' },
  },
  {
    id: 'demo-action-welcome',
    type: 'action',
    position: { x: 80, y: 420 },
    data: {
      type: 'action',
      label: 'Send Welcome Email',
      message: 'Welcome to Flow Builder! Your account is ready.',
      actionType: 'send_email',
      recipient: '{{user.email}}',
      subject: 'Welcome aboard! 🎉',
    },
  },
  {
    id: 'demo-action-remind',
    type: 'action',
    position: { x: 520, y: 420 },
    data: {
      type: 'action',
      label: 'Send Verification Reminder',
      message: 'Please verify your email to get started.',
      actionType: 'send_email',
      recipient: '{{user.email}}',
      subject: 'Verify your email',
    },
  },
  {
    id: 'demo-delay-1',
    type: 'delay',
    position: { x: 520, y: 620 },
    data: { type: 'delay', label: 'Wait 24 Hours', duration: 86400 },
  },
  {
    id: 'demo-condition-2',
    type: 'condition',
    position: { x: 520, y: 800 },
    data: { type: 'condition', label: 'Still Unverified?', expression: 'user.emailVerified === false' },
  },
  {
    id: 'demo-action-log',
    type: 'action',
    position: { x: 80, y: 640 },
    data: {
      type: 'action',
      label: 'Log Onboarding',
      message: 'User {{user.id}} completed onboarding.',
      actionType: 'log_message',
    },
  },
  {
    id: 'demo-action-api',
    type: 'action',
    position: { x: 300, y: 1000 },
    data: {
      type: 'action',
      label: 'Notify Admin API',
      message: '{"userId": "{{user.id}}", "status": "unverified"}',
      actionType: 'http_request',
      url: 'https://api.example.com/admin/alert',
      method: 'POST',
    },
  },
  {
    id: 'demo-delay-2',
    type: 'delay',
    position: { x: 740, y: 800 },
    data: { type: 'delay', label: 'Retry in 1 Hour', duration: 3600 },
  },
];

const DEMO_EDGES: WorkflowEdge[] = [
  {
    id: 'demo-e1', source: 'demo-start', target: 'demo-condition-1', type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
    style: { strokeWidth: 2.5, stroke: 'hsl(var(--muted-foreground) / 0.4)' },
  },
  {
    id: 'demo-e2', source: 'demo-condition-1', target: 'demo-action-welcome', sourceHandle: 'true',
    label: 'True', type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
    style: { strokeWidth: 2.5, stroke: 'hsl(152, 60%, 45%)' },
    labelStyle: { fontWeight: 600, fontSize: 11 },
  },
  {
    id: 'demo-e3', source: 'demo-condition-1', target: 'demo-action-remind', sourceHandle: 'false',
    label: 'False', type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
    style: { strokeWidth: 2.5, stroke: 'hsl(0, 70%, 55%)' },
    labelStyle: { fontWeight: 600, fontSize: 11 },
  },
  {
    id: 'demo-e4', source: 'demo-action-remind', target: 'demo-delay-1', type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
    style: { strokeWidth: 2.5, stroke: 'hsl(var(--muted-foreground) / 0.4)' },
  },
  {
    id: 'demo-e5', source: 'demo-delay-1', target: 'demo-condition-2', type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
    style: { strokeWidth: 2.5, stroke: 'hsl(var(--muted-foreground) / 0.4)' },
  },
  {
    id: 'demo-e6', source: 'demo-condition-2', target: 'demo-action-api', sourceHandle: 'true',
    label: 'True', type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
    style: { strokeWidth: 2.5, stroke: 'hsl(152, 60%, 45%)' },
    labelStyle: { fontWeight: 600, fontSize: 11 },
  },
  {
    id: 'demo-e7', source: 'demo-condition-2', target: 'demo-delay-2', sourceHandle: 'false',
    label: 'False', type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
    style: { strokeWidth: 2.5, stroke: 'hsl(0, 70%, 55%)' },
    labelStyle: { fontWeight: 600, fontSize: 11 },
  },
  {
    id: 'demo-e8', source: 'demo-action-welcome', target: 'demo-action-log', type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
    style: { strokeWidth: 2.5, stroke: 'hsl(var(--muted-foreground) / 0.4)' },
  },
];

function createDemoProject(): Project {
  return {
    id: DEMO_PROJECT_ID,
    name: 'Demo: User Onboarding',
    description: 'A sample onboarding workflow — explore freely, changes reset on refresh.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
    nodes: JSON.parse(JSON.stringify(DEMO_NODES)),
    edges: JSON.parse(JSON.stringify(DEMO_EDGES)),
    nodeCount: DEMO_NODES.length,
    edgeCount: DEMO_EDGES.length,
    isDemo: true,
  };
}

function loadProjects(): Project[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const userProjects: Project[] = data ? JSON.parse(data) : [];
    // Remove any stale demo from localStorage
    const filtered = userProjects.filter((p) => p.id !== DEMO_PROJECT_ID);
    return filtered;
  } catch {
    return [];
  }
}

function saveProjects(projects: Project[]) {
  // Never persist demo project to localStorage
  const userOnly = projects.filter((p) => !p.isDemo);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userOnly));
}

interface ProjectStore {
  projects: Project[];
  currentProjectId: string | null;

  loadFromStorage: () => void;
  createProject: (name: string, description: string) => string;
  updateProject: (id: string, updates: Partial<Pick<Project, 'name' | 'description'>>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => string;
  saveWorkflowToProject: (id: string, nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
  getProject: (id: string) => Project | undefined;
  setCurrentProjectId: (id: string | null) => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [...loadProjects(), createDemoProject()],
  currentProjectId: null,

  loadFromStorage: () => {
    // Always recreate demo from scratch + load user projects
    set({ projects: [...loadProjects(), createDemoProject()] });
  },

  createProject: (name, description) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    const newProject: Project = {
      id,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      nodes: [],
      edges: [],
      nodeCount: 0,
      edgeCount: 0,
    };
    const updated = [newProject, ...get().projects];
    set({ projects: updated });
    saveProjects(updated);
    return id;
  },

  updateProject: (id, updates) => {
    // Don't allow renaming demo project
    if (id === DEMO_PROJECT_ID) return;
    const updated = get().projects.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    set({ projects: updated });
    saveProjects(updated);
  },

  deleteProject: (id) => {
    // Cannot delete demo project
    if (id === DEMO_PROJECT_ID) return;
    const updated = get().projects.filter((p) => p.id !== id);
    set({ projects: updated });
    saveProjects(updated);
  },

  duplicateProject: (id) => {
    const original = get().projects.find((p) => p.id === id);
    if (!original) return '';
    const newId = uuidv4();
    const now = new Date().toISOString();
    const copy: Project = {
      ...original,
      id: newId,
      name: `${original.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
      isDemo: false, // Duplicates are always user projects
    };
    const updated = [copy, ...get().projects];
    set({ projects: updated });
    saveProjects(updated);
    return newId;
  },

  saveWorkflowToProject: (id, nodes, edges) => {
    // Allow in-memory changes to demo (for interaction) but don't persist
    const updated = get().projects.map((p) =>
      p.id === id
        ? {
          ...p,
          nodes,
          edges,
          nodeCount: nodes.length,
          edgeCount: edges.length,
          updatedAt: new Date().toISOString(),
        }
        : p
    );
    set({ projects: updated });
    // Only persist non-demo projects
    if (id !== DEMO_PROJECT_ID) {
      saveProjects(updated);
    }
  },

  getProject: (id) => {
    return get().projects.find((p) => p.id === id);
  },

  setCurrentProjectId: (id) => set({ currentProjectId: id }),
}));
