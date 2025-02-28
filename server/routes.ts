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
    if (!req.user?.isArtist) return res.status(403).send("Only artists can create events");

    const event = await storage.createEvent({
      ...req.body,
      artistId: req.user.id,
      remainingSupply: req.body.totalSupply,
    });
    res.status(201).json(event);
  });

  // Artist events
  app.get("/api/artist/events", async (req, res) => {
    if (!req.user?.isArtist) return res.status(403).send("Not an artist");

    const events = await storage.getArtistEvents(req.user.id);
    res.json(events);
  });

  // Wallet update
  app.post("/api/user/wallet", async (req, res) => {
    const user = await storage.updateUserWallet(req.user.id, req.body.walletAddress);
    res.json(user);
  });

  const httpServer = createServer(app);
  return httpServer;
}