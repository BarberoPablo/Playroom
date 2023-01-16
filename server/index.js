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

/* 
users:{
  socketid:{
    id: "9woiuegn9342",
    username: "Player 1"
  },
  ...
}
*/
const users = {};
const matches = {};
const defaultRoom = "general";

io.on("connection", (socket) => {
  console.log(`USER CONNECTED: ${socket.id}`);
  socket.join(defaultRoom);

  //  User creation
  socket.on("new-username", (username) => {
    /* users[username] = socket.id; */
    const id = socket.id;
    users[id] = { username, id };
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
    socket.leave(defaultRoom);
    socket.join(room);
  });

  //  Online users
  socket.on("online-users", () => {
    io.sockets.to(socket.id).emit("online-users", users);
  });

  //  Challenge user
  socket.on("challenge-user", (game, challenged, username) => {
    //  Match creation
    const match = {
      turn: "x",
      //match.challenger.id + match.challenged.id
      room: socket.id + challenged.id,
      game,
      challenged: {
        id: challenged.id,
        username: challenged.username,
      },
      challenger: {
        id: socket.id,
        username,
      },
    };
    // Store match in matches
    matches[match.room] = match;
    io.to(challenged.id).emit("challenge-user", { ...match, me: "o" });
  });

  socket.on("challenge-denied", (match) => {
    io.to(match.challenger.id).emit("challenge-denied", match);
  });

  socket.on("challenge-accepted", (match) => {
    //  Tell challenger to connect to room and both users to join the new chat
    io.to(match.challenger.id).emit("join-playroom", match);
    io.to(match.challenger.id).to(match.challenged.id).emit("chatroom-connect", match.room);
  });

  socket.on("challenge-canceled", () => {
    let match = false;
    Object.keys(matches).forEach((matchId) => {
      match = matchId.includes(socket.id) ? matchId : false;
    });

    const challenged = matches[match].challenged.id;
    io.to(challenged).emit("close-modal");
  });

  //  TicTacToe events
  socket.on("play-again", (matchReset) => {
    //  Destroy previous match
    const room = matchReset.room;
    matches[room] = null;
    const theOtherPlayer =
      socket.id === matchReset.challenger.id ? matchReset.challenged.id : matchReset.challenger.id;

    //  Alert the other player that is ready
    io.to(theOtherPlayer).emit("wants-to-play-again");
    //  One more player is ready to play again
    io.to(room).emit("player-ready", matchReset); //HACER LA LOGICA EN EL CLIENTE
  });

  //  TicTacToe reset game
  socket.on("reset-game", (matchReset) => {
    io.to(matchReset.room).emit("client-reset-game", matchReset);
  });

  //  TicTacToe
  socket.on("update-server-game", (clientMatch, index) => {
    let serverMatch = matches[clientMatch.room];
    if (serverMatch === null) {
      serverMatch = clientMatch;
      matches[clientMatch.room] = clientMatch;
      //serverMatch = ...;
    }
    const newTurn = serverMatch?.turn === "x" ? "o" : "x";

    if (
      (serverMatch.turn === "x" && socket.id === serverMatch.challenger.id) ||
      (serverMatch.turn === "o" && socket.id === serverMatch.challenged.id)
    ) {
      serverMatch.turn = newTurn;
      //  Client to update match
      io.in(clientMatch.room).emit("update-client-game", serverMatch, index);
    }
  });

  //  Socket disconnect
  socket.on("disconnect", function () {
    //  Delete user from connected users

    delete users[socket.id];

    //  Stop user ongoing match
    const ongoingMatch = Object.keys(matches).find((match) => match.includes(socket.id));

    if (ongoingMatch) {
      const onlinePlayerId = ongoingMatch.replace(socket.id, "");
      //  send message to second user to disconnect from socket and destroy match
      delete matches[ongoingMatch];
      io.to(onlinePlayerId).emit("opponent-disconnected");
    }
    socket.broadcast.emit("new-online-user", users);
  });
});

server.listen(configuration.PORT);
console.log(`Listening on port ${configuration.PORT}`);
