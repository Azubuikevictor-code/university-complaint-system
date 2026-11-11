export function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export function sendDuplicateError(error, res) {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "value";
    const labels = {
      email: "Email address",
      matriculationNumber: "Matriculation number",
    };
    return res.status(409).json({
      success: false,
      message: `${labels[field] || "This value"} is already registered`,
    });
  }
  return null;
}
