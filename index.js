require("dotenv").config();
require("./config/connectMongo");

// import files
const catchError = require("./middlewares/error");
const { limiter } = require("./middlewares/rateLimit");

// routes
const filmRoutes = require("./routes/filmRoutes");
const { basicAuth } = require("./middlewares/basicAuth");

// import package
const cors = require("cors");
const express = require("express");
const app = express();
const server = require("http").Server(app);

// Socket
// const Socket = require("./utils/Socket-io");
// const socketInstance = new Socket(server);
// socketInstance.initiSocketConnection();

// schedule job to crawl pages
// require("./utils/crawlPage")();
// Listen or Emit Socket
// socketInstance.SocketHandler();

app.use(express.json());
app.use(cors());

// Endpoints
app.use("/api/v1/film", filmRoutes);
app.use(catchError);

server.listen(process.env.PORT, () => {
  console.log("Server is running on " + process.env.PORT);
});
