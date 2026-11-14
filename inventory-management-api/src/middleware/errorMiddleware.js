function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Something went wrong";

  if (error.name === "CastError") {
    statusCode = 400;
    message = "The supplied item ID is not valid";
  }

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(error.errors).map((entry) => entry.message).join(", ");
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = "An item with this item code already exists";
  }

  if (error.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Request body must contain valid JSON";
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === "development" ? { detail: error.stack } : {})
    }
  });
}

module.exports = { notFound, errorHandler };
