const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const RefreshTokenSchema = new mongoose.Schema(
  {
    token: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    expiryDate: Date,
  },
  {
    timestamps: true,
  }
);

RefreshTokenSchema.statics.createToken = async function (user) {
  let expiredAt = new Date();
  // 60s === 1 minute
  expiredAt.setSeconds(expiredAt.getSeconds() + 360);
  let token = uuidv4();

  let object = new this({
    token: token,
    user: user._id,
    expiryDate: expiredAt.getTime(),
  });

  let refreshToken = await object.save();

  return refreshToken.token;
};

RefreshTokenSchema.statics.verifyExpiration = (token) => {
  return token.expiryDate.getTime() < new Date().getTime();
};

const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);

module.exports = RefreshToken;
