import { useWorkflowStore } from '../../store/workflowStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Play,
  GitBranch,
  Zap,
  Timer,
  Trash2,
  X,
  MousePointerClick,
  Settings2,
  MessageSquare,
  Send,
  Globe,
  Variable,
  Repeat,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActionType } from '../../types/workflowTypes';

const actionTypeOptions: { value: ActionType; label: string; icon: typeof Zap; desc: string }[] = [
  { value: 'log_message', label: 'Log Message', icon: MessageSquare, desc: 'Output a message to the log' },
  { value: 'send_email', label: 'Send Email', icon: Send, desc: 'Send an email notification' },
  { value: 'http_request', label: 'HTTP Request', icon: Globe, desc: 'Make a web API call' },
  { value: 'set_variable', label: 'Set Variable', icon: Variable, desc: 'Store a value for later' },
  { value: 'transform_data', label: 'Transform Data', icon: Repeat, desc: 'Process and reshape data' },
];

const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

interface NodeConfigPanelProps {
  className?: string;
  onClose?: () => void;
  idPrefix?: string;
}

export default function NodeConfigPanel({ className, onClose, idPrefix = '' }: NodeConfigPanelProps) {
  const { nodes, selectedNodeId, updateNodeData, deleteNode, setSelectedNodeId } = useWorkflowStore();
  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        <div className="flex items-center gap-2 p-4 border-b border-border/50">
          <Settings2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Configuration</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center mb-4">
            <MousePointerClick className="w-7 h-7 text-muted-foreground/60" />
          </div>
          <p className="text-sm font-semibold text-foreground">No node selected</p>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-[200px] leading-relaxed">
            Click on any node in the canvas to view and edit its properties
          </p>
          {nodes.length === 0 && (
            <div className="mt-6 p-3 rounded-xl bg-gradient-to-br from-primary/5 to-violet-500/5 border border-primary/10 max-w-[220px]">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Drag a node from the left panel onto the canvas to get started
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const data = node.data;

  const headerConfig = {
    start: {
      icon: Play,
      gradient: 'from-emerald-500 to-green-600',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-200/60 dark:border-emerald-500/20',
      bgAccent: 'bg-emerald-50/60 dark:bg-emerald-950/20',
      label: 'Start Node',
    },
    condition: {
      icon: GitBranch,
      gradient: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-200/60 dark:border-amber-500/20',
      bgAccent: 'bg-amber-50/60 dark:bg-amber-950/20',
      label: 'Condition Node',
    },
    action: {
      icon: Zap,
      gradient: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200/60 dark:border-blue-500/20',
      bgAccent: 'bg-blue-50/60 dark:bg-blue-950/20',
      label: 'Action Node',
    },
    delay: {
      icon: Timer,
      gradient: 'from-violet-500 to-purple-600',
      textColor: 'text-violet-600 dark:text-violet-400',
      borderColor: 'border-violet-200/60 dark:border-violet-500/20',
      bgAccent: 'bg-violet-50/60 dark:bg-violet-950/20',
      label: 'Delay Node',
    },
  }[data.type];

  const Icon = headerConfig.icon;

  return (
    <div className={cn('flex flex-col h-full animate-fade-in', className)}>
      {/* Header with gradient accent */}
      <div className={cn('flex items-center justify-between gap-2 p-4 border-b', headerConfig.borderColor)}>
        <div className="flex items-center gap-2.5">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center text-white',
            'bg-gradient-to-br', headerConfig.gradient,
            'shadow-md'
          )}>
            <Icon className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className={cn('text-[10px] font-bold uppercase tracking-[0.12em]', headerConfig.textColor)}>
              {headerConfig.label}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">ID: {node.id.slice(0, 8)}</p>
          </div>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8 rounded-lg" data-testid="button-close-config">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Form content */}
      <div className="flex-1 p-4 space-y-5 overflow-y-auto custom-scrollbar">
        {/* Label input — all node types */}
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}node-label`} className="text-xs font-semibold">Label</Label>
          <Input
            id={`${idPrefix}node-label`}
            data-testid="input-node-label"
            value={data.label}
            onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
            className="h-9"
          />
          <p className="text-[10px] text-muted-foreground/70">Display name shown on the node</p>
        </div>

        {/* ==================== CONDITION NODE ==================== */}
        {data.type === 'condition' && (
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}node-expression`} className="text-xs font-semibold">Logical Expression</Label>
            <Input
              id={`${idPrefix}node-expression`}
              data-testid="input-node-expression"
              value={data.expression}
              onChange={(e) => updateNodeData(node.id, { expression: e.target.value })}
              placeholder="e.g. orderValue > 1000"
              className="font-mono text-sm h-9"
            />
            <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
              During simulation, uses random values. Type <span className="font-mono font-bold">true</span> or <span className="font-mono font-bold">false</span> for a fixed result.
            </p>
            <div className={cn('mt-3 p-3 rounded-xl border', headerConfig.bgAccent, headerConfig.borderColor)}>
              <p className={cn('text-[10px] font-medium leading-relaxed', headerConfig.textColor)}>
                Connect two outgoing edges — one for True and one for False branch.
              </p>
            </div>
          </div>
        )}

        {/* ==================== ACTION NODE ==================== */}
        {data.type === 'action' && (
          <>
            {/* Action Type Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Action Type</Label>
              <Select
                value={data.actionType || 'log_message'}
                onValueChange={(val) => updateNodeData(node.id, { actionType: val as ActionType })}
              >
                <SelectTrigger className="h-9" data-testid="select-action-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actionTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-medium">{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground/70">
                {actionTypeOptions.find((o) => o.value === (data.actionType || 'log_message'))?.desc}
              </p>
            </div>

            {/* Log Message fields */}
            {(data.actionType === 'log_message' || !data.actionType) && (
              <div className="space-y-2">
                <Label htmlFor={`${idPrefix}node-message`} className="text-xs font-semibold">Log Message</Label>
                <Textarea
                  id={`${idPrefix}node-message`}
                  data-testid="input-node-message"
                  value={data.message}
                  onChange={(e) => updateNodeData(node.id, { message: e.target.value })}
                  placeholder="Message to output in the log..."
                  className="resize-none text-sm min-h-[80px]"
                  rows={3}
                />
              </div>
            )}

            {/* Send Email fields */}
            {data.actionType === 'send_email' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}node-recipient`} className="text-xs font-semibold">Recipient</Label>
                  <Input
                    id={`${idPrefix}node-recipient`}
                    data-testid="input-node-recipient"
                    value={data.recipient || ''}
                    onChange={(e) => updateNodeData(node.id, { recipient: e.target.value })}
                    placeholder="user@example.com"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}node-subject`} className="text-xs font-semibold">Subject</Label>
                  <Input
                    id={`${idPrefix}node-subject`}
                    data-testid="input-node-subject"
                    value={data.subject || ''}
                    onChange={(e) => updateNodeData(node.id, { subject: e.target.value })}
                    placeholder="Email subject line"
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}node-email-body`} className="text-xs font-semibold">Body</Label>
                  <Textarea
                    id={`${idPrefix}node-email-body`}
                    data-testid="input-node-email-body"
                    value={data.message}
                    onChange={(e) => updateNodeData(node.id, { message: e.target.value })}
                    placeholder="Email body content..."
                    className="resize-none text-sm min-h-[80px]"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* HTTP Request fields */}
            {data.actionType === 'http_request' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">HTTP Method</Label>
                  <Select
                    value={data.method || 'GET'}
                    onValueChange={(val) => updateNodeData(node.id, { method: val })}
                  >
                    <SelectTrigger className="h-9 font-mono" data-testid="select-http-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {httpMethods.map((m) => (
                        <SelectItem key={m} value={m}>
                          <span className="font-mono font-bold">{m}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}node-url`} className="text-xs font-semibold">URL</Label>
                  <Input
                    id={`${idPrefix}node-url`}
                    data-testid="input-node-url"
                    value={data.url || ''}
                    onChange={(e) => updateNodeData(node.id, { url: e.target.value })}
                    placeholder="https://api.example.com/data"
                    className="h-9 font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}node-request-body`} className="text-xs font-semibold">Request Body (optional)</Label>
                  <Textarea
                    id={`${idPrefix}node-request-body`}
                    data-testid="input-node-request-body"
                    value={data.message}
                    onChange={(e) => updateNodeData(node.id, { message: e.target.value })}
                    placeholder='{"key": "value"}'
                    className="resize-none text-sm min-h-[60px] font-mono"
                    rows={2}
                  />
                </div>
              </div>
            )}

            {/* Set Variable fields */}
            {data.actionType === 'set_variable' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}node-var-name`} className="text-xs font-semibold">Variable Name</Label>
                  <Input
                    id={`${idPrefix}node-var-name`}
                    data-testid="input-node-var-name"
                    value={data.variableName || ''}
                    onChange={(e) => updateNodeData(node.id, { variableName: e.target.value })}
                    placeholder="myVariable"
                    className="h-9 font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}node-var-value`} className="text-xs font-semibold">Value</Label>
                  <Input
                    id={`${idPrefix}node-var-value`}
                    data-testid="input-node-var-value"
                    value={data.variableValue || ''}
                    onChange={(e) => updateNodeData(node.id, { variableValue: e.target.value })}
                    placeholder="42 or 'hello'"
                    className="h-9 font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}node-var-desc`} className="text-xs font-semibold">Description</Label>
                  <Input
                    id={`${idPrefix}node-var-desc`}
                    value={data.message}
                    onChange={(e) => updateNodeData(node.id, { message: e.target.value })}
                    placeholder="Purpose of this variable..."
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Transform Data fields */}
            {data.actionType === 'transform_data' && (
              <div className="space-y-2">
                <Label htmlFor={`${idPrefix}node-transform`} className="text-xs font-semibold">Transform Description</Label>
                <Textarea
                  id={`${idPrefix}node-transform`}
                  data-testid="input-node-transform"
                  value={data.message}
                  onChange={(e) => updateNodeData(node.id, { message: e.target.value })}
                  placeholder="Describe how data should be transformed..."
                  className="resize-none text-sm min-h-[80px]"
                  rows={3}
                />
                <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
                  During simulation, this action will log the transformation description
                </p>
              </div>
            )}

            <div className={cn('p-2.5 rounded-xl border', headerConfig.bgAccent, headerConfig.borderColor)}>
              <p className={cn('text-[10px] font-medium leading-relaxed', headerConfig.textColor)}>
                During simulation, action nodes execute and log their result to the console.
              </p>
            </div>
          </>
        )}

        {/* ==================== DELAY NODE ==================== */}
        {data.type === 'delay' && (
          <div className="space-y-3">
            <Label className="text-xs font-semibold">Delay Duration</Label>
            <div className="flex items-center gap-3">
              <Slider
                data-testid="slider-node-duration"
                value={[data.duration]}
                onValueChange={([val]) => updateNodeData(node.id, { duration: val })}
                min={1}
                max={30}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-mono font-bold w-12 text-right tabular-nums text-violet-600 dark:text-violet-400">
                {data.duration}s
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground/70">
              Simulation will pause for this duration before continuing
            </p>
          </div>
        )}

        {/* ==================== START NODE ==================== */}
        {data.type === 'start' && (
          <div className={cn('p-3 rounded-xl border', headerConfig.bgAccent, headerConfig.borderColor)}>
            <p className={cn('text-[10px] font-medium leading-relaxed', headerConfig.textColor)}>
              This is the entry point of your workflow. Connect an outgoing edge from the bottom handle to the next node.
            </p>
          </div>
        )}
      </div>

      {/* Footer with delete */}
      <div className="p-4 border-t border-border/50 space-y-2">
        <p className="text-[10px] text-muted-foreground/60 mb-2 font-mono">
          Position: {Math.round(node.position.x)}, {Math.round(node.position.y)}
        </p>
        <Button
          variant="destructive"
          size="sm"
          className="w-full gap-2 h-9"
          data-testid="button-delete-node"
          onClick={() => {
            deleteNode(node.id);
            setSelectedNodeId(null);
          }}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Node
        </Button>
      </div>
    </div>
  );
}
