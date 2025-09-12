import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  real,
  timestamp,
  integer,
  boolean,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const stocks = pgTable("stocks", {
  id: varchar("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  currentPrice: real("current_price").notNull(),
  changeAmount: real("change_amount").notNull(),
  changePercent: real("change_percent").notNull(),
  marketCap: real("market_cap"),
  peRatio: real("pe_ratio"),
  volume: integer("volume"),
  aiScore: real("ai_score"),
  sector: text("sector"),
  exchange: text("exchange").default("NSE"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const recommendations = pgTable("recommendations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  stockId: varchar("stock_id")
    .notNull()
    .references(() => stocks.id),
  action: text("action").notNull(), // BUY, SELL, HOLD
  score: real("score").notNull(), // 0-10
  targetPrice: real("target_price"),
  stopLoss: real("stop_loss"),
  analysis: text("analysis").notNull(),
  confidence: real("confidence").notNull(), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
});

export const marketIndices = pgTable("market_indices", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  currentValue: real("current_value").notNull(),
  changeAmount: real("change_amount").notNull(),
  changePercent: real("change_percent").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const news = pgTable("news", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  headline: text("headline").notNull(),
  summary: text("summary"),
  source: text("source").notNull(),
  sentiment: text("sentiment"), // Positive, Negative, Neutral
  sentimentScore: real("sentiment_score"), // 0-100
  publishedAt: timestamp("published_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const watchlist = pgTable("watchlist", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  stockId: varchar("stock_id")
    .notNull()
    .references(() => stocks.id),
  userId: text("user_id").default("default_user"), // Simplified for demo
  createdAt: timestamp("created_at").defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // price_alert, portfolio_milestone, ai_recommendation
  title: text("title").notNull(),
  message: text("message").notNull(),
  stockId: varchar("stock_id").references(() => stocks.id),
  isRead: boolean("is_read").default(false),
  severity: text("severity").default("info"), // info, warning, success, danger
  createdAt: timestamp("created_at").defaultNow(),
});

export const portfolio = pgTable("portfolio", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  totalValue: real("total_value").notNull(),
  dayChange: real("day_change").notNull(),
  dayChangePercent: real("day_change_percent").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User investments table for tracking individual investments
export const userInvestments = pgTable("user_investments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().default("default_user"),
  stockId: varchar("stock_id").references(() => stocks.id),
  forexPairId: varchar("forex_pair_id").references(() => forexPairs.id),
  investmentType: text("investment_type").notNull(), // 'stock' or 'forex'

  // Investment details
  quantity: real("quantity").notNull(), // Number of shares or units
  investedAmount: real("invested_amount").notNull(), // Amount invested
  investedCurrency: text("invested_currency").notNull().default("INR"), // Currency used
  purchasePrice: real("purchase_price").notNull(), // Price per unit when purchased
  purchaseDate: timestamp("purchase_date").notNull(),

  // Current status
  currentPrice: real("current_price"), // Current market price
  currentValue: real("current_value"), // Current total value
  profitLoss: real("profit_loss"), // Profit or loss amount
  profitLossPercent: real("profit_loss_percent"), // Profit or loss percentage

  // Alert settings
  stopLossPrice: real("stop_loss_price"), // User-defined stop loss
  targetPrice: real("target_price"), // User-defined target
  alertsEnabled: boolean("alerts_enabled").default(true),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Investment alerts for loss prevention
export const investmentAlerts = pgTable("investment_alerts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  investmentId: varchar("investment_id")
    .notNull()
    .references(() => userInvestments.id),
  alertType: text("alert_type").notNull(), // 'stop_loss', 'target_reached', 'loss_warning', 'suggestion'
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: text("severity").notNull().default("warning"), // 'info', 'warning', 'danger', 'success'
  isRead: boolean("is_read").default(false),
  actionRequired: boolean("action_required").default(false), // Whether immediate action is needed
  suggestionType: text("suggestion_type"), // 'sell', 'hold', 'buy_more', 'set_stop_loss'
  createdAt: timestamp("created_at").defaultNow(),
});

export const forexPairs = pgTable("forex_pairs", {
  id: varchar("id").primaryKey(),
  baseCurrency: text("base_currency").notNull(),
  quoteCurrency: text("quote_currency").notNull(),
  currentRate: real("current_rate").notNull(),
  changeAmount: real("change_amount").notNull(),
  changePercent: real("change_percent").notNull(),
  high24h: real("high_24h"),
  low24h: real("low_24h"),
  volume: real("volume"),
  aiScore: real("ai_score"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Historical stock price data for charts
export const stockHistoricalData = pgTable("stock_historical_data", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  stockId: varchar("stock_id")
    .notNull()
    .references(() => stocks.id),
  date: timestamp("date").notNull(),
  open: real("open").notNull(),
  high: real("high").notNull(),
  low: real("low").notNull(),
  close: real("close").notNull(),
  volume: integer("volume"),
  adjustedClose: real("adjusted_close"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const portfolioHoldings = pgTable("portfolio_holdings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  stockId: varchar("stock_id").references(() => stocks.id),
  forexPairId: varchar("forex_pair_id").references(() => forexPairs.id),
  quantity: real("quantity").notNull(),
  averagePrice: real("average_price").notNull(),
  currentValue: real("current_value").notNull(),
  dayChange: real("day_change").notNull(),
  dayChangePercent: real("day_change_percent").notNull(),
  holdingType: text("holding_type").notNull(), // 'stock' or 'forex'
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertStockSchema = createInsertSchema(stocks).omit({
  updatedAt: true,
});
export const insertRecommendationSchema = createInsertSchema(
  recommendations,
).omit({ id: true, createdAt: true });
export const insertMarketIndexSchema = createInsertSchema(marketIndices).omit({
  updatedAt: true,
});
export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  createdAt: true,
});
export const insertWatchlistSchema = createInsertSchema(watchlist).omit({
  id: true,
  createdAt: true,
});
export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});
export const insertPortfolioSchema = createInsertSchema(portfolio).omit({
  id: true,
  updatedAt: true,
});
export const insertForexPairSchema = createInsertSchema(forexPairs).omit({
  updatedAt: true,
});
export const insertPortfolioHoldingSchema = createInsertSchema(
  portfolioHoldings,
).omit({ id: true, updatedAt: true });
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});
export const insertUserInvestmentSchema = createInsertSchema(
  userInvestments,
).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInvestmentAlertSchema = createInsertSchema(
  investmentAlerts,
).omit({ id: true, createdAt: true });
export const insertStockHistoricalDataSchema = createInsertSchema(
  stockHistoricalData,
).omit({ id: true, createdAt: true });

// Types
export type Stock = typeof stocks.$inferSelect;
export type InsertStock = z.infer<typeof insertStockSchema>;
export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type MarketIndex = typeof marketIndices.$inferSelect;
export type InsertMarketIndex = z.infer<typeof insertMarketIndexSchema>;
export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type Watchlist = typeof watchlist.$inferSelect;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Portfolio = typeof portfolio.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type ForexPair = typeof forexPairs.$inferSelect;
export type InsertForexPair = z.infer<typeof insertForexPairSchema>;
export type PortfolioHolding = typeof portfolioHoldings.$inferSelect;
export type InsertPortfolioHolding = z.infer<
  typeof insertPortfolioHoldingSchema
>;
export type User = typeof users.$inferSelect;
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type UserInvestment = typeof userInvestments.$inferSelect;
export type InsertUserInvestment = z.infer<typeof insertUserInvestmentSchema>;
export type InvestmentAlert = typeof investmentAlerts.$inferSelect;
export type InsertInvestmentAlert = z.infer<typeof insertInvestmentAlertSchema>;
export type StockHistoricalData = typeof stockHistoricalData.$inferSelect;
export type InsertStockHistoricalData = z.infer<typeof insertStockHistoricalDataSchema>;
