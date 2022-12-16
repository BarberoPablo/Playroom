import { useState, useEffect } from "react";
import io from "socket.io-client";
import { Input } from "antd";
import "./Chat.css";

//  socket is the bridge connection between the server and client
//const socket = io(configuration.WSSURL || "http://localhost:3001");
const socket = io("http://localhost:3001");

function Chat() {
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const receiveMessage = (messageAndUser) => {
      setMessages([...messages, messageAndUser]);
    };

    socket.on("message", receiveMessage);

    var chatHistory = document.getElementById("messageBody");
    chatHistory.scrollTop = chatHistory.scrollHeight;

    return () => {
      socket.off("message", receiveMessage);
    };
  }, [messages.length]);

  const handleMessage = (e) => {
    e.preventDefault();
    setMessage(e.target.value);
  };

  const handleRoom = (e) => {
    e.preventDefault();
    setRoom(e.target.value);
  };

  const handleSubmitMessage = (e) => {
    e.preventDefault();
    if (message !== "") {
      socket.emit("message", message, room);
      setMessage("");
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (room !== "") {
      socket.emit("join-room", room, (message) => {
        setMessages([...messages, message]);
      });
    }
  };

  const inputStyle = (bottom) => {
    return {
      position: "absolute",
      left: 0,
      bottom,
      color: "red",
      background: "rgba(255, 255, 255, 0.6)",
    };
  };

  return (
    <div className="conteiner">
      <div className="messages" id="messageBody">
        {messages.length > 0 &&
          messages.map((message, index) => (
            <p key={index}>{message.from ? `${message.from}: ${message.message}` : `${message}`}</p>
          ))}
      </div>

      <div>
        <form onSubmit={(e) => handleSubmitMessage(e)}>
          <Input
            className="messageInput"
            placeholder="Send message"
            style={inputStyle(50)}
            value={message}
            type="text"
            onChange={(e) => handleMessage(e)}
          />
          {/* <input value={message} type="text" onChange={(e) => handleMessage(e)} /> */}
          {/* <button>Send</button> */}
        </form>

        <form onSubmit={(e) => handleJoinRoom(e)}>
          <Input
            className="roomInput"
            placeholder="Join room"
            style={inputStyle(90)}
            value={room}
            type="text"
            onChange={(e) => handleRoom(e)}
          />
          {/* <input value={room} type="text" onChange={(e) => handleRoom(e)} /> */}
          {/* <button>Join</button> */}
        </form>
      </div>
    </div>
  );
}

export default Chat;
