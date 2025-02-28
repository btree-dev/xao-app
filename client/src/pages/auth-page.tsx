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
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useOkto } from "@okto_web3/react-sdk";
import { GoogleLogin } from "@react-oauth/google";

export default function AuthPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isArtist, setIsArtist] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const oktoClient = useOkto();
  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   if (oktoClient.userSWA) {
  //     setLocation("/");
  //   }
  // }, [oktoClient.userSWA, setLocation]);

  const emailForm = useForm({
    resolver: zodResolver(
      verifyEmailSchema.pick({ email: true })
    ),
    defaultValues: {
      email: "",
    }
  });

  const verificationForm = useForm({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      code: "",
      email: "",
    },
  });

  async function handleGoogleLogin(credentialResponse: any) {
    try {
        setIsLoading(true);
        await oktoClient.loginUsingOAuth({
            idToken: credentialResponse.credential,
            provider: "google",
        });
    } catch (error) {
        console.error("Authentication error:", error);
    } finally {
        setIsLoading(false);
    }
  }

  const requestCodeMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await apiRequest("POST", "/api/auth/request-code", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Verification code sent",
        description: "Please check your email for the verification code.",
      });
      setShowVerification(true);
      // Set email but ensure code is empty
      verificationForm.reset({
        email: emailForm.getValues("email"),
        code: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async (data: { email: string; code: string }) => {
      const res = await apiRequest("POST", "/api/auth/verify", {
        ...data,
        isArtist,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "You have been logged in successfully.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
              NFTickets
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
              <div>Logged In...</div>
            ) : (
                <GoogleLogin onSuccess={handleGoogleLogin} />
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