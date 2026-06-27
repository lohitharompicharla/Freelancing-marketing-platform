export const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, _req, res, _next) => {
  const message =
    err.code === "LIMIT_FILE_SIZE"
      ? "Resume file is too large. Please upload a file under 5MB."
      : err.message || "Internal server error";

  console.error("API error:", {
    message: err.message,
    stack: err.stack
  });

  res.status(err.statusCode || 500).json({
    message
  });
};
