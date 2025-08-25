/** @format */

const { query } = require("../utils/database");

/**
 * Follow model for managing user relationships
 */

/**
 * Follow a user
 * @param {number} followerId - ID of the user who is following
 * @param {number} followedId - ID of the user being followed
 * @returns {Promise<Object>} Follow relationship
 */
const followUser = async (followerId, followedId) => {
  try {
    const result = await query(
      `INSERT INTO follows (follower_id, followed_id, created_at)
       VALUES ($1, $2, NOW())
       RETURNING follower_id, followed_id, created_at`,
      [followerId, followedId]
    );
    return result.rows[0];
  } catch (error) {
    logger.critical("Follow user error:", error);
    throw new Error(`Failed to follow user: ${error.message}`);
  }
};

/**
 * Unfollow a user
 * @param {number} followerId - ID of the user who is unfollowing
 * @param {number} followedId - ID of the user being unfollowed
 * @returns {Promise<boolean>} Success status
 */
const unfollowUser = async (followerId, followedId) => {
  try {
    const result = await query(
      `DELETE FROM follows 
       WHERE follower_id = $1 AND followed_id = $2`,
      [followerId, followedId]
    );
    return result.rowCount > 0;
  } catch (error) {
    logger.critical("Unfollow user error:", error);
    throw new Error(`Failed to unfollow user: ${error.message}`);
  }
};

/**
 * Get list of users that a user is following
 * @param {number} userId - User ID
 * @param {number} offset - Pagination offset
 * @param {number} limit - Pagination limit
 * @returns {Promise<Object>} Following list with pagination
 */
const getFollowing = async (userId, offset = 0, limit = 20) => {
  try {
    const result = await query(
      `SELECT u.id, u.username, u.full_name, f.created_at as followed_since
       FROM follows f
       JOIN users u ON f.followed_id = u.id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM follows WHERE follower_id = $1`,
      [userId]
    );

    return {
      following: result.rows,
      total: parseInt(countResult.rows[0].total),
      hasMore: result.rows.length === limit,
    };
  } catch (error) {
    logger.critical("Get following list error:", error);
    throw new Error(`Failed to get following list: ${error.message}`);
  }
};

/**
 * Get list of users that follow a user
 * @param {number} userId - User ID
 * @param {number} offset - Pagination offset
 * @param {number} limit - Pagination limit
 * @returns {Promise<Object>} Followers list with pagination
 */
const getFollowers = async (userId, offset = 0, limit = 20) => {
  try {
    const result = await query(
      `SELECT u.id, u.username, u.full_name, f.created_at as followed_since
       FROM follows f
       JOIN users u ON f.follower_id = u.id
       WHERE f.followed_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM follows WHERE followed_id = $1`,
      [userId]
    );

    return {
      followers: result.rows,
      total: parseInt(countResult.rows[0].total),
      hasMore: result.rows.length === limit,
    };
  } catch (error) {
    logger.critical("Get followers list error:", error);
    throw new Error(`Failed to get followers list: ${error.message}`);
  }
};

/**
 * Get follow counts for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Follow counts
 */
const getFollowCounts = async (userId) => {
  try {
    const result = await query(
      `SELECT 
        (SELECT COUNT(*) FROM follows WHERE follower_id = $1) as following_count,
        (SELECT COUNT(*) FROM follows WHERE followed_id = $1) as followers_count`,
      [userId]
    );

    return {
      following_count: parseInt(result.rows[0].following_count),
      followers_count: parseInt(result.rows[0].followers_count),
    };
  } catch (error) {
    logger.critical("Get follow counts error:", error);
    throw new Error(`Failed to get follow counts: ${error.message}`);
  }
};

/**
 * Check if user is following another user
 * @param {number} followerId - ID of the potential follower
 * @param {number} followedId - ID of the potentially followed user
 * @returns {Promise<boolean>} True if following, false otherwise
 */
const isFollowing = async (followerId, followedId) => {
  try {
    const result = await query(
      `SELECT 1 FROM follows WHERE follower_id = $1 AND followed_id = $2`,
      [followerId, followedId]
    );
    return result.rows.length > 0;
  } catch (error) {
    logger.critical("Check follow status error:", error);
    throw new Error(`Failed to check follow status: ${error.message}`);
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getFollowCounts,
  isFollowing,
};
