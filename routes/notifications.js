const express = require("express");

const router = express.Router();

const db = require("../db");

const multer = require("multer");

const path = require("path");

// ============================
// FILE UPLOAD
// ============================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
});

// ============================
// GET ALL NOTIFICATIONS
// ============================

router.get("/", (req, res) => {
  const sql = `
    SELECT *
    FROM notifications
    ORDER BY id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);

      return res.status(500).json(err);
    }

    res.json(result);
  });
});

// ============================
// CREATE NOTIFICATION
// ============================

router.post("/", upload.single("attachment"), (req, res) => {
  const { category, title, description, posted_date } = req.body;

  const attachment = req.file ? req.file.filename : null;

  const sql = `
      INSERT INTO notifications
      (
        category,
        title,
        description,
        attachment,
        posted_date,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

  db.query(
    sql,
    [category, title, description, attachment, posted_date, true],
    (err) => {
      if (err) {
        console.error(err);

        return res.status(500).json(err);
      }

      res.json({
        message: "Notification created successfully",
      });
    },
  );
});

// ============================
// UPDATE STATUS
// ============================

router.put("/status/:id", (req, res) => {
  const { id } = req.params;

  const { status } = req.body;

  const sql = `
    UPDATE notifications
    SET status = ?
    WHERE id = ?
  `;

  db.query(sql, [status, id], (err) => {
    if (err) {
      console.error(err);

      return res.status(500).json(err);
    }

    res.json({
      message: "Status updated",
    });
  });
});

module.exports = router;
