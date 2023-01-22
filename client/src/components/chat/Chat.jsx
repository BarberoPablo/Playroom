import { useState, useEffect } from "react";
import { Input } from "antd";
import "./Chat.css";
import { socket } from "../../configuration";
//  socket is the bridge connection between the server and client

function Chat() {
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("general");
  const storage = window.localStorage;
  const [username, setUsername] = useState(storage.getItem("username"));
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const receiveMessage = (messageAndUser) => {
      setMessages([...messages, messageAndUser]);
    };

    socket.on("message", receiveMessage);

    var chatHistory = document.getElementById("messageBody");
    chatHistory.scrollTop = chatHistory.scrollHeight;

    //  Connect to room when match starts
    const connectToRoom = (room) => {
      setRoom(room);
      //  Clear out all messages
      setMessages(["You are now connected to a different chat room"]);
    };

    socket.on("chatroom-connect", connectToRoom);

    //  Unmount component
    return () => {
      socket.off("message", receiveMessage);
      socket.off("chatroom-connect", connectToRoom);
    };
  }, [messages.length]);

  const handleMessage = (e) => {
    e.preventDefault();
    setMessage(e.target.value);
  };

  const handleSubmitMessage = (e) => {
    e.preventDefault();
    if (message !== "") {
      socket.emit("message", message, username, room);
      setMessage("");
    }
  };

  const inputStyle = (bottom) => {
    return {
      position: "absolute",
      left: 0,
      bottom,
      color: "black",
      background: "rgba(255, 255, 255, 0.6)",
    };
  };

  return (
    <div className="chat-conteiner">
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
        </form>
      </div>
    </div>
  );
}

export default Chat;
