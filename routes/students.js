const express = require("express");
const router = express.Router();
const db = require("../db");

// CREATE STUDENT
router.post("/", (req, res) => {
  console.log("Incoming Data:", req.body); // 👈 ADD THIS
  const {
    first_name,
    last_name,
    father_name,
    mother_name,
    guardian_name,
    contact,
    email,
    area,
    city,
    address,
    pincode,
    joining_date,
    class: studentClass,
    fee,
    payment_type,
    aadhar_number,
    status,
    inactive_reason,
  } = req.body;

  const sql = `
    INSERT INTO students 
(first_name, last_name, father_name, mother_name, guardian_name, contact, email, area, city, address, pincode, joining_date, class, fee, payment_type, aadhar, status, inactive_reason)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      first_name,
      last_name,
      father_name,
      mother_name,
      guardian_name,
      contact,
      email,
      area,
      city,
      address,
      pincode,
      joining_date,
      studentClass,
      fee,
      payment_type,
      aadhar_number,
      status || "Active",
      inactive_reason || null,
    ],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "DB Error" });
      }
      res.json({ message: "Student created successfully" });
    },
  );
});

// GET ALL STUDENTS
router.get("/", (req, res) => {
  const sql = "SELECT * FROM students ORDER BY id DESC";

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching students" });
    }
    res.json(result);
  });
});

// UPDATE STUDENTS
router.put("/:id", (req, res) => {
  const { id } = req.params;

  const {
    first_name,
    last_name,
    father_name,
    mother_name,
    guardian_name,
    contact, // ✅
    email,
    area,
    city,
    address,
    pincode,
    joining_date,
    class: studentClass,
    fee,
    payment_type,
    aadhar, // ✅
    status,
    inactive_reason,
  } = req.body;

  const sql = `
    UPDATE students SET
      first_name=?,
  last_name=?,
  father_name=?,
  mother_name=?,
  guardian_name=?,
  contact=?,
  email=?,
  area=?,
  city=?,
  address=?,
  pincode=?,
  joining_date=?,
  class=?,
  fee=?,
  payment_type=?,
  aadhar=?,
  status=?,
  inactive_reason=?
    WHERE id=?
  `;

  db.query(
    sql,
    [
      first_name,
      last_name,
      father_name,
      mother_name,
      guardian_name,
      contact,
      email,
      area,
      city,
      address,
      pincode,
      joining_date,
      studentClass,
      fee,
      payment_type,
      aadhar,
      status,
      inactive_reason,
      id,
    ],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Student Updated" });
    },
  );
});

// GET STUDENT COUNT CLASS-WISE
router.get("/class-wise-count", (req, res) => {
  const sql = `
    SELECT class, COUNT(*) as students
    FROM students
    GROUP BY class
    ORDER BY class
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "Error fetching class-wise student count",
      });
    }

    res.json(result);
  });
});

module.exports = router;
