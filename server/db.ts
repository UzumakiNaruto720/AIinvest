// db.ts - Mock version for local frontend testing

// Mock "db" object for local testing
export const db = {
  users: [
    { id: 1, name: "Test User", email: "you@example.com" }
  ],
  getUser: function() {
    return this.users[0];
  }
};

// Optional: provide a mock "pool" object if something else imports it
export const pool = {};
