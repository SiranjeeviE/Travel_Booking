/**
 * Wraps an asynchronous Express handler to automatically catch errors
 * and pass them to the global error middleware.
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;