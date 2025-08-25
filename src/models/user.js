/** @format */

const { query } = require("../utils/database");
const bcrypt = require("bcryptjs");
const logger = require("../utils/logger");

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
const createUser = async ({ username, email, password, full_name }) => {
  if (!username || !email || !password || !full_name) {
    logger.error("All fields are required");
    throw new Error("All fields are required");
  }
  try {
    logger.verbose(`Creating user: ${username}`);
    const hashedPassword = await bcrypt.hash(password, 10);
    const res = await query(
      `INSERT INTO users (username, email, password_hash, full_name, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, username, email, full_name, created_at`,
      [username, email, hashedPassword, full_name]
    );

    return res.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      // PostgreSQL unique violation error code
      logger.error(
        "User creation failed: User with this username or email already exists."
      );
      throw new Error("A user with this username or email already exists.");
    } else {
      logger.error("Database error during user creation:", error);
      throw new Error("Failed to create user due to an internal server error.");
    }
  }
};

/**
 * Find user by username
 * @param {string} username - Username to search for
 * @returns {Promise<Object|null>} User object or null
 */
const getUserByUsername = async (username) => {
  if (!username) {
    logger.error("Username is required");
    throw new Error("Username is required");
  }
  try {
    logger.verbose(`Fetching user by username: ${username}`);
    const res = await query(
      "SELECT id, username, email, full_name, password_hash, created_at FROM users WHERE username = $1",
      [username]
    );
    return res.rows[0] || null;
  } catch (error) {
    logger.error("Database error during user retrieval:", error);
    throw new Error("Failed to retrieve user due to an internal server error.");
  }
};

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} User object or null
 */
const getUserById = async (id) => {
  if (!id) {
    logger.error("User ID is required");
    throw new Error("User ID is required");
  }
  try {
    logger.verbose(`Fetching user by ID: ${id}`);
    const res = await query(
      "SELECT id, username, email, full_name, created_at FROM users WHERE id = $1",
      [id]
    );

    return res.rows[0] || null;
  } catch (error) {
    logger.error("Database error during user retrieval:", error);
    throw new Error("Failed to retrieve user due to an internal server error.");
  }
};

/**
 * Verify user password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} Password match res
 */

// this was mistake
const verifyPassword = async (plainPassword, hashedPassword) => {
  if (!plainPassword || !hashedPassword) {
    logger.error("Both plain and hashed passwords are required");
    throw new Error("Both plain and hashed passwords are required");
  }
  try {
    logger.verbose("Verifying user password");
    // FIX: Return the true/false result
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    logger.error("Error during password verification:", error);
    throw new Error(
      "Failed to verify password due to an internal server error."
    );
  }
};
// TODO: Implement findUsersByName function for search functionality

/**
 * @param {string} searchTerm - search term for username or full name
 * @param {number} offset - pagination offset
 * @param {number} limit - pagination limit
 * @returns {Promise<Object>} -  Search results with pagination
 */

const findUsersByName = async (searchTerm, offset = 0, limit = 20) => {
  if (!searchTerm) {
    throw new Error("Search term is required");
  }
  try {
    logger.verbose(`Searching users with term: ${searchTerm}`);
    const searchPattern = `%${searchTerm}%`;

    const [usersResult, countResult] = await Promise.all([
      query(
        `SELECT id, username, full_name, profile_picture_url, created_at
         FROM users 
         WHERE (username ILIKE $1 OR full_name ILIKE $1) AND is_deleted = FALSE
         ORDER BY 
           CASE 
             WHEN username ILIKE $1 THEN 1
             WHEN full_name ILIKE $1 THEN 2
             ELSE 3
           END,
           username ASC
         LIMIT $2 OFFSET $3`,
        [searchPattern, limit, offset]
      ),
      query(
        `SELECT COUNT(*) as total 
         FROM users 
         WHERE (username ILIKE $1 OR full_name ILIKE $1) AND is_deleted = FALSE`,
        [searchPattern]
      ),
    ]);

    return {
      users: usersResult.rows,
      total: parseInt(countResult.rows[0].total),
      hasMore: offset + limit < parseInt(countResult.rows[0].total),
    };
  } catch (error) {
    logger.error(`Failed to search users: ${error.message}`);
    throw new Error(`Failed to search users: ${error.message}`);
  }
};

// TODO: Implement getUserProfile function that includes follower/following counts

/**
 * @param {number} userId - user ID
 * @param {number} requestingUserId - ID of user making the request (optional)
 * @returns {Promise<Object | null>} user profile information
 */

const getUserProfile = async (userId, requestingUserId = null) => {
  try {
    logger.verbose("getUserProfile called", { userId, requestingUserId });

    // Validate input parameters
    if (!userId || isNaN(parseInt(userId))) {
      logger.error("Invalid userId provided", { userId });
      throw new Error("Invalid user ID provided");
    }

    logger.verbose("Executing database queries for user profile...");
    const [userResult, countsResult, isFollowingResult] = await Promise.all([
      query(
        `SELECT id, username, email, full_name, bio, profile_picture_url, created_at
         FROM users 
         WHERE id = $1 AND is_deleted = FALSE`,
        [userId]
      ),
      query(
        `SELECT 
           (SELECT COUNT(*) FROM follows f JOIN users u ON f.following_id = u.id 
            WHERE f.follower_id = $1 AND u.is_deleted = FALSE) as following_count,
           (SELECT COUNT(*) FROM follows f JOIN users u ON f.follower_id = u.id 
            WHERE f.following_id = $1 AND u.is_deleted = FALSE) as followers_count,
           (SELECT COUNT(*) FROM posts WHERE user_id = $1 AND is_deleted = FALSE) as posts_count`,
        [userId]
      ),
      requestingUserId
        ? query(
            "SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2",
            [requestingUserId, userId]
          )
        : Promise.resolve({ rows: [] }),
    ]);

    logger.verbose("Database query results", {
      userFound: userResult.rows.length > 0,
      countsRows: countsResult.rows.length,
      isFollowingRows: isFollowingResult.rows.length,
    });

    if (userResult.rows.length === 0) {
      logger.info("User not found or deleted", { userId });
      return null;
    }

    const user = userResult.rows[0];
    const counts = countsResult.rows[0];
    const isFollowing = isFollowingResult.rows.length > 0;

    logger.verbose("Processing user profile data", {
      userId: user.id,
      username: user.username,
      countsData: counts,
    });

    const profile = {
      ...user,
      following_count: parseInt(counts.following_count || 0),
      followers_count: parseInt(counts.followers_count || 0),
      posts_count: parseInt(counts.posts_count || 0),
      ...(requestingUserId && { is_following: isFollowing }),
    };

    logger.verbose("getUserProfile completed successfully", { userId });
    return profile;
  } catch (error) {
    logger.error("getUserProfile error", {
      userId,
      requestingUserId,
      error: error.message,
      stack: error.stack,
    });
    throw new Error(`Failed to get user profile: ${error.message}`);
  }
};
// TODO: Implement updateUserProfile function for profile updates
/**
 * Updates a user's profile with validated data.
 * @param {number} userId - The ID of the user to update.
 * @param {Object} updateData - An object containing the fields to update (e.g., { full_name, email }).
 * @returns {Promise<Object>} The fully updated user profile object.
 */
const updateUserProfile = async (userId, updateData) => {
  // 1. Initial validation of the user ID
  if (!userId || isNaN(parseInt(userId))) {
    throw new Error("Invalid user ID provided");
  }

  try {
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        throw new Error("Invalid email format provided.");
      }

      const existingUser = await query(
        "SELECT id FROM users WHERE email = $1 AND id != $2",
        [updateData.email, userId]
      );

      if (existingUser.rows.length > 0) {
        throw new Error("This email is already in use by another account.");
      }
    }
    const allowedFields = ["full_name", "email", "bio", "profile_picture_url"];
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    // Dynamically build the SET part of the query
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        updateValues.push(value);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      throw new Error("No valid fields provided for update.");
    }

    updateFields.push(`updated_at = NOW()`);

    updateValues.push(userId);

    const queryString = `
      UPDATE users 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramCount} AND is_deleted = FALSE
      RETURNING id, username, email, full_name, bio, profile_picture_url, created_at, updated_at
    `;

    const result = await query(queryString, updateValues);

    if (result.rows.length === 0) {
      throw new Error("User not found or has been deleted.");
    }

    return result.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      // PostgreSQL's unique constraint violation code
      throw new Error("A user with that email already exists.");
    }

    if (!error.code) {
      throw error;
    }

    logger.error("Database error during user profile update:", error);
    throw new Error("Failed to update user profile due to a server error.");
  }
};

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  verifyPassword,
  findUsersByName,
  getUserProfile,
  updateUserProfile,
};
