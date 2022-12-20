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

/* users:
  { "username1": "socket1", "username2": "socket2", "username3": "socket3",}
*/
const users = {};

io.on("connection", (socket) => {
  console.log(`USER CONNECTED: ${socket.id}`);

  socket.on("new-username", (username) => {
    users[username] = socket.id;
    socket.broadcast.emit("new-online-user", users);
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
    io.sockets.to(socket.id).emit("online-users", users);
  });

  //  Challenge user
  socket.on("challenge-user", (game, challenged, username) => {
    const challengedId = users[challenged];

    if (challengedId) {
      const match = {
        game,
        challenged: {
          id: challengedId,
          username: challenged,
        },
        challenger: {
          id: socket.id,
          username,
        },
      };
      //socket.emit("challenge-user", match);
      io.to(challengedId).emit("challenge-user", match);
    }
  });

  socket.on("chellenge-accepted", (match) => {
    //  Conectar ambos usuarios a una room, mandar un mensaje para que se redireccionen al juego
    //  ahora el chat es solo entre ellos dos
  });
  /* //  TicTacToe events
  socket.on("update-tictactoe", (message) => {
    socket.emit
  }); */

  //  Socket disconnect
  socket.on("disconnect", function () {
    const username = Object.keys(users).find((user) => users[user] === socket.id);
    delete users[username];
    socket.broadcast.emit("new-online-user", users);
  });
});

server.listen(configuration.PORT);
console.log(`Listening on port ${configuration.PORT}`);
