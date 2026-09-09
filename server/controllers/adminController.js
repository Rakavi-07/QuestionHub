import mongoose from 'mongoose';
import Student from '../models/Student.js';

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics (live MongoDB counts)
 * @access  Private (Admin)
 */
export async function getAdminStats(req, res, next) {
  try {
    const [totalStudents, pendingStudents, approvedStudents, rejectedStudents] =
      await Promise.all([
        Student.countDocuments(),
        Student.countDocuments({ status: 'Pending' }),
        Student.countDocuments({ status: 'Approved' }),
        Student.countDocuments({ status: 'Rejected' }),
      ]);

    return res.status(200).json({
      totalStudents,
      pendingStudents,
      approvedStudents,
      rejectedStudents,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   GET /api/admin/students
 * @desc    Get paginated list of students with optional search/filter
 *          Query params: search, status, semester, page, limit
 * @access  Private (Admin)
 */
export async function getStudents(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const { search, status, semester } = req.query;

    // Build match filter
    const matchStage = {};

    if (status && ['Pending', 'Approved', 'Rejected'].includes(status)) {
      matchStage.status = status;
    }

    const numericSemester = parseInt(semester);
    if (semester && !isNaN(numericSemester) && numericSemester >= 1 && numericSemester <= 8) {
      matchStage.semester = numericSemester;
    }

    if (search && search.trim()) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedSearch, 'i');
      matchStage.$or = [
        { fullName: regex },
        { registerNumber: regex },
        { email: regex },
      ];
    }

    const [students, total] = await Promise.all([
      Student.find(matchStage)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(matchStage),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      students,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   GET /api/admin/students/:id
 * @desc    Get a single student's details (no password)
 * @access  Private (Admin)
 */
export async function getStudentById(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid student ID.' });
    }

    const student = await Student.findById(id).select('-password').lean();

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    return res.status(200).json({ student });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   PATCH /api/admin/students/:id/status
 * @desc    Update a student's status (Pending | Approved | Rejected)
 * @access  Private (Admin)
 */
export async function updateStudentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid student ID.' });
    }

    const ALLOWED_STATUSES = ['Pending', 'Approved', 'Rejected'];
    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}.`,
      });
    }

    const student = await Student.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    return res.status(200).json({
      message: `Student status updated to ${status}.`,
      student,
    });
  } catch (error) {
    next(error);
  }
}
