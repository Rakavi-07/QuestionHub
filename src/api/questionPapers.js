import api from '@/api/axios';

/**
 * Fetch all question papers (metadata).
 * GET /api/admin/question-papers
 * @param {Object} params - { semester, subjectCode }
 */
export function fetchQuestionPapers(params = {}) {
  return api.get('/admin/question-papers', { params });
}

/**
 * Upload a new question paper.
 * POST /api/admin/question-papers
 * @param {FormData} formData - Must contain semester, subjectCode, subjectName, pdf
 */
export function uploadQuestionPaper(formData) {
  return api.post('/admin/question-papers', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * Replace an existing question paper.
 * PUT /api/admin/question-papers/:subjectCode
 * @param {string} subjectCode
 * @param {FormData} formData - Must contain pdf
 */
export function replaceQuestionPaper(subjectCode, formData) {
  return api.put(`/admin/question-papers/${subjectCode}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * Delete a question paper.
 * DELETE /api/admin/question-papers/:subjectCode
 * @param {string} subjectCode
 */
export function deleteQuestionPaper(subjectCode) {
  return api.delete(`/admin/question-papers/${subjectCode}`);
}
