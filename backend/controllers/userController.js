const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};