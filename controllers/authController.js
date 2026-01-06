
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Generates a JWT token for a given user ID.
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

/**
 * Registers a new user.
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Create user (password hashing is handled in User model)
    const newUser = await User.create({
      name,
      email,
      password
    });

    // 2. Generate token
    const token = signToken(newUser._id);

    // 3. Send response (hide password)
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: { user: newUser }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

/**
 * Authenticates an existing user.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password' });
    }

    // 2. Find user and explicitly select password
    const user = await User.findOne({ email }).select('+password');

    // 3. Verify user exists and password is correct
    if (!user || !(await user.comparePassword(password, user.password))) {
      return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
    }

    // 4. Generate token
    const token = signToken(user._id);

    // 5. Send response
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: { user }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
