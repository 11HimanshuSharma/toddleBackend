/** @format */

const express = require("express");
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const {
  validateRequest,
  followUserSchema,
  updateProfileSchema,
} = require("../utils/validation");
const {
  followUserController,
  unfollowUserController,
  getMyFollowingController,
  getMyFollowersController,
  getMyStatsController,
  searchUsersController,
  getUserProfileController,
  updateMyProfileController,
} = require("../controllers/users");

const router = express.Router();

/**
 * User routes
 */

// POST /api/users/follow - Follow a user
router.post(
  "/follow",
  authenticateToken,
  validateRequest(followUserSchema),
  followUserController
);

// DELETE /api/users/unfollow/:user_id - Unfollow a user
router.delete("/unfollow/:user_id", authenticateToken, unfollowUserController);

// GET /api/users/following - Get users that current user follows
router.get("/following", authenticateToken, getMyFollowingController);

// GET /api/users/followers - Get users that follow current user
router.get("/followers", authenticateToken, getMyFollowersController);

// GET /api/users/stats - Get follow stats for current user
router.get("/stats", authenticateToken, getMyStatsController);

// GET /api/users/search - Find users by name
router.get("/search", searchUsersController);

// GET /api/users/profile/:user_id - Get user profile by ID
router.get(
  "/profile/:user_id",
  (req, res, next) => {
    console.log("🎯 Profile route hit! Params:", req.params);
    next();
  },
  optionalAuth,
  getUserProfileController
);

// PUT /api/users/profile - Update current user's profile
router.put(
  "/profile",
  authenticateToken,
  validateRequest(updateProfileSchema),
  updateMyProfileController
);

module.exports = router;
