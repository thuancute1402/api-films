const express = require("express");
const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken");
const {
  login,
  register,
  getProfile,
} = require("../controllers/authController");

const route = express.Router();

route.post("/login", login);
route.post("/register", register);
route.get("/me", getProfile);

route.post("/refresh-token", async (req, res) => {
  const { refreshToken: requestToken } = req.body;

  if (!requestToken) {
    return res.status(400).json({ message: "Refresh Token is required!" });
  }

  try {
    let refreshToken = await RefreshToken.findOne({ token: requestToken });

    if (!refreshToken) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.findByIdAndRemove(refreshToken._id, {
        useFindAndModify: false,
      }).exec();

      res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
      return;
    }

    let newToken = jwt.sign({ id: refreshToken.user._id }, "12345", {
      expiresIn: "1d",
    });

    return res.status(200).json({
      token: newToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
});

module.exports = route;
