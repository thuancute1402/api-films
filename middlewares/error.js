const catchError = (err, req, res, next) => {
  // handle error
  console.log("From err.js ", JSON.stringify(err.message, null, 2));
  if (err.name === "ValidationError") {
    const errors = err.errors;
    const keysErr = Object.keys(errors);
    const errorObj = {};
    keysErr.map((key) => {
      errorObj[key] = errors[key].message;
      if (errors[key].kind === "enum") {
        errorObj[key] = "invalid enum value";
      }
    });
    err.statusCode = 400;
    err.message = errorObj;
  }

  //  if (err.kind === "ObjectId") {
  //    err.statusCode === 400;
  //    err.message = "Invalid ID";
  //  }

  //  if (err.code === 11000) {
  //    err.statusCode = 400;
  //    const field = Object.keys(err.keyValue)[0];
  //    err.message = `${field} is already existed.`;
  //  }

  // 500: Internal server error
  res.status(err.statusCode || 500).json({
    success: false,
    statusCode: err.statusCode,
    message: err.message || "Internal error!",
  });
};

module.exports = catchError;
