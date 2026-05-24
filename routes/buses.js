const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/auth");

// ✅ GET all buses
router.get("/", verifyToken, (req, res) => {
  const sql = "SELECT * FROM buses WHERE is_active = 1";

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// ✅ ADD new bus
router.post("/", verifyToken, (req, res) => {
  const { bus_name, bus_code, description } = req.body;

  const sql = `
    INSERT INTO buses (bus_name, bus_code, description, is_active)
    VALUES (?, ?, ?, 1)
  `;

  db.query(sql, [bus_name, bus_code, description], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Bus added successfully" });
  });
});

router.get("/occupancy", verifyToken, (req, res) => {
  console.log("Fetching bus occupancy data");
  const sql = `
   SELECT
  b.id,
  b.bus_name,
  b.bus_code,
  b.total_seats,
  COUNT(t.student_id) AS occupied_seats
FROM buses b
LEFT JOIN transport t
  ON t.bus_id = b.id
  AND t.is_transport = 1
GROUP BY b.id;
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
});

// ✅ Optional: GET single bus
router.get("/:id", verifyToken, (req, res) => {
  const sql = "SELECT * FROM buses WHERE id = ?";

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

module.exports = router;
