const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, contact, city, password } = req.body;

    // 🔍 Validation
    if (!firstName || !email || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 📦 Insert user
    db.query(
      `INSERT INTO users 
      (firstName, lastName, email, contact, city, password) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, contact, city, hashedPassword],
      (err) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "Email already exists" });
          }
          return res.status(500).json(err);
        }

        res.json({ message: "User registered successfully" });
      },
    );
  } catch (error) {
    res.status(500).json(error);
  }
});

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (result.length === 0) {
        return res.status(401).json({
          message: "User not found",
        });
      }

      const user = result[0];

      // ✅ check active status
      if (!user.status) {
        return res.status(403).json({
          message: "User account disabled",
        });
      }

      // 🔐 compare password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          message: "Invalid password",
        });
      }

      // ✅ parse permissions
      let permissions = [];

      try {
        permissions = user.permissions ? JSON.parse(user.permissions) : [];
      } catch {
        permissions = [];
      }

      // ✅ success
      res.json({
        message: "Login successful",

        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          permissions,
        },
      });
    },
  );
});

module.exports = router;
