const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/auth");

// GET SUBJECTS
router.get("/", verifyToken, (req, res) => {
  db.query(
    "SELECT * FROM subjects ORDER BY subject_name ASC",
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Error fetching subjects",
        });
      }

      res.json(result);
    },
  );
});

// ADD SUBJECT
router.post("/", verifyToken, (req, res) => {
  const { subject_name } = req.body;

  db.query(
    "INSERT INTO subjects (subject_name) VALUES (?)",
    [subject_name],
    (err, result) => {
      if (err) {
        console.error(err);

        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({
            message: "Subject already exists",
          });
        }

        return res.status(500).json({
          message: "Error adding subject",
        });
      }

      res.json({
        message: "Subject added successfully",
      });
    },
  );
});

// FACULTY SUBJECT-WISE COUNT
router.get("/faculty-count", verifyToken, (req, res) => {
  const sql = `
    SELECT subject, COUNT(*) as count
    FROM faculty
    GROUP BY subject
    ORDER BY subject
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        message: "Error fetching faculty chart",
      });
    }

    res.json(result);
  });
});

module.exports = router;
