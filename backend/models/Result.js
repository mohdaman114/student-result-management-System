const mongoose = require("mongoose");

const ResultSchema = mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    examName: {
      type: String,
      required: true,
    },
    subjects: [
      {
        subjectName: {
          type: String,
          required: true,
        },
        marks: {
          type: Number,
          required: true,
        },
      },
    ],
    totalMarks: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    grade: {
      type: String,
      default: "N/A",
    },
    status: {
      type: String,
      enum: ["PASS", "FAIL"],
      default: "FAIL",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate totalMarks, percentage, grade, and status
ResultSchema.pre("save", function (next) {
  let total = 0;
  this.subjects.forEach((subject) => {
    total += subject.marks;
  });
  this.totalMarks = total;

  // Assuming max marks per subject is 100 for percentage calculation
  const maxPossibleMarks = this.subjects.length * 100;
  this.percentage = (this.totalMarks / maxPossibleMarks) * 100;

  if (this.percentage >= 90) {
    this.grade = "A+";
  } else if (this.percentage >= 75) {
    this.grade = "A";
  } else if (this.percentage >= 60) {
    this.grade = "B";
  } else {
    this.grade = "C";
  }

  // Assuming passing marks are 40%
  this.status = this.percentage >= 40 ? "PASS" : "FAIL";

  next();
});

const Result = mongoose.model("Result", ResultSchema);

module.exports = Result;
