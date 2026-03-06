import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useParams } from 'wouter';
import WorkflowCanvas from '../components/Canvas/WorkflowCanvas';
import NodePalette from '../components/Sidebar/NodePalette';
import NodeConfigPanel from '../components/ConfigPanel/NodeConfigPanel';
import WorkflowToolbar from '../components/Toolbar/WorkflowToolbar';
import SimulationLog from '../components/SimulationLog/SimulationLog';
import { useWorkflowStore } from '../store/workflowStore';
import { useProjectStore } from '../store/projectStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Workflow } from 'lucide-react';


function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export default function WorkflowBuilder() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const isMobile = useIsMobile();
  const { selectedNodeId, setSelectedNodeId, addNode, nodes, edges } = useWorkflowStore();
  const { saveWorkflowToProject, getProject, setCurrentProjectId, loadFromStorage } = useProjectStore();
  const hasSelection = !!selectedNodeId;
  const params = useParams<{ id: string }>();
  const projectId = params?.id;
  const [, navigate] = useLocation();
  const projectIdRef = useRef(projectId);
  projectIdRef.current = projectId;

  useEffect(() => {
    loadFromStorage();

    if (!projectId) {
      navigate('/');
      return;
    }

    const project = useProjectStore.getState().getProject(projectId);
    if (!project) {
      navigate('/');
      return;
    }

    setCurrentProjectId(projectId);

    const store = useWorkflowStore.getState();
    store.clearWorkflow();

    if (project.nodes.length > 0 || project.edges.length > 0) {
      store.importWorkflow(JSON.stringify({ nodes: project.nodes, edges: project.edges }));
    }

    requestAnimationFrame(() => setLoaded(true));

    return () => {
      setCurrentProjectId(null);
      setLoaded(false);
    };
  }, [projectId]);

  // Auto-save workflow changes
  useEffect(() => {
    if (!loaded || !projectIdRef.current) return;
    const timer = setTimeout(() => {
      if (projectIdRef.current) {
        saveWorkflowToProject(projectIdRef.current, nodes, edges);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [nodes, edges, loaded, saveWorkflowToProject]);

  // Mobile: tap-to-add node at a smart canvas position
  const handleMobileTapAdd = useCallback((type: string) => {
    const currentNodes = useWorkflowStore.getState().nodes;
    const maxY = currentNodes.reduce((max, n) => Math.max(max, n.position.y), 0);
    const centerX = 200 + Math.random() * 120;
    const newY = currentNodes.length === 0 ? 100 : maxY + 150;
    addNode(type as 'start' | 'condition' | 'action' | 'delay', { x: centerX, y: newY });
    setSidebarOpen(false);
  }, [addNode]);

  const project = projectId ? getProject(projectId) : null;

  if (!loaded && projectId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse">
          <Workflow className="w-6 h-6 text-white" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">Loading project...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <WorkflowToolbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        projectName={project?.name}
        onBack={() => navigate('/')}
      />

      <div className="flex flex-1 min-h-0 relative">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-60 border-r border-border/50 bg-card/30 backdrop-blur-sm p-3 shrink-0">
          <ScrollArea className="flex-1">
            <NodePalette />
          </ScrollArea>
        </aside>

        {/* Mobile Sidebar Sheet — tap-to-add */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-72 p-0" aria-describedby={undefined}>
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="text-sm font-bold">Add Node</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-60px)] p-4">
              <NodePalette onTapAdd={handleMobileTapAdd} />
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Canvas + Log */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex-1 min-h-0 relative">
            <WorkflowCanvas />
          </div>
          <SimulationLog />
        </div>

        {/* Desktop Config Panel */}
        <aside className="hidden md:flex flex-col w-72 border-l border-border/50 bg-card/30 backdrop-blur-sm shrink-0">
          <ScrollArea className="flex-1">
            <NodeConfigPanel onClose={() => setSelectedNodeId(null)} />
          </ScrollArea>
        </aside>

        {/* Mobile Config Panel — bottom sheet */}
        {isMobile && (
          <Sheet open={hasSelection} onOpenChange={(open) => { if (!open) setSelectedNodeId(null); }}>
            <SheetContent side="bottom" className="h-[65vh] rounded-t-2xl p-0" aria-describedby={undefined}>
              <span className="sr-only">
                <SheetTitle>Node Configuration</SheetTitle>
              </span>
              <ScrollArea className="h-full p-4 pt-2">
                <NodeConfigPanel onClose={() => setSelectedNodeId(null)} idPrefix="mobile-" />
              </ScrollArea>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
}
