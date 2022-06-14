const ApiError = require("../utils/ApiError");

exports.basicAuth = (req, res, next) => {
  const headerToken = req.headers.authorization;
  if (!headerToken) {
    throw new ApiError(401, "Unauthorized");
  }

  const token = headerToken.split(" ");
  const basicToken = new Buffer.from(
    process.env.BASIC_USER + ":" + process.env.BASIC_PASSWORD
  ).toString("base64");

  if (token[0] !== "Basic" || token[1] !== basicToken) {
    throw new ApiError(401, "Unauthorized");
  }

  next();
};
