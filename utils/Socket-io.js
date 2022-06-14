const Posts = require("../models/Posts");
const {
  CREATE_POST,
  HAVE_NEW_POST,
  GET_ALL_POSTS,
} = require("../constants/socketTypes");

class Socket {
  constructor(server) {
    this.server = server;
    this.socketConnec = null;
  }

  initiSocketConnection() {
    const socketIo = require("socket.io")(this.server, {
      cors: {
        origin: process.env.FE_URL,
      },
    });
    this.socketConnec = socketIo;
  }

  // socket page cointelegraph
  SocketHandler() {
    this.socketConnec.on("connection", (socket) => {
      const room_name = socket.request.headers.referer;
      socket.join(room_name);

      socket.on(GET_ALL_POSTS, async () => {
        const post = await Posts.find({});
        socket.to(room_name).emit(HAVE_NEW_POST, post);
        // socket.emit(HAVE_NEW_POST, post);
      });

      // listen envent create new Post
      socket.on(CREATE_POST, async () => {
        const post = await Posts.find({});
        socket.to(room_name).emit(HAVE_NEW_POST, post);
        // socket.emit(HAVE_NEW_POST, post);
      });
    });
  }
}

module.exports = Socket;
