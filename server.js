const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
// ✅ expose uploads folder
app.use("/files", express.static(path.join(__dirname, "uploads")));

const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const facultyRoutes = require("./routes/faculty");
const attendanceRoutes = require("./routes/attendance");
const transportRoutes = require("./routes/transport");
const feeRoutes = require("./routes/fees");
const subjectRoutes = require("./routes/subjectRoutes");
const busRoutes = require("./routes/buses");
const timeTableRoutes = require("./routes/timetable");
const notificationRoutes = require("./routes/notifications");
const usersRoutes = require("./routes/users");
const lessonRoutes = require("./routes/lessons");
const questionRoutes = require("./routes/questions");
const practicePaperRoutes = require("./routes/practicePaper");

app.use("/api", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/timetable", timeTableRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/papers", practicePaperRoutes);
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
