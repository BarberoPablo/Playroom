import React, { useState, useEffect } from "react";
import { useInsertionEffect } from "react";
import { socket } from "../../configuration";

const TicTacToe = () => {
  const [users, setUsers] = useState([]);
  const [change, setChange] = useState(false);
  const storage = window.localStorage;

  useEffect(() => {
    socket.emit("online-users");

    const getOnlineUsers = (users) => {
      const allUsernames = Object.keys(users).filter((user) => user !== storage.getItem("username"));
      setUsers(allUsernames);
    };
    const challengeResponse = (match) => {
      console.log("Challenged", match);
    };

    socket.on("online-users", getOnlineUsers);

    socket.on("challenge-user", challengeResponse);

    return () => {
      socket.off("online-users", getOnlineUsers);
      socket.off("online-users", challengeResponse);
    };
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    console.log("Emit challenge", e.target.value, storage.getItem("username"));
    socket.emit("challenge-user", e.target.value, storage.getItem("username"));
  };

  return (
    <div>
      <h1> Select a user to play with</h1>
      {users.length > 0 &&
        users.map((user, index) => {
          return (
            <button key={user} value={user} onClick={(e) => handleClick(e)}>
              {user}
            </button>
          );
        })}

      {change && <div>CAMBIO </div>}
    </div>
  );
};

export default TicTacToe;
