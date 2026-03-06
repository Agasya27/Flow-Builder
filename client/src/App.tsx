import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/Landing";
import WorkflowBuilder from "@/pages/WorkflowBuilder";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { useWorkflowStore } from "./store/workflowStore";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/builder/:id" component={WorkflowBuilder} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const isDark = useWorkflowStore((s) => s.isDarkMode);

  // Sync dark mode class on html element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('transitioning');
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Remove transitioning class after animation completes
    const timer = setTimeout(() => root.classList.remove('transitioning'), 350);
    return () => clearTimeout(timer);
  }, [isDark]);

  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
