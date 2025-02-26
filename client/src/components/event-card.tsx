import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Event } from "@shared/schema";
import { format } from "date-fns";
import { Link } from "wouter";

export function EventCard({ event }: { event: Event }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="object-cover w-full h-full"
        />
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{event.title}</h3>
          <div className="text-sm text-muted-foreground">
            {format(new Date(event.date), "MMM d, yyyy")}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.description}
        </p>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm">
            <p className="font-medium">{event.venue}</p>
            <p className="text-muted-foreground">
              {event.remainingSupply} tickets left
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold">
              {event.price} ETH
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/event/${event.id}`}>
          <Button className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}