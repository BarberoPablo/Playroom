const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { Server: SocketServer } = require("socket.io");
const http = require("http");
const configuration = require("./config.js");

//  Convierto la aplicacion de express en un servidor http y lo recibe el wss
const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    /* origin: "http://localhost:5173" */
    origin: "*",
  },
});

app.use(cors());
app.use(morgan("dev"));

io.on("connection", (socket) => {
  //console.log(`USER CONNECTED: ${socket.id}`);

  socket.on("message", (message, room) => {
    const messageAndUser = { message, from: socket.id };
    if (room === "") {
      io.sockets.emit("message", messageAndUser);
    } else {
      //socket.to(room).emit("message", messageAndUser); //Every Socket but this one
      io.sockets.to(room).emit("message", messageAndUser); //Every socket
    }
  });

  socket.on("join-room", (room, cb) => {
    socket.join(room);
    cb(`Joined room "${room}"`);
  });
});

server.listen(configuration.PORT);
console.log(`Listening on port ${configuration.PORT}`);
