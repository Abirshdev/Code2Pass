import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function adminOnly(req, res, next) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

export async function attachUser(req, res, next) {
  try {
    const u = await User.findById(req.userId).select('-password');
    if (!u) return res.status(401).json({ message: 'User not found' });
    req.user = u;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid user' });
  }
}
