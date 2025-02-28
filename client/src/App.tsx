import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { useOkto } from "@okto_web3/react-sdk";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "./lib/protected-route";

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
      <Route path="/event/:id" component={EventPage} />
      <ProtectedRoute path="/create-event" component={CreateEvent} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const oktoClient = useOkto();

  //check if user is already logged in
  const isloggedIn = oktoClient.isLoggedIn();
  console.log(isloggedIn);
  console.log(oktoClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
          <div className="min-h-screen bg-background">
            <Router />
          </div>
          <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;