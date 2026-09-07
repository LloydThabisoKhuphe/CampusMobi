const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'campusmobi-dev-secret-key-change-me-please-32-bytes-min';
const JWT_EXPIRATION_MINUTES = parseInt(process.env.JWT_EXPIRATION_MINUTES || '1440');

class JwtService {
  static generateToken(userId, username, role, isGuest = false) {
    const payload = {
      userId,
      username,
      role,
      isGuest
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: `${JWT_EXPIRATION_MINUTES}m`,
      algorithm: 'HS256'
    });
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET, {
        algorithms: ['HS256']
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      }
      throw new Error('Invalid token');
    }
  }

  static extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}

module.exports = JwtService;
