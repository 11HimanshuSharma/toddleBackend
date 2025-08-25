/** @format */

const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { validateRequest, likePostSchema } = require("../utils/validation");
const {
  likePostController,
  unlikePostController,
  getPostLikesController,
  getUserLikesController,
  checkLikeStatusController,
} = require("../controllers/likes");

const router = express.Router();

/**
 * Likes routes
 */

// GET /api/likes - Get likes endpoints information
router.get("/", (req, res) => {
  res.json({
    message: "Likes API endpoints",
    endpoints: {
      "POST /api/likes":
        "Like a post (requires authentication and post_id in body)",
      "DELETE /api/likes/:post_id": "Unlike a post (requires authentication)",
      "GET /api/likes/post/:post_id": "Get likes for a specific post",
      "GET /api/likes/user/:user_id": "Get posts liked by a specific user",
      "GET /api/likes/status/:post_id":
        "Check if user has liked a post (requires authentication)",
    },
    examples: {
      like_post: 'POST /api/likes with body: {"post_id": 1}',
      unlike_post: "DELETE /api/likes/1",
      get_post_likes: "GET /api/likes/post/1",
      get_user_likes: "GET /api/likes/user/1",
      check_like_status: "GET /api/likes/status/1",
    },
  });
});

// POST /api/likes - Like a post
router.post(
  "/",
  authenticateToken,
  validateRequest(likePostSchema),
  likePostController
);

// DELETE /api/likes/:post_id - Unlike a post
router.delete("/:post_id", authenticateToken, unlikePostController);

// GET /api/likes/post/:post_id - Get likes for a post
router.get("/post/:post_id", getPostLikesController);

// GET /api/likes/user/:user_id - Get posts liked by a user
router.get("/user/:user_id", getUserLikesController);

// GET /api/likes/status/:post_id - Check if user has liked a post
router.get("/status/:post_id", authenticateToken, checkLikeStatusController);

module.exports = router;
