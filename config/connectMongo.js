const mongoose = require("mongoose");

const isLocal = false;
const URL = isLocal
  ? "mongodb://localhost:27017/charge"
  : process.env.MONGO_URL;

mongoose
  .connect(URL)
  .then(() => {
    console.log("Connect to db success");
  })
  .catch((err) => {
    console.log("Err in connect DB " + err);
  });
