/** @format */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const serverless = require("serverless-http");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

// Import your existing routes
const authRoutes = require("../../src/routes/auth");
const userRoutes = require("../../src/routes/users");
const postRoutes = require("../../src/routes/posts");
const commentsRoutes = require("../../src/routes/comments");
const likesRoutes = require("../../src/routes/likes");

// Create Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/likes", likesRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: "netlify-functions",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { details: err.message }),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Export the serverless function
module.exports.handler = serverless(app);
