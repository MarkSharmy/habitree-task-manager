const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            //Attach user to the request object (excluding password)
            req.user = await User.findById(decoded.id).select('-password');
            next();

        } catch(error) {
            res.status(401).json({ success: false, message: 'Not authorized, token failed'});
        }
    }

    //If token is not defined
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };