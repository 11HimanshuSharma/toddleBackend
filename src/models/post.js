/** @format */

const { query } = require("../utils/database");

/**
 * Post model for database operations
 */

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @returns {Promise<Object>} Created post
 */
const createPost = async ({
  user_id,
  content,
  media_url,
  comments_enabled = true,
}) => {
  const result = await query(
    `INSERT INTO posts (user_id, content, media_url, comments_enabled, created_at, is_deleted)
     VALUES ($1, $2, $3, $4, NOW(), false)
     RETURNING id, user_id, content, media_url, comments_enabled, created_at`,
    [user_id, content, media_url, comments_enabled]
  );

  return result.rows[0];
};

/**
 * Get post by ID
 * @param {number} postId - Post ID
 * @returns {Promise<Object|null>} Post object or null
 */
const getPostById = async (postId) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = $1 AND p.is_deleted = false`,
    [postId]
  );

  return result.rows[0] || null;
};

/**
 * Get posts by user ID
 * @param {number} userId - User ID
 * @param {number} limit - Number of posts to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of posts
 */
const getPostsByUserId = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id = $1
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
};

/**
 * Delete a post
 * @param {number} postId - Post ID
 * @param {number} userId - User ID (for ownership verification)
 * @returns {Promise<boolean>} Success status
 */
const deletePost = async (postId, userId) => {
  const result = await query(
    "UPDATE posts SET is_deleted = false WHERE id = $1 AND user_id = $2",
    [postId, userId]
  );

  return result.rowCount > 0;
};

// TODO: Implement getFeedPosts function that returns posts from followed users
// This should include pagination and ordering by creation date

// TODO: Implement updatePost function for editing posts
/**
 * Update a post
 * @param {number} postId - Post ID
 * @param {number} userId - User ID (for ownership verification)
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated post
 */
const updatePost = async (postId, userId, updateData) => {
  try {
    const allowedFields = ["content", "media_url", "comments_enabled"];
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    // Build dynamic update query
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        updateValues.push(value);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      throw new Error("No valid fields to update");
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(postId, userId);

    const result = await query(
      `UPDATE posts 
       SET ${updateFields.join(", ")}
       WHERE id = $${paramCount} AND user_id = $${
        paramCount + 1
      } AND is_deleted = FALSE
       RETURNING id, user_id, content, media_url, comments_enabled, created_at, updated_at`,
      updateValues
    );

    if (result.rows.length === 0) {
      throw new Error("Post not found or unauthorized");
    }

    return result.rows[0];
  } catch (error) {
    throw new Error(`Failed to update post: ${error.message}`);
  }
};

// TODO: Implement searchPosts function for content search

module.exports = {
  createPost,
  getPostById,
  getPostsByUserId,
  deletePost,
  updatePost
};
