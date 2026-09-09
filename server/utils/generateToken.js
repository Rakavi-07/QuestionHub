import jwt from 'jsonwebtoken';

/**
 * Signs a JWT carrying the user's id and role.
 * Role is what protected routes/middleware use to tell Students and
 * Admins apart, so it must always be embedded in the payload.
 */
export default function generateToken({ id, role }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in your environment variables.');
  }

  return jwt.sign({ id, role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}
