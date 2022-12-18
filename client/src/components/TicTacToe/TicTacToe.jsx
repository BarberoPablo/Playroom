import React, { useState, useEffect } from "react";
import { socket } from "../../configuration";

const TicTacToe = () => {
  const [users, setUsers] = useState([]);
  const storage = window.localStorage;

  useEffect(() => {
    socket.emit("online-users");
  }, []);

  socket.on("online-users", (users) => {
    //  Filter this user
    const allUsers = users.filter((user) => user !== storage.getItem("username"));
    setUsers(allUsers);
  });

  return (
    <div>
      <h1> Select a user to play with</h1>
      {users.length > 0 &&
        users.map((user) => {
          return <button key={user}> {user}</button>;
        })}
    </div>
  );
};

export default TicTacToe;
