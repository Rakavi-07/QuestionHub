import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'questionhub_token';
const USER_KEY = 'questionhub_user';

export function setSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const { exp } = jwtDecode(token);
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

export function isAuthenticated() {
  const token = getToken();
  return Boolean(token) && !isTokenExpired(token);
}

export function logout({ redirect = false } = {}) {
  const user = getUser();
  const isAdmin = user?.role === 'Admin';
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  if (redirect && typeof window !== 'undefined') {
    window.location.href = isAdmin ? '/admin/login' : '/student/login';
  }
}
