const JwtService = require('../services/jwtService');
const { ApiError } = require('./errorHandler');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ApiError(401, 'Unauthorized: No authorization header provided');
    }

    const token = JwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      throw new ApiError(401, 'Unauthorized: Invalid token format');
    }

    const decoded = JwtService.verifyToken(token);
    req.user = decoded; // Attach user info to request

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(401).json({ message: error.message || 'Unauthorized' });
  }
};

const guestGuard = (req, res, next) => {
  if (req.user.isGuest) {
    throw new ApiError(403, 'Forbidden: Guest accounts cannot access this resource');
  }
  next();
};

module.exports = {
  authMiddleware,
  guestGuard
};
