const rateLimit = require("express-rate-limit");
const ApiError = require("../utils/ApiError");

exports.limiter = (requests, minutes) =>
  rateLimit({
    windowMs: minutes * 60 * 1000,
    max: requests,
    handler: () => {
      throw new ApiError(429, "Too many request");
    },
  });
