# Flow Builder

A visual workflow builder that runs entirely in the browser. Drag nodes onto a canvas, connect them with edges, configure their properties, and simulate execution — no backend required.

I built this because I wanted to explore how workflow editors like n8n and Retool handle node-based UIs, but without the overhead of a server. Everything here is client-side: React, Zustand for state, React Flow for the canvas, and localStorage for persistence.

![Landing Page](https://raw.githubusercontent.com/Agasya27/Flow-Builder/main/screenshots/landing.png)

## What it does

You get a canvas where you can build workflows out of four types of nodes:

- **Start** — every workflow begins here
- **Condition** — branches the flow based on a logical expression (e.g. `user.emailVerified === true`)
- **Action** — does something: log a message, send an email, make an HTTP request, set a variable, or transform data
- **Delay** — pauses the flow for a set duration

Drag them from the sidebar, drop them on the canvas, and connect them by pulling edges between handles. Click any node to open a config panel where you can edit its label, expression, action type, or whatever fields are relevant to that node type.

Once you've wired things up, hit **Run** to simulate the workflow step-by-step. The active node gets highlighted as the simulation walks through the graph. Condition nodes branch based on their expression — if you type `true` or `false` it follows that path, otherwise it picks randomly so you can see both branches.

![Builder View](https://raw.githubusercontent.com/Agasya27/Flow-Builder/main/screenshots/builder.png)

## Demo project

There's a built-in demo called **"Demo: User Onboarding"** that ships with the app. It has 9 nodes and 8 edges showing a realistic email verification flow — conditions, email actions, delays, an HTTP call, the works. You can interact with it freely (move nodes, delete edges, run the simulation), and it resets to its original state on page refresh. Good for getting a feel for how things work without having to build something from scratch.

## Features

- **Drag & drop** nodes from the sidebar onto the canvas
- **Visual connections** between nodes with directional edges
- **Click-to-delete edges** — hover over any edge and a red ✕ appears at the midpoint
- **Node configuration panel** with fields specific to each node type
- **Step-by-step simulation** with visual highlighting and a running log
- **Conditional branching** — condition nodes route to true/false paths
- **Zoom and pan** — scroll to zoom, drag to pan, fit-to-view button
- **JSON export/import** — download your workflow as JSON, upload it later to restore the exact state
- **Project management** — create, rename, duplicate, and delete projects
- **Dark mode** toggle
- **Mobile responsive** — works on phones with a bottom sheet for node config
- **Undo/redo** support

## Tech stack

| Layer | What I used |
|-------|-------------|
| Framework | React 18 + TypeScript |
| Canvas | [React Flow](https://reactflow.dev/) |
| State | [Zustand](https://github.com/pmndrs/zustand) |
| Styling | Tailwind CSS + shadcn/ui components |
| Routing | [Wouter](https://github.com/molefrog/wouter) |
| Build | Vite |
| Hosting | Vercel |

## Project structure

```
client/
├── src/
│   ├── components/
│   │   ├── Canvas/          — WorkflowCanvas (React Flow wrapper)
│   │   ├── ConfigPanel/     — NodeConfigPanel (side panel for editing node props)
│   │   ├── Sidebar/         — NodePalette (draggable node type list)
│   │   ├── SimulationLog/   — SimulationLog (step-by-step execution log)
│   │   ├── Toolbar/         — WorkflowToolbar (run, export, import, undo, redo)
│   │   ├── edges/           — DeletableEdge (custom edge with delete button)
│   │   ├── nodes/           — StartNode, ConditionNode, ActionNode, DelayNode
│   │   └── ui/              — shadcn/ui primitives (button, dialog, sheet, etc.)
│   ├── pages/
│   │   ├── Landing.tsx      — project list + hero section
│   │   └── WorkflowBuilder.tsx — main builder layout
│   ├── store/
│   │   ├── workflowStore.ts — nodes, edges, simulation state (Zustand)
│   │   └── projectStore.ts  — project CRUD + demo project seeding
│   ├── types/
│   │   └── workflowTypes.ts — TypeScript types for nodes, edges, simulation
│   └── utils/
│       └── workflowSimulator.ts — simulation engine (graph traversal + branching)
├── index.html
└── index.css                — global styles, dark mode, animations
```

## Running locally

```bash
git clone https://github.com/Agasya27/Flow-Builder.git
cd Flow-Builder
npm install
npm run dev
```

Opens at `http://localhost:5173`. That's it — no environment variables, no database, no API keys.

## Building for production

```bash
npm run build
```

Output goes to `dist/`. The `vercel.json` handles SPA routing so direct URLs like `/builder/some-id` don't 404.

## How the simulation works

The simulator (`workflowSimulator.ts`) does a simple graph traversal:

1. Finds the Start node
2. Follows outgoing edges to the next node
3. If it hits a Condition node, it evaluates the expression — `true`/`false` literals go to the matching branch, anything else picks a random path
4. Highlights each node for ~1 second with a purple glow
5. Logs every step to the simulation panel
6. Stops when there are no more outgoing edges

It's not a real execution engine — there's no actual email sending or HTTP requests. But it walks the graph correctly and handles branching, which is the interesting part.

## Things I'd improve if I kept going

- **Node grouping** — collapse a set of nodes into a single "group" node for cleaner layouts
- **Parallel execution** — let the simulator walk multiple branches simultaneously instead of picking one
- **Real expressions** — parse condition expressions properly instead of just checking for `true`/`false` strings  
- **Collaboration** — WebSocket-based real-time editing with CRDT for conflict resolution
- **Custom node types** — let users define their own node types with custom fields
- **Minimap** — React Flow has a minimap component, I just didn't add it yet

## License

MIT — do what you want with it.
