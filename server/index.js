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

const users = {};

io.on("connection", (socket) => {
  console.log(`USER CONNECTED: ${socket.id}`);
  users[socket.id] = undefined;

  socket.on("new-username", (username) => {
    users[socket.id] = username;
  });

  socket.on("message", (message, username, room) => {
    const messageAndUser = { message, from: username };
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

  socket.on("online-users", () => {
    io.sockets.to(socket.id).emit("online-users", Object.values(users));
  });

  socket.on("disconnect", function () {
    delete users[socket.id];
    console.log("remaining users:", users);
  });
});

server.listen(configuration.PORT);
console.log(`Listening on port ${configuration.PORT}`);
