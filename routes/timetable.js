const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/auth");

router.get("/class/:className", verifyToken, (req, res) => {
  const sql = `
  SELECT
    t.*,
    s.subject_name,
    CONCAT(f.first_name, ' ', f.last_name) AS faculty_name
  FROM timetable t
  LEFT JOIN subjects s
    ON t.subject_id = s.id
  LEFT JOIN faculty f
    ON t.faculty_id = f.id
  WHERE t.class_name = ?
  ORDER BY
    FIELD(day_name,
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ),
    period_no
`;

  db.query(sql, [req.params.className], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
});

router.post("/class/:className", verifyToken, (req, res) => {
  const {
    class_name,
    day_name,
    period_no,
    start_time,
    end_time,
    subject_id,
    faculty_id,
  } = req.body;

  const checkSql = `
    SELECT * FROM timetable
    WHERE class_name = ?
    AND day_name = ?
    AND period_no = ?
  `;

  db.query(checkSql, [class_name, day_name, period_no], (err, existing) => {
    if (err) return res.status(500).json(err);

    // UPDATE
    if (existing.length > 0) {
      const updateSql = `
          UPDATE timetable
          SET
            start_time = ?,
            end_time = ?,
            subject_id = ?,
            faculty_id = ?
          WHERE class_name = ?
          AND day_name = ?
          AND period_no = ?
        `;

      db.query(
        updateSql,
        [
          start_time,
          end_time,
          subject_id,
          faculty_id,
          class_name,
          day_name,
          period_no,
        ],
        (err2) => {
          if (err2) return res.status(500).json(err2);

          res.json({
            message: "Timetable updated",
          });
        },
      );
    }

    // INSERT
    else {
      const insertSql = `
          INSERT INTO timetable (
            class_name,
            day_name,
            period_no,
            start_time,
            end_time,
            subject_id,
            faculty_id
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

      db.query(
        insertSql,
        [
          class_name,
          day_name,
          period_no,
          start_time,
          end_time,
          subject_id,
          faculty_id,
        ],
        (err3) => {
          if (err3) return res.status(500).json(err3);

          res.json({
            message: "Timetable created",
          });
        },
      );
    }
  });
});

module.exports = router;
