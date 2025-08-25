/** @format */

const {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getFollowCounts,
  isFollowing,
} = require("../models/follow");
const {
  findUsersByName,
  getUserProfile,
  updateUserProfile,
  getUserById,
} = require("../models/user");
const logger = require("../utils/logger");

/**
 * Follow a user
 */
const followUserController = async (req, res) => {
  try {
    logger.verbose("Follow user called");
    const { user_id } = req.validatedData;
    const followerId = req.user.id;

    if (followerId === parseInt(user_id)) {
      logger.critical("User attempted to follow themselves");
      return res.status(400).json({ error: "Cannot follow yourself" });
    }
    const targetUser = await getUserById(user_id);
    if (!targetUser) {
      logger.critical(
        `User ${followerId} attempted to follow non-existent user ${user_id}`
      );
      return res.status(404).json({ error: "User not found" });
    }
    const alreadyFollowing = await isFollowing(followerId, user_id);
    if (alreadyFollowing) {
      logger.critical(
        `User ${followerId} attempted to follow user ${user_id} again`
      );
      return res.status(400).json({ error: "Already following this user" });
    }

    const follow = await followUser(followerId, user_id);
    const followCounts = await getFollowCounts(user_id);

    logger.verbose(`User ${followerId} followed user ${user_id}`);

    res.status(201).json({
      message: "User followed successfully",
      follow: follow,
      followers_count: followCounts.followers_count,
    });
  } catch (error) {
    logger.critical("Follow user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Unfollow a user
 */
const unfollowUserController = async (req, res) => {
  try {
    logger.verbose("Unfollow user called");
    const { user_id } = req.params;
    const followerId = req.user.id;

    if (followerId === parseInt(user_id)) {
      logger.critical("User attempted to unfollow themselves");
      return res.status(400).json({ error: "Cannot unfollow yourself" });
    }
    const currentlyFollowing = await isFollowing(followerId, user_id);
    if (!currentlyFollowing) {
      logger.critical(
        `User ${followerId} attempted to unfollow user ${user_id} without following`
      );
      return res.status(400).json({ error: "Not following this user" });
    }
    const success = await unfollowUser(followerId, user_id);
    if (!success) {
      logger.critical(`User ${followerId} failed to unfollow user ${user_id}`);
      return res.status(400).json({ error: "Failed to unfollow user" });
    }

    const followCounts = await getFollowCounts(user_id);

    logger.verbose(`User ${followerId} unfollowed user ${user_id}`);

    res.json({
      message: "User unfollowed successfully",
      followers_count: followCounts.followers_count,
    });
  } catch (error) {
    logger.critical("Unfollow user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get users that current user is following
 */
const getMyFollowingController = async (req, res) => {
  try {
    logger.verbose("Get my following called");
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const followingData = await getFollowing(userId, offset, parseInt(limit));

    res.json({
      message: "Following list retrieved successfully",
      ...followingData,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    logger.critical("Get following error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get users that follow the current user
 */
const getMyFollowersController = async (req, res) => {
  try {
    logger.verbose("Get my followers called");
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const followersData = await getFollowers(userId, offset, parseInt(limit));

    res.json({
      message: "Followers list retrieved successfully",
      ...followersData,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    logger.critical("Get followers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get follow stats for current user
 */
const getMyStatsController = async (req, res) => {
  try {
    logger.verbose("Get my stats called");
    const userId = req.user.id;

    const followCounts = await getFollowCounts(userId);

    res.json({
      message: "Follow stats retrieved successfully",
      ...followCounts,
    });
  } catch (error) {
    logger.critical("Get follow stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Search users by name
 */
const searchUsersController = async (req, res) => {
  try {
    logger.verbose("Search users called");
    const { q: searchTerm } = req.query;
    const { page = 1, limit = 20 } = req.query;

    if (!searchTerm || searchTerm.trim().length < 2) {
      logger.critical("Invalid search term");
      return res
        .status(400)
        .json({ error: "Search term must be at least 2 characters" });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const searchResults = await findUsersByName(
      searchTerm.trim(),
      offset,
      parseInt(limit)
    );

    res.json({
      message: "User search completed successfully",
      ...searchResults,
      page: parseInt(page),
      limit: parseInt(limit),
      search_term: searchTerm.trim(),
    });
  } catch (error) {
    logger.critical("Search users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get user profile by ID
 */
const getUserProfileController = async (req, res) => {
  try {
    logger.verbose("Get user profile called");

    const { user_id } = req.params;
    const requestingUserId = req.user ? req.user.id : null;

    if (!user_id || isNaN(parseInt(user_id))) {
      logger.critical("Invalid user ID");
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const userProfile = await getUserProfile(
      parseInt(user_id),
      requestingUserId
    );
    logger.verbose(
      "Get user profile result:",
      userProfile ? "Found" : "Not found"
    );

    if (!userProfile) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User profile retrieved successfully",
      user: userProfile,
    });
  } catch (error) {
    logger.critical("Get user profile error:", error);
    res.status(500).json({
      error: "Internal server error",
      ...(process.env.NODE_ENV === "development" && {
        details: error.message,
        stack: error.stack,
      }),
    });
  }
};

/**
 * Update current user's profile
 */
const updateMyProfileController = async (req, res) => {
  try {
    logger.verbose("Update my profile called");
    const userId = req.user.id;
    const updateData = req.body;

    const updatedProfile = await updateUserProfile(userId, updateData);

    logger.verbose(`User ${userId} updated their profile`);

    res.json({
      message: "Profile updated successfully",
      user: updatedProfile,
    });
  } catch (error) {
    logger.critical("Update profile error:", error);
    if (error.message.includes("No valid fields")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  followUserController,
  unfollowUserController,
  getMyFollowingController,
  getMyFollowersController,
  getMyStatsController,
  searchUsersController,
  getUserProfileController,
  updateMyProfileController,
};
