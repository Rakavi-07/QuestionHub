import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const SRMIST_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@srmist\.edu\.in$/;

const studentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  registerNumber: {
    type: String,
    required: [true, 'Register number is required'],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    unique: true,
    validate: {
      validator: (value) => SRMIST_EMAIL_REGEX.test(value),
      message: 'Only official @srmist.edu.in email addresses are allowed',
    },
  },
  // Department removed — QuestionHub is exclusively for SRM Physiotherapy (BPT) students.
  year: {
    type: Number,
    required: [true, 'Year is required'],
    enum: [1, 2, 3, 4, 5],
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: 1,
    max: 8,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  role: {
    type: String,
    default: 'Student',
    immutable: true,
  },
  savedQuestionPapers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuestionPaper',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

studentSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

studentSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

studentSchema.methods.toSafeObject = function toSafeObject() {
  const { _id, fullName, registerNumber, email, year, semester, status, role, createdAt } = this;
  return { id: _id, fullName, registerNumber, email, year, semester, status, role, createdAt };
};

export const SRMIST_EMAIL_PATTERN = SRMIST_EMAIL_REGEX;

export default mongoose.model('Student', studentSchema);
