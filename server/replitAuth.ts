import type { RequestHandler, Express } from "express";
import session from "express-session";

export function setupAuth(app: Express) {
  app.use(
    session({
      secret: "dev-secret-key", // change if you want
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24h
    })
  );
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session?.user) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};
