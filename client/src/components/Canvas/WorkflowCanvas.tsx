import { useCallback, useRef, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '../../store/workflowStore';
import StartNode from '../nodes/StartNode';
import ConditionNode from '../nodes/ConditionNode';
import ActionNode from '../nodes/ActionNode';
import DelayNode from '../nodes/DelayNode';
import DeletableEdge from '../edges/DeletableEdge';

const nodeTypes = {
  start: StartNode,
  condition: ConditionNode,
  action: ActionNode,
  delay: DelayNode,
};

const edgeTypes = {
  smoothstep: DeletableEdge,
  default: DeletableEdge,
};

function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNodeId,
    simulation,
  } = useWorkflowStore();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as
        | 'start'
        | 'condition'
        | 'action'
        | 'delay';

      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [screenToFlowPosition, addNode]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: any) => {
      if (!simulation.isRunning) {
        setSelectedNodeId(node.id);
      }
    },
    [setSelectedNodeId, simulation.isRunning]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'smoothstep',
      style: { strokeWidth: 2.5 },
    }),
    []
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full" data-testid="workflow-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        deleteKeyCode={['Backspace', 'Delete']}
        nodesDraggable={!simulation.isRunning}
        nodesConnectable={!simulation.isRunning}
        elementsSelectable={!simulation.isRunning}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          className="!bg-background"
          color="hsl(var(--muted-foreground) / 0.15)"
        />
        <Controls
          showFitView
          showZoom
          showInteractive={false}
          position="bottom-left"
        />
        <MiniMap
          maskColor="rgba(0, 0, 0, 0.08)"
          nodeColor={(node) => {
            switch (node.type) {
              case 'start': return '#22c55e';
              case 'condition': return '#f59e0b';
              case 'action': return '#3b82f6';
              case 'delay': return '#8b5cf6';
              default: return '#6b7280';
            }
          }}
          nodeStrokeWidth={3}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}

export default function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
