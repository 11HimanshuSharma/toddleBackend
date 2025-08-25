/** @format */

const logger = require("../utils/logger");
const { getPostById } = require("../models/post");
const {
  createComment,
  getCommentById,
  updateComment,
  deleteComment,
  getPostComments,
  getCommentReplies,
  getPostCommentCount,
} = require("../models/comment");

// Create a comment
const createCommentController = async (req, res) => {
  try {
    logger.verbose("Create comment called");
    const { post_id, content, parent_comment_id } = req.validatedData;
    const userId = req.user.id;

    const post = await getPostById(post_id);
    if (!post) {
      logger.critical(
        `User ${userId} attempted to comment on non-existent post ${post_id}`
      );
      return res.status(404).json({ error: "Post not found" });
    }

    if (!post.comments_enabled) {
      logger.critical(
        `User ${userId} attempted to comment on post ${post_id} with comments disabled`
      );
      return res
        .status(403)
        .json({ error: "Comments are disabled for this post" });
    }

    if (parent_comment_id) {
      const parentComment = await getCommentById(parent_comment_id);
      if (!parentComment) {
        logger.critical(
          `User ${userId} attempted to reply to non-existent comment ${parent_comment_id}`
        );
        return res.status(404).json({ error: "Parent comment not found" });
      }
      if (parentComment.post_id !== post_id) {
        logger.critical(
          `User ${userId} attempted to reply to comment ${parent_comment_id} that does not belong to post ${post_id}`
        );
        return res
          .status(400)
          .json({ error: "Parent comment does not belong to this post" });
      }
    }

    const comment = await createComment({
      postId: post_id,
      userId,
      content,
      parentCommentId: parent_comment_id || null,
    });

    const commentCount = await getPostCommentCount(post_id);

    logger.verbose(`User ${userId} commented on post ${post_id}`);

    res.status(201).json({
      message: "Comment created successfully",
      comment,
      comment_count: commentCount,
    });
  } catch (error) {
    logger.critical("Create comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// TODO: Implement updateComment function
const updateCommentController = async (req, res) => {
  try {
    logger.verbose("Update comment called");
    const { comment_id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const updatedComment = await updateComment(comment_id, userId, content);

    logger.verbose(`User ${userId} updated comment ${comment_id}`);

    res.json({
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    logger.critical("Update comment error:", error);
    if (
      error.message.includes("not found") ||
      error.message.includes("unauthorized")
    ) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

// TODO: Implement deleteComment function
const deleteCommentController = async (req, res) => {
  try {
    logger.verbose("Delete comment called");
    const { comment_id } = req.params;
    const userId = req.user.id;

    const success = await deleteComment(comment_id, userId);
    if (!success) {
      logger.critical(
        `User ${userId} attempted to delete comment ${comment_id} that does not exist or they do not own`
      );
      return res
        .status(404)
        .json({ error: "Comment not found or unauthorized" });
    }

    logger.verbose(`User ${userId} deleted comment ${comment_id}`);

    res.json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    logger.critical("Delete comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// TODO: Implement getPostComments function
const getPostCommentsController = async (req, res) => {
  try {
    logger.verbose("Get post comments called");
    const { post_id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Validate post exists
    const post = await getPostById(post_id);
    if (!post) {
      logger.critical(
        `User ${req.user.id} attempted to get comments for non-existent post ${post_id}`
      );
      return res.status(404).json({ error: "Post not found" });
    }

    const commentsData = await getPostComments(
      post_id,
      offset,
      parseInt(limit)
    );

    res.json({
      message: "Comments retrieved successfully",
      ...commentsData,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    logger.critical("Get post comments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get replies to a comment
 */
const getCommentRepliesController = async (req, res) => {
  try {
    logger.verbose("Get comment replies called");
    const { comment_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Validate parent comment exists
    const parentComment = await getCommentById(comment_id);
    if (!parentComment) {
      logger.critical(
        `User ${req.user.id} attempted to get replies for non-existent comment ${comment_id}`
      );
      return res.status(404).json({ error: "Comment not found" });
    }

    const repliesData = await getCommentReplies(
      comment_id,
      offset,
      parseInt(limit)
    );

    res.json({
      message: "Comment replies retrieved successfully",
      ...repliesData,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    logger.critical("Get comment replies error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createCommentController,
  updateCommentController,
  deleteCommentController,
  getPostCommentsController,
  getCommentRepliesController,
};
