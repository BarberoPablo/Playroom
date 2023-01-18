import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "antd";
import { socket } from "../../configuration";
import "./Home.css";
import welcomeVideo from "../../assets/welcomeVideo.mp4";

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
      socket.emit("new-username", username, false);

      setNewUsername(!newUsername);
    } else {
      setUsername("Please select a name");
    }
  };

  return (
    <div className="home-main">
      <video src={welcomeVideo} autoPlay muted>
        Your browser does not support the video tag.
      </video>

      <div className="home-content">
        <Input
          className="username"
          placeholder="Enter your username"
          showCount
          value={username}
          maxLength={20}
          autoFocus
          onChange={onChange}
          onPressEnter={handleSubmit}
        />
      </div>
    </div>
  );
};

export default Home;
