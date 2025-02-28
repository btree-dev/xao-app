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

import * as Client from "@web3-storage/w3up-client"
import { StoreMemory } from "@web3-storage/w3up-client/stores/memory"
import * as Proof from "@web3-storage/w3up-client/proof"
import { Signer } from "@web3-storage/w3up-client/principal/ed25519"

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

async function createSpaceAccess() {
  const principal = Signer.parse(import.meta.env.VITE_WEB3_STORAGE_TOKEN);
  const store = new StoreMemory();
  const client = await Client.create({ principal, store });
  // Add proof that this agent has been delegated capabilities on the space
  const proof = await Proof.parse(import.meta.env.VITE_WEB3_STORAGE_PROOF);
  const space = await client.addSpace(proof);
  await client.setCurrentSpace(space.did());
}

function App() {
  const oktoClient = useOkto();

  //check if user is already logged in
  const isloggedIn = oktoClient.isLoggedIn();
  console.log(isloggedIn);
  console.log(oktoClient);
  if (isloggedIn) {
    createSpaceAccess();
  }
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