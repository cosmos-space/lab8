const User = require('../models/User');

exports.getMe = async (req, res) => {
    try {
        const id = req.user?.id;
        if (!id) return res.status(401).json({ error: 'Unauthorized' });

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await User.delete(id);
        if (!deleted) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createUserByAdmin = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        const trimmedUsername = (username || '').trim();
        const trimmedEmail = (email || '').trim();
        const trimmedPassword = (password || '').trim();

        const hasEmojiOrNonAscii = (str) => /[^\x00-\x7F]/.test(str);

        if (!trimmedUsername || trimmedUsername.length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 characters' });
        }
        if (!trimmedEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmedEmail)) {
            return res.status(400).json({ error: 'Please provide a valid email' });
        }
        if (!trimmedPassword || trimmedPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        if (hasEmojiOrNonAscii(trimmedUsername)) {
            return res.status(400).json({ error: 'Username cannot contain emojis or non-ASCII characters' });
        }

        const allowedRoles = ['user', 'admin'];
        const safeRole = allowedRoles.includes(role) ? role : 'user';

        const existing = await User.findByEmail(trimmedEmail);
        if (existing) {
            return res.status(400).json({ error: 'Email is already in use' });
        }

        const bcrypt = require('bcrypt');
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(trimmedPassword, salt);

        const userId = await User.create(trimmedUsername, trimmedEmail, password_hash, safeRole);
        res.status(201).json({ message: 'User created', userId });
    } catch (error) {
        console.error('Create user by admin error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};