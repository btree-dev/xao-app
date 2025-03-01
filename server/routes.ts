import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// import { FlatDirectory } from "./customEthStorage"; 
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

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

  // app.post("/api/save", async (req, res) => {
  //   try {
  //     console.log('Save files to EthStorage:', req.body);

      
  //     // FlatDirectory address: 0x37df32c7a3c30d352453dadacc838461d8629016
  //     const rpc = "https://rpc.beta.testnet.l2.quarkchain.io:8545";
  //     // For Sepolia:
  //     // const rpc = "https://rpc.sepolia.org";
  //     const privateKey = "0x3e9ae11b546fbc8e4d673beae0b8e9de3ae35164d8dacd24dbde6b0282408165";
      
  //     const flatDirectory = await FlatDirectory.create({
  //         rpc: rpc,
  //         privateKey: privateKey,
  //     });
  //     const contracAddress = await flatDirectory.deploy();
  //     console.log(`FlatDirectory address: ${contracAddress}.`);
  //     // FlatDirectory address: 0x37df32c7a3c30d352453dadacc838461d8629016

  //     console.log('Saved successfully:', event);
  //     res.status(201).json(event);
  //   } catch (error) {
  //     console.error('Error saving:', error);
  //     res.status(500).send("Failed to save");
  //   }
  // });

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