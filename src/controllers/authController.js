const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");
require("dotenv").config();

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function register(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "Username, email, and password are required"
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: "Invalid email format"
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters"
    });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], async (error, existingUser) => {
    if (error) {
      return res.status(500).json({
        message: "Internal server error"
      });
    }

    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered"
      });
    }

    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const userId = `U-${uuidv4()}`;
      const createdAt = new Date().toISOString();

      db.run(
        `
          INSERT INTO users (id, username, email, password_hash, created_at)
          VALUES (?, ?, ?, ?, ?)
        `,
        [userId, username, email, passwordHash, createdAt],
        function (insertError) {
          if (insertError) {
            return res.status(500).json({
              message: "Failed to register user"
            });
          }

          return res.status(201).json({
            message: "User registered successfully",
            data: {
              id: userId,
              username,
              email,
              created_at: createdAt
            }
          });
        }
      );
    } catch (hashError) {
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  });
}

function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], async (error, user) => {
    if (error) {
      return res.status(500).json({
        message: "Internal server error"
      });
    }

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d"
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      data: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  });
}

module.exports = {
  register,
  login
};