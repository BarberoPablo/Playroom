const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { Server: SocketServer } = require("socket.io");
const http = require("http");
const configuration = require("./config.js");
const mongoose = require("mongoose");
const CONNECTION_URL = `mongodb+srv://admin:aDqvIJdJh6GNfiBD@cluster0.dycq5dv.mongodb.net/test`;
const PORT = 3001;
mongoose
  .set("strictQuery", true)
  .connect(CONNECTION_URL)
  .then(() => console.log(`Server running on port ${PORT}`))
  .catch((error) => {
    console.log(error.message);
  });

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
const matches = {};

io.on("connection", (socket) => {
  console.log(`USER CONNECTED: ${socket.id}`);

  //  User creation
  socket.on("new-username", (username) => {
    users[username] = socket.id;
    socket.broadcast.emit("new-online-user", users);
  });

  //  Chat message
  socket.on("message", (message, username, room) => {
    const messageAndUser = { message, from: username };
    if (room === "") {
      io.sockets.emit("message", messageAndUser);
    } else {
      //socket.to(room).emit("message", messageAndUser); //Every Socket but this one
      io.sockets.to(room).emit("message", messageAndUser); //Every socket
    }
  });

  //  Join room
  socket.on("join-room", (room) => {
    socket.join(room);
  });

  //  Online users
  socket.on("online-users", () => {
    io.sockets.to(socket.id).emit("online-users", users);
  });

  //  Challenge user
  socket.on("challenge-user", (game, challenged, username) => {
    const challengedId = users[challenged];
    //  Match creation
    if (challengedId) {
      const match = {
        turn: "x",
        //match.challenger.id + match.challenged.id
        room: socket.id + challengedId,
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
      // Store match in matches
      matches[match.room] = match;
      io.to(challengedId).emit("challenge-user", { ...match, me: "o" });
    }
  });

  socket.on("challenge-denied", (match) => {
    io.to(match.challenger.id).emit("challenge-denied", match);
  });

  socket.on("challenge-accepted", (match) => {
    //  Connect challenged user to room
    //  Connect challenger user to room
    //  Say to both users to render the game
    socket.join(match.room);

    io.to(match.challenger.id).emit("join-playroom", match);

    io.to(match.challenger.id, socket.id).emit("play", match);
  });

  //  TicTacToe events
  socket.on("update-tictactoe", (message) => {
    socket.emit;
  });

  //  Socket disconnect
  socket.on("disconnect", function () {
    const username = Object.keys(users).find((user) => users[user] === socket.id);
    delete users[username];
    socket.broadcast.emit("new-online-user", users);
  });

  //  TicTacToe
  socket.on("update-game", (clientMatch, index) => {
    const serverMatch = matches[clientMatch.room];
    const newTurn = serverMatch?.turn === "x" ? "o" : "x";
    if (
      (serverMatch.turn === "x" && socket.id === serverMatch.challenger.id) ||
      (serverMatch.turn === "o" && socket.id === serverMatch.challenged.id)
    ) {
      serverMatch.turn = newTurn;
      //  Client to update match
      io.in(clientMatch.room).emit("update-game", serverMatch, index);
    }
  });
});

server.listen(configuration.PORT);
console.log(`Listening on port ${configuration.PORT}`);
