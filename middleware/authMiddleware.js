import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

/**
 * Middleware to protect routes and ensure only logged-in users gain access.
 */
export const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1) Check if token is provided in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please login to get access.', 401));
  }

  // 2) Verify the JWT
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Verify if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // Grant access by attaching user to the request object
  req.user = currentUser;
  next();
});