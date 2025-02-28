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
  environment: "mainnet", // or use import.meta.env.VITE_OKTO_ENV if you want to make it configurable
  clientId: import.meta.env.VITE_OKTO_CLIENT_ID,
  redirectUri: import.meta.env.VITE_OKTO_REDIRECT_URI,
};

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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