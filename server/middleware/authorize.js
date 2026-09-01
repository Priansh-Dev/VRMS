const { AppError } = require('./errorHandler');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403, 'FORBIDDEN'));
    }

    next();
  };
};

const authorizeOwner = (resourceUserIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
    }

    const resourceUserId = req.params[resourceUserIdParam] || req.body[resourceUserIdParam];

    if (req.user.role === 'ADMIN') {
      return next();
    }

    if (req.user.id !== parseInt(resourceUserId, 10)) {
      return next(new AppError('Access denied', 403, 'FORBIDDEN'));
    }

    next();
  };
};

module.exports = { authorize, authorizeOwner };