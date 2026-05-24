const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ GET ALL PRACTICE PAPERS
router.get("/", (req, res) => {
  const sql = `
    SELECT *
    FROM practice_papers
    ORDER BY id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);

      return res.status(500).json(err);
    }

    res.json(result);
  });
});

// ✅ CREATE PRACTICE PAPER
router.post("/", (req, res) => {
  const {
    title,
    class_name,
    is_time_based,
    total_duration,
    total_qualified_marks,
    instructions,
    status,
    subjects,
  } = req.body;

  // STEP 1 → CREATE PAPER
  const paperSql = `
    INSERT INTO practice_papers
    (
      title,
      class_name,
      is_time_based,
      total_duration,
      total_qualified_marks,
      instructions,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    paperSql,
    [
      title,
      class_name,
      is_time_based,
      total_duration || null,
      total_qualified_marks || 0,
      instructions,
      status,
    ],
    (paperErr, paperResult) => {
      if (paperErr) {
        console.error(paperErr);

        return res.status(500).json(paperErr);
      }

      const practicePaperId = paperResult.insertId;

      // NO SUBJECTS
      if (!subjects || subjects.length === 0) {
        return res.json({
          success: true,
          message: "Practice paper created successfully",
        });
      }

      let completedSubjects = 0;

      subjects.forEach((subjectRow) => {
        // STEP 2 → INSERT SUBJECT
        const subjectSql = `
          INSERT INTO practice_paper_subjects
          (
            practice_paper_id,
            subject_id,
            duration_minutes,
            positive_marks,
            negative_marks,
            total_marks,
            qualified_marks
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
          subjectSql,
          [
            practicePaperId,
            subjectRow.subject_id,
            subjectRow.duration_minutes || 0,
            subjectRow.positive_marks || 0,
            subjectRow.negative_marks || 0,
            subjectRow.total_marks || 0,
            subjectRow.qualified_marks || 0,
          ],
          (subjectErr, subjectResult) => {
            if (subjectErr) {
              console.error(subjectErr);

              return res.status(500).json(subjectErr);
            }

            const practicePaperSubjectId = subjectResult.insertId;

            // NO QUESTIONS
            if (
              !subjectRow.selectedQuestions ||
              subjectRow.selectedQuestions.length === 0
            ) {
              completedSubjects++;

              if (completedSubjects === subjects.length) {
                return res.json({
                  success: true,
                  message: "Practice paper created successfully",
                });
              }

              return;
            }

            let completedQuestions = 0;

            // STEP 3 → INSERT QUESTIONS
            subjectRow.selectedQuestions.forEach((questionId) => {
              const questionSql = `
                INSERT INTO practice_paper_questions
                (
                  practice_paper_id,
                  practice_paper_subject_id,
                  question_id
                )
                VALUES (?, ?, ?)
              `;

              db.query(
                questionSql,
                [practicePaperId, practicePaperSubjectId, questionId],
                (questionErr) => {
                  if (questionErr) {
                    console.error(questionErr);

                    return res.status(500).json(questionErr);
                  }

                  completedQuestions++;

                  if (
                    completedQuestions === subjectRow.selectedQuestions.length
                  ) {
                    completedSubjects++;

                    if (completedSubjects === subjects.length) {
                      return res.json({
                        success: true,
                        message: "Practice paper created successfully",
                      });
                    }
                  }
                },
              );
            });
          },
        );
      });
    },
  );
});

// ✅ DELETE PRACTICE PAPER
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  // DELETE QUESTIONS
  db.query(
    "DELETE FROM practice_paper_questions WHERE practice_paper_id = ?",
    [id],
    (questionErr) => {
      if (questionErr) {
        console.error(questionErr);

        return res.status(500).json(questionErr);
      }

      // DELETE SUBJECTS
      db.query(
        "DELETE FROM practice_paper_subjects WHERE practice_paper_id = ?",
        [id],
        (subjectErr) => {
          if (subjectErr) {
            console.error(subjectErr);

            return res.status(500).json(subjectErr);
          }

          // DELETE PAPER
          db.query(
            "DELETE FROM practice_papers WHERE id = ?",
            [id],
            (paperErr) => {
              if (paperErr) {
                console.error(paperErr);

                return res.status(500).json(paperErr);
              }

              res.json({
                success: true,
                message: "Practice paper deleted successfully",
              });
            },
          );
        },
      );
    },
  );
});

// UPDATE PAPER STATUS
router.put("/:id/status", (req, res) => {
  const { id } = req.params;

  const { status } = req.body;

  const sql = `
    UPDATE practice_papers
    SET status = ?
    WHERE id = ?
  `;

  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error(err);

      return res.status(500).json(err);
    }

    res.json({
      success: true,
      message: "Paper status updated successfully",
    });
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  const paperSql = `
    SELECT *
    FROM practice_papers
    WHERE id = ?
  `;

  db.query(paperSql, [id], (err, paperResult) => {
    if (err) {
      console.error(err);

      return res.status(500).json(err);
    }

    if (paperResult.length === 0) {
      return res.status(404).json({
        message: "Paper not found",
      });
    }

    const paper = paperResult[0];

    const subjectSql = `
      SELECT
        pps.*,
        s.subject_name

      FROM practice_paper_subjects pps

      LEFT JOIN subjects s
        ON s.id = pps.subject_id

      WHERE pps.practice_paper_id = ?
    `;

    db.query(subjectSql, [id], (err, subjectResult) => {
      if (err) {
        console.error(err);

        return res.status(500).json(err);
      }

      if (subjectResult.length === 0) {
        return res.json({
          ...paper,
          subjects: [],
        });
      }

      let completedSubjects = 0;

      const subjects = [];

      subjectResult.forEach((subjectRow, index) => {
        const questionSql = `
          SELECT
            ppq.id,
            ppq.question_id,

            q.question,
            q.question_type,

            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,

            q.correct_answer,
            q.explanation,

            q.lesson_id,

            l.lesson_name

          FROM practice_paper_questions ppq

          LEFT JOIN questions q
            ON q.id = ppq.question_id

          LEFT JOIN lessons l
            ON l.id = q.lesson_id

          WHERE ppq.practice_paper_subject_id = ?
        `;

        db.query(questionSql, [subjectRow.id], (err, questionResult) => {
          if (err) {
            console.error(err);

            return res.status(500).json(err);
          }

          subjects[index] = {
            ...subjectRow,
            questions: questionResult,
          };

          completedSubjects++;

          if (completedSubjects === subjectResult.length) {
            res.json({
              ...paper,
              subjects,
            });
          }
        });
      });
    });
  });
});

module.exports = router;
