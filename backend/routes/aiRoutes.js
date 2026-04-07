const express = require('express');
const router = express.Router();
const { aiChat } = require('../controllers/aiController');

router.post('/chat', aiChat);

module.exports = router;
