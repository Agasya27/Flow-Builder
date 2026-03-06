import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useProjectStore, type Project } from '../store/projectStore';
import { useWorkflowStore } from '../store/workflowStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Workflow,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Copy,
  Pencil,
  ArrowRight,
  GitBranch,
  Zap,
  Timer,
  Play,
  Layers,
  Cable,
  Moon,
  Sun,
  MousePointer2,
  ChevronRight,
  Clock,
  FileJson,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getNodeTypeBreakdown(project: Project) {
  const counts = { start: 0, condition: 0, action: 0, delay: 0 };
  project.nodes.forEach((n) => {
    const t = n.data?.type || n.type;
    if (t && t in counts) counts[t as keyof typeof counts]++;
  });
  return counts;
}

const features = [
  { icon: Layers, text: 'Drag & Drop Nodes' },
  { icon: Cable, text: 'Visual Connections' },
  { icon: Play, text: 'Step-by-Step Simulation' },
  { icon: GitBranch, text: 'Conditional Branching' },
  { icon: FileJson, text: 'JSON Import/Export' },
  { icon: Clock, text: 'Timed Delays' },
];

export default function Landing() {
  const [, navigate] = useLocation();
  const { projects, createProject, deleteProject, duplicateProject, updateProject, loadFromStorage } = useProjectStore();
  const { isDarkMode, toggleDarkMode } = useWorkflowStore();
  const { toast } = useToast();

  useEffect(() => {
    loadFromStorage();
  }, []);

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = createProject(newName.trim(), newDesc.trim());
    setShowNewDialog(false);
    setNewName('');
    setNewDesc('');
    toast({ title: 'Project created', description: 'Your workflow project is ready.' });
    navigate(`/builder/${id}`);
  };

  const handleEdit = () => {
    if (!editProject || !newName.trim()) return;
    updateProject(editProject.id, { name: newName.trim(), description: newDesc.trim() });
    setEditProject(null);
    setNewName('');
    setNewDesc('');
    toast({ title: 'Updated', description: 'Project details saved.' });
  };

  const handleDelete = (p: Project) => {
    deleteProject(p.id);
    toast({ title: 'Deleted', description: `"${p.name}" has been removed.` });
  };

  const handleDuplicate = (p: Project) => {
    duplicateProject(p.id);
    toast({ title: 'Duplicated', description: `Copy of "${p.name}" created.` });
  };

  const openEdit = (p: Project) => {
    setNewName(p.name);
    setNewDesc(p.description);
    setEditProject(p);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ================== HEADER ================== */}
      <header className="sticky top-0 z-50 glass-toolbar">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-md shadow-primary/20">
              <Workflow className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight" data-testid="text-brand">Flow Builder</span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleDarkMode}
            className="h-8 w-8 rounded-lg"
            data-testid="button-dark-mode-landing"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* ================== HERO ================== */}
      <section className="relative overflow-hidden">
        {/* Background accents */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-violet-600/[0.04]" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-primary/[0.06] to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-gradient-radial from-violet-500/[0.05] to-transparent rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">
            {/* Left: copy */}
            <div className="max-w-lg">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-[1.15]">
                Design workflows,{' '}
                <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                  not flowcharts.
                </span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md">
                Drag nodes, wire connections, configure actions, and simulate execution paths — all in your browser. Zero setup, zero backend.
              </p>

              {/* Feature tags — clean inline layout */}
              <div className="mt-5 flex flex-wrap gap-2">
                {features.map((f) => (
                  <span
                    key={f.text}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 text-[11px] font-medium text-muted-foreground"
                  >
                    <f.icon className="w-3 h-3 text-primary/60" />
                    {f.text}
                  </span>
                ))}
              </div>

              <div className="mt-7">
                <Button
                  size="lg"
                  onClick={() => setShowNewDialog(true)}
                  className="gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-700 shadow-lg shadow-primary/20 text-white border-0 font-semibold"
                  data-testid="button-new-project"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </Button>
              </div>
            </div>

            {/* Right: Visual node preview */}
            <div className="hidden lg:flex justify-center">
              <div className="relative w-80 h-72">
                {/* Start node */}
                <div className="absolute left-[30%] top-0 -translate-x-1/2 w-[160px] bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-emerald-200/80 dark:border-emerald-500/30 p-3 shadow-md animate-fade-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
                  <div className="absolute top-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-sm">
                      <Play className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Start</p>
                      <p className="text-xs font-semibold text-foreground">Entry Point</p>
                    </div>
                  </div>
                </div>

                {/* Connector 1 */}
                <div className="absolute left-[30%] top-[68px] w-px h-[22px] bg-gradient-to-b from-emerald-400 to-amber-400 -translate-x-1/2" />

                {/* Condition node */}
                <div className="absolute left-[30%] top-[90px] -translate-x-1/2 w-[170px] bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-amber-200/80 dark:border-amber-500/30 p-3 shadow-md animate-fade-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
                  <div className="absolute top-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-amber-400 to-orange-400" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-sm">
                      <GitBranch className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Condition</p>
                      <p className="text-xs font-semibold text-foreground">value &gt; 100</p>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 px-1">
                    <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />True</span>
                    <span className="text-[8px] font-bold text-red-500 dark:text-red-400 flex items-center gap-1">False<span className="w-1.5 h-1.5 rounded-full bg-red-500" /></span>
                  </div>
                </div>

                {/* Branch lines */}
                <div className="absolute left-[17%] top-[197px] w-px h-[22px] bg-gradient-to-b from-amber-400 to-blue-400" />
                <div className="absolute left-[60%] top-[197px] w-px h-[22px] bg-gradient-to-b from-amber-400 to-violet-400" />

                {/* Action node */}
                <div className="absolute left-[17%] top-[219px] -translate-x-1/2 w-[135px] bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-blue-200/80 dark:border-blue-500/30 p-2.5 shadow-md animate-fade-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
                  <div className="absolute top-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-blue-400 to-indigo-400" />
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                      <Zap className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Action</p>
                      <p className="text-[10px] font-semibold text-foreground">Send Email</p>
                    </div>
                  </div>
                </div>

                {/* Delay node */}
                <div className="absolute left-[60%] top-[219px] -translate-x-1/2 w-[130px] bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-violet-200/80 dark:border-violet-500/30 p-2.5 shadow-md animate-fade-up" style={{ animationDelay: '450ms', animationFillMode: 'both' }}>
                  <div className="absolute top-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-violet-400 to-purple-400" />
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                      <Timer className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">Delay</p>
                      <p className="text-[10px] font-semibold text-foreground">Wait 5s</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================== PROJECTS SECTION ================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-foreground" data-testid="text-projects-heading">Projects</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {projects.length === 0
                ? 'No workflows yet — create one to get started'
                : `${projects.length} workflow${projects.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 rounded-lg text-sm"
                data-testid="input-search-projects"
              />
            </div>
          </div>
        </div>

        {filteredProjects.length === 0 && projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-muted/60 to-muted/30 flex items-center justify-center mb-4">
              <MousePointer2 className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">No projects yet</h3>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Click "New Project" above to design workflows using drag-and-drop nodes, connect them with edges, and simulate execution.
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <Search className="w-6 h-6 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No projects match "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProjects.map((project, idx) => {
              const counts = getNodeTypeBreakdown(project);
              return (
                <div
                  key={project.id}
                  data-testid={`card-project-${project.id}`}
                  className={cn(
                    'group relative rounded-xl border bg-card/80 backdrop-blur-sm p-4',
                    'transition-all duration-200',
                    'hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5',
                    'cursor-pointer animate-fade-up',
                    project.isDemo && 'border-primary/15 bg-gradient-to-br from-primary/[0.03] to-violet-500/[0.03]'
                  )}
                  style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
                  onClick={() => navigate(`/builder/${project.id}`)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-foreground truncate flex items-center gap-1.5" data-testid={`text-project-name-${project.id}`}>
                        {project.name}
                        {project.isDemo && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-px rounded-full bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-wider shrink-0">
                            Demo
                          </span>
                        )}
                      </h3>
                      {project.description && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 leading-relaxed">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button size="icon" variant="ghost" className="shrink-0 h-7 w-7 rounded-md sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" data-testid={`button-menu-${project.id}`}>
                          <MoreVertical className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => navigate(`/builder/${project.id}`)} data-testid={`menu-open-${project.id}`}>
                          <ArrowRight className="w-3.5 h-3.5 mr-2" />
                          Open
                        </DropdownMenuItem>
                        {!project.isDemo && (
                          <DropdownMenuItem onClick={() => openEdit(project)} data-testid={`menu-edit-${project.id}`}>
                            <Pencil className="w-3.5 h-3.5 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDuplicate(project)} data-testid={`menu-duplicate-${project.id}`}>
                          <Copy className="w-3.5 h-3.5 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        {!project.isDemo && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(project)}
                              className="text-destructive focus:text-destructive"
                              data-testid={`menu-delete-${project.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Node breakdown */}
                  <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                    {project.nodeCount > 0 ? (
                      <>
                        {counts.start > 0 && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-px rounded-md bg-emerald-100/60 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold border border-emerald-200/40 dark:border-emerald-500/15">
                            <Play className="w-2 h-2" />{counts.start}
                          </span>
                        )}
                        {counts.condition > 0 && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-px rounded-md bg-amber-100/60 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-[9px] font-bold border border-amber-200/40 dark:border-amber-500/15">
                            <GitBranch className="w-2 h-2" />{counts.condition}
                          </span>
                        )}
                        {counts.action > 0 && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-px rounded-md bg-blue-100/60 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[9px] font-bold border border-blue-200/40 dark:border-blue-500/15">
                            <Zap className="w-2 h-2" />{counts.action}
                          </span>
                        )}
                        {counts.delay > 0 && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-px rounded-md bg-violet-100/60 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 text-[9px] font-bold border border-violet-200/40 dark:border-violet-500/15">
                            <Timer className="w-2 h-2" />{counts.delay}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[9px] text-muted-foreground/50 italic">Empty canvas</span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
                    <span>{project.nodeCount} node{project.nodeCount !== 1 ? 's' : ''} · {project.edgeCount} edge{project.edgeCount !== 1 ? 's' : ''}</span>
                    <span className="flex items-center gap-1">
                      {project.isDemo ? (
                        <><Clock className="w-2.5 h-2.5" /> Resets on refresh</>
                      ) : (
                        <><Clock className="w-2.5 h-2.5" /> {formatDate(project.updatedAt)}</>
                      )}
                    </span>
                  </div>

                  {/* Hover chevron */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0 -translate-x-1 hidden sm:block">
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================== DIALOGS ================== */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">New Project</DialogTitle>
            <DialogDescription>Give your workflow a name to get started.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-xs font-semibold">Name</Label>
              <Input
                id="project-name"
                data-testid="input-project-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Order Processing Pipeline"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="h-10 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-desc" className="text-xs font-semibold">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea
                id="project-desc"
                data-testid="input-project-desc"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What does this workflow do?"
                className="resize-none rounded-lg"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={() => setShowNewDialog(false)} className="rounded-lg">Cancel</Button>
              <Button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="rounded-lg bg-gradient-to-r from-primary to-violet-600 text-white border-0 shadow-sm shadow-primary/15"
                data-testid="button-create-project"
              >
                Create & Open
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editProject} onOpenChange={(open) => !open && setEditProject(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Project</DialogTitle>
            <DialogDescription>Update project details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-xs font-semibold">Name</Label>
              <Input
                id="edit-name"
                data-testid="input-edit-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                className="h-10 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc" className="text-xs font-semibold">Description</Label>
              <Textarea
                id="edit-desc"
                data-testid="input-edit-desc"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="resize-none rounded-lg"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={() => setEditProject(null)} className="rounded-lg">Cancel</Button>
              <Button
                onClick={handleEdit}
                disabled={!newName.trim()}
                className="rounded-lg bg-gradient-to-r from-primary to-violet-600 text-white border-0 shadow-sm shadow-primary/15"
                data-testid="button-save-edit"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
