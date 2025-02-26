import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { Web3Provider } from "@/hooks/use-web3";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "./lib/protected-route";
import { NavHeader } from "@/components/nav-header";

import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import EventPage from "@/pages/event-page";
import CreateEvent from "@/pages/create-event";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/event/:id" component={EventPage} />
      <ProtectedRoute path="/create-event" component={CreateEvent} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Web3Provider>
          <div className="min-h-screen bg-background">
            <NavHeader />
            <Router />
          </div>
          <Toaster />
        </Web3Provider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;