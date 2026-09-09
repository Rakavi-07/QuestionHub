import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Admin from '../models/Admin.js';

/**
 * Verifies the Authorization: Bearer <token> header and attaches the
 * corresponding user (without the password) to req.user.
 */
export async function protect(req, res, next) {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const Model = decoded.role === 'Admin' ? Admin : Student;
    const user = await Model.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Not authorized. User no longer exists.' });
    }

    req.user = { id: user._id, role: decoded.role, doc: user };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized. Token is invalid or expired.' });
  }
}

/**
 * Restricts a route to one or more roles, e.g. requireRole('Admin').
 * Must run after `protect`.
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to access this resource.' });
    }
    next();
  };
}
