import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import {
  getAllQuestionPapers,
  getQuestionPaperBySubjectCode,
  uploadQuestionPaper,
  replaceQuestionPaper,
  deleteQuestionPaper,
} from '../controllers/questionPaperController.js';

const router = express.Router();

// All routes here will be protected by protect + requireRole('Admin')
// at the mount point.

router.get('/', getAllQuestionPapers);
router.get('/:subjectCode', getQuestionPaperBySubjectCode);

// Use multer upload.single('pdf') for multipart/form-data
router.post('/', upload.single('pdf'), uploadQuestionPaper);
router.put('/:subjectCode', upload.single('pdf'), replaceQuestionPaper);
router.delete('/:subjectCode', deleteQuestionPaper);

export default router;
