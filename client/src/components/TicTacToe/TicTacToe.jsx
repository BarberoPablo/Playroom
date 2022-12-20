import React, { useState, useEffect } from "react";
import { socket } from "../../configuration";

const TicTacToe = () => {
  const [users, setUsers] = useState([]);
  const storage = window.localStorage;

  useEffect(() => {
    socket.emit("online-users");

    const getOnlineUsers = (users) => {
      const allUsernames = Object.keys(users).filter((user) => user !== storage.getItem("username"));
      setUsers(allUsernames);
    };

    const challengeResponse = (match) => {
      console.log("You have been challenged", match);
      window.alert(`You have been challenged by: ${match.challenger.username}`);
    };

    socket.on("online-users", getOnlineUsers);

    return () => {
      socket.off("online-users", getOnlineUsers);
    };
  }, []);

  const handleChallengeUser = (e) => {
    e.preventDefault();
    socket.emit("challenge-user", "TicTacToe", e.target.value, storage.getItem("username"));
    console.log(`You "${storage.getItem("username")}" have chellenged:`, e.target.value);
  };

  return (
    <div>
      <h1> Select a user to play with</h1>
      {users.length > 0 &&
        users.map((user) => {
          return (
            <button key={user} value={user} onClick={(e) => handleChallengeUser(e)}>
              {user}
            </button>
          );
        })}
    </div>
  );
};

export default TicTacToe;
