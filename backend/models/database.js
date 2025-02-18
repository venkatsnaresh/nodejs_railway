const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Define the database path (absolute path)
const dbPath = path.resolve(__dirname, "kpmpp.db");

// Initialize the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

// Create the tables
const createTables = () => {
  return new Promise((resolve, reject) => {
    // Create users table
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        reset_token TEXT,
        reset_token_expiry INTEGER
      )`,
      (err) => {
        if (err) {
          console.error("Error creating users table:", err.message);
          return reject(err);
        }
        console.log("Users table created or exists");
      }
    );

    // Create admins table
    db.run(
      `CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )`,
      (err) => {
        if (err) {
          console.error("Error creating admins table:", err.message);
          return reject(err);
        }
        console.log("Admins table created or exists");
      }
    );

    // Create master admins table
    db.run(
      `CREATE TABLE IF NOT EXISTS master_admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )`,
      (err) => {
        if (err) {
          console.error("Error creating master admins table:", err.message);
          return reject(err);
        }
        console.log("Master admins table created or exists");
      }
    );

    // Create subscriptions table
    db.run(
      `CREATE TABLE IF NOT EXISTS subscriptions (
        user_id INTEGER PRIMARY KEY,
        plan TEXT NOT NULL,
        created_on TEXT NOT NULL,
        expiring_on TEXT NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`,
      (err) => {
        if (err) {
          console.error("Error creating subscriptions table:", err.message);
          return reject(err);
        }
        console.log("Subscriptions table created or exists");
      }
    );

    // Create donations table
    db.run(
      `CREATE TABLE IF NOT EXISTS donations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        donated_amount REAL NOT NULL,
        donated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      (err) => {
        if (err) {
          console.error("Error creating donations table:", err.message);
          return reject(err);
        }
        console.log("Donations table created or exists");
      }
    );

    // Create complaints table
    db.run(
      `CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT,
        lastname TEXT,
        adhar TEXT,
        voter TEXT,
        phno TEXT,
        hno TEXT,
        city TEXT,
        mandal TEXT,
        district TEXT,
        state TEXT,
        country TEXT,
        pincode TEXT,  
        professionCategory TEXT,
        mainProfession TEXT,
        subProfession TEXT,
        organization_name TEXT,
        organization_city TEXT,
        organization_phone TEXT,
        organization_pincode TEXT,
        organization_email TEXT,
        organization_sourceType TEXT,
        business_name TEXT,
        business_city TEXT,
        business_phone TEXT,
        business_pincode TEXT,
        business_email TEXT,
        farming_land TEXT,
        farming_buffalo INTEGER,
        farming_ox INTEGER,
        farming_cows INTEGER,
        student_category TEXT,
        student_institution_name TEXT,
        student_institution_city TEXT,
        student_institution_phone TEXT,
        student_institution_pincode TEXT,
        problemCategories TEXT,
        problemDescriptions TEXT,
        status TEXT
      )`,
      (err) => {
        if (err) {
          console.error("Error creating complaints table:", err.message);
          return reject(err);
        }
        console.log("Complaints table created or exists");
        resolve();
      }
    );
  });
};

// Initialize the database and create tables
const initializeDatabase = async () => {
  try {
    await createTables();
    console.log("All tables created or verified successfully!");
  } catch (error) {
    console.error("Database initialization failed:", error.message);
  }
};

// Call the function to initialize the database
initializeDatabase();

module.exports = db;
