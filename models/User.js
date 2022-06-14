const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { ROLES } = require("../constants");
const bcrypt = require("bcryptjs");
const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    fullname: {
      type: String,
      required: [true, "Fullname is required"],
    },
    role: {
      type: String,
      enum: ROLES,
      default: ROLES.GUEST,
    },
    customerID: {
      type: String,
      required: [true, "CustomerID is required"],
    },
    points: {
      type: Number,
      required: [true, "Points is required"],
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "mt-users",
  }
);

UserSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(this.password, salt);
    this.password = hashedPassword;
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
