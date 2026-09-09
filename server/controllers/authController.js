import Student, { SRMIST_EMAIL_PATTERN } from '../models/Student.js';
import Admin from '../models/Admin.js';
import generateToken from '../utils/generateToken.js';
import { isValidSemester } from '../utils/subjects.js';

/**
 * @route   POST /api/auth/register
 * @desc    Register a new student account (status defaults to Pending)
 *          Department has been removed — QuestionHub is exclusively for
 *          SRM Physiotherapy (BPT) students.
 * @access  Public
 */
export async function registerStudent(req, res, next) {
  try {
    const { fullName, registerNumber, email, year, semester, password } = req.body;

    // --- Validation -------------------------------------------------
    const missingFields = [];
    if (!fullName) missingFields.push('fullName');
    if (!registerNumber) missingFields.push('registerNumber');
    if (!email) missingFields.push('email');
    if (!year) missingFields.push('year');
    if (!semester) missingFields.push('semester');
    if (!password) missingFields.push('password');

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required field(s): ${missingFields.join(', ')}`,
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (!SRMIST_EMAIL_PATTERN.test(normalizedEmail)) {
      return res.status(400).json({
        message: 'Only students with an official @srmist.edu.in email can register.',
      });
    }

    const numericYear = Number(year);
    const numericSemester = Number(semester);

    if (![1, 2, 3, 4, 5].includes(numericYear)) {
      return res.status(400).json({ message: 'Invalid year selected.' });
    }

    if (!isValidSemester(numericSemester)) {
      return res.status(400).json({ message: 'Invalid semester selected.' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // --- Duplicate check ---------------------------------------------
    const existingStudent = await Student.findOne({
      $or: [{ email: normalizedEmail }, { registerNumber }],
    });

    if (existingStudent) {
      return res.status(409).json({
        message: 'An account with this email or register number already exists.',
      });
    }

    // --- Create student (status Pending, role Student by default) ---
    await Student.create({
      fullName,
      registerNumber,
      email: normalizedEmail,
      year: numericYear,
      semester: numericSemester,
      password,
    });

    return res.status(201).json({
      message: 'Registration submitted successfully. Please wait for admin approval.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   POST /api/auth/student/login
 * @desc    Authenticate a student and return a JWT if approved
 * @access  Public
 */
export async function loginStudent(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const student = await Student.findOne({ email: normalizedEmail }).select('+password');

    if (!student) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const isPasswordCorrect = await student.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    if (student.status === 'Pending') {
      return res.status(403).json({
        status: 'pending',
        message: 'Your account is awaiting admin approval.',
      });
    }

    if (student.status === 'Rejected') {
      return res.status(403).json({
        status: 'rejected',
        message: 'Your registration has been rejected. Please contact the department.',
      });
    }

    // status === 'Approved'
    const token = generateToken({ id: student._id, role: 'Student' });

    return res.status(200).json({
      message: 'Login successful.',
      token,
      student: student.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   POST /api/auth/admin/login
 * @desc    Authenticate an admin and return a JWT
 * @access  Public
 */
export async function loginAdmin(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const admin = await Admin.findOne({ email: normalizedEmail }).select('+password');

    if (!admin) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const isPasswordCorrect = await admin.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const token = generateToken({ id: admin._id, role: 'Admin' });

    return res.status(200).json({
      message: 'Login successful.',
      token,
      admin: admin.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
}
