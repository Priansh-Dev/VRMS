const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { AppError } = require('./errorHandler');
const logger = require('../utils/logger');

const authenticate = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      email: decoded.email
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401, 'TOKEN_EXPIRED'));
    }
    logger.warn('Invalid token', { error: err.message, ip: req.ip });
    return next(new AppError('Invalid token', 401, 'UNAUTHORIZED'));
  }
};

const optionalAuth = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      email: decoded.email
    };
  } catch (err) {
    // Ignore invalid tokens for optional auth
  }
  next();
};

module.exports = { authenticate, optionalAuth };