import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "antd";
import ClockCircleOutlined from "@ant-design/icons/ClockCircleOutlined";
import { socket } from "../../configuration";
import "./Home.css";
import welcomeVideo from "../../assets/welcomeVideo.mp4";
import AvatarButton from "./components/AvatarButton";

const Home = () => {
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState(false);
  const [inputStatus, setInputStatus] = useState("");
  const [inputPrefix, setInputPrefix] = useState("");
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

  function handleSubmit(avatarClicked) {
    if (username !== "" && username !== "Please select a name" && username.length <= 20) {
      storage.setItem("username", username);
      storage.setItem("avatar", avatarClicked);

      socket.emit("new-username", username, avatarClicked, false);

      setNewUsername(!newUsername);
    } else {
      setUsername("Please select a name");
      setInputStatus("warning");
      setInputPrefix(<ClockCircleOutlined />);
    }
  }

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
          style={{ color: "red" }}
          status={inputStatus}
          prefix={inputPrefix}
        />
        <AvatarButton className="home-avatar-button" submit={handleSubmit} />
      </div>
    </div>
  );
};

export default Home;
