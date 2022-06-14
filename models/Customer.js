const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ListCustomer = new Schema(
  {
    customerID: {
      type: String,
      required: [true, "ID customer is required"],
    },
    type: {
      type: String,
      required: [true, "Type's card is required"],
    },
    lastNumbers: {
      type: Number,
      required: [true, "Last number's card is required"],
    },
  },
  {
    collection: "mt-listCustomer",
    timestamps: true,
  }
);

module.exports = mongoose.model("ListCustomer", ListCustomer);
