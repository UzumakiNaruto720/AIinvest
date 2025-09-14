import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupAuth } from "./replitauth";

async function main() {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: "http://localhost:3000", // frontend dev server
      credentials: true,
    })
  );

  // Setup local session-based auth
  setupAuth(app);

  // Register all routes
  const server = await registerRoutes(app);

  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
