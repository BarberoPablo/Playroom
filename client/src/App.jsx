import { useState, useEffect } from "react";
import io from "socket.io-client";
import { configuration } from "./clientConfig";

//  socket is the bridge connection between the server and client
//const socket = io(configuration.WSSURL || "http://localhost:3001");
const socket = io("http://localhost:3001");

function App() {
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const receiveMessage = (messageAndUser) => {
      setMessages([...messages, messageAndUser]);
    };

    socket.on("message", receiveMessage);

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
    socket.emit("message", message, room);
    setMessage("");
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    socket.emit("join-room", room, (message) => {
      console.log("qq", message);
      setMessages([...messages, message]);
    });
  };

  return (
    <div>
      <form onSubmit={(e) => handleSubmitMessage(e)}>
        <input value={message} type="text" onChange={(e) => handleMessage(e)} />
        <button>Send</button>
      </form>

      <form onSubmit={(e) => handleJoinRoom(e)}>
        <input value={room} type="text" onChange={(e) => handleRoom(e)} />
        <button>Join</button>
      </form>

      {messages.length > 0 &&
        messages.map((message, index) => (
          <div key={index}>
            {message.from ? (
              <p>
                {message.from}: {message.message}
              </p>
            ) : (
              <p>{message}</p>
            )}
          </div>
        ))}
    </div>
  );
}

export default App;
