import api from '@/api/axios';

export function registerStudent(payload) {
  return api.post('/auth/register', payload);
}

export function studentLogin(payload) {
  return api.post('/auth/student/login', payload);
}

export function adminLogin(payload) {
  return api.post('/auth/admin/login', payload);
}
