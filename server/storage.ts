import { InsertUser, User, Event, InsertEvent, Ticket, InsertTicket, VerificationCode } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import crypto from 'crypto';

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;

  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWallet(userId: string, walletAddress: string): Promise<User>;

  // Verification operations
  createVerificationCode(email: string, code: string): Promise<VerificationCode>;
  getVerificationCode(email: string, code: string): Promise<VerificationCode | undefined>;
  markVerificationCodeAsUsed(id: number): Promise<void>;

  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: number): Promise<Event | undefined>;
  getEvents(): Promise<Event[]>;
  getArtistEvents(artistId: string): Promise<Event[]>;

  // Ticket operations
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  getUserTickets(userId: string): Promise<Ticket[]>;
  getEventTickets(eventId: number): Promise<Ticket[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private events: Map<number, Event>;
  private tickets: Map<number, Ticket>;
  private verificationCodes: Map<number, VerificationCode>;
  sessionStore: session.Store;
  private nextEventId: number;
  private nextTicketId: number;
  private nextVerificationCodeId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.tickets = new Map();
    this.verificationCodes = new Map();
    this.nextEventId = 1;
    this.nextTicketId = 1;
    this.nextVerificationCodeId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = crypto.randomUUID(); // Generate a UUID for the user ID
    const user: User = {
      id,
      email: insertUser.email,
      isArtist: insertUser.isArtist ?? false,
      walletAddress: insertUser.walletAddress ?? null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserWallet(userId: string, walletAddress: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, walletAddress };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async createVerificationCode(email: string, code: string): Promise<VerificationCode> {
    const id = this.nextVerificationCodeId++;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    const verificationCode: VerificationCode = {
      id,
      email,
      code,
      expiresAt,
      used: false,
    };
    this.verificationCodes.set(id, verificationCode);
    return verificationCode;
  }

  async getVerificationCode(email: string, code: string): Promise<VerificationCode | undefined> {
    return Array.from(this.verificationCodes.values()).find(
      (vc) => 
        vc.email === email && 
        vc.code === code && 
        vc.expiresAt > new Date() && 
        !vc.used
    );
  }

  async markVerificationCodeAsUsed(id: number): Promise<void> {
    const code = this.verificationCodes.get(id);
    if (code) {
      code.used = true;
      this.verificationCodes.set(id, code);
    }
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.nextEventId++;
    const event: Event = {
      id,
      title: insertEvent.title,
      description: insertEvent.description,
      imageUrl: insertEvent.imageUrl,
      date: insertEvent.date,
      venue: insertEvent.venue,
      price: insertEvent.price,
      totalSupply: insertEvent.totalSupply,
      remainingSupply: insertEvent.remainingSupply,
      artistId: insertEvent.artistId,
      contractAddress: insertEvent.contractAddress ?? null,
      chainId: insertEvent.chainId,
    };
    this.events.set(id, event);
    return event;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getArtistEvents(artistId: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.artistId === artistId,
    );
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = this.nextTicketId++;
    const ticket: Ticket = { ...insertTicket, id };
    this.tickets.set(id, ticket);
    return ticket;
  }

  async getUserTickets(userId: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(
      (ticket) => ticket.userId === userId,
    );
  }

  async getEventTickets(eventId: number): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(
      (ticket) => ticket.eventId === eventId,
    );
  }
}

export const storage = new MemStorage();