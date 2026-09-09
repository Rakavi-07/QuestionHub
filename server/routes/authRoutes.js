import express from 'express';
import { registerStudent, loginStudent, loginAdmin } from '../controllers/authController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerStudent);
router.post('/student/login', loginStudent);
router.post('/admin/login', loginAdmin);

/**
 * @route   GET /api/auth/me
 * @desc    Return the currently authenticated user (student or admin).
 *          Demonstrates the `protect` middleware; useful for the frontend
 *          to validate a stored token / hydrate session on page load.
 * @access  Private (Student or Admin)
 */
router.get('/me', protect, (req, res) => {
  const { role, doc } = req.user;
  const safeUser = typeof doc.toSafeObject === 'function' ? doc.toSafeObject() : doc;
  res.status(200).json({ role, user: safeUser });
});

/**
 * @route   GET /api/auth/admin-only
 * @desc    Sample route demonstrating role-based access control.
 * @access  Private (Admin only)
 */
router.get('/admin-only', protect, requireRole('Admin'), (req, res) => {
  res.status(200).json({ message: 'Welcome, Admin.' });
});

/**
 * @route   GET /api/auth/student-only
 * @desc    Sample route demonstrating role-based access control.
 * @access  Private (Student only)
 */
router.get('/student-only', protect, requireRole('Student'), (req, res) => {
  res.status(200).json({ message: 'Welcome, Student.' });
});

export default router;
