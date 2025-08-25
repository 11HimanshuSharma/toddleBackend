/** @format */

const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  validateRequest,
  createCommentSchema,
  updateCommentSchema,
} = require("../utils/validation");
const {
  createCommentController,
  updateCommentController,
  deleteCommentController,
  getPostCommentsController,
  getCommentRepliesController,
} = require("../controllers/comments");

const router = express.Router();

/**
 * Comments routes
 */

// POST /api/comments - Create a comment on a post
router.post(
  "/",
  authenticateToken,
  validateRequest(createCommentSchema),
  createCommentController
);

// PUT /api/comments/:comment_id - Update a comment
router.put(
  "/:comment_id",
  authenticateToken,
  validateRequest(updateCommentSchema),
  updateCommentController
);

// DELETE /api/comments/:comment_id - Delete a comment
router.delete("/:comment_id", authenticateToken, deleteCommentController);

// GET /api/comments/post/:post_id - Get comments for a post
router.get("/post/:post_id", getPostCommentsController);

// GET /api/comments/:comment_id/replies - Get replies to a comment
router.get("/:comment_id/replies", getCommentRepliesController);

module.exports = router;
