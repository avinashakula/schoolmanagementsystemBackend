const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ GET all questions
router.get("/", (req, res) => {
  const sql = `
    SELECT
      q.*,
      l.lesson_name,
      s.subject_name

    FROM questions q

    LEFT JOIN lessons l
      ON l.id = q.lesson_id

    LEFT JOIN subjects s
      ON s.id = q.subject_id

    ORDER BY q.id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);

      return res.status(500).json(err);
    }

    res.json(result);
  });
});

// ✅ CREATE question
router.post("/", (req, res) => {
  const {
    class_name,
    subject_id,
    lesson_id,
    question_type,

    question,

    option_a,
    option_b,
    option_c,
    option_d,

    correct_answer,

    explanation,
  } = req.body;

  const sql = `
    INSERT INTO questions
    (
      class_name,
      subject_id,
      lesson_id,
      question_type,

      question,

      option_a,
      option_b,
      option_c,
      option_d,

      correct_answer,

      explanation
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      class_name,
      subject_id,
      lesson_id,
      question_type,

      question,

      option_a,
      option_b,
      option_c,
      option_d,

      correct_answer,

      explanation,
    ],
    (err, result) => {
      if (err) {
        console.error(err);

        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "Question created successfully",
      });
    },
  );
});

// UPDATE QUESTION
router.put("/:id", (req, res) => {
  const { id } = req.params;

  const {
    class_name,
    subject_id,
    lesson_id,
    question_type,
    question,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer,
    explanation,
  } = req.body;

  const sql = `
    UPDATE questions
    SET
      class_name = ?,
      subject_id = ?,
      lesson_id = ?,
      question_type = ?,
      question = ?,
      option_a = ?,
      option_b = ?,
      option_c = ?,
      option_d = ?,
      correct_answer = ?,
      explanation = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      class_name,
      subject_id,
      lesson_id,
      question_type,
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      explanation,
      id,
    ],
    (err) => {
      if (err) {
        console.error(err);

        return res.status(500).json(err);
      }

      res.json({
        message: "Question updated successfully",
      });
    },
  );
});

// DELETE QUESTION
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM questions WHERE id = ?", [id], (err) => {
    if (err) {
      console.error(err);

      return res.status(500).json(err);
    }

    res.json({
      message: "Question deleted successfully",
    });
  });
});

module.exports = router;
