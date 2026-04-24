const express = require("express");
const Result = require("../models/Result");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// @desc    Add a new result
// @route   POST /api/results
// @access  Private/Admin
router.post("/", protect, authorize("admin"), async (req, res) => {
  const { studentId, examName, subjects } = req.body;

  try {
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const result = new Result({
      studentId,
      examName,
      subjects,
    });

    const createdResult = await result.save();
    res.status(201).json(createdResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get all results (Admin)
// @route   GET /api/results
// @access  Private/Admin
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const results = await Result.find({}).populate("studentId", "name email rollNumber class");
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get single result by ID (Admin)
// @route   GET /api/results/:id
// @access  Private/Admin
router.get("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const result = await Result.findById(req.params.id).populate("studentId", "name email rollNumber class");
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "Result not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// @desc    Update result by ID
// @route   PUT /api/results/:id
// @access  Private/Admin
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  const { examName, subjects } = req.body;

  try {
    const result = await Result.findById(req.params.id);

    if (result) {
      result.examName = examName || result.examName;
      result.subjects = subjects || result.subjects;

      // Recalculate fields on update
      let total = 0;
      result.subjects.forEach((subject) => {
        total += subject.marks;
      });
      result.totalMarks = total;

      const maxPossibleMarks = result.subjects.length * 100;
      result.percentage = (result.totalMarks / maxPossibleMarks) * 100;

      if (result.percentage >= 90) {
        result.grade = "A+";
      } else if (result.percentage >= 75) {
        result.grade = "A";
      } else if (result.percentage >= 60) {
        result.grade = "B";
      } else {
        result.grade = "C";
      }

      result.status = result.percentage >= 40 ? "PASS" : "FAIL";


      const updatedResult = await result.save();
      res.status(200).json(updatedResult);
    } else {
      res.status(404).json({ message: "Result not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Delete result by ID
// @route   DELETE /api/results/:id
// @access  Private/Admin
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);

    if (result) {
      await result.deleteOne();
      res.status(200).json({ message: "Result removed" });
    } else {
      res.status(404).json({ message: "Result not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get results for a specific student
// @route   GET /api/results/student/:studentId
// @access  Private
router.get("/student/:studentId", protect, async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.params.studentId }).populate(
      "studentId",
      "name email rollNumber class"
    );
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get results for logged-in student
// @route   GET /api/results/my
// @access  Private/Student
router.get("/my", protect, authorize("student"), async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.user._id }).populate(
      "studentId",
      "name email rollNumber class"
    );
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get logged-in user profile
// @route   GET /api/profile
// @access  Private
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// @desc    Search result by roll number
// @route   GET /api/results/search/:rollNumber
// @access  Public
router.get("/search/:rollNumber", async (req, res) => {
  try {
    const student = await User.findOne({ rollNumber: req.params.rollNumber, role: "student" });
    
    if (!student) {
      return res.status(404).json({ message: "Student not found with this roll number" });
    }

    const result = await Result.findOne({ studentId: student._id }).populate("studentId", "name email rollNumber class");
    
    if (!result) {
      return res.status(404).json({ message: "No result found for this student" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
