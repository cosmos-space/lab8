const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { error: 'Too many authentication attempts, please try again after 15 minutes.' }
});

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
};

router.post('/register', authLimiter, [
    body('username').trim().notEmpty().withMessage('Username is required').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, authController.register);

router.post('/login', authLimiter, [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], validate, authController.login);

router.post('/logout', authController.logout);

module.exports = router;