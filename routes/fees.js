const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/payments/:studentId", (req, res) => {
  const sql = `
    SELECT *
    FROM student_fee_payments
    WHERE student_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [req.params.studentId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

router.post("/payments", (req, res) => {
  const { student_id, amount, mode, description, type } = req.body;

  const sql = `
    INSERT INTO student_fee_payments 
    (student_id, amount, mode, description, type)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [student_id, amount, mode, description, type], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Payment added" });
  });
});

router.get("/payments/summary/:studentId", (req, res) => {
  const studentId = req.params.studentId;

  const sql = `
    SELECT 
      s.fee AS total_fee,

      COALESCE(
        SUM(CASE WHEN p.type = 'Fee' THEN p.amount ELSE 0 END),
        0
      ) AS paid_fee

    FROM students s
    LEFT JOIN student_fee_payments p 
      ON s.id = p.student_id

    WHERE s.id = ?
    GROUP BY s.id
  `;

  db.query(sql, [studentId], (err, result) => {
    if (err) return res.status(500).json(err);

    const data = result[0] || {
      total_fee: 0,
      paid_fee: 0,
    };

    const pending_fee =
      Number(data.total_fee || 0) - Number(data.paid_fee || 0);

    res.json({
      total_fee: data.total_fee || 0,
      paid_fee: data.paid_fee || 0,
      pending_fee,
    });
  });
});

// ✅ GET fees by year
router.get("/:year", (req, res) => {
  const { year } = req.params;

  const sql = "SELECT * FROM fee_structure WHERE year = ?";

  db.query(sql, [year], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

// ✅ SAVE / UPDATE fees
router.post("/", (req, res) => {
  const { data } = req.body;

  const sql = `
    INSERT INTO fee_structure (class, year, default_fee, admission_fee)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      default_fee = VALUES(default_fee),
      admission_fee = VALUES(admission_fee)
  `;

  const values = data.map((row) => [
    row.class,
    row.year,
    row.default_fee || 0,
    row.admission_fee || 0,
  ]);

  db.query(sql, [values], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }

    res.json({ message: "Fee structure saved successfully" });
  });
});

router.get("/:year/:class", (req, res) => {
  const { year, class: studentClass } = req.params;

  const sql = "SELECT default_fee FROM fee_structure WHERE year=? AND class=?";

  db.query(sql, [year, studentClass], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.json({ default_fee: "" });
    }

    res.json(result[0]);
  });
});

module.exports = router;
