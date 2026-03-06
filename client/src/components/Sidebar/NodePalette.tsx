import { Play, GitBranch, Zap, Timer, GripVertical, Plus } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { cn } from '@/lib/utils';

const nodeTypes = [
  {
    type: 'start',
    label: 'Start Node',
    description: 'Begin workflow execution',
    icon: Play,
    gradient: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-50/60 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-200/60 dark:border-emerald-500/20',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-500/40',
    shadowColor: 'shadow-emerald-500/10',
  },
  {
    type: 'condition',
    label: 'Condition Node',
    description: 'Branch based on logic',
    icon: GitBranch,
    gradient: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50/60 dark:bg-amber-950/20',
    borderColor: 'border-amber-200/60 dark:border-amber-500/20',
    textColor: 'text-amber-700 dark:text-amber-300',
    hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-500/40',
    shadowColor: 'shadow-amber-500/10',
  },
  {
    type: 'action',
    label: 'Action Node',
    description: 'Execute an operation',
    icon: Zap,
    gradient: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50/60 dark:bg-blue-950/20',
    borderColor: 'border-blue-200/60 dark:border-blue-500/20',
    textColor: 'text-blue-700 dark:text-blue-300',
    hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-500/40',
    shadowColor: 'shadow-blue-500/10',
  },
  {
    type: 'delay',
    label: 'Delay Node',
    description: 'Wait before continuing',
    icon: Timer,
    gradient: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-50/60 dark:bg-violet-950/20',
    borderColor: 'border-violet-200/60 dark:border-violet-500/20',
    textColor: 'text-violet-700 dark:text-violet-300',
    hoverBorder: 'hover:border-violet-300 dark:hover:border-violet-500/40',
    shadowColor: 'shadow-violet-500/10',
  },
];

interface NodePaletteProps {
  className?: string;
  onTapAdd?: (type: string) => void;
}

export default function NodePalette({ className, onTapAdd }: NodePaletteProps) {
  const nodes = useWorkflowStore((s) => s.nodes);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Count nodes by type
  const getNodeCount = (type: string) => {
    return nodes.filter((n) => n.data.type === type).length;
  };

  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <div className="px-1 mb-1">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Node Types
        </h3>
        <p className="text-[10px] text-muted-foreground/70 mt-0.5">
          {onTapAdd ? 'Tap to add a node to the canvas' : 'Drag nodes onto the canvas'}
        </p>
      </div>
      {nodeTypes.map((node) => {
        const count = getNodeCount(node.type);
        return (
          <div
            key={node.type}
            data-testid={`palette-${node.type}`}
            draggable={!onTapAdd}
            onDragStart={(e) => !onTapAdd && onDragStart(e, node.type)}
            onClick={() => onTapAdd?.(node.type)}
            className={cn(
              'group flex items-center gap-3 p-3 rounded-xl border',
              onTapAdd ? 'cursor-pointer active:scale-[0.97]' : 'cursor-grab active:cursor-grabbing',
              'transition-all duration-200',
              node.bgColor,
              node.borderColor,
              node.hoverBorder,
              'hover:shadow-md',
              node.shadowColor,
              'hover:-translate-y-0.5 active:translate-y-0',
              'select-none'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
              'bg-gradient-to-br', node.gradient,
              'text-white shadow-md',
              'group-hover:shadow-lg transition-shadow duration-200'
            )}>
              <node.icon className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={cn('text-sm font-semibold', node.textColor)}>
                  {node.label}
                </p>
                {count > 0 && (
                  <span className={cn(
                    'text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                    'bg-white/60 dark:bg-white/10',
                    node.textColor
                  )}>
                    {count}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                {node.description}
              </p>
            </div>
            {onTapAdd ? (
              <Plus className="w-4 h-4 text-muted-foreground/30 shrink-0 group-hover:text-muted-foreground/50 transition-colors" />
            ) : (
              <GripVertical className="w-4 h-4 text-muted-foreground/30 shrink-0 group-hover:text-muted-foreground/50 transition-colors" />
            )}
          </div>
        );
      })}
    </div>
  );
}
