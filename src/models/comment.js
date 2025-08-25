/** @format */

const { query } = require("../utils/database");

/**
 * Comment model for managing post comments
 */

/**
 * Create a comment
 * @param {Object} commentData - Comment data
 * @returns {Promise<Object>} Created comment
 */
const createComment = async ({
  postId,
  userId,
  content,
  parentCommentId = null,
}) => {
  try {
    const result = await query(
      `INSERT INTO comments (post_id, user_id, content, parent_comment_id, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, post_id, user_id, content, parent_comment_id, created_at`,
      [postId, userId, content, parentCommentId]
    );

    return result.rows[0];
  } catch (error) {
    logger.critical("Create comment error:", error);
    throw new Error(`Failed to create comment: ${error.message}`);
  }
};

/**
 * Update a comment
 * @param {number} commentId - Comment ID
 * @param {number} userId - User ID (for authorization)
 * @param {string} content - New content
 * @returns {Promise<Object>} Updated comment
 */
const updateComment = async (commentId, userId, content) => {
  try {
    const result = await query(
      `UPDATE comments 
       SET content = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3 AND is_deleted = FALSE
       RETURNING id, post_id, user_id, content, parent_comment_id, created_at, updated_at`,
      [content, commentId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error("Comment not found or unauthorized");
    }

    return result.rows[0];
  } catch (error) {
    logger.critical("Update comment error:", error);
    throw new Error(`Failed to update comment: ${error.message}`);
  }
};

/**
 * Delete a comment (soft delete)
 * @param {number} commentId - Comment ID
 * @param {number} userId - User ID (for authorization)
 * @returns {Promise<boolean>} Success status
 */
const deleteComment = async (commentId, userId) => {
  try {
    const result = await query(
      `UPDATE comments 
       SET is_deleted = TRUE, updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE`,
      [commentId, userId]
    );

    return result.rowCount > 0;
  } catch (error) {
    logger.critical("Delete comment error:", error);
    throw new Error(`Failed to delete comment: ${error.message}`);
  }
};

/**
 * Get comments for a post
 * @param {number} postId - Post ID
 * @param {number} offset - Pagination offset
 * @param {number} limit - Pagination limit
 * @returns {Promise<Object>} Comments with pagination
 */
const getPostComments = async (postId, offset = 0, limit = 20) => {
  try {
    const [commentsResult, countResult] = await Promise.all([
      query(
        `SELECT c.id, c.post_id, c.user_id, c.content, c.parent_comment_id,
                c.created_at, c.updated_at,
                u.username, u.full_name,
                (SELECT COUNT(*) FROM comments WHERE parent_comment_id = c.id AND is_deleted = FALSE) as reply_count
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.post_id = $1 AND c.is_deleted = FALSE AND c.parent_comment_id IS NULL
         ORDER BY c.created_at ASC
         LIMIT $2 OFFSET $3`,
        [postId, limit, offset]
      ),
      query(
        "SELECT COUNT(*) as total FROM comments WHERE post_id = $1 AND is_deleted = FALSE AND parent_comment_id IS NULL",
        [postId]
      ),
    ]);

    return {
      comments: commentsResult.rows,
      total: parseInt(countResult.rows[0].total),
      hasMore: offset + limit < parseInt(countResult.rows[0].total),
    };
  } catch (error) {
    logger.critical("Get post comments error:", error);
    throw new Error(`Failed to get post comments: ${error.message}`);
  }
};

/**
 * Get replies to a comment
 * @param {number} parentCommentId - Parent comment ID
 * @param {number} offset - Pagination offset
 * @param {number} limit - Pagination limit
 * @returns {Promise<Object>} Replies with pagination
 */
const getCommentReplies = async (parentCommentId, offset = 0, limit = 10) => {
  try {
    logger.verbose(`Get replies for comment ${parentCommentId} called`);
    const [repliesResult, countResult] = await Promise.all([
      query(
        `SELECT c.id, c.post_id, c.user_id, c.content, c.parent_comment_id,
                c.created_at, c.updated_at,
                u.username, u.full_name
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.parent_comment_id = $1 AND c.is_deleted = FALSE
         ORDER BY c.created_at ASC
         LIMIT $2 OFFSET $3`,
        [parentCommentId, limit, offset]
      ),
      query(
        "SELECT COUNT(*) as total FROM comments WHERE parent_comment_id = $1 AND is_deleted = FALSE",
        [parentCommentId]
      ),
    ]);
    logger.verbose(
      `Get replies for comment ${parentCommentId} result:`,
      repliesResult.rows
    );

    return {
      replies: repliesResult.rows,
      total: parseInt(countResult.rows[0].total),
      hasMore: offset + limit < parseInt(countResult.rows[0].total),
    };
  } catch (error) {
    logger.critical("Get comment replies error:", error);
    throw new Error(`Failed to get comment replies: ${error.message}`);
  }
};

/**
 * Get comment by ID
 * @param {number} commentId - Comment ID
 * @returns {Promise<Object|null>} Comment object or null
 */
const getCommentById = async (commentId) => {
  try {
    logger.verbose(`Get comment by ID ${commentId} called`);
    const result = await query(
      `SELECT c.id, c.post_id, c.user_id, c.content, c.parent_comment_id,
              c.created_at, c.updated_at,
              u.username, u.full_name
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = $1 AND c.is_deleted = FALSE`,
      [commentId]
    );
    logger.verbose(`Get comment by ID ${commentId} result:`, result.rows);

    return result.rows[0] || null;
  } catch (error) {
    logger.critical("Get comment by ID error:", error);
    throw new Error(`Failed to get comment: ${error.message}`);
  }
};

/**
 * Get comment count for a post
 * @param {number} postId - Post ID
 * @returns {Promise<number>} Comment count
 */
const getPostCommentCount = async (postId) => {
  try {
    logger.verbose(`Get comment count for post ${postId} called`);
    const result = await query(
      "SELECT COUNT(*) as count FROM comments WHERE post_id = $1 AND is_deleted = FALSE",
      [postId]
    );

    return parseInt(result.rows[0].count);
  } catch (error) {
    logger.critical("Get comment count error:", error);
    throw new Error(`Failed to get comment count: ${error.message}`);
  }
};

module.exports = {
  createComment,
  updateComment,
  deleteComment,
  getPostComments,
  getCommentReplies,
  getCommentById,
  getPostCommentCount,
};
