import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated } from "./replitauth";
import { z } from "zod";

// Validation schemas
const periodSchema = z.enum(["1M", "1Y", "5Y"]).default("1M");

export async function registerRoutes(app: Express): Promise<Server> {
  // 🔑 Local test login
  app.post("/api/auth/login", (req: any, res) => {
    const { email, password } = req.body;

    if (email === "test@gmail.com" && password === "12345") {
      const user = {
        id: "test-user-1",
        email: "test@gmail.com",
        firstName: "Test",
        lastName: "User",
        profileImageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      req.session.user = user;
      return res.json({ success: true, user });
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  });

  app.get("/api/auth/user", (req: any, res) => {
    if (req.session?.user) {
      return res.json(req.session.user);
    }
    return res.status(401).json({ message: "Not authenticated" });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // Example protected route
  app.get("/api/portfolio", isAuthenticated, async (_req, res) => {
    try {
      const portfolio = await storage.getPortfolio();
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  // --- Keep all your other routes (market, stocks, news, etc.) the same ---
  // You can wrap protected ones with `isAuthenticated`

  const httpServer = createServer(app);
  return httpServer;
}
