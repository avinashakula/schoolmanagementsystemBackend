const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ GET transport + students by class
router.get("/:className", (req, res) => {
  const { className } = req.params;

  const sql = `
    SELECT 
      s.id,
      s.first_name,
      s.last_name,
      s.address,
      t.bus_id,
      t.is_transport,
      b.bus_code,
      b.bus_name
    FROM students s
    LEFT JOIN transport t ON s.id = t.student_id
    LEFT JOIN buses b ON t.bus_id = b.id
    WHERE s.class = ?
  `;

  db.query(sql, [className], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// ✅ SAVE / UPDATE transport
router.post("/", (req, res) => {
  const { transportList } = req.body;

  const queries = transportList.map((item) => {
    return new Promise((resolve, reject) => {
      const checkSql = "SELECT id FROM transport WHERE student_id=?";

      db.query(checkSql, [item.student_id], (err, result) => {
        if (err) return reject(err);

        if (result.length > 0) {
          // UPDATE
          const updateSql = `
            UPDATE transport 
            SET bus_id=?, is_transport=?
            WHERE student_id=?
          `;

          db.query(
            updateSql,
            [item.bus_id, item.is_transport, item.student_id],
            (err) => {
              if (err) return reject(err);
              resolve();
            },
          );
        } else {
          // INSERT
          const insertSql = `
            INSERT INTO transport 
            (student_id, class, bus_id, is_transport)
            VALUES (?, ?, ?, ?)
          `;

          db.query(
            insertSql,
            [item.student_id, item.class, item.bus_id, item.is_transport],
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
    .then(() => res.json({ message: "Saved" }))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Error" });
    });
});

module.exports = router;
