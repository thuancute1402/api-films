const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FilmSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Vi name is required"],
    },
    originName: {
      type: String,
      required: [true, "En name is required"],
    },
    imgUrl: String,
    year: Number,
    status: String,
    category: String,
    country: String,
    modified: String,
    slug: String,
  },
  {
    collection: "peter-films",
  }
);

module.exports = mongoose.model("Film", FilmSchema);
