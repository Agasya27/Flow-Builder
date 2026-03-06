import { Handle, Position, NodeProps } from 'reactflow';
import { Play } from 'lucide-react';
import { StartNodeData } from '../../types/workflowTypes';
import { useWorkflowStore } from '../../store/workflowStore';
import { cn } from '@/lib/utils';

export default function StartNode({ id, data, selected }: NodeProps<StartNodeData>) {
  const simulation = useWorkflowStore((s) => s.simulation);
  const isActive = simulation.activeNodeId === id;
  const isVisited = simulation.visitedNodeIds.includes(id);

  return (
    <div
      data-testid={`node-start-${id}`}
      className={cn(
        'relative px-4 py-3.5 rounded-2xl min-w-[190px] transition-all duration-300 cursor-pointer',
        'bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm',
        'border border-emerald-200/80 dark:border-emerald-500/30',
        'shadow-sm hover:shadow-md',
        'hover:scale-[1.02] hover:-translate-y-0.5',
        selected && 'ring-2 ring-emerald-500/70 ring-offset-2 ring-offset-background border-emerald-400 dark:border-emerald-400/60 shadow-lg',
        isActive && 'animate-glow-pulse-green scale-[1.03] border-emerald-400 dark:border-emerald-400',
        isVisited && !isActive && 'opacity-50 scale-[0.98]'
      )}
    >
      {/* Top gradient accent bar */}
      <div className="absolute top-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400" />

      {/* Active glow ring */}
      {isActive && (
        <div className="absolute -inset-[3px] rounded-2xl bg-gradient-to-r from-emerald-400/30 via-green-400/20 to-teal-400/30 blur-sm pointer-events-none" />
      )}

      <div className="relative flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          'bg-gradient-to-br from-emerald-500 to-green-600 text-white',
          'shadow-md shadow-emerald-500/25',
          isActive && 'shadow-lg shadow-emerald-500/40'
        )}>
          <Play className="w-4.5 h-4.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400">
            Start
          </p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate mt-0.5">
            {data.label}
          </p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3.5 !h-3.5 !bg-gradient-to-br !from-emerald-400 !to-green-500 !border-2 !border-white dark:!border-slate-800 !shadow-sm !-bottom-[7px]"
      />
    </div>
  );
}
