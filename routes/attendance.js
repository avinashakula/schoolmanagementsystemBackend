const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ GET students by class
router.get("/students/:className", (req, res) => {
  const { className } = req.params;

  db.query(
    "SELECT id, first_name, last_name, class FROM students WHERE class = ?",
    [className],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    },
  );
});

// // ✅ GET attendance by date + class
// router.get("/", (req, res) => {
//   console.log("by date + class");
//   const { className, date } = req.query;

//   const sql = `
//     SELECT a.*, s.first_name, s.last_name
//     FROM attendance a
//     JOIN students s ON s.id = a.student_id
//     WHERE a.class = ? AND a.date = ?
//   `;

//   db.query(sql, [className, date], (err, result) => {
//     if (err) return res.status(500).json(err);
//     res.json(result);
//   });
// });

// ✅ GET attendance by date + class
router.get("/", (req, res) => {
  console.log("by date + class");

  const { className, date } = req.query;

  const sql = `
    SELECT
      s.id,
      s.first_name,
      s.last_name,
      s.class,

      a.status,
      a.date,

      CASE
        WHEN a.status = 'Present'
        THEN 1
        ELSE 0
      END AS checked

    FROM students s

    LEFT JOIN attendance a
      ON s.id = a.student_id
      AND a.date = ?

    WHERE s.class = ?

    ORDER BY s.first_name ASC
  `;

  db.query(sql, [date, className], (err, result) => {
    if (err) {
      console.error(err);

      return res.status(500).json(err);
    }

    res.json(result);
  });
});

// ✅ SAVE attendance
router.post("/", (req, res) => {
  const { attendanceList } = req.body;

  const queries = attendanceList.map((item) => {
    return new Promise((resolve, reject) => {
      const checkSql =
        "SELECT id FROM attendance WHERE student_id=? AND date=?";

      db.query(checkSql, [item.student_id, item.date], (err, result) => {
        if (err) return reject(err);

        if (result.length > 0) {
          // ✅ UPDATE
          const updateSql =
            "UPDATE attendance SET status=? WHERE student_id=? AND date=?";

          db.query(
            updateSql,
            [item.status, item.student_id, item.date],
            (err) => {
              if (err) return reject(err);
              resolve();
            },
          );
        } else {
          // ✅ INSERT
          const insertSql =
            "INSERT INTO attendance (student_id, class, date, status) VALUES (?, ?, ?, ?)";

          db.query(
            insertSql,
            [item.student_id, item.class, item.date, item.status],
            (err) => {
              if (err) return reject(err);
              resolve();
            },
          );
        }
      });
    });
  });

  Promise.all(queries)
    .then(() => res.json({ message: "Saved / Updated" }))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Error" });
    });
});

// ✅ GET student attendance report
router.get("/student-report", (req, res) => {
  const { className, studentId, fromDate, toDate } = req.query;

  // ✅ validation
  if (!className || !studentId || !fromDate || !toDate) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  const sql = `
    SELECT
      COUNT(*) AS total,

      SUM(
        CASE
          WHEN status = 'Present'
          THEN 1
          ELSE 0
        END
      ) AS present,

      SUM(
        CASE
          WHEN status = 'Absent'
          THEN 1
          ELSE 0
        END
      ) AS absent

    FROM attendance

    WHERE class = ?
    AND student_id = ?
    AND date BETWEEN ? AND ?
  `;

  db.query(sql, [className, studentId, fromDate, toDate], (err, result) => {
    if (err) {
      console.error(err);

      return res.status(500).json(err);
    }

    res.json({
      total: result[0].total || 0,
      present: result[0].present || 0,
      absent: result[0].absent || 0,
    });
  });
});

// ✅ RFID attendance
router.post("/rfid", (req, res) => {
  const { rfid_uid } = req.body;

  if (!rfid_uid) {
    return res.status(400).json({
      message: "RFID is required",
    });
  }

  // ✅ find student
  const studentSql = `
    SELECT *
    FROM students
    WHERE rfid_uid = ?
  `;

  db.query(studentSql, [rfid_uid], (err, studentResult) => {
    if (err) {
      console.error(err);

      return res.status(500).json(err);
    }

    if (studentResult.length === 0) {
      return res.status(404).json({
        message: "RFID card not registered",
      });
    }

    const student = studentResult[0];

    const today = new Date().toISOString().split("T")[0];

    // ✅ check already marked
    const checkSql = `
      SELECT *
      FROM attendance
      WHERE student_id = ?
      AND date = ?
    `;

    db.query(checkSql, [student.id, today], (err, attendanceResult) => {
      if (err) {
        console.error(err);

        return res.status(500).json(err);
      }

      // ✅ already marked
      if (attendanceResult.length > 0) {
        return res.json({
          alreadyMarked: true,
          student,
          message: "Attendance already marked",
        });
      }

      // ✅ insert attendance
      const insertSql = `
        INSERT INTO attendance
        (
          student_id,
          class,
          date,
          status
        )
        VALUES (?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [student.id, student.class, today, "Present"],
        (err) => {
          if (err) {
            console.error(err);

            return res.status(500).json(err);
          }

          res.json({
            success: true,
            alreadyMarked: false,
            student,
            message: "Attendance marked successfully",
          });
        },
      );
    });
  });
});

module.exports = router;
