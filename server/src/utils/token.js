import jwt from 'jsonwebtoken';

const SECRET = () => process.env.JWT_SECRET || 'dev-secret';

export function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    SECRET(),
    { expiresIn: '7d' }
  );
}
