
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect routes. 
 * Checks for a Bearer token in the Authorization header.
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please login to get access.'
      });
    }

    // 2. Verify token
    // Promisifying jwt.verify or just using it directly
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 4. Grant access to protected route by attaching user to request
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: 'Invalid token. Please login again.'
    });
  }
};
