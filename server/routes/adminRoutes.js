import express from 'express';
import {
  getAdminStats,
  getStudents,
  getStudentById,
  updateStudentStatus,
} from '../controllers/adminController.js';

import questionPaperRoutes from './questionPaperRoutes.js';

const router = express.Router();

// All routes in this file are already protected by protect + requireRole('Admin')
// applied in server.js before mounting this router.

/** GET /api/admin/stats */
router.get('/stats', getAdminStats);

/** GET /api/admin/students */
router.get('/students', getStudents);

/** GET /api/admin/students/:id */
router.get('/students/:id', getStudentById);

/** PATCH /api/admin/students/:id/status */
router.patch('/students/:id/status', updateStudentStatus);

/** Question Papers Management */
router.use('/question-papers', questionPaperRoutes);

export default router;
