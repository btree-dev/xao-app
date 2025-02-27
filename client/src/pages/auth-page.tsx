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

export default function AuthPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isArtist, setIsArtist] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

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
      email: "",
      code: "",
    }
  });

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
      verificationForm.setValue("email", emailForm.getValues("email"));
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
            {!showVerification ? (
              <Form {...emailForm}>
                <form
                  onSubmit={emailForm.handleSubmit((data) =>
                    requestCodeMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Register as an Artist</FormLabel>
                    <Switch
                      checked={isArtist}
                      onCheckedChange={setIsArtist}
                    />
                  </FormItem>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={requestCodeMutation.isPending}
                  >
                    Send Verification Code
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...verificationForm}>
                <form
                  onSubmit={verificationForm.handleSubmit((data) =>
                    verifyCodeMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={verificationForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                          <InputOTP
                            maxLength={6}
                            render={() => (
                              <InputOTPGroup>
                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                  <InputOTPSlot
                                    key={index}
                                    index={index}
                                  />
                                ))}
                              </InputOTPGroup>
                            )}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowVerification(false)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={verifyCodeMutation.isPending}
                    >
                      Verify
                    </Button>
                  </div>
                </form>
              </Form>
            )}
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