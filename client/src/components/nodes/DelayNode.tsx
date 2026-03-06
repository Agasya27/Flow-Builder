import { Handle, Position, NodeProps } from 'reactflow';
import { Timer } from 'lucide-react';
import { DelayNodeData } from '../../types/workflowTypes';
import { useWorkflowStore } from '../../store/workflowStore';
import { cn } from '@/lib/utils';

export default function DelayNode({ id, data, selected }: NodeProps<DelayNodeData>) {
  const simulation = useWorkflowStore((s) => s.simulation);
  const isActive = simulation.activeNodeId === id;
  const isVisited = simulation.visitedNodeIds.includes(id);

  return (
    <div
      data-testid={`node-delay-${id}`}
      className={cn(
        'relative px-4 py-3.5 rounded-2xl min-w-[190px] transition-all duration-300 cursor-pointer',
        'bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm',
        'border border-violet-200/80 dark:border-violet-500/30',
        'shadow-sm hover:shadow-md',
        'hover:scale-[1.02] hover:-translate-y-0.5',
        selected && 'ring-2 ring-violet-500/70 ring-offset-2 ring-offset-background border-violet-400 dark:border-violet-400/60 shadow-lg',
        isActive && 'animate-glow-pulse-violet scale-[1.03] border-violet-400 dark:border-violet-400',
        isVisited && !isActive && 'opacity-50 scale-[0.98]'
      )}
    >
      {/* Top gradient accent bar */}
      <div className="absolute top-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400" />

      {/* Active glow ring */}
      {isActive && (
        <div className="absolute -inset-[3px] rounded-2xl bg-gradient-to-r from-violet-400/30 via-purple-400/20 to-fuchsia-400/30 blur-sm pointer-events-none" />
      )}

      <Handle
        type="target"
        position={Position.Top}
        className="!w-3.5 !h-3.5 !bg-gradient-to-br !from-violet-400 !to-purple-500 !border-2 !border-white dark:!border-slate-800 !shadow-sm !-top-[7px]"
      />

      <div className="relative flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          'bg-gradient-to-br from-violet-500 to-purple-600 text-white',
          'shadow-md shadow-violet-500/25',
          isActive && 'shadow-lg shadow-violet-500/40'
        )}>
          <Timer className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-violet-600 dark:text-violet-400">
            Delay
          </p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate mt-0.5">
            {data.label}
          </p>
        </div>
      </div>

      {/* Duration display */}
      <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-violet-50/80 dark:bg-violet-950/30 border border-violet-200/60 dark:border-violet-500/20 flex items-center gap-2">
        <Timer className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 shrink-0" />
        <span className="text-[11px] font-mono font-semibold text-violet-700 dark:text-violet-300">
          {data.duration} second{data.duration !== 1 ? 's' : ''}
        </span>
        {isActive && (
          <div className="ml-auto w-3 h-3 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3.5 !h-3.5 !bg-gradient-to-br !from-violet-400 !to-purple-500 !border-2 !border-white dark:!border-slate-800 !shadow-sm !-bottom-[7px]"
      />
    </div>
  );
}
