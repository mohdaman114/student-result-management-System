const express = require("express");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// @desc    Create a new student
// @route   POST /api/students
// @access  Private/Admin
router.post("/", protect, authorize("admin"), async (req, res) => {
  const { name, email, password, rollNumber, class: studentClass } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Auto-generate password if not provided (using rollNumber or random)
    const generatedPassword = password || (rollNumber ? rollNumber : Math.random().toString(36).slice(-8));

    const student = await User.create({
      name,
      email,
      password: generatedPassword,
      role: "student",
      rollNumber,
      class: studentClass,
    });

    if (student) {
      res.status(201).json({
        _id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        class: student.class,
        generatedPassword: generatedPassword, // Send back the generated password
      });
    } else {
      res.status(400).json({ message: "Invalid student data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");
    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Update student by ID
// @route   PUT /api/students/:id
// @access  Private/Admin
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  const { id } = req.params;
  const { name, email, rollNumber, class: studentClass } = req.body;

  try {
    const student = await User.findById(id);

    if (student) {
      student.name = name || student.name;
      student.email = email || student.email;
      student.rollNumber = rollNumber || student.rollNumber;
      student.class = studentClass || student.class;

      const updatedStudent = await student.save();
      res.status(200).json({
        _id: updatedStudent._id,
        name: updatedStudent.name,
        email: updatedStudent.email,
        rollNumber: updatedStudent.rollNumber,
        class: updatedStudent.class,
      });
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Delete student by ID
// @route   DELETE /api/students/:id
// @access  Private/Admin
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  const { id } = req.params;

  try {
    const student = await User.findById(id);

    if (student && student.role === "student") {
      await student.deleteOne();
      res.status(200).json({ message: "Student removed" });
    } else {
      res.status(404).json({ message: "Student not found or not a student role" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
