import { Handle, Position, NodeProps } from 'reactflow';
import { GitBranch } from 'lucide-react';
import { ConditionNodeData } from '../../types/workflowTypes';
import { useWorkflowStore } from '../../store/workflowStore';
import { cn } from '@/lib/utils';

export default function ConditionNode({ id, data, selected }: NodeProps<ConditionNodeData>) {
  const simulation = useWorkflowStore((s) => s.simulation);
  const isActive = simulation.activeNodeId === id;
  const isVisited = simulation.visitedNodeIds.includes(id);

  return (
    <div
      data-testid={`node-condition-${id}`}
      className={cn(
        'relative px-4 py-3.5 rounded-2xl min-w-[210px] transition-all duration-300 cursor-pointer',
        'bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm',
        'border border-amber-200/80 dark:border-amber-500/30',
        'shadow-sm hover:shadow-md',
        'hover:scale-[1.02] hover:-translate-y-0.5',
        selected && 'ring-2 ring-amber-500/70 ring-offset-2 ring-offset-background border-amber-400 dark:border-amber-400/60 shadow-lg',
        isActive && 'animate-glow-pulse-amber scale-[1.03] border-amber-400 dark:border-amber-400',
        isVisited && !isActive && 'opacity-50 scale-[0.98]'
      )}
    >
      {/* Top gradient accent bar */}
      <div className="absolute top-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400" />

      {/* Active glow ring */}
      {isActive && (
        <div className="absolute -inset-[3px] rounded-2xl bg-gradient-to-r from-amber-400/30 via-orange-400/20 to-yellow-400/30 blur-sm pointer-events-none" />
      )}

      <Handle
        type="target"
        position={Position.Top}
        className="!w-3.5 !h-3.5 !bg-gradient-to-br !from-amber-400 !to-orange-500 !border-2 !border-white dark:!border-slate-800 !shadow-sm !-top-[7px]"
      />

      <div className="relative flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
          'shadow-md shadow-amber-500/25',
          isActive && 'shadow-lg shadow-amber-500/40'
        )}>
          <GitBranch className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-600 dark:text-amber-400">
            Condition
          </p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate mt-0.5">
            {data.label}
          </p>
        </div>
      </div>

      {/* Expression display */}
      {data.expression && (
        <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-500/20">
          <code className="text-[11px] font-mono text-amber-700 dark:text-amber-300 truncate block">
            if ({data.expression})
          </code>
        </div>
      )}

      {/* Branch labels */}
      <div className="flex justify-between mt-3 px-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-sm shadow-emerald-400/30" />
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400">True</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-red-500 dark:text-red-400">False</span>
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-red-400 to-rose-500 shadow-sm shadow-red-400/30" />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!w-3.5 !h-3.5 !bg-gradient-to-br !from-emerald-400 !to-green-500 !border-2 !border-white dark:!border-slate-800 !shadow-sm !-bottom-[7px]"
        style={{ left: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="!w-3.5 !h-3.5 !bg-gradient-to-br !from-red-400 !to-rose-500 !border-2 !border-white dark:!border-slate-800 !shadow-sm !-bottom-[7px]"
        style={{ left: '70%' }}
      />
    </div>
  );
}
