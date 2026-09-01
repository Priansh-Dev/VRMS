const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => `${e.path}: ${e.msg}`).join('; ');
    return next(new AppError(messages, 400, 'VALIDATION_ERROR'));
  }
  next();
};

const validateQuery = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => `${e.param}: ${e.msg}`).join('; ');
    return next(new AppError(messages, 400, 'VALIDATION_ERROR'));
  }
  next();
};

module.exports = { validate, validateQuery };