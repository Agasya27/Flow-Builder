import { memo, useState } from 'react';
import {
    EdgeProps,
    getSmoothStepPath,
    EdgeLabelRenderer,
} from 'reactflow';
import { X } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { cn } from '@/lib/utils';

function DeletableEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    selected,
    label,
}: EdgeProps) {
    const [hovered, setHovered] = useState(false);
    const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
    const isRunning = useWorkflowStore((s) => s.simulation.isRunning);

    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
    });

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isRunning) return;
        onEdgesChange([{ id, type: 'remove' }]);
    };

    const showButton = (hovered || selected) && !isRunning;

    // Determine label styling
    const labelStr = typeof label === 'string' ? label : '';
    const isTrueLabel = labelStr.toLowerCase() === 'true';
    const isFalseLabel = labelStr.toLowerCase() === 'false';
    const hasConditionLabel = isTrueLabel || isFalseLabel;

    // Position label closer to the source (30% of the way from source to midpoint)
    const sourceLabelX = sourceX + (labelX - sourceX) * 0.55;
    const sourceLabelY = sourceY + (labelY - sourceY) * 0.55;

    return (
        <>
            {/* Invisible wider hit area for easier hover/click on mobile */}
            <path
                d={edgePath}
                fill="none"
                stroke="transparent"
                strokeWidth={20}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => setHovered(true)}
                style={{ cursor: 'pointer' }}
            />
            {/* Visible edge */}
            <path
                d={edgePath}
                fill="none"
                stroke={showButton ? 'hsl(var(--destructive))' : (style.stroke as string) || 'hsl(var(--muted-foreground) / 0.4)'}
                strokeWidth={showButton ? 3 : (style.strokeWidth as number) || 2.5}
                markerEnd={markerEnd}
                className="transition-all duration-150"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            />

            {/* Condition branch label (True/False) */}
            {hasConditionLabel && !showButton && (
                <EdgeLabelRenderer>
                    <div
                        className={cn(
                            'absolute pointer-events-none select-none',
                            'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                            'shadow-sm border backdrop-blur-sm',
                            isTrueLabel && 'bg-emerald-50/90 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-500/30',
                            isFalseLabel && 'bg-red-50/90 dark:bg-red-950/80 text-red-500 dark:text-red-400 border-red-200/80 dark:border-red-500/30',
                        )}
                        style={{
                            transform: `translate(-50%, -50%) translate(${sourceLabelX}px, ${sourceLabelY}px)`,
                        }}
                    >
                        <span className="flex items-center gap-1">
                            <span className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                isTrueLabel && 'bg-emerald-500',
                                isFalseLabel && 'bg-red-500',
                            )} />
                            {labelStr}
                        </span>
                    </div>
                </EdgeLabelRenderer>
            )}

            {/* Delete button at midpoint */}
            {showButton && (
                <EdgeLabelRenderer>
                    <button
                        className={cn(
                            'absolute pointer-events-auto',
                            'w-5 h-5 rounded-full',
                            'bg-destructive text-destructive-foreground',
                            'flex items-center justify-center',
                            'shadow-md shadow-destructive/30',
                            'hover:scale-110 active:scale-95 transition-transform',
                            'border-2 border-background',
                            'cursor-pointer'
                        )}
                        style={{
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        }}
                        onClick={handleDelete}
                        onTouchEnd={(e) => { e.stopPropagation(); if (!isRunning) onEdgesChange([{ id, type: 'remove' }]); }}
                        title="Delete edge"
                        aria-label="Delete edge"
                    >
                        <X className="w-2.5 h-2.5" />
                    </button>
                </EdgeLabelRenderer>
            )}
        </>
    );
}

export default memo(DeletableEdge);
