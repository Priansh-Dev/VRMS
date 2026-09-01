const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented', errorCode: 'NOT_IMPLEMENTED' });
});

router.patch('/:id/read', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented', errorCode: 'NOT_IMPLEMENTED' });
});

router.patch('/read-all', (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented', errorCode: 'NOT_IMPLEMENTED' });
});

module.exports = router;