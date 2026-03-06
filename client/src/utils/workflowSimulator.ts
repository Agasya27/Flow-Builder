import { WorkflowNode, WorkflowEdge, WorkflowNodeData, ActionNodeData } from '../types/workflowTypes';

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Simulated context for expression evaluation ───
// During simulation, condition expressions are evaluated against this context.
// Users can reference these variables in their expressions using dot notation.
// Values are randomized on each simulation run so you see different paths.
function createSimulationContext(): Record<string, unknown> {
  const verified = Math.random() > 0.5;
  const age = Math.floor(Math.random() * 60) + 14;
  const score = Math.floor(Math.random() * 1000);
  const roles = ['admin', 'user', 'editor', 'viewer'];
  const statuses = ['active', 'inactive', 'pending', 'suspended'];

  return {
    user: {
      emailVerified: verified,
      email: 'demo@flowbuilder.app',
      name: 'Demo User',
      age,
      role: roles[Math.floor(Math.random() * roles.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      premium: Math.random() > 0.6,
      loginCount: Math.floor(Math.random() * 100),
    },
    order: {
      total: Math.floor(Math.random() * 500) + 10,
      itemCount: Math.floor(Math.random() * 10) + 1,
      status: ['pending', 'confirmed', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
      isPaid: Math.random() > 0.3,
    },
    value: Math.floor(Math.random() * 2000),
    score,
    count: Math.floor(Math.random() * 50),
    enabled: Math.random() > 0.5,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    temperature: Math.floor(Math.random() * 40) - 5,
  };
}

// ─── Expression evaluator ───
// Safely evaluates expressions like:
//   "true", "false"
//   "user.emailVerified === true"
//   "score > 100"
//   "user.age >= 18 && user.role === 'admin'"
//   "order.total > 200 || user.premium"
//   "!user.emailVerified"
//   "status !== 'inactive'"
function resolveValue(path: string, ctx: Record<string, unknown>): unknown {
  const trimmed = path.trim();

  // String literals: 'value' or "value"
  if ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    return trimmed.slice(1, -1);
  }

  // Number literals
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return parseFloat(trimmed);
  }

  // Boolean literals
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;

  // null / undefined
  if (trimmed === 'null') return null;
  if (trimmed === 'undefined') return undefined;

  // Dot-notation property lookup: user.emailVerified, order.total, etc.
  const parts = trimmed.split('.');
  let current: unknown = ctx;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function evaluateSingleComparison(expr: string, ctx: Record<string, unknown>): boolean {
  const trimmed = expr.trim();

  // Handle negation: !something
  if (trimmed.startsWith('!')) {
    const inner = trimmed.slice(1).trim();
    const val = resolveValue(inner, ctx);
    return !val;
  }

  // Try comparison operators (order matters — check longer ops first)
  const operators = ['!==', '===', '!=', '==', '>=', '<=', '>', '<'];
  for (const op of operators) {
    const idx = trimmed.indexOf(op);
    if (idx !== -1) {
      // Make sure we don't match inside a string literal
      const leftStr = trimmed.slice(0, idx);
      const rightStr = trimmed.slice(idx + op.length);

      const left = resolveValue(leftStr, ctx);
      const right = resolveValue(rightStr, ctx);

      switch (op) {
        case '===': return left === right;
        case '!==': return left !== right;
        case '==': return left == right;
        case '!=': return left != right;
        case '>': return Number(left) > Number(right);
        case '<': return Number(left) < Number(right);
        case '>=': return Number(left) >= Number(right);
        case '<=': return Number(left) <= Number(right);
      }
    }
  }

  // No operator found — treat as a truthy check
  const val = resolveValue(trimmed, ctx);
  return !!val;
}

function evaluateExpression(expression: string, ctx: Record<string, unknown>): boolean {
  const trimmed = expression.trim();

  // Handle literal true/false first (fast path)
  if (trimmed.toLowerCase() === 'true') return true;
  if (trimmed.toLowerCase() === 'false') return false;

  // Split on || (OR) — each OR segment can contain && (AND)
  const orSegments = trimmed.split('||');

  for (const orSegment of orSegments) {
    const andSegments = orSegment.split('&&');
    let allTrue = true;

    for (const andSegment of andSegments) {
      if (!evaluateSingleComparison(andSegment, ctx)) {
        allTrue = false;
        break;
      }
    }

    if (allTrue) return true; // Short-circuit OR
  }

  return false;
}

// ─── Main simulation runner ───
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

  // Create a fresh simulation context with randomized values
  const ctx = createSimulationContext();
  const user = ctx.user as Record<string, unknown>;
  const order = ctx.order as Record<string, unknown>;
  callbacks.onLog(
    `📋 Context: temperature=${String(ctx.temperature)}, score=${String(ctx.score)}, status="${String(ctx.status)}", ` +
    `user.age=${String(user.age)}, user.role="${String(user.role)}", user.emailVerified=${String(user.emailVerified)}, ` +
    `order.total=${String(order.total)}, order.status="${String(order.status)}"`
  );

  let currentNode: WorkflowNode | undefined = startNode;

  while (currentNode && !callbacks.shouldStop()) {
    callbacks.onNodeActivate(currentNode.id);
    callbacks.onNodeVisited(currentNode.id);

    const data: WorkflowNodeData = currentNode.data;

    switch (data.type) {
      case 'start':
        callbacks.onLog(`▶ Starting workflow: "${data.label}"`);
        await sleep(800);
        break;

      case 'action': {
        const actionData = data as ActionNodeData;
        const actionType = actionData.actionType || 'log_message';

        switch (actionType) {
          case 'log_message':
            callbacks.onLog(`⚡ Executing: "${actionData.message}"`);
            break;
          case 'send_email':
            callbacks.onLog(`📧 Sending email to ${actionData.recipient || '(no recipient)'} — "${actionData.subject || actionData.message}"`);
            break;
          case 'http_request':
            callbacks.onLog(`🌐 ${actionData.method || 'GET'} ${actionData.url || '(no URL)'}`);
            break;
          case 'set_variable':
            callbacks.onLog(`📝 Set ${actionData.variableName || 'var'} = ${actionData.variableValue || 'undefined'}`);
            break;
          case 'transform_data':
            callbacks.onLog(`🔄 Transform: "${actionData.message}"`);
            break;
        }
        await sleep(1000);
        break;
      }

      case 'delay': {
        const seconds = Math.min(data.duration, 3); // Cap at 3s for simulation
        callbacks.onLog(`⏳ Waiting ${data.duration} second${data.duration !== 1 ? 's' : ''}... (simulated as ${seconds}s)`);
        await sleep(seconds * 1000);
        callbacks.onLog(`✓ Delay complete.`);
        break;
      }

      case 'condition': {
        const expression: string = data.expression?.trim() || '';
        callbacks.onLog(`🔀 Evaluating: "${expression || '(empty)'}"`);

        // Log referenced variable values for debugging
        if (expression && expression !== 'true' && expression !== 'false') {
          const varMatches = expression.match(/[a-zA-Z_][a-zA-Z0-9_.]*(?=\s*[><=!]|\s*$|\s*[&|])/g);
          if (varMatches) {
            const uniqueVars = Array.from(new Set(varMatches)).filter(v => v !== 'true' && v !== 'false');
            const varValues = uniqueVars.map(v => {
              const val = resolveValue(v, ctx);
              return `${v}=${typeof val === 'string' ? `"${val}"` : String(val)}`;
            });
            if (varValues.length > 0) {
              callbacks.onLog(`   📎 Values: ${varValues.join(', ')}`);
            }
          }
        }

        await sleep(800);

        let result = false;
        try {
          result = expression ? evaluateExpression(expression, ctx) : false;
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          callbacks.onLog(`⚠ Expression error: ${msg} — defaulting to false`);
        }

        callbacks.onLog(`→ Result: ${result ? '✅ TRUE' : '❌ FALSE'}`);

        const branchHandle: string = result ? 'true' : 'false';
        const nextEdge: WorkflowEdge | undefined = edges.find(
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
    callbacks.onLog('✅ Simulation complete.');
  }
  callbacks.onNodeActivate('');
  callbacks.onComplete();
}
