import { 
  type Stock, type InsertStock, 
  type Recommendation, type InsertRecommendation, 
  type MarketIndex, type InsertMarketIndex, 
  type News, type InsertNews, 
  type Watchlist, type InsertWatchlist, 
  type Alert, type InsertAlert, 
  type Portfolio, type InsertPortfolio, 
  type ForexPair, type InsertForexPair, 
  type PortfolioHolding, type InsertPortfolioHolding,
  type User, type UpsertUser,
  type UserInvestment, type InsertUserInvestment,
  type InvestmentAlert, type InsertInvestmentAlert,
  type StockHistoricalData, type InsertStockHistoricalData,
  users, stocks, recommendations, marketIndices, news, watchlist, alerts, portfolio, forexPairs, portfolioHoldings, userInvestments, investmentAlerts, stockHistoricalData
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Stocks
  getStocks(): Promise<Stock[]>;
  getStock(id: string): Promise<Stock | undefined>;
  getStockBySymbol(symbol: string): Promise<Stock | undefined>;
  createStock(stock: InsertStock): Promise<Stock>;
  updateStock(id: string, stock: Partial<Stock>): Promise<Stock | undefined>;
  
  // Stock Historical Data
  getStockHistoricalData(stockId: string, period?: string): Promise<StockHistoricalData[]>;
  createStockHistoricalData(data: InsertStockHistoricalData): Promise<StockHistoricalData>;
  getStockWithHistoricalData(stockId: string, period?: string): Promise<(Stock & { historical: StockHistoricalData[] }) | undefined>;

  // Recommendations
  getRecommendations(): Promise<(Recommendation & { stock: Stock })[]>;
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;

  // Market Indices
  getMarketIndices(): Promise<MarketIndex[]>;
  updateMarketIndex(id: string, index: Partial<MarketIndex>): Promise<MarketIndex | undefined>;
  createMarketIndex(index: InsertMarketIndex): Promise<MarketIndex>;

  // News
  getNews(limit?: number): Promise<News[]>;
  createNews(news: InsertNews): Promise<News>;

  // Watchlist
  getWatchlist(): Promise<(Watchlist & { stock: Stock })[]>;
  addToWatchlist(watchlist: InsertWatchlist): Promise<Watchlist>;
  removeFromWatchlist(id: string): Promise<boolean>;

  // Alerts
  getAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: string): Promise<boolean>;

  // Portfolio
  getPortfolio(): Promise<Portfolio | undefined>;
  updatePortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;

  // Forex
  getForexPairs(): Promise<ForexPair[]>;
  getForexPair(id: string): Promise<ForexPair | undefined>;
  createForexPair(pair: InsertForexPair): Promise<ForexPair>;
  updateForexPair(id: string, pair: Partial<ForexPair>): Promise<ForexPair | undefined>;

  // Portfolio Holdings
  getPortfolioHoldings(): Promise<(PortfolioHolding & { stock?: Stock; forexPair?: ForexPair })[]>;
  createPortfolioHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding>;

  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // User Investments
  getUserInvestments(userId?: string): Promise<(UserInvestment & { stock?: Stock; forexPair?: ForexPair })[]>;
  createUserInvestment(investment: InsertUserInvestment): Promise<UserInvestment>;
  updateUserInvestment(id: string, investment: Partial<UserInvestment>): Promise<UserInvestment | undefined>;
  deleteUserInvestment(id: string): Promise<boolean>;

  // Investment Alerts
  getInvestmentAlerts(userId?: string): Promise<InvestmentAlert[]>;
  createInvestmentAlert(alert: InsertInvestmentAlert): Promise<InvestmentAlert>;
  markInvestmentAlertAsRead(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private stocks: Map<string, Stock> = new Map();
  private recommendations: Map<string, Recommendation> = new Map();
  private marketIndices: Map<string, MarketIndex> = new Map();
  private news: Map<string, News> = new Map();
  private watchlist: Map<string, Watchlist> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private portfolios: Map<string, Portfolio> = new Map();
  private forexPairs: Map<string, ForexPair> = new Map();
  private portfolioHoldings: Map<string, PortfolioHolding> = new Map();
  private userInvestments: Map<string, UserInvestment> = new Map();
  private investmentAlerts: Map<string, InvestmentAlert> = new Map();
  private stockHistoricalData: Map<string, StockHistoricalData> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize market indices
    const nifty: MarketIndex = {
      id: "NIFTY50",
      name: "NIFTY 50",
      currentValue: 19674.25,
      changeAmount: 145.80,
      changePercent: 0.75,
      updatedAt: new Date(),
    };
    
    const sensex: MarketIndex = {
      id: "SENSEX",
      name: "SENSEX",
      currentValue: 66112.50,
      changeAmount: 523.20,
      changePercent: 0.80,
      updatedAt: new Date(),
    };
    
    this.marketIndices.set(nifty.id, nifty);
    this.marketIndices.set(sensex.id, sensex);

    // Initialize portfolio
    const portfolio: Portfolio = {
      id: "default_portfolio",
      totalValue: 245678,
      dayChange: 3245,
      dayChangePercent: 1.34,
      updatedAt: new Date(),
    };
    this.portfolios.set(portfolio.id, portfolio);

    // Initialize sample stocks
    const stocks: Stock[] = [
      {
        id: "TCS",
        symbol: "TCS",
        name: "Tata Consultancy Services",
        currentPrice: 3542.80,
        changeAmount: 72.45,
        changePercent: 2.1,
        marketCap: 1280000000000,
        peRatio: 28.5,
        volume: 2500000,
        aiScore: 8.7,
        sector: "IT Services",
        exchange: "NSE",
        updatedAt: new Date(),
      },
      {
        id: "RIL",
        symbol: "RIL",
        name: "Reliance Industries",
        currentPrice: 2876.45,
        changeAmount: -23.10,
        changePercent: -0.8,
        marketCap: 1945000000000,
        peRatio: 15.2,
        volume: 3200000,
        aiScore: 6.5,
        sector: "Oil & Gas",
        exchange: "NSE",
        updatedAt: new Date(),
      },
      {
        id: "HDFCBANK",
        symbol: "HDFCBANK",
        name: "HDFC Bank",
        currentPrice: 1645.20,
        changeAmount: -25.15,
        changePercent: -1.5,
        marketCap: 1245000000000,
        peRatio: 18.7,
        volume: 4100000,
        aiScore: 3.8,
        sector: "Banking",
        exchange: "NSE",
        updatedAt: new Date(),
      },
      {
        id: "INFY",
        symbol: "INFY",
        name: "Infosys",
        currentPrice: 1456.75,
        changeAmount: 28.30,
        changePercent: 1.98,
        marketCap: 615000000000,
        peRatio: 25.3,
        volume: 1800000,
        aiScore: 7.8,
        sector: "IT Services",
        exchange: "NSE",
        updatedAt: new Date(),
      },
      {
        id: "WIPRO",
        symbol: "WIPRO",
        name: "Wipro",
        currentPrice: 445.60,
        changeAmount: -8.20,
        changePercent: -1.81,
        marketCap: 245000000000,
        peRatio: 22.1,
        volume: 9800000,
        aiScore: 5.2,
        sector: "IT Services",
        exchange: "NSE",
        updatedAt: new Date(),
      },
    ];

    stocks.forEach(stock => this.stocks.set(stock.id, stock));

    // Initialize recommendations
    const recommendations: (InsertRecommendation & { id: string })[] = [
      {
        id: randomUUID(),
        stockId: "TCS",
        action: "BUY",
        score: 8.7,
        targetPrice: 3800,
        stopLoss: 3300,
        analysis: "Strong Q3 earnings beat expectations. Technical indicators show bullish momentum with RSI at 65.",
        confidence: 87,
      },
      {
        id: randomUUID(),
        stockId: "RIL",
        action: "HOLD",
        score: 6.5,
        targetPrice: 2950,
        stopLoss: 2700,
        analysis: "Consolidating near support levels. Wait for breakout above ₹2,900 for bullish confirmation.",
        confidence: 65,
      },
      {
        id: randomUUID(),
        stockId: "HDFCBANK",
        action: "SELL",
        score: 3.8,
        targetPrice: 1550,
        stopLoss: 1700,
        analysis: "Breaking key support at ₹1,650. Regulatory concerns and NIM pressure affecting outlook.",
        confidence: 82,
      },
    ];

    recommendations.forEach(rec => {
      const recommendation: Recommendation = {
        ...rec,
        createdAt: new Date(),
      };
      this.recommendations.set(recommendation.id, recommendation);
    });

    // Initialize sample news
    const newsItems: (InsertNews & { id: string })[] = [
      {
        id: randomUUID(),
        headline: "RBI Maintains Repo Rate at 6.5%, Focuses on Inflation Control",
        summary: "The Reserve Bank of India keeps key policy rates unchanged, citing inflation concerns and global economic uncertainty.",
        source: "Economic Times",
        sentiment: "Positive",
        sentimentScore: 72,
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: randomUUID(),
        headline: "IT Sector Shows Strong Q3 Results Amid Global Demand",
        summary: "Major IT companies report better-than-expected earnings, boosting sector outlook for 2024.",
        source: "Business Standard",
        sentiment: "Positive",
        sentimentScore: 85,
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        id: randomUUID(),
        headline: "Foreign Institutional Investors Turn Net Buyers",
        summary: "FIIs invest ₹2,800 crores in Indian equities, signaling renewed confidence in market fundamentals.",
        source: "Mint",
        sentiment: "Positive",
        sentimentScore: 78,
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
    ];

    newsItems.forEach(item => {
      const news: News = {
        ...item,
        createdAt: new Date(),
      };
      this.news.set(news.id, news);
    });

    // Initialize watchlist
    const watchlistItems = [
      { stockId: "INFY" },
      { stockId: "WIPRO" },
    ];

    watchlistItems.forEach(item => {
      const watchlistItem: Watchlist = {
        id: randomUUID(),
        stockId: item.stockId,
        userId: "default_user",
        createdAt: new Date(),
      };
      this.watchlist.set(watchlistItem.id, watchlistItem);
    });

    // Initialize alerts
    const alertItems: (InsertAlert & { id: string })[] = [
      {
        id: randomUUID(),
        type: "price_alert",
        title: "TCS Price Alert",
        message: "Target ₹3,600 reached",
        stockId: "TCS",
        severity: "warning",
        isRead: false,
      },
      {
        id: randomUUID(),
        type: "portfolio_milestone",
        title: "Portfolio Milestone",
        message: "Gained ₹5,000 today",
        severity: "success",
        isRead: false,
      },
      {
        id: randomUUID(),
        type: "ai_recommendation",
        title: "AI Recommendation",
        message: "New buy signal for INFY",
        stockId: "INFY",
        severity: "info",
        isRead: false,
      },
    ];

    alertItems.forEach(item => {
      const alert: Alert = {
        ...item,
        createdAt: new Date(),
      };
      this.alerts.set(alert.id, alert);
    });

    // Initialize forex pairs
    const forexPairs: ForexPair[] = [
      {
        id: "USDINR",
        baseCurrency: "USD",
        quoteCurrency: "INR",
        currentRate: 83.25,
        changeAmount: 0.15,
        changePercent: 0.18,
        high24h: 83.45,
        low24h: 82.95,
        volume: 2500000,
        aiScore: 6.8,
        updatedAt: new Date(),
      },
      {
        id: "EURUSD",
        baseCurrency: "EUR",
        quoteCurrency: "USD",
        currentRate: 1.0892,
        changeAmount: -0.0023,
        changePercent: -0.21,
        high24h: 1.0925,
        low24h: 1.0875,
        volume: 5200000,
        aiScore: 7.2,
        updatedAt: new Date(),
      },
      {
        id: "GBPINR",
        baseCurrency: "GBP",
        quoteCurrency: "INR",
        currentRate: 105.67,
        changeAmount: 0.89,
        changePercent: 0.85,
        high24h: 106.12,
        low24h: 104.88,
        volume: 980000,
        aiScore: 5.9,
        updatedAt: new Date(),
      },
    ];

    forexPairs.forEach(pair => this.forexPairs.set(pair.id, pair));
  }

  // Stocks
  async getStocks(): Promise<Stock[]> {
    return Array.from(this.stocks.values());
  }

  async getStock(id: string): Promise<Stock | undefined> {
    return this.stocks.get(id);
  }

  async getStockBySymbol(symbol: string): Promise<Stock | undefined> {
    return Array.from(this.stocks.values()).find(stock => stock.symbol === symbol);
  }

  async createStock(insertStock: InsertStock): Promise<Stock> {
    const stock: Stock = {
      ...insertStock,
      updatedAt: new Date(),
    };
    this.stocks.set(stock.id, stock);
    return stock;
  }

  async updateStock(id: string, updates: Partial<Stock>): Promise<Stock | undefined> {
    const stock = this.stocks.get(id);
    if (!stock) return undefined;
    
    const updatedStock: Stock = {
      ...stock,
      ...updates,
      updatedAt: new Date(),
    };
    this.stocks.set(id, updatedStock);
    return updatedStock;
  }

  // Recommendations
  async getRecommendations(): Promise<(Recommendation & { stock: Stock })[]> {
    const recommendations = Array.from(this.recommendations.values());
    return recommendations.map(rec => {
      const stock = this.stocks.get(rec.stockId);
      if (!stock) throw new Error(`Stock not found for recommendation: ${rec.stockId}`);
      return { ...rec, stock };
    });
  }

  async createRecommendation(insertRecommendation: InsertRecommendation): Promise<Recommendation> {
    const id = randomUUID();
    const recommendation: Recommendation = {
      id,
      ...insertRecommendation,
      createdAt: new Date(),
    };
    this.recommendations.set(id, recommendation);
    return recommendation;
  }

  // Market Indices
  async getMarketIndices(): Promise<MarketIndex[]> {
    return Array.from(this.marketIndices.values());
  }

  async updateMarketIndex(id: string, updates: Partial<MarketIndex>): Promise<MarketIndex | undefined> {
    const index = this.marketIndices.get(id);
    if (!index) return undefined;
    
    const updatedIndex: MarketIndex = {
      ...index,
      ...updates,
      updatedAt: new Date(),
    };
    this.marketIndices.set(id, updatedIndex);
    return updatedIndex;
  }

  async createMarketIndex(insertIndex: InsertMarketIndex): Promise<MarketIndex> {
    const index: MarketIndex = {
      ...insertIndex,
      updatedAt: new Date(),
    };
    this.marketIndices.set(index.id, index);
    return index;
  }

  // News
  async getNews(limit = 10): Promise<News[]> {
    return Array.from(this.news.values())
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  }

  async createNews(insertNews: InsertNews): Promise<News> {
    const id = randomUUID();
    const news: News = {
      id,
      ...insertNews,
      createdAt: new Date(),
    };
    this.news.set(id, news);
    return news;
  }

  // Watchlist
  async getWatchlist(): Promise<(Watchlist & { stock: Stock })[]> {
    const watchlistItems = Array.from(this.watchlist.values());
    return watchlistItems.map(item => {
      const stock = this.stocks.get(item.stockId);
      if (!stock) throw new Error(`Stock not found for watchlist item: ${item.stockId}`);
      return { ...item, stock };
    });
  }

  async addToWatchlist(insertWatchlist: InsertWatchlist): Promise<Watchlist> {
    const id = randomUUID();
    const watchlistItem: Watchlist = {
      id,
      ...insertWatchlist,
      createdAt: new Date(),
    };
    this.watchlist.set(id, watchlistItem);
    return watchlistItem;
  }

  async removeFromWatchlist(id: string): Promise<boolean> {
    return this.watchlist.delete(id);
  }

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const alert: Alert = {
      id,
      ...insertAlert,
      createdAt: new Date(),
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async markAlertAsRead(id: string): Promise<boolean> {
    const alert = this.alerts.get(id);
    if (!alert) return false;
    
    this.alerts.set(id, { ...alert, isRead: true });
    return true;
  }

  // Portfolio
  async getPortfolio(): Promise<Portfolio | undefined> {
    return this.portfolios.get("default_portfolio");
  }

  async updatePortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const portfolio: Portfolio = {
      id: "default_portfolio",
      ...insertPortfolio,
      updatedAt: new Date(),
    };
    this.portfolios.set(portfolio.id, portfolio);
    return portfolio;
  }

  // Forex
  async getForexPairs(): Promise<ForexPair[]> {
    return Array.from(this.forexPairs.values());
  }

  async getForexPair(id: string): Promise<ForexPair | undefined> {
    return this.forexPairs.get(id);
  }

  async createForexPair(insertPair: InsertForexPair): Promise<ForexPair> {
    const pair: ForexPair = {
      ...insertPair,
      updatedAt: new Date(),
    };
    this.forexPairs.set(pair.id, pair);
    return pair;
  }

  async updateForexPair(id: string, updates: Partial<ForexPair>): Promise<ForexPair | undefined> {
    const pair = this.forexPairs.get(id);
    if (!pair) return undefined;
    
    const updatedPair: ForexPair = {
      ...pair,
      ...updates,
      updatedAt: new Date(),
    };
    this.forexPairs.set(id, updatedPair);
    return updatedPair;
  }

  // Portfolio Holdings
  async getPortfolioHoldings(): Promise<(PortfolioHolding & { stock?: Stock; forexPair?: ForexPair })[]> {
    const holdings = Array.from(this.portfolioHoldings.values());
    return holdings.map(holding => {
      const result: PortfolioHolding & { stock?: Stock; forexPair?: ForexPair } = { ...holding };
      
      if (holding.stockId) {
        result.stock = this.stocks.get(holding.stockId);
      }
      
      if (holding.forexPairId) {
        result.forexPair = this.forexPairs.get(holding.forexPairId);
      }
      
      return result;
    });
  }

  async createPortfolioHolding(insertHolding: InsertPortfolioHolding): Promise<PortfolioHolding> {
    const id = randomUUID();
    const holding: PortfolioHolding = {
      id,
      ...insertHolding,
      updatedAt: new Date(),
    };
    this.portfolioHoldings.set(id, holding);
    return holding;
  }

  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    // Try database first, fallback to memory for development
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.warn("Database not available, using memory storage for users");
      // Fallback for development - create a mock user
      return {
        id,
        email: `user-${id}@example.com`,
        firstName: "Demo",
        lastName: "User",
        profileImageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    } catch (error) {
      console.warn("Database not available, using memory storage for users");
      // Fallback for development
      const user: User = {
        id: userData.id || randomUUID(),
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return user;
    }
  }

  // User Investments Implementation
  async getUserInvestments(userId = "default_user"): Promise<(UserInvestment & { stock?: Stock; forexPair?: ForexPair })[]> {
    const investments = Array.from(this.userInvestments.values())
      .filter(inv => inv.userId === userId)
      .map(investment => {
        const enriched = { ...investment } as UserInvestment & { stock?: Stock; forexPair?: ForexPair };
        
        if (investment.stockId) {
          enriched.stock = this.stocks.get(investment.stockId);
          // Update current price and calculate profit/loss
          if (enriched.stock) {
            enriched.currentPrice = enriched.stock.currentPrice;
            enriched.currentValue = enriched.currentPrice * investment.quantity;
            enriched.profitLoss = enriched.currentValue - investment.investedAmount;
            enriched.profitLossPercent = (enriched.profitLoss / investment.investedAmount) * 100;
          }
        }
        
        if (investment.forexPairId) {
          enriched.forexPair = this.forexPairs.get(investment.forexPairId);
          if (enriched.forexPair) {
            enriched.currentPrice = enriched.forexPair.currentRate;
            enriched.currentValue = enriched.currentPrice * investment.quantity;
            enriched.profitLoss = enriched.currentValue - investment.investedAmount;
            enriched.profitLossPercent = (enriched.profitLoss / investment.investedAmount) * 100;
          }
        }
        
        return enriched;
      });
    
    // Generate alerts for investments with significant losses
    await this.generateLossPreventionAlerts(investments);
    
    return investments;
  }

  async createUserInvestment(investment: InsertUserInvestment): Promise<UserInvestment> {
    const id = randomUUID();
    const newInvestment: UserInvestment = {
      id,
      ...investment,
      currentPrice: investment.purchasePrice,
      currentValue: investment.investedAmount,
      profitLoss: 0,
      profitLossPercent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.userInvestments.set(id, newInvestment);
    
    // Create initial success alert
    await this.createInvestmentAlert({
      investmentId: id,
      alertType: "suggestion",
      title: "Investment Added Successfully",
      message: `Your investment in ${investment.investmentType === 'stock' ? 'stock' : 'forex'} has been recorded. We'll monitor it for you.`,
      severity: "success",
      actionRequired: false,
      suggestionType: "hold"
    });

    return newInvestment;
  }

  async updateUserInvestment(id: string, updates: Partial<UserInvestment>): Promise<UserInvestment | undefined> {
    const investment = this.userInvestments.get(id);
    if (!investment) return undefined;

    const updated = { ...investment, ...updates, updatedAt: new Date() };
    this.userInvestments.set(id, updated);
    return updated;
  }

  async deleteUserInvestment(id: string): Promise<boolean> {
    return this.userInvestments.delete(id);
  }

  // Investment Alerts Implementation
  async getInvestmentAlerts(userId = "default_user"): Promise<InvestmentAlert[]> {
    return Array.from(this.investmentAlerts.values())
      .filter(alert => {
        const investment = this.userInvestments.get(alert.investmentId);
        return investment?.userId === userId;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createInvestmentAlert(alert: InsertInvestmentAlert): Promise<InvestmentAlert> {
    const id = randomUUID();
    const newAlert: InvestmentAlert = {
      id,
      ...alert,
      createdAt: new Date(),
    };

    this.investmentAlerts.set(id, newAlert);
    return newAlert;
  }

  async markInvestmentAlertAsRead(id: string): Promise<boolean> {
    const alert = this.investmentAlerts.get(id);
    if (!alert) return false;

    alert.isRead = true;
    this.investmentAlerts.set(id, alert);
    return true;
  }

  // Helper method to generate loss prevention alerts
  private async generateLossPreventionAlerts(investments: (UserInvestment & { stock?: Stock; forexPair?: ForexPair })[]) {
    for (const investment of investments) {
      if (!investment.alertsEnabled) continue;

      const lossPercent = investment.profitLossPercent || 0;
      const currentPrice = investment.currentPrice || investment.purchasePrice;

      // Stop loss alert
      if (investment.stopLossPrice && currentPrice <= investment.stopLossPrice) {
        await this.createInvestmentAlert({
          investmentId: investment.id,
          alertType: "stop_loss",
          title: "🚨 Stop Loss Triggered",
          message: `${investment.stock?.name || investment.forexPair?.baseCurrency} has reached your stop loss price of ${investment.stopLossPrice}. Consider selling to prevent further losses.`,
          severity: "danger",
          actionRequired: true,
          suggestionType: "sell"
        });
      }

      // Target price reached
      if (investment.targetPrice && currentPrice >= investment.targetPrice) {
        await this.createInvestmentAlert({
          investmentId: investment.id,
          alertType: "target_reached",
          title: "🎯 Target Price Reached",
          message: `${investment.stock?.name || investment.forexPair?.baseCurrency} has reached your target price of ${investment.targetPrice}. Consider taking profits.`,
          severity: "success",
          actionRequired: true,
          suggestionType: "sell"
        });
      }

      // Loss warning alerts
      if (lossPercent <= -5 && lossPercent > -10) {
        await this.createInvestmentAlert({
          investmentId: investment.id,
          alertType: "loss_warning",
          title: "⚠️ Investment Down 5%",
          message: `Your investment in ${investment.stock?.name || investment.forexPair?.baseCurrency} is down ${Math.abs(lossPercent).toFixed(1)}%. Consider reviewing your position.`,
          severity: "warning",
          actionRequired: false,
          suggestionType: "hold"
        });
      } else if (lossPercent <= -10 && lossPercent > -15) {
        await this.createInvestmentAlert({
          investmentId: investment.id,
          alertType: "loss_warning",
          title: "🔴 Significant Loss Alert",
          message: `Your investment in ${investment.stock?.name || investment.forexPair?.baseCurrency} is down ${Math.abs(lossPercent).toFixed(1)}%. Consider setting a stop loss or reducing position.`,
          severity: "danger",
          actionRequired: true,
          suggestionType: "set_stop_loss"
        });
      } else if (lossPercent <= -15) {
        await this.createInvestmentAlert({
          investmentId: investment.id,
          alertType: "loss_warning",
          title: "🚨 Major Loss Alert",
          message: `Your investment in ${investment.stock?.name || investment.forexPair?.baseCurrency} is down ${Math.abs(lossPercent).toFixed(1)}%. Immediate action recommended to prevent further losses.`,
          severity: "danger",
          actionRequired: true,
          suggestionType: "sell"
        });
      }

      // Positive performance alerts
      if (lossPercent >= 10) {
        await this.createInvestmentAlert({
          investmentId: investment.id,
          alertType: "suggestion",
          title: "📈 Great Performance!",
          message: `Your investment in ${investment.stock?.name || investment.forexPair?.baseCurrency} is up ${lossPercent.toFixed(1)}%. Consider taking some profits or setting a trailing stop.`,
          severity: "success",
          actionRequired: false,
          suggestionType: "hold"
        });
      }
    }
  }

  // Stock Historical Data Methods
  async getStockHistoricalData(stockId: string, period?: string): Promise<StockHistoricalData[]> {
    const allData = Array.from(this.stockHistoricalData.values())
      .filter(data => data.stockId === stockId);
    
    if (!period) return allData;
    
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case "1M":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "1Y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case "5Y":
        startDate.setFullYear(now.getFullYear() - 5);
        break;
      default:
        return allData;
    }
    
    return allData.filter(data => data.date >= startDate).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async createStockHistoricalData(data: InsertStockHistoricalData): Promise<StockHistoricalData> {
    const id = randomUUID();
    const historicalData: StockHistoricalData = {
      id,
      stockId: data.stockId,
      date: data.date,
      open: data.open,
      high: data.high,
      low: data.low,
      close: data.close,
      volume: data.volume || null,
      adjustedClose: data.adjustedClose || null,
      createdAt: new Date(),
    };
    
    this.stockHistoricalData.set(id, historicalData);
    return historicalData;
  }

  async getStockWithHistoricalData(stockId: string, period?: string): Promise<(Stock & { historical: StockHistoricalData[] }) | undefined> {
    const stock = this.stocks.get(stockId);
    if (!stock) return undefined;
    
    const historical = await this.getStockHistoricalData(stockId, period);
    return { ...stock, historical };
  }
}

// Create a database storage implementation
export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Implement other methods as needed...
  async getStocks(): Promise<Stock[]> {
    return await db.select().from(stocks);
  }

  async getStock(id: string): Promise<Stock | undefined> {
    const [stock] = await db.select().from(stocks).where(eq(stocks.id, id));
    return stock;
  }

  async createStock(insertStock: InsertStock): Promise<Stock> {
    const [stock] = await db.insert(stocks).values(insertStock).returning();
    return stock;
  }

  async updateStock(id: string, updates: Partial<Stock>): Promise<Stock | undefined> {
    const [stock] = await db.update(stocks).set(updates).where(eq(stocks.id, id)).returning();
    return stock;
  }

  // Other methods would be implemented similarly...
  // For brevity, I'll delegate the rest to MemStorage for now
  private memStorage = new MemStorage();

  async getRecommendations(): Promise<Recommendation[]> {
    return this.memStorage.getRecommendations();
  }

  async createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation> {
    return this.memStorage.createRecommendation(recommendation);
  }

  async getMarketIndices(): Promise<MarketIndex[]> {
    return this.memStorage.getMarketIndices();
  }

  async updateMarketIndex(id: string, updates: Partial<MarketIndex>): Promise<MarketIndex | undefined> {
    return this.memStorage.updateMarketIndex(id, updates);
  }

  async getNews(): Promise<News[]> {
    return this.memStorage.getNews();
  }

  async createNews(newsItem: InsertNews): Promise<News> {
    return this.memStorage.createNews(newsItem);
  }

  async getWatchlist(): Promise<(Watchlist & { stock?: Stock })[]> {
    return this.memStorage.getWatchlist();
  }

  async addToWatchlist(watchlistItem: InsertWatchlist): Promise<Watchlist> {
    return this.memStorage.addToWatchlist(watchlistItem);
  }

  async removeFromWatchlist(id: string): Promise<boolean> {
    return this.memStorage.removeFromWatchlist(id);
  }

  async getAlerts(): Promise<Alert[]> {
    return this.memStorage.getAlerts();
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    return this.memStorage.createAlert(alert);
  }

  async markAlertAsRead(id: string): Promise<boolean> {
    return this.memStorage.markAlertAsRead(id);
  }

  async getPortfolio(): Promise<Portfolio | undefined> {
    return this.memStorage.getPortfolio();
  }

  async updatePortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    return this.memStorage.updatePortfolio(portfolio);
  }

  async getForexPairs(): Promise<ForexPair[]> {
    return this.memStorage.getForexPairs();
  }

  async getForexPair(id: string): Promise<ForexPair | undefined> {
    return this.memStorage.getForexPair(id);
  }

  async createForexPair(pair: InsertForexPair): Promise<ForexPair> {
    return this.memStorage.createForexPair(pair);
  }

  async updateForexPair(id: string, pair: Partial<ForexPair>): Promise<ForexPair | undefined> {
    return this.memStorage.updateForexPair(id, pair);
  }

  async getPortfolioHoldings(): Promise<(PortfolioHolding & { stock?: Stock; forexPair?: ForexPair })[]> {
    return this.memStorage.getPortfolioHoldings();
  }

  async createPortfolioHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding> {
    return this.memStorage.createPortfolioHolding(holding);
  }

  // Investment tracking methods
  async getUserInvestments(userId?: string): Promise<(UserInvestment & { stock?: Stock; forexPair?: ForexPair })[]> {
    return this.memStorage.getUserInvestments(userId);
  }

  async createUserInvestment(investment: InsertUserInvestment): Promise<UserInvestment> {
    return this.memStorage.createUserInvestment(investment);
  }

  async updateUserInvestment(id: string, investment: Partial<UserInvestment>): Promise<UserInvestment | undefined> {
    return this.memStorage.updateUserInvestment(id, investment);
  }

  async deleteUserInvestment(id: string): Promise<boolean> {
    return this.memStorage.deleteUserInvestment(id);
  }

  async getInvestmentAlerts(userId?: string): Promise<InvestmentAlert[]> {
    return this.memStorage.getInvestmentAlerts(userId);
  }

  async createInvestmentAlert(alert: InsertInvestmentAlert): Promise<InvestmentAlert> {
    return this.memStorage.createInvestmentAlert(alert);
  }

  async markInvestmentAlertAsRead(id: string): Promise<boolean> {
    return this.memStorage.markInvestmentAlertAsRead(id);
  }

  async getStockBySymbol(symbol: string): Promise<Stock | undefined> {
    return this.memStorage.getStockBySymbol(symbol);
  }

  async createMarketIndex(index: InsertMarketIndex): Promise<MarketIndex> {
    return this.memStorage.createMarketIndex(index);
  }

  // Stock Historical Data Methods - delegate to MemStorage for now
  async getStockHistoricalData(stockId: string, period?: string): Promise<StockHistoricalData[]> {
    return this.memStorage.getStockHistoricalData(stockId, period);
  }

  async createStockHistoricalData(data: InsertStockHistoricalData): Promise<StockHistoricalData> {
    return this.memStorage.createStockHistoricalData(data);
  }

  async getStockWithHistoricalData(stockId: string, period?: string): Promise<(Stock & { historical: StockHistoricalData[] }) | undefined> {
    return this.memStorage.getStockWithHistoricalData(stockId, period);
  }
}

export const storage = new MemStorage();
