const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/env');
const userRepository = require('../repositories/userRepository');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const SALT_ROUNDS = 12;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiry }
  );
}

function generateRefreshToken(user) {
  const tokenId = uuidv4();
  return jwt.sign(
    { userId: user.id, tokenId, role: user.role, email: user.email },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiry }
  );
}

async function register({ name, email, phone, password, role }) {
  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
  }

  if (role !== 'OWNER' && role !== 'CUSTOMER') {
    throw new AppError('Invalid role. Only OWNER or CUSTOMER allowed', 400, 'INVALID_ROLE');
  }

  const passwordHash = await hashPassword(password);
  const user = await userRepository.createUser({ name, email, phone, passwordHash, role });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  logger.info('User registered', { userId: user.id, email, role });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    },
    accessToken,
    refreshToken
  };
}

async function login({ email, password }) {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    logger.warn('Login attempt with non-existent email', { email, ip: 'unknown' });
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  if (user.status !== 'ACTIVE') {
    logger.warn('Login attempt with inactive account', { userId: user.id, status: user.status });
    throw new AppError('Account is not active', 403, 'ACCOUNT_INACTIVE');
  }

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    logger.warn('Login attempt with invalid password', { userId: user.id });
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  await userRepository.updateLastLogin(user.id);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  logger.info('User logged in', { userId: user.id, email });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    },
    accessToken,
    refreshToken
  };
}

async function logout(refreshToken) {
  logger.info('User logged out');
  return { success: true };
}

async function getCurrentUser(userId) {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  return user;
}

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  generateAccessToken,
  generateRefreshToken
};