const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented', errorCode: 'NOT_IMPLEMENTED' });
});

router.get('/my', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented', errorCode: 'NOT_IMPLEMENTED' });
});

router.get('/:id', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented', errorCode: 'NOT_IMPLEMENTED' });
});

router.post('/:id/handover', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented', errorCode: 'NOT_IMPLEMENTED' });
});

router.post('/:id/reject', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented', errorCode: 'NOT_IMPLEMENTED' });
});

module.exports = router;