import api from '@/api/axios';

/**
 * Fetch dashboard statistics.
 * GET /api/admin/stats
 */
export function fetchAdminStats() {
  return api.get('/admin/stats');
}

/**
 * Fetch paginated/filtered students.
 * GET /api/admin/students
 * @param {Object} params - { search, status, semester, page, limit }
 */
export function fetchStudents(params = {}) {
  return api.get('/admin/students', { params });
}

/**
 * Fetch single student details.
 * GET /api/admin/students/:id
 */
export function fetchStudentById(id) {
  return api.get(`/admin/students/${id}`);
}

/**
 * Update a student's status.
 * PATCH /api/admin/students/:id/status
 * @param {string} id
 * @param {'Pending'|'Approved'|'Rejected'} status
 */
export function updateStudentStatus(id, status) {
  return api.patch(`/admin/students/${id}/status`, { status });
}
