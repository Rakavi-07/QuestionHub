import express from 'express';
import {
  getStudentQuestionPapers,
  getSavedPapers,
  savePaper,
  unsavePaper,
} from '../controllers/studentController.js';

const router = express.Router();

// All routes here are protected by protect + requireRole('Student')
// applied in server.js before mounting this router.

/**
 * GET /api/question-papers
 * Returns all uploaded papers for the authenticated student's semester.
 * Excludes internal Cloudinary metadata (publicId, API secrets).
 */
router.get('/', getStudentQuestionPapers);

/**
 * GET /api/question-papers/saved
 * Returns the student's saved question papers.
 * Must be registered before /:id routes to avoid route shadowing.
 */
router.get('/saved', getSavedPapers);

/**
 * POST /api/question-papers/:id/save
 * Save a question paper to the student's list.
 */
router.post('/:id/save', savePaper);

/**
 * DELETE /api/question-papers/:id/save
 * Remove a question paper from the student's list.
 */
router.delete('/:id/save', unsavePaper);

export default router;
