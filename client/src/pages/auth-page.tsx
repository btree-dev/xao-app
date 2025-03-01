import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { verifyEmailSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User as SelectUser } from "@shared/schema";
import { useNavigate } from "react-router-dom";

import { getAccount, useOkto } from "@okto_web3/react-sdk";
import { GoogleLogin } from "@react-oauth/google";
import Dashboard from "./dashboard";

export default function AuthPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isArtist, setIsArtist] = useState(true);
  const oktoClient = useOkto();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (oktoClient.isLoggedIn()) {
      console.log("logged in");
      addUser();
      navigate("/dashboard");
      return;
    }
    // If not authenticated with Okto, check for stored Google token
    const storedToken = localStorage.getItem("googleIdToken");
    if (storedToken) {
      console.log("storedToken", storedToken);
      handleAuthenticate(storedToken);
    }
  }, [oktoClient.isLoggedIn()]);

  // Authenticates user with Okto using Google ID token
  const handleAuthenticate = async (idToken: string) => {
    try {
      const user = await oktoClient.loginUsingOAuth({
        idToken: idToken,
        provider: "google",
      });
      console.log("Authenticated with Okto:", user);
      navigate("/home");
    } catch (error) {
      console.error("Authentication failed:", error);

      // Remove invalid token from storage
      localStorage.removeItem("googleIdToken");
    }
  };
  
  // Handles successful Google login
  // 1. Stores the ID token in localStorage
  // 2. Initiates Okto authentication
  const handleGoogleLogin = async (credentialResponse: any) => {
    const idToken = credentialResponse.credential || "";
    if (idToken) {
      localStorage.setItem("googleIdToken", idToken);
      handleAuthenticate(idToken);
    }
  };

  function addUser() {      
    
    const user = oktoClient?.userSWA ? { isArtist: isArtist, id: oktoClient.userSWA, walletAddress: oktoClient.userSWA, } as SelectUser : null;
    queryClient.setQueryData(["/api/user"], user);

    const getData = async () => {  
      const accounts = await getAccount(oktoClient);
      const userAccount = accounts.find(account => account.networkName === "BASE_TESTNET");
      console.log("User Address:", userAccount?.address);
      const user = userAccount?.address ? { isArtist: isArtist, id: userAccount?.address, walletAddress: userAccount?.address } as SelectUser : null;
      queryClient.setQueryData(["/api/user"], user);
    };
    getData();
  }
  async function handleAsyncGoogleLogin(credentialResponse: any) {
    try {
        setIsLoading(true);
        await oktoClient.loginUsingOAuth({
            idToken: credentialResponse.credential,
            provider: "google",
        });
        console.log("Google login successful");
        addUser();
    } catch (error) {
        console.error("Authentication error:", error);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
              Xao
            </CardTitle>
            <CardDescription>
              The Web3-native platform for event tickets
            </CardDescription>
          </CardHeader>
          <CardContent>
          <div>
            {isLoading ? (
              <div>Loading...</div>
            ) : oktoClient.userSWA ? (
              <>
              {addUser()}
              <div>Logged In...</div>
              </>
            ) : (
              <GoogleLogin onSuccess={handleAsyncGoogleLogin} />
            )}
        </div>
          </CardContent>
        </Card>
      </div>
      <div
        className="hidden lg:block flex-1 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1653389525308-e7ab9fc0c260")',
        }}
      />
    </div>
  );
}