const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already in use' });
        }
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const userRole = 'user'; // Force 'user' for public registration
        const userId = await User.create(username, email, password_hash, userRole);

        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('LOGIN attempt:', { email });

        if (!email || !password) {
            console.log('LOGIN fail: missing email or password');
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await User.findByEmail(email);
        if (!user) {
            console.log('LOGIN fail: user not found for email', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            console.log('LOGIN fail: bad password for user id', user.id);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const payload = {
            id: user.id,
            role: user.role
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Set HttpOnly cookie for security
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.logout = (req, res) => {
res.clearCookie('token');
res.json({ message: 'Logged out successfully' });
}; 