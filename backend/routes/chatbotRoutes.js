const express = require('express');
const { handleChat, getChatStatus } = require('../controllers/chatbotController');

const router = express.Router();

router.post('/', handleChat);
router.get('/status', getChatStatus); // Diagnostic: shows key rotation health

module.exports = router;
