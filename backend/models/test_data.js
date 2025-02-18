const bcrypt = require("bcryptjs");

const db = require("../models/database");

// Sample data for both admins and master admins
const users = [
  { username: "rakshak", email: "cg@cg.com", password: "cg123" },
  { username: "rakshak", email: "lg@lg.com", password: "lg123" },
];

// Function to insert users into the database
const insertUsers = async (db, table, users) => {
  users.forEach(async (user) => {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    db.run(
      `INSERT INTO ${table} (username, email, password) VALUES (?, ?, ?)`,
      [user.username, user.email, hashedPassword],
      (err) => {
        if (err) {
          console.error(`Error inserting into ${table}:`, err.message);
        } else {
          console.log(`${user.username} inserted into ${table} successfully`);
        }
      }
    );
  });
};

// Insert the same users into both admins and master_admins
insertUsers(db, "admins", users);
insertUsers(db, "master_admins", users);
