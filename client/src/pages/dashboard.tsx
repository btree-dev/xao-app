import { useQuery } from "@tanstack/react-query";
import { NavHeader } from "@/components/nav-header";
import { EventCard } from "@/components/event-card";
import { useAuth } from "@/hooks/use-auth";
import { Event, Ticket } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: tickets } = useQuery<Ticket[]>({
    queryKey: ["/api/user/tickets"],
    enabled: !user?.isArtist,
  });

  const { data: artistEvents } = useQuery<Event[]>({
    queryKey: ["/api/artist/events"],
    enabled: user?.isArtist,
  });

  if (user?.isArtist) {
    return (
      <div className="min-h-screen bg-background">
        <NavHeader />
        
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Artist Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artistEvents?.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Tickets</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets?.map((ticket) => (
            <Card key={ticket.id}>
              <CardHeader>
                <CardTitle>Token #{ticket.tokenId}</CardTitle>
                <CardDescription>
                  Purchased on {format(new Date(ticket.purchaseDate), "PP")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-accent rounded-lg text-center">
                  <p className="text-sm font-medium">
                    View on Polygonscan
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
