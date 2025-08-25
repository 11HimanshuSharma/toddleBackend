/** @format */

const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

/**
 * Database setup script
 * This script creates the database tables and seeds initial data
 */

const setupDatabase = async () => {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD),
  });

  try {
    console.log("Setting up database...");

    // Drop existing objects first
    console.log("Dropping existing database objects...");
    const dropSQL = `
      -- Drop triggers
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
      DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
      
      -- Drop function
      DROP FUNCTION IF EXISTS update_updated_at_column();
      
      -- Drop tables (in reverse order of dependencies)
      DROP TABLE IF EXISTS follows CASCADE;
      DROP TABLE IF EXISTS likes CASCADE;
      DROP TABLE IF EXISTS comments CASCADE;
      DROP TABLE IF EXISTS posts CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `;

    await pool.query(dropSQL);
    console.log("Existing database objects dropped successfully");

    // Read and execute schema file
    const fs = require("fs");
    const path = require("path");

    const schemaSQL = fs.readFileSync(
      path.join(__dirname, "../sql/schema.sql"),
      "utf8"
    );
    await pool.query(schemaSQL);
    console.log("Database schema created successfully");

    console.log("Database setup completed successfully!");
  } catch (error) {
    console.error("Database setup failed!", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
