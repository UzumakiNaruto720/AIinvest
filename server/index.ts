import express from "express";
import session from "express-session";
import cors from "cors";
import { registerAuthRoutes } from "./auth";

const app = express();
const PORT = 4000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // frontend origin
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
  }
}));

// Routes
registerAuthRoutes(app);

// Default route
app.get("/", (_req, res) => res.send("Backend is running"));

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
