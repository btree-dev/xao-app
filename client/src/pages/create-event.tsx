import { NavHeader } from "@/components/nav-header";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEventSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Web3Storage } from 'web3.storage';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { z } from "zod";

type EventFormData = z.infer<typeof insertEventSchema>;

// Use import.meta.env instead of process.env
const client = new Web3Storage({ token: import.meta.env.VITE_WEB3_STORAGE_TOKEN });

export default function CreateEvent() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!user?.isArtist) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const form = useForm<EventFormData>({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      date: new Date().toISOString(),
      venue: "",
      price: 0,
      totalSupply: 100,
      remainingSupply: 100,
      chainId: 8453, // Base chain
      contractAddress: null,
      artistId: user?.id
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const formattedData = {
        ...data,
        date: data.date instanceof Date ? data.date.toISOString() : new Date(data.date).toISOString(),
        price: parseFloat(data.price.toString()),
        totalSupply: parseInt(data.totalSupply.toString()),
        remainingSupply: parseInt(data.totalSupply.toString()),
      };
      const res = await apiRequest("POST", "/api/events", formattedData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setLocation("/dashboard");
    },
  });

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      // Upload file to IPFS
      const cid = await client.put([file], {
        name: file.name,
        maxRetries: 3,
      });

      // Construct the IPFS URL
      const imageUrl = `https://${cid}.ipfs.w3s.link/${file.name}`;
      form.setValue("imageUrl", imageUrl);
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Create New Event</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => createEventMutation.mutate(data))}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Image</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(file);
                              }
                            }}
                          />
                          {uploadingImage && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Uploading image to IPFS...
                            </div>
                          )}
                          {field.value && (
                            <img
                              src={field.value}
                              alt="Event preview"
                              className="rounded-md max-h-48 object-cover"
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel>Event Date</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="datetime-local"
                            value={value ? new Date(value).toISOString().slice(0, 19) : ""}
                            onChange={(e) => onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field: { onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>Price (ETH)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            step="0.001"
                            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalSupply"
                    render={({ field: { onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>Total Tickets</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="1"
                            onChange={(e) => onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createEventMutation.isPending || uploadingImage}
                >
                  {createEventMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Event...
                    </>
                  ) : (
                    "Create Event"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}