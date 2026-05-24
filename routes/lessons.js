const express = require("express");

const router = express.Router();

const db = require("../db");

const verifyToken = require("../middleware/auth");

// ✅ GET all lessons
router.get("/", verifyToken, (req, res) => {
  const sql = `
    SELECT
      l.*,
      s.subject_name AS subject_name

    FROM lessons l

    LEFT JOIN subjects s
    ON s.id = l.subject_id

    ORDER BY l.id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);

      return res.status(500).json(err);
    }

    res.json(result);
  });
});

// ✅ GET lessons by subject
router.get("/subject/:subjectId", verifyToken, (req, res) => {
  const { subjectId } = req.params;

  const sql = `
    SELECT *
    FROM lessons
    WHERE subject_id = ?
    ORDER BY lesson_name ASC
  `;

  db.query(sql, [subjectId], (err, result) => {
    if (err) {
      console.error(err);

      return res.status(500).json(err);
    }

    res.json(result);
  });
});

// ✅ CREATE lesson
router.post("/", verifyToken, (req, res) => {
  const { subject_id, class_name, lesson_name, description, status } = req.body;

  const sql = `
    INSERT INTO lessons
    (
      subject_id,
      class_name,
      lesson_name,
      description,
      status
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [subject_id, class_name, lesson_name, description, status],
    (err) => {
      if (err) {
        console.error(err);

        return res.status(500).json(err);
      }

      res.json({
        message: "Lesson created successfully",
      });
    },
  );
});

// ✅ UPDATE lesson
router.put("/:id", verifyToken, (req, res) => {
  const { id } = req.params;

  const { subject_id, class_name, lesson_name, description, status } = req.body;

  const sql = `
    UPDATE lessons
    SET
      subject_id = ?,
      class_name = ?,
      lesson_name = ?,
      description = ?,
      status = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [subject_id, class_name, lesson_name, description, status, id],
    (err) => {
      if (err) {
        console.error(err);

        return res.status(500).json(err);
      }

      res.json({
        message: "Lesson updated successfully",
      });
    },
  );
});

module.exports = router;
