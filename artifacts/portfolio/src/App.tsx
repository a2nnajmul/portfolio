import { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "@/pages/Home";

const AdminShell = lazy(() => import("@/pages/Admin"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="portfolio-theme">
        <Switch>
          <Route path="/admin" nest>
            <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><span className="text-muted-foreground">Loading…</span></div>}>
              <AdminShell />
            </Suspense>
          </Route>
          <Route path="/">
            <Home />
          </Route>
          <Route>
            <Home />
          </Route>
        </Switch>
        <Toaster richColors closeButton />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
