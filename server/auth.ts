import type { Express } from "express";

const DUMMY_USER = {
  id: "test-user-1",
  email: "test@gmail.com",
  password: "12345", // plain text for simplicity
  firstName: "Test",
  lastName: "User",
  profileImageUrl: null
};

export function registerAuthRoutes(app: Express) {
  // Login
  app.post("/api/auth/login", (req: any, res) => {
    const { email, password } = req.body;
    if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
      req.session.user = { ...DUMMY_USER };
      delete req.session.user.password;
      return res.json({ success: true, user: req.session.user });
    }
    res.status(401).json({ success: false, message: "Invalid credentials" });
  });

  // Get logged-in user
  app.get("/api/auth/user", (req: any, res) => {
    if (req.session.user) return res.json(req.session.user);
    res.status(401).json({ message: "Not authenticated" });
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ success: true });
    });
  });
}
