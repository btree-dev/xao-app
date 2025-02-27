import passport from "passport";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { randomInt } from "crypto";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

function generateVerificationCode(): string {
  return randomInt(100000, 999999).toString();
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "local-dev-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Step 1: Request verification code
  app.post("/api/auth/request-code", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).send("Email is required");
      }

      const code = generateVerificationCode();
      await storage.createVerificationCode(email, code);

      // In a real application, send this code via email
      // For development, we'll just return it in the response
      console.log(`Verification code for ${email}: ${code}`);
      res.json({ message: "Verification code sent" });
    } catch (err) {
      res.status(500).json({ message: "Failed to send verification code" });
    }
  });

  // Step 2: Verify code and login/register
  app.post("/api/auth/verify", async (req, res) => {
    try {
      const { email, code } = req.body;

      const verificationCode = await storage.getVerificationCode(email, code);
      if (!verificationCode) {
        return res.status(400).json({ message: "Invalid or expired code" });
      }

      // Mark the code as used
      await storage.markVerificationCodeAsUsed(verificationCode.id);

      // Get existing user or create new one
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({
          email,
          isArtist: false,
          walletAddress: null,
        });
      }

      // Log the user in
      req.login(user, (err) => {
        if (err) throw err;
        res.json(user);
      });
    } catch (err) {
      res.status(500).json({ message: "Verification failed" });
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}