const User = require('../models/user');
const jwt = require('jsonwebtoken');

//Token generator
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc Reister new user
// @route POST /api/auth/register
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ success: false, message: 'User already exists'});

        const user = await User.create({ username, email, password });

        res.status(201).json({
            success: true,
            message: 'User created',
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });

    }catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
            
        } else {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

    }catch(error) {

        res.status(500).json({ success: false, message: error.message });
    }
};
