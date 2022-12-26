import React, { useState, useEffect } from "react";
import { socket } from "../../configuration";

const TicTacToe = ({ match }) => {
  const [number, setNumber] = useState(0);

  useEffect(() => {
    const newNumber = (response) => {
      console.log("Se toco un boton");
      setNumber(response);
    };

    socket.on("button", newNumber);

    return () => {
      socket.off("button", newNumber);
    };
  }, []);

  const handleClick = (e, operation) => {
    e.preventDefault();
    //setNumber(number + 1);
    socket.emit("button", { number, operation, room: match.room });
  };

  return (
    <div>
      <h1>{number} </h1>
      <button onClick={(e) => handleClick(e, "suma")}>Sumar</button>
      <button onClick={(e) => handleClick(e, "resta")}>Restar</button>
    </div>
  );
};

export default TicTacToe;
