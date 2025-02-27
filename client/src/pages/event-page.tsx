import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Event } from "@shared/schema";
import { NavHeader } from "@/components/nav-header";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/hooks/use-web3";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, MapPin, Calendar, Ticket } from "lucide-react";

export default function EventPage() {
  const { id } = useParams();
  const { connect, isConnected, mintTicket } = useWeb3();

  const { data: event, isLoading } = useQuery<Event>({
    queryKey: ["/api/events", id],
  });

  if (isLoading || !event) {
    return (
      <div className="min-h-screen">
        <NavHeader />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  // Safely parse the date with error handling
  let formattedDate = "Date not available";
  try {
    if (event.date) {
      const eventDate = parseISO(event.date);
      formattedDate = format(eventDate, "MMMM d, yyyy 'at' h:mm a");
    }
  } catch (error) {
    console.error("Error parsing date:", error);
  }

  return (
    <div className="min-h-screen">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <img
              src={event.imageUrl}
              alt={event.title}
              className="rounded-lg w-full aspect-video object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              <p className="text-muted-foreground">{event.description}</p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span>
                    {format(new Date(event.date || Date.now()), "MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>{event.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-muted-foreground" />
                  <span>{event.remainingSupply} tickets remaining</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-medium">Price</span>
                    <span className="text-2xl font-bold">
                      {event.price} ETH
                    </span>
                  </div>
                  {!isConnected ? (
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500"
                      onClick={() => connect()}
                    >
                      Connect Wallet to Purchase
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() =>
                        mintTicket(
                          event.id,
                          event.totalSupply - event.remainingSupply + 1,
                        )
                      }
                      disabled={event.remainingSupply === 0}
                    >
                      {event.remainingSupply === 0
                        ? "Sold Out"
                        : "Purchase Ticket"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
