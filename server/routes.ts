import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

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
    if (!req.isAuthenticated()) return res.sendStatus(401);
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
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.user?.isArtist) return res.status(403).send("Not an artist");
    
    const events = await storage.getArtistEvents(req.user.id);
    res.json(events);
  });

  // Ticket routes
  app.post("/api/tickets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const event = await storage.getEvent(req.body.eventId);
    if (!event) return res.status(404).send("Event not found");
    if (event.remainingSupply <= 0) return res.status(400).send("Event sold out");
    
    const ticket = await storage.createTicket({
      ...req.body,
      userId: req.user.id,
      purchaseDate: new Date(),
    });
    res.status(201).json(ticket);
  });

  app.get("/api/user/tickets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tickets = await storage.getUserTickets(req.user.id);
    res.json(tickets);
  });

  // Wallet update
  app.post("/api/user/wallet", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = await storage.updateUserWallet(req.user.id, req.body.walletAddress);
    res.json(user);
  });

  const httpServer = createServer(app);
  return httpServer;
}
