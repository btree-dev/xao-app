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
      console.log('Creating event with data:', req.body);

      const event = await storage.createEvent({
        ...req.body,
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
    const events = await storage.getEvents();
    res.json(events);
  });

  // Wallet update
  app.post("/api/user/wallet", async (req, res) => {
    try {
      const user = await storage.updateUserWallet(req.body.userId, req.body.walletAddress);
      res.json(user);
    } catch (error) {
      console.error('Error updating wallet:', error);
      res.status(500).send("Failed to update wallet");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}