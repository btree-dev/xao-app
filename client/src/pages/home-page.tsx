import { useQuery } from "@tanstack/react-query";
import { EventCard } from "@/components/event-card";
import { NavHeader } from "@/components/nav-header";
import { Event } from "@shared/schema";

export default function HomePage() {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      
      <main className="container mx-auto px-4 py-8">
        <section className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
            Discover Upcoming Events
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Purchase NFT tickets for exclusive events and experiences. Your ticket is your unique digital collectible.
          </p>
        </section>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[400px] rounded-lg bg-card animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events?.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
