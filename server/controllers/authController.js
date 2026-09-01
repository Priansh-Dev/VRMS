const authService = require('../services/authService');
const config = require('../config/env');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const ACCESS_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 15 * 60 * 1000
};

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
}

function clearAuthCookies(res) {
  res.clearCookie('accessToken', { httpOnly: true, secure: config.nodeEnv === 'production', sameSite: 'lax' });
  res.clearCookie('refreshToken', { httpOnly: true, secure: config.nodeEnv === 'production', sameSite: 'lax' });
}

async function register(req, res, next) {
  try {
    const { name, email, phone, password, role } = req.body;
    const result = await authService.register({ name, email, phone, password, role });
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user: result.user }
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.json({
      success: true,
      message: 'Login successful',
      data: { user: result.user }
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.cookies?.refreshToken);
    clearAuthCookies(res);
    res.json({ success: true, message: 'Logout successful' });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me };