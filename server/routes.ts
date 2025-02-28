import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Event routes
  app.get("/api/events", async (req, res) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  app.get("/api/events/:id", async (req, res) => {
    const event = await storage.getEvent(Number(req.params.id));
    if (!event) return res.status(404).send("Event not found");
    res.json(event);
  });

  app.post("/api/events", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).send("Unauthorized - Please login first");
      }

      if (!req.user.isArtist) {
        return res.status(403).send("Only artists can create events");
      }

      console.log('Creating event with data:', {
        ...req.body,
        artistId: req.user.id,
      });

      const event = await storage.createEvent({
        ...req.body,
        artistId: req.user.id,
        remainingSupply: req.body.totalSupply,
      });

      console.log('Event created successfully:', event);
      res.status(201).json(event);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).send("Failed to create event");
    }
  });

  // Artist events
  app.get("/api/artist/events", async (req, res) => {
    let events = [];
    if(req?.user?.id === undefined) {
      events = await storage.getEvents();
    } else {
      events = await storage.getArtistEvents(req.user.id);
    }
    res.json(events);
  });

  // Wallet update
  app.post("/api/user/wallet", async (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");

    const user = await storage.updateUserWallet(req.user.id, req.body.walletAddress);
    res.json(user);
  });

  const httpServer = createServer(app);
  return httpServer;
}