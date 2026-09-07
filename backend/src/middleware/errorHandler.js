class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      message: err.message,
      status: err.status
    });
  }

  // Validation errors
  if (err.name === 'ValidationError' || err.status === 400) {
    return res.status(400).json({
      message: err.message || 'Validation error',
      status: 400
    });
  }

  // Database errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const message = err.errors ? err.errors[0].message : err.message;
    return res.status(400).json({
      message,
      status: 400
    });
  }

  // Default error
  res.status(500).json({
    message: 'Internal server error',
    status: 500
  });
};

module.exports = {
  ApiError,
  errorHandler
};
