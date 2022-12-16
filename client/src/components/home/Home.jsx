import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "antd";
import "./Home.css";

const Home = () => {
  const { TextArea } = Input;
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState(false);
  const storage = window.localStorage;
  let navigate = useNavigate();

  useEffect(() => {
    const user = storage.getItem("username");
    console.log(user);
    if (user) {
      console.log("Su usuario es: ", user);
      navigate("/play");
    }
  }, [newUsername]);

  const onChange = (e) => {
    setUsername(e.target.value);
  };

  const handleSubmit = () => {
    if (username !== "" && username !== "Nice try" && username.length <= 20) {
      storage.setItem("username", username);
      console.log("Username: ", storage.getItem("username"));
      setNewUsername(!newUsername);
    } else {
      setUsername("Nice try");
    }
  };

  return (
    <div className="conteiner">
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
