const logger = require('../utils/logger');
const config = require('../config/env');

class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  logger.error('Error', {
    message: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    statusCode: error.statusCode || 500
  });

  if (err.name === 'ValidationError') {
    error = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid or expired token', 401, 'UNAUTHORIZED');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401, 'TOKEN_EXPIRED');
  }

  if (err.code === 'ER_DUP_ENTRY') {
    error = new AppError('Duplicate entry', 409, 'DUPLICATE_ENTRY');
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    error = new AppError('Referenced record not found', 400, 'FOREIGN_KEY_ERROR');
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new AppError('File too large', 413, 'FILE_TOO_LARGE');
  }

  const statusCode = error.statusCode || 500;
  const errorCode = error.errorCode || 'INTERNAL_ERROR';
  const message = error.isOperational ? error.message : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler, AppError };