import api from '@/api/axios';

/**
 * Fetch all uploaded question papers for the authenticated student's semester.
 * GET /api/question-papers
 */
export function fetchStudentQuestionPapers() {
  return api.get('/question-papers');
}

/**
 * Fetch the student's saved question papers.
 * GET /api/question-papers/saved
 */
export function fetchSavedPapers() {
  return api.get('/question-papers/saved');
}

/**
 * Save a question paper.
 * POST /api/question-papers/:id/save
 * @param {string} paperId - MongoDB _id of the QuestionPaper
 */
export function saveQuestionPaper(paperId) {
  return api.post(`/question-papers/${paperId}/save`);
}

/**
 * Unsave a question paper.
 * DELETE /api/question-papers/:id/save
 * @param {string} paperId - MongoDB _id of the QuestionPaper
 */
export function unsaveQuestionPaper(paperId) {
  return api.delete(`/question-papers/${paperId}/save`);
}
