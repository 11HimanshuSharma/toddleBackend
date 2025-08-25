/** @format */

const { query } = require("../utils/database");

/**
 * Like model for managing post likes
 * TODO: Implement this model for the like functionality
 */

// TODO: Implement likePost function
/**
 * @param {number} userId - User ID
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} Like result
 */

const likePost = async (userId, postId) => {
  try {
    const result = await query(
      `INSERT INTO likes (user_id, post_id, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, post_id) DO NOTHING
       RETURNING user_id, post_id, created_at`,
      [userId, postId]
    );

    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Failed to like post: ${error.message}`);
  }
};

// TODO: Implement unlikePost function
/**
 * Unlike a post
 * @param {number} userId - User ID
 * @param {number} postId - Post ID
 * @returns {Promise<boolean>} Success status
 */
const unlikePost = async (userId, postId) => {
  try {
    const result = await query(
      "DELETE FROM likes WHERE user_id = $1 AND post_id = $2",
      [userId, postId]
    );

    return result.rowCount > 0;
  } catch (error) {
    throw new Error(`Failed to unlike post: ${error.message}`);
  }
};
// TODO: Implement getPostLikes function
/**
 * Get likes for a post
 * @param {number} postId - Post ID
 * @param {number} offset - Pagination offset
 * @param {number} limit - Pagination limit
 * @returns {Promise<Object>} Likes data with pagination
 */
const getPostLikes = async (postId, offset = 0, limit = 20) => {
  try {
    const [likesResult, countResult] = await Promise.all([
      query(
        `SELECT l.user_id, l.created_at, u.username, u.full_name
         FROM likes l
         JOIN users u ON l.user_id = u.id
         WHERE l.post_id = $1
         ORDER BY l.created_at DESC
         LIMIT $2 OFFSET $3`,
        [postId, limit, offset]
      ),
      query("SELECT COUNT(*) as total FROM likes WHERE post_id = $1", [postId]),
    ]);

    return {
      likes: likesResult.rows,
      total: parseInt(countResult.rows[0].total),
      hasMore: offset + limit < parseInt(countResult.rows[0].total),
    };
  } catch (error) {
    throw new Error(`Failed to get post likes: ${error.message}`);
  }
};

// TODO: Implement getUserLikes function
/**
 * Get posts liked by a user
 * @param {number} userId - User ID
 * @param {number} offset - Pagination offset
 * @param {number} limit - Pagination limit
 * @returns {Promise<Object>} Liked posts with pagination
 */
const getUserLikes = async (userId, offset = 0, limit = 20) => {
  try {
    const [likesResult, countResult] = await Promise.all([
      query(
        `SELECT l.user_id, l.post_id, l.created_at, 
                p.content, p.media_url, p.created_at as post_created_at,
                u.username, u.full_name
         FROM likes l
         JOIN posts p ON l.post_id = p.id
         JOIN users u ON p.user_id = u.id
         WHERE l.user_id = $1 AND p.is_deleted = FALSE
         ORDER BY l.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      ),
      query(
        `SELECT COUNT(*) as total 
         FROM likes l 
         JOIN posts p ON l.post_id = p.id 
         WHERE l.user_id = $1 AND p.is_deleted = FALSE`,
        [userId]
      ),
    ]);

    return {
      likes: likesResult.rows,
      total: parseInt(countResult.rows[0].total),
      hasMore: offset + limit < parseInt(countResult.rows[0].total),
    };
  } catch (error) {
    throw new Error(`Failed to get user likes: ${error.message}`);
  }
};

// TODO: Implement hasUserLikedPost function
/**
 * Check if user has liked a post
 * @param {number} userId - User ID
 * @param {number} postId - Post ID
 * @returns {Promise<boolean>} Like status
 */
const hasUserLikedPost = async (userId, postId) => {
  try {
    const result = await query(
      "SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2",
      [userId, postId]
    );

    return result.rows.length > 0;
  } catch (error) {
    throw new Error(`Failed to check like status: ${error.message}`);
  }
};

/**
 * Get like count for a post
 * @param {number} postId - Post ID
 * @returns {Promise<number>} Like count
 */
const getPostLikeCount = async (postId) => {
  try {
    const result = await query(
      "SELECT COUNT(*) as count FROM likes WHERE post_id = $1",
      [postId]
    );

    return parseInt(result.rows[0].count);
  } catch (error) {
    throw new Error(`Failed to get like count: ${error.message}`);
  }
};
module.exports = {
  likePost,
  unlikePost,
  getPostLikes,
  getUserLikes,
  hasUserLikedPost,
  getPostLikeCount,
};
