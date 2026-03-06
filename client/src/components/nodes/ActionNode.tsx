import { Handle, Position, NodeProps } from 'reactflow';
import { Zap, Send, Globe, Variable, Repeat, MessageSquare } from 'lucide-react';
import { ActionNodeData, ActionType } from '../../types/workflowTypes';
import { useWorkflowStore } from '../../store/workflowStore';
import { cn } from '@/lib/utils';

const actionTypeConfig: Record<ActionType, { icon: typeof Zap; shortLabel: string }> = {
  log_message: { icon: MessageSquare, shortLabel: 'Log' },
  send_email: { icon: Send, shortLabel: 'Email' },
  http_request: { icon: Globe, shortLabel: 'HTTP' },
  set_variable: { icon: Variable, shortLabel: 'Var' },
  transform_data: { icon: Repeat, shortLabel: 'Transform' },
};

export default function ActionNode({ id, data, selected }: NodeProps<ActionNodeData>) {
  const simulation = useWorkflowStore((s) => s.simulation);
  const isActive = simulation.activeNodeId === id;
  const isVisited = simulation.visitedNodeIds.includes(id);

  const config = actionTypeConfig[data.actionType || 'log_message'];
  const ActionIcon = config.icon;

  // Build preview text based on action type
  const getPreviewText = () => {
    switch (data.actionType) {
      case 'send_email':
        return data.recipient ? `To: ${data.recipient}` : data.message;
      case 'http_request':
        return data.url ? `${data.method || 'GET'} ${data.url}` : data.message;
      case 'set_variable':
        return data.variableName ? `${data.variableName} = ${data.variableValue || '...'}` : data.message;
      case 'transform_data':
        return data.message || 'Transform pipeline';
      default:
        return data.message;
    }
  };

  return (
    <div
      data-testid={`node-action-${id}`}
      className={cn(
        'relative px-4 py-3.5 rounded-2xl min-w-[190px] max-w-[260px] transition-all duration-300 cursor-pointer',
        'bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm',
        'border border-blue-200/80 dark:border-blue-500/30',
        'shadow-sm hover:shadow-md',
        'hover:scale-[1.02] hover:-translate-y-0.5',
        selected && 'ring-2 ring-blue-500/70 ring-offset-2 ring-offset-background border-blue-400 dark:border-blue-400/60 shadow-lg',
        isActive && 'animate-glow-pulse-blue scale-[1.03] border-blue-400 dark:border-blue-400',
        isVisited && !isActive && 'opacity-50 scale-[0.98]'
      )}
    >
      {/* Top gradient accent bar */}
      <div className="absolute top-0 left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400" />

      {/* Active glow ring */}
      {isActive && (
        <div className="absolute -inset-[3px] rounded-2xl bg-gradient-to-r from-blue-400/30 via-indigo-400/20 to-cyan-400/30 blur-sm pointer-events-none" />
      )}

      <Handle
        type="target"
        position={Position.Top}
        className="!w-3.5 !h-3.5 !bg-gradient-to-br !from-blue-400 !to-indigo-500 !border-2 !border-white dark:!border-slate-800 !shadow-sm !-top-[7px]"
      />

      <div className="relative flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          'bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
          'shadow-md shadow-blue-500/25',
          isActive && 'shadow-lg shadow-blue-500/40'
        )}>
          <ActionIcon className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400">
              Action
            </p>
            <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-px rounded-full bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 border border-blue-200/50 dark:border-blue-500/20">
              {config.shortLabel}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate mt-0.5">
            {data.label}
          </p>
        </div>
      </div>

      {/* Preview text */}
      {getPreviewText() && (
        <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-500/20">
          <p className="text-[11px] text-blue-700 dark:text-blue-300 line-clamp-2 leading-relaxed font-mono">
            {getPreviewText()}
          </p>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3.5 !h-3.5 !bg-gradient-to-br !from-blue-400 !to-indigo-500 !border-2 !border-white dark:!border-slate-800 !shadow-sm !-bottom-[7px]"
      />
    </div>
  );
}
