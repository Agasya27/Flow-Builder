import { WorkflowNode, WorkflowEdge, ActionNodeData } from '../types/workflowTypes';

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runSimulation(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  callbacks: {
    onNodeActivate: (nodeId: string) => void;
    onNodeVisited: (nodeId: string) => void;
    onLog: (message: string) => void;
    onComplete: () => void;
    shouldStop: () => boolean;
  }
) {
  const startNode = nodes.find((n) => n.data.type === 'start');
  if (!startNode) {
    callbacks.onLog('No Start node found. Add a Start node to begin.');
    callbacks.onComplete();
    return;
  }

  let currentNode: WorkflowNode | undefined = startNode;

  while (currentNode && !callbacks.shouldStop()) {
    callbacks.onNodeActivate(currentNode.id);
    callbacks.onNodeVisited(currentNode.id);

    const data = currentNode.data;

    switch (data.type) {
      case 'start':
        callbacks.onLog(`Starting workflow: "${data.label}"`);
        await sleep(800);
        break;

      case 'action': {
        const actionData = data as ActionNodeData;
        const actionType = actionData.actionType || 'log_message';

        switch (actionType) {
          case 'log_message':
            callbacks.onLog(`Executing: "${actionData.message}"`);
            break;
          case 'send_email':
            callbacks.onLog(`Sending email to ${actionData.recipient || '(no recipient)'} — "${actionData.subject || actionData.message}"`);
            break;
          case 'http_request':
            callbacks.onLog(`${actionData.method || 'GET'} ${actionData.url || '(no URL)'}`);
            break;
          case 'set_variable':
            callbacks.onLog(`Set ${actionData.variableName || 'var'} = ${actionData.variableValue || 'undefined'}`);
            break;
          case 'transform_data':
            callbacks.onLog(`Transform: "${actionData.message}"`);
            break;
        }
        await sleep(1000);
        break;
      }

      case 'delay': {
        const seconds = data.duration;
        callbacks.onLog(`Waiting for ${seconds} second${seconds !== 1 ? 's' : ''}...`);
        await sleep(seconds * 1000);
        callbacks.onLog(`Delay complete.`);
        break;
      }

      case 'condition': {
        callbacks.onLog(`Evaluating condition: "${data.expression}"`);
        await sleep(800);

        let result = false;
        try {
          result = evaluateExpression(data.expression);
        } catch {
          callbacks.onLog(`Expression error — defaulting to false`);
        }

        callbacks.onLog(`Condition result: ${result}`);

        const branchHandle = result ? 'true' : 'false';
        const nextEdge = edges.find(
          (e) => e.source === currentNode!.id && e.sourceHandle === branchHandle
        );

        if (nextEdge) {
          currentNode = nodes.find((n) => n.id === nextEdge.target);
        } else {
          callbacks.onLog(`No "${branchHandle}" branch connected. Simulation ended.`);
          currentNode = undefined;
        }
        continue;
      }
    }

    const outgoingEdge = edges.find((e) => e.source === currentNode!.id);
    if (outgoingEdge) {
      currentNode = nodes.find((n) => n.id === outgoingEdge.target);
    } else {
      currentNode = undefined;
    }
  }

  if (!callbacks.shouldStop()) {
    callbacks.onLog('Simulation complete.');
  }
  callbacks.onNodeActivate('');
  callbacks.onComplete();
}

function evaluateExpression(expression: string): boolean {
  const cleaned = expression.trim().toLowerCase();

  if (cleaned === 'true') return true;
  if (cleaned === 'false') return false;

  const compMatch = cleaned.match(/^(\w+)\s*(>|<|>=|<=|===|==|!==|!=)\s*(.+)$/);
  if (compMatch) {
    const [, , op, rightStr] = compMatch;
    const right = parseFloat(rightStr);
    const left = Math.random() * 2000;

    switch (op) {
      case '>': return left > right;
      case '<': return left < right;
      case '>=': return left >= right;
      case '<=': return left <= right;
      case '==':
      case '===': return left === right;
      case '!=':
      case '!==': return left !== right;
    }
  }

  return Math.random() > 0.5;
}
