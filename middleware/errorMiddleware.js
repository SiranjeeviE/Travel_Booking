import AppError from '../utils/AppError.js';

/**
 * Formats and sends the error response to the client.
 */
const sendError = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } 
  // Programming or other unknown error: don't leak details
  else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

/**
 * Global Error Handler Middleware
 */
export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle specific Mongoose/JWT errors
  let error = { ...err };
  error.message = err.message;

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(el => el.message);
    error = new AppError(`Invalid input data: ${messages.join('. ')}`, 400);
  }

  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again!', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired! Please log in again.', 401);
  }

  sendError(error, res);
};