const express = require('express');
const router = express.Router();

router.post('/create-order', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented', errorCode: 'NOT_IMPLEMENTED' });
});

router.post('/verify', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented', errorCode: 'NOT_IMPLEMENTED' });
});

router.post('/webhook', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented', errorCode: 'NOT_IMPLEMENTED' });
});

router.get('/:bookingId', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented', errorCode: 'NOT_IMPLEMENTED' });
});

module.exports = router;