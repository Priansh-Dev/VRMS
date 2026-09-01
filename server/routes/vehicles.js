const express = require('express');
const router = express.Router();

router.get('/search', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented', errorCode: 'NOT_IMPLEMENTED' });
});

router.get('/my', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented', errorCode: 'NOT_IMPLEMENTED' });
});

router.post('/', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented', errorCode: 'NOT_IMPLEMENTED' });
});

router.get('/:id', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented', errorCode: 'NOT_IMPLEMENTED' });
});

router.patch('/:id', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented', errorCode: 'NOT_IMPLEMENTED' });
});

router.patch('/:id/status', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented', errorCode: 'NOT_IMPLEMENTED' });
});

router.delete('/:id', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented', errorCode: 'NOT_IMPLEMENTED' });
});

router.post('/:id/documents', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented', errorCode: 'NOT_IMPLEMENTED' });
});

router.get('/:id/documents', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented', errorCode: 'NOT_IMPLEMENTED' });
});

router.get('/:id/verification', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented', errorCode: 'NOT_IMPLEMENTED' });
});

module.exports = router;