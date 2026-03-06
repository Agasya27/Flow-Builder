import { useRef, useState, useEffect } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { runSimulation } from '../../utils/workflowSimulator';
import { Button } from '@/components/ui/button';
import {
  Play,
  Square,
  Download,
  Upload,
  Trash2,
  Workflow,
  ChevronLeft,
  Moon,
  Sun,
  Undo2,
  Redo2,
  CircleDot,
  Cable,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface WorkflowToolbarProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  projectName?: string;
  onBack?: () => void;
}

export default function WorkflowToolbar({ onToggleSidebar, projectName, onBack }: WorkflowToolbarProps) {
  const {
    nodes,
    edges,
    simulation,
    startSimulation,
    stopSimulation,
    setActiveNode,
    addVisitedNode,
    addLogEntry,
    exportWorkflow,
    importWorkflow,
    clearWorkflow,
    toggleDarkMode,
    isDarkMode,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useWorkflowStore();

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSimRunning, setIsSimRunning] = useState(false);
  const stopRef = useRef(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;
      if (isCmd && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (isCmd && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const handleRunSimulation = async () => {
    if (nodes.length === 0) {
      toast({ title: 'No nodes', description: 'Add nodes to the canvas first.', variant: 'destructive' });
      return;
    }

    // Pre-simulation validation for condition nodes
    const conditionNodes = nodes.filter((n) => n.data.type === 'condition');
    let hasWarnings = false;

    for (const cNode of conditionNodes) {
      const outgoing = edges.filter((e) => e.source === cNode.id);
      const hasTrueBranch = outgoing.some((e) => e.sourceHandle === 'true');
      const hasFalseBranch = outgoing.some((e) => e.sourceHandle === 'false');

      if (outgoing.length === 0) {
        toast({
          title: `⚠ "${cNode.data.label}" has no outgoing edges`,
          description: 'Connect at least one branch (True/False) from this condition node.',
          variant: 'destructive',
        });
        hasWarnings = true;
      } else if (!hasTrueBranch || !hasFalseBranch) {
        const missing = !hasTrueBranch ? 'True' : 'False';
        toast({
          title: `⚠ "${cNode.data.label}" missing ${missing} branch`,
          description: `Consider connecting the ${missing} handle for complete branching.`,
        });
      }

      if (cNode.data.type === 'condition' && !cNode.data.expression?.trim()) {
        toast({
          title: `⚠ "${cNode.data.label}" has no expression`,
          description: 'The condition will default to false during simulation.',
        });
        hasWarnings = true;
      }
    }

    // Don't block simulation on warnings — just notify and proceed
    stopRef.current = false;
    setIsSimRunning(true);
    startSimulation();

    await runSimulation(nodes, edges, {
      onNodeActivate: (id) => setActiveNode(id || null),
      onNodeVisited: (id) => addVisitedNode(id),
      onLog: (msg) => addLogEntry(msg),
      onComplete: () => {
        setIsSimRunning(false);
        stopSimulation();
      },
      shouldStop: () => stopRef.current,
    });
  };

  const handleStopSimulation = () => {
    stopRef.current = true;
    setIsSimRunning(false);
    stopSimulation();
  };

  const handleExport = () => {
    const json = exportWorkflow();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName || 'workflow'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'Workflow saved as JSON file.' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const success = importWorkflow(text);
      if (success) {
        toast({ title: 'Imported', description: 'Workflow loaded from file.' });
      } else {
        toast({ title: 'Import failed', description: 'Invalid workflow JSON file.', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    clearWorkflow();
    toast({ title: 'Cleared', description: 'Canvas has been reset.' });
  };

  // Helper to wrap icon buttons with tooltips
  const ToolbarBtn = ({ onClick, disabled, tooltip, icon: Icon, className, testId, iconClass }: {
    onClick: () => void;
    disabled?: boolean;
    tooltip: string;
    icon: typeof Play;
    className?: string;
    testId: string;
    iconClass?: string;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClick}
          disabled={disabled}
          className={cn('h-8 w-8 rounded-lg shrink-0', className)}
          data-testid={testId}
          aria-label={tooltip}
        >
          <Icon className={cn('w-3.5 h-3.5', iconClass)} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>{tooltip}</TooltipContent>
    </Tooltip>
  );

  return (
    <div className="flex items-center justify-between gap-1.5 px-2 sm:px-3 py-2 glass-toolbar overflow-x-auto">
      {/* Left: nav + name */}
      <div className="flex items-center gap-1 min-w-0 shrink-0">
        {onBack && (
          <ToolbarBtn onClick={onBack} tooltip="Back to Projects" icon={ChevronLeft} testId="button-back" />
        )}
        <Button
          size="icon"
          variant="ghost"
          className="md:hidden h-8 w-8 rounded-lg shrink-0"
          onClick={onToggleSidebar}
          data-testid="button-toggle-sidebar"
          aria-label="Toggle sidebar"
        >
          <Workflow className="w-4 h-4" />
        </Button>
        {projectName && (
          <span className="hidden sm:block text-sm font-bold truncate max-w-[160px] lg:max-w-[220px]" data-testid="text-project-name">
            {projectName}
          </span>
        )}
        {/* Stats badges — only on lg+ */}
        <div className="hidden lg:flex items-center gap-1 ml-2">
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/60 text-[10px] font-medium text-muted-foreground">
            <CircleDot className="w-2.5 h-2.5" />{nodes.length}
          </span>
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/60 text-[10px] font-medium text-muted-foreground">
            <Cable className="w-2.5 h-2.5" />{edges.length}
          </span>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-0.5 shrink-0">
        {/* Undo/Redo — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-0.5">
          <ToolbarBtn onClick={undo} disabled={!canUndo || isSimRunning} tooltip="Undo (⌘Z)" icon={Undo2} testId="button-undo" />
          <ToolbarBtn onClick={redo} disabled={!canRedo || isSimRunning} tooltip="Redo (⌘⇧Z)" icon={Redo2} testId="button-redo" />
          <div className="w-px h-5 bg-border/40 mx-0.5" />
        </div>

        {/* Run / Stop */}
        {!isSimRunning ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                onClick={handleRunSimulation}
                data-testid="button-run-simulation"
                aria-label="Run Simulation"
                className={cn(
                  'gap-1.5 h-8 px-3 rounded-lg shrink-0',
                  'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0',
                  'hover:from-emerald-600 hover:to-green-700',
                  'shadow-md shadow-emerald-500/20'
                )}
              >
                <Play className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Run</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6}>Run Simulation</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            size="sm"
            variant="destructive"
            onClick={handleStopSimulation}
            data-testid="button-stop-simulation"
            aria-label="Stop Simulation"
            className="gap-1.5 h-8 px-3 rounded-lg animate-pulse shrink-0"
          >
            <Square className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Stop</span>
          </Button>
        )}

        <div className="w-px h-5 bg-border/40 mx-0.5 hidden sm:block" />

        {/* Import/Export */}
        <ToolbarBtn onClick={handleExport} tooltip="Export JSON" icon={Download} testId="button-export" />
        <ToolbarBtn onClick={() => fileInputRef.current?.click()} tooltip="Import JSON" icon={Upload} testId="button-import" />

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        <div className="w-px h-5 bg-border/40 mx-0.5" />

        {/* Dark mode */}
        <ToolbarBtn
          onClick={toggleDarkMode}
          tooltip={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          icon={isDarkMode ? Sun : Moon}
          testId="button-dark-mode"
        />

        {/* Clear */}
        <ToolbarBtn
          onClick={handleClear}
          tooltip="Clear Canvas"
          icon={Trash2}
          testId="button-clear"
          className="text-muted-foreground hover:text-destructive"
        />
      </div>
    </div>
  );
}
