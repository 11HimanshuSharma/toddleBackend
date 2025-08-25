/** @format */

const Joi = require("joi");

/**
 * Validation schemas for API endpoints
 */

const userRegistrationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  full_name: Joi.string().min(1).max(100).required(),
});

const userLoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const createPostSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
  media_url: Joi.string().uri().optional(),
  comments_enabled: Joi.boolean().default(true),
});

const updatePostSchema = Joi.object({
  content: Joi.string().min(1).max(1000).optional(),
  media_url: Joi.string().uri().optional().allow(""),
  comments_enabled: Joi.boolean().optional(),
});

const createCommentSchema = Joi.object({
  post_id: Joi.number().integer().positive().required(),
  content: Joi.string().min(1).max(500).required(),
  parent_comment_id: Joi.number().integer().positive().optional(),
});

const updateCommentSchema = Joi.object({
  content: Joi.string().min(1).max(500).required(),
});

const followUserSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
});

const updateProfileSchema = Joi.object({
  full_name: Joi.string().min(1).max(100).optional(),
  bio: Joi.string().max(500).optional().allow(""),
  profile_picture_url: Joi.string().uri().optional().allow(""),
});
const likePostSchema = Joi.object({
  post_id: Joi.number().integer().positive().required(),
});
/**
 * Middleware to validate request body against schema
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map((detail) => detail.message),
      });
    }

    req.validatedData = value;
    next();
  };
};

module.exports = {
  userRegistrationSchema,
  userLoginSchema,
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
  updateCommentSchema,
  followUserSchema,
  updateProfileSchema,
  likePostSchema,
  validateRequest,
};
