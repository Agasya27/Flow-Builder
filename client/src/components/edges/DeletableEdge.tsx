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
