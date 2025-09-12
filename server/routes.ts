import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple test authentication
  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const { email, password } = req.body;
      console.log('Login attempt:', { email, password });
      
      // Test credentials
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
        console.log('User logged in successfully:', user);
        res.json({ success: true, user });
      } else {
        console.log('Invalid credentials provided');
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (req.session?.user) {
        res.json(req.session.user);
      } else {
        res.status(401).json({ message: "Not authenticated" });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ message: "Logout failed" });
      } else {
        res.json({ success: true });
      }
    });
  });
  // Market data routes
  app.get("/api/market-indices", async (_req, res) => {
    try {
      const indices = await storage.getMarketIndices();
      res.json(indices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch market indices" });
    }
  });

  app.get("/api/portfolio", async (_req, res) => {
    try {
      const portfolio = await storage.getPortfolio();
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  // Stock routes
  app.get("/api/stocks", async (_req, res) => {
    try {
      const stocks = await storage.getStocks();
      res.json(stocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stocks" });
    }
  });

  app.get("/api/stocks/:id", async (req, res) => {
    try {
      const stock = await storage.getStock(req.params.id);
      if (!stock) {
        return res.status(404).json({ error: "Stock not found" });
      }
      res.json(stock);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock" });
    }
  });

  // Stock detail route with historical data
  app.get("/api/stocks/:id/detail", async (req, res) => {
    try {
      const { period } = req.query;
      const stockWithHistory = await storage.getStockWithHistoricalData(
        req.params.id, 
        period as string
      );
      if (!stockWithHistory) {
        return res.status(404).json({ error: "Stock not found" });
      }
      res.json(stockWithHistory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock details" });
    }
  });

  // Historical stock data route
  app.get("/api/stocks/:id/historical", async (req, res) => {
    try {
      const { period } = req.query;
      const historicalData = await storage.getStockHistoricalData(
        req.params.id, 
        period as string
      );
      res.json(historicalData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch historical data" });
    }
  });

  // Recommendations routes
  app.get("/api/recommendations", async (_req, res) => {
    try {
      const recommendations = await storage.getRecommendations();
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  // Watchlist routes
  app.get("/api/watchlist", async (_req, res) => {
    try {
      const watchlist = await storage.getWatchlist();
      res.json(watchlist);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch watchlist" });
    }
  });

  app.post("/api/watchlist", async (req, res) => {
    try {
      const { stockId } = req.body;
      if (!stockId) {
        return res.status(400).json({ error: "Stock ID is required" });
      }
      
      const watchlistItem = await storage.addToWatchlist({ 
        stockId, 
        userId: "default_user" 
      });
      res.status(201).json(watchlistItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to add to watchlist" });
    }
  });

  app.delete("/api/watchlist/:id", async (req, res) => {
    try {
      const success = await storage.removeFromWatchlist(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Watchlist item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove from watchlist" });
    }
  });

  // News routes
  app.get("/api/news", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const news = await storage.getNews(limit);
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // Alerts routes
  app.get("/api/alerts", async (_req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.patch("/api/alerts/:id/read", async (req, res) => {
    try {
      const success = await storage.markAlertAsRead(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to mark alert as read" });
    }
  });

  // Trading simulation routes
  app.post("/api/trades/buy", async (req, res) => {
    try {
      const { stockId, quantity } = req.body;
      if (!stockId || !quantity) {
        return res.status(400).json({ error: "Stock ID and quantity are required" });
      }
      
      const stock = await storage.getStock(stockId);
      if (!stock) {
        return res.status(404).json({ error: "Stock not found" });
      }
      
      // Simulate buy order
      res.json({ 
        message: `Buy order placed for ${quantity} shares of ${stock.name}`,
        orderId: "ORD" + Date.now(),
        stock,
        quantity,
        price: stock.currentPrice
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to place buy order" });
    }
  });

  app.post("/api/trades/sell", async (req, res) => {
    try {
      const { stockId, quantity } = req.body;
      if (!stockId || !quantity) {
        return res.status(400).json({ error: "Stock ID and quantity are required" });
      }
      
      const stock = await storage.getStock(stockId);
      if (!stock) {
        return res.status(404).json({ error: "Stock not found" });
      }
      
      // Simulate sell order
      res.json({ 
        message: `Sell order placed for ${quantity} shares of ${stock.name}`,
        orderId: "ORD" + Date.now(),
        stock,
        quantity,
        price: stock.currentPrice
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to place sell order" });
    }
  });

  // Forex routes
  app.get("/api/forex", async (_req, res) => {
    try {
      const forexPairs = await storage.getForexPairs();
      res.json(forexPairs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch forex pairs" });
    }
  });

  app.get("/api/forex/:id", async (req, res) => {
    try {
      const pair = await storage.getForexPair(req.params.id);
      if (!pair) {
        return res.status(404).json({ error: "Forex pair not found" });
      }
      res.json(pair);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch forex pair" });
    }
  });

  // Portfolio holdings routes
  app.get("/api/portfolio/holdings", async (_req, res) => {
    try {
      const holdings = await storage.getPortfolioHoldings();
      res.json(holdings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio holdings" });
    }
  });

  // AI scoring simulation
  app.get("/api/ai/market-sentiment", async (_req, res) => {
    try {
      res.json({
        score: 8.2,
        sentiment: "Bullish",
        factors: [
          "Strong earnings growth in IT sector",
          "Positive FII inflows",
          "Stable macroeconomic indicators"
        ]
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch market sentiment" });
    }
  });

  // User investments routes
  app.get("/api/user-investments", async (_req, res) => {
    try {
      const investments = await storage.getUserInvestments();
      res.json(investments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user investments" });
    }
  });

  app.post("/api/user-investments", async (req, res) => {
    try {
      const investment = await storage.createUserInvestment(req.body);
      res.json(investment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create investment" });
    }
  });

  app.patch("/api/user-investments/:id", async (req, res) => {
    try {
      const investment = await storage.updateUserInvestment(req.params.id, req.body);
      if (!investment) {
        return res.status(404).json({ error: "Investment not found" });
      }
      res.json(investment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update investment" });
    }
  });

  app.delete("/api/user-investments/:id", async (req, res) => {
    try {
      const success = await storage.deleteUserInvestment(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Investment not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete investment" });
    }
  });

  app.get("/api/investment-alerts", async (_req, res) => {
    try {
      const alerts = await storage.getInvestmentAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch investment alerts" });
    }
  });

  app.patch("/api/investment-alerts/:id/read", async (req, res) => {
    try {
      const success = await storage.markInvestmentAlertAsRead(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark alert as read" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
