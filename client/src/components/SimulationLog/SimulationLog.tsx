import { useWorkflowStore } from '../../store/workflowStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Terminal, Circle, X, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface SimulationLogProps {
  className?: string;
}

export default function SimulationLog({ className }: SimulationLogProps) {
  const { simulation } = useWorkflowStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (simulation.isRunning || simulation.log.length > 0) {
      setIsVisible(true);
      setIsCollapsed(false);
    }
  }, [simulation.isRunning, simulation.log.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [simulation.log]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn(
      'border-t bg-slate-950/95 dark:bg-slate-950/90 backdrop-blur-sm text-slate-100 transition-all duration-300',
      isCollapsed ? 'h-10' : '',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
            Simulation Console
          </span>
          {simulation.isRunning && (
            <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 animate-pulse" />
          )}
          {!simulation.isRunning && simulation.log.length > 0 && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              {simulation.log.length} entries
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            onClick={() => setIsVisible(false)}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Log content */}
      {!isCollapsed && (
        <ScrollArea className="h-36" ref={scrollRef as any}>
          <div className="p-3 space-y-0.5">
            {simulation.log.map((entry, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 text-xs font-mono animate-log-entry py-0.5"
                data-testid={`log-entry-${i}`}
              >
                <span className="text-slate-600 shrink-0 w-6 text-right select-none tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-emerald-400/80 shrink-0 select-none">›</span>
                <span className={cn(
                  'text-slate-300',
                  entry.includes('Starting') && 'text-emerald-400',
                  entry.includes('complete') && 'text-sky-400',
                  entry.includes('Executing') && 'text-blue-400',
                  entry.includes('Waiting') && 'text-violet-400',
                  entry.includes('Evaluating') && 'text-amber-400',
                  entry.includes('true') && 'text-emerald-400',
                  entry.includes('false') && 'text-red-400',
                  entry.includes('error') && 'text-red-400',
                  entry.includes('ended') && 'text-amber-400',
                )}>
                  {entry}
                </span>
              </div>
            ))}
            {simulation.isRunning && simulation.log.length > 0 && (
              <div className="flex items-center gap-2 mt-1 text-xs font-mono text-slate-500">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Running...</span>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
