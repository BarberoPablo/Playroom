import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "antd";
import "./Home.css";
import { socket } from "../../configuration";

const Home = () => {
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState(false);
  const storage = window.localStorage;
  let navigate = useNavigate();

  useEffect(() => {
    const user = storage.getItem("username");
    if (user) {
      navigate("/play");
    }
  }, [newUsername]);

  const onChange = (e) => {
    setUsername(e.target.value);
  };

  const handleSubmit = () => {
    if (username !== "" && username !== "Please select a name" && username.length <= 20) {
      storage.setItem("username", username);
      socket.emit("new-username", username);

      setNewUsername(!newUsername);
    } else {
      setUsername("Please select a name");
    }
  };

  return (
    <div className="home-conteiner">
      <Input
        className="username"
        placeholder="Enter your username"
        showCount
        value={username}
        maxLength={20}
        onChange={onChange}
        onPressEnter={handleSubmit}
      />
    </div>
  );
};

export default Home;
