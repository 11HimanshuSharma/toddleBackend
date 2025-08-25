/** @format */
const {
  likePost,
  unlikePost,
  getPostLikes,
  getUserLikes,
  hasUserLikedPost,
  getPostLikeCount,
} = require("../models/like");
const { getPostById } = require("../models/post");
const logger = require("../utils/logger");

// TODO: Implement likes controller
// This controller should handle:
// - Liking posts
// - Unliking posts
// - Getting likes for a post
// - Getting posts liked by a user

// TODO: Implement likePost function
const likePostController = async (req, res) => {
  try {
    logger.verbose("Like post called");
    const { post_id } = req.body;
    const userId = req.user.id;

    const post = await getPostById(post_id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const alreadyLiked = await hasUserLikedPost(userId, post_id);
    if (alreadyLiked) {
      return res.status(400).json({ error: "Post already liked" });
    }

    const like = await likePost(userId, post_id);
    const likeCount = await getPostLikeCount(post_id);
    logger.verbose(`User ${userId} liked post ${post_id}`);

    res.status(201).json({
      message: "Post liked successfully",
      like: like,
      like_count: likeCount,
    });
  } catch (error) {
    logger.critical("Like post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// TODO: Implement unlikePost function
const unlikePostController = async (req, res) => {
  try {
    logger.verbose("Unlike post called");
    const { post_id } = req.params;
    const userId = req.user.id;

    const post = await getPostById(post_id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isLiked = await hasUserLikedPost(userId, post_id);
    if (!isLiked) {
      return res.status(400).json({ error: "Post not liked" });
    }

    const success = await unlikePost(userId, post_id);
    if (!success) {
      return res.status(400).json({ error: "Failed to unlike post" });
    }

    const likeCount = await getPostLikeCount(post_id);

    logger.verbose(`User ${userId} unliked post ${post_id}`);

    res.json({
      message: "Post unliked successfully",
      like_count: likeCount,
    });
  } catch (error) {
    logger.critical("Unlike post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// TODO: Implement getPostLikes function
const getPostLikesController = async (req, res) => {
  try {
    logger.verbose("Get post likes called");
    const { post_id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const post = await getPostById(post_id);
    if (!post) {
      logger.critical(
        `User ${req.user.id} attempted to get likes for non-existent post ${post_id}`
      );
      return res.status(404).json({ error: "Post not found" });
    }

    const likesData = await getPostLikes(post_id, offset, parseInt(limit));

    logger.verbose("Likes data retrieved successfully:", likesData);
    res.json({
      message: "Post likes retrieved successfully",
      ...likesData,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    logger.critical("Get post likes error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// TODO: Implement getUserLikes function
const getUserLikesController = async (req, res) => {
  try {
    logger.verbose("Get user likes called");
    const { user_id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const likesData = await getUserLikes(user_id, offset, parseInt(limit));
    logger.verbose("User likes data retrieved successfully:", likesData);
    res.json({
      message: "User likes retrieved successfully",
      ...likesData,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    logger.critical("Get user likes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
/**
 * Check if user has liked a post
 */
const checkLikeStatusController = async (req, res) => {
  try {
    logger.verbose("Check like status called");
    const { post_id } = req.params;
    const userId = req.user.id;

    // Validate post exists
    const post = await getPostById(post_id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const hasLiked = await hasUserLikedPost(userId, post_id);
    const likeCount = await getPostLikeCount(post_id);

    res.json({
      post_id: parseInt(post_id),
      user_has_liked: hasLiked,
      like_count: likeCount,
    });
  } catch (error) {
    logger.critical("Check like status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = {
  likePostController,
  unlikePostController,
  getPostLikesController,
  getUserLikesController,
  checkLikeStatusController,
};
