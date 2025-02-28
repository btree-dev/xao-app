import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { OktoClientConfig, OktoProvider } from "@okto_web3/react-sdk";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import "./index.css";
import { Buffer } from 'buffer';

window.Buffer = Buffer;

const config: OktoClientConfig = {
    environment: import.meta.env.VITE_OKTO_ENVIRONMENT,
    clientPrivateKey: import.meta.env.VITE_CLIENT_PRIVATE_KEY,
    clientSWA: import.meta.env.VITE_CLIENT_SWA,
  };
  
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  console.log(GOOGLE_CLIENT_ID);
  console.log(config);
  
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <OktoProvider config={config}>
            <App />
          </OktoProvider>
        </GoogleOAuthProvider>
      </BrowserRouter>
    </StrictMode>
  );