const express = require("express");
const router = express.Router();
const db = require("../db");

// CREATE FACULTY
router.post("/", (req, res) => {
  const {
    firstName,
    lastName,
    subject,
    contact,
    email,
    qualification,
    experience,
    joiningDate,
    salary,
  } = req.body;

  const sql = `
    INSERT INTO faculty 
    (first_name, last_name, subject, contact, email, qualification, experience, joining_date, salary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      firstName,
      lastName,
      subject,
      contact,
      email,
      qualification,
      experience,
      joiningDate,
      salary,
    ],
    (err) => {
      if (err) {
        console.error("FACULTY DB ERROR:", err); // 👈 IMPORTANT
        return res.status(500).json({ message: "DB Error" });
      }
      res.json({ message: "Faculty created successfully" });
    },
  );
});

// GET FACULTY
router.get("/", (req, res) => {
  db.query("SELECT * FROM faculty ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

module.exports = router;
