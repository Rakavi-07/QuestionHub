import QuestionPaper from '../models/QuestionPaper.js';
import Student from '../models/Student.js';
import { getSubjectsForSemester } from '../utils/subjects.js';

/**
 * Safe fields to return to students — excludes publicId and internal Cloudinary metadata.
 */
const SAFE_FIELDS = 'semester subjectCode subjectName fileUrl originalFileName fileSize createdAt updatedAt';

/**
 * @route   GET /api/question-papers
 * @desc    Get all uploaded question papers for the authenticated student's semester.
 *          Returns only safe fields — no Cloudinary publicId or API secrets.
 * @access  Private (Student)
 */
export async function getStudentQuestionPapers(req, res, next) {
  try {
    const { doc: student } = req.user;

    const papers = await QuestionPaper.find({ semester: student.semester })
      .select(SAFE_FIELDS)
      .lean();

    return res.status(200).json({ semester: student.semester, papers });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   GET /api/question-papers/saved
 * @desc    Get the authenticated student's saved question papers.
 * @access  Private (Student)
 */
export async function getSavedPapers(req, res, next) {
  try {
    const { id } = req.user;

    const student = await Student.findById(id)
      .populate({
        path: 'savedQuestionPapers',
        select: SAFE_FIELDS,
      })
      .lean();

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    return res.status(200).json({ savedPapers: student.savedQuestionPapers || [] });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   POST /api/question-papers/:id/save
 * @desc    Save a question paper to the student's saved list.
 *          Students can only save papers from their own semester.
 * @access  Private (Student)
 */
export async function savePaper(req, res, next) {
  try {
    const { id: studentId, doc: studentDoc } = req.user;
    const { id: paperId } = req.params;

    // Verify the paper exists
    const paper = await QuestionPaper.findById(paperId).select('semester subjectCode').lean();
    if (!paper) {
      return res.status(404).json({ message: 'Question paper not found.' });
    }

    // Security: students can only save papers from their own semester
    if (paper.semester !== studentDoc.semester) {
      return res.status(403).json({ message: 'You can only save papers for your registered semester.' });
    }

    // Add to saved list if not already saved (use $addToSet to prevent duplicates)
    await Student.findByIdAndUpdate(
      studentId,
      { $addToSet: { savedQuestionPapers: paperId } },
      { new: true }
    );

    return res.status(200).json({ message: 'Question paper saved successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   DELETE /api/question-papers/:id/save
 * @desc    Remove a question paper from the student's saved list.
 * @access  Private (Student)
 */
export async function unsavePaper(req, res, next) {
  try {
    const { id: studentId } = req.user;
    const { id: paperId } = req.params;

    await Student.findByIdAndUpdate(
      studentId,
      { $pull: { savedQuestionPapers: paperId } },
      { new: true }
    );

    return res.status(200).json({ message: 'Question paper removed from saved list.' });
  } catch (error) {
    next(error);
  }
}
