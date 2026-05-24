const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

// ✅ GET users
router.get("/", (req, res) => {
  db.query("SELECT * FROM users ORDER BY id DESC", (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }

    res.json(result);
  });
});

// ✅ CREATE user
router.post("/", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      contact,
      city,
      password,
      role,
      permissions,
      status,
    } = req.body;

    // ✅ hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users
      (
        firstName,
        lastName,
        email,
        contact,
        city,
        password,
        role,
        permissions,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        firstName,
        lastName,
        email,
        contact,
        city,
        hashedPassword, // ✅ encrypted password
        role,
        JSON.stringify(permissions || []),
        status ?? true,
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json(err);
        }

        res.json({
          success: true,
          message: "User created successfully",
        });
      },
    );
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Error creating user",
    });
  }
});

// ✅ UPDATE user
router.put("/:id", (req, res) => {
  const { id } = req.params;

  const {
    firstName,
    lastName,
    email,
    contact,
    city,
    role,
    permissions,
    status,
  } = req.body;

  const sql = `
    UPDATE users
    SET
      firstName = ?,
      lastName = ?,
      email = ?,
      contact = ?,
      city = ?,
      role = ?,
      permissions = ?,
      status = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      firstName,
      lastName,
      email,
      contact,
      city,
      role,
      JSON.stringify(permissions || []),
      status,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "User updated successfully",
      });
    },
  );
});

module.exports = router;
