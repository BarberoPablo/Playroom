import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { message } from "antd";
import Square from "./components/Square";
import Button from "./components/Button";
import "../TicTacToe/index.css";
import { socket } from "../../configuration";

function TicTacToe({ match }) {
  const [squares, setSquares] = useState(Array(9).fill(""));
  const [winner, setWinner] = useState(null);
  const [clientMatch, setClientMatch] = useState(match);
  const [readyPlayers, setReadyPlayers] = useState(0);
  const [playAgain, setPlayAgain] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    //  Update game with server info
    const updateGame = (serverMatch, index) => {
      const updatedMatch = { ...clientMatch, turn: serverMatch.turn };
      setClientMatch(updatedMatch);
      updateSquares(index);
    };
    socket.on("update-client-game", updateGame);

    //  Play again
    const playerReady = (matchReset) => {
      setReadyPlayers(1);
    };
    socket.on("player-ready", playerReady);

    //  Reset game
    const resetMatch = (matchReset) => {
      setPlayAgain(false);
      setSquares(Array(9).fill(""));
      setWinner(null);
      const newMatch = { ...matchReset, me: clientMatch.me };
      setClientMatch(newMatch);
      messageApi.destroy();
      setReadyPlayers(0);
    };
    socket.on("client-reset-game", resetMatch);

    //  Other player wants to play again
    const playAgainAlert = () => {
      messageApi.open({
        type: "loading",
        content: (
          <div>
            The other player is ready to play again
            {/* <Button danger type="link" onClick={cancelChallenge}>
              Cancel
            </Button> */}
          </div>
        ),
        duration: 0,
      });
    };
    socket.on("wants-to-play-again", playAgainAlert);

    //  Component unmount
    return () => {
      socket.off("update-client-game", updateGame);
      socket.off("player-ready", playerReady);
      socket.off("client-reset-game", resetMatch);
      socket.off("wants-to-play-again", playAgainAlert);
    };
  }, [clientMatch]);

  const checkEndTheGame = () => {
    for (let square of squares) {
      if (!square) return false;
    }
    return true;
  };

  const checkWinner = () => {
    const combos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let combo of combos) {
      const [a, b, c] = combo;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const updateSquaresInServer = (index) => {
    if (squares[index] || winner) {
      return;
    }
    //console.log("click");
    if (clientMatch.turn === clientMatch.me) {
      socket.emit("update-server-game", clientMatch, index);
    }
  };

  const updateSquares = (ind) => {
    const s = squares;

    s[ind] = clientMatch.turn;
    setSquares(s);
    const W = checkWinner();
    if (W) {
      setWinner(W);
    } else if (checkEndTheGame()) {
      setWinner("x | o");
    }
  };

  const resetGame = () => {
    if (!playAgain) {
      setPlayAgain(true);
      const matchReset = { ...match, turn: "x" };

      if (readyPlayers === 1) {
        socket.emit("reset-game", matchReset);
      } else {
        socket.emit("play-again", matchReset);
        //RENDER WAITING FOR OTHER PLAYER ALERT
        messageApi.open({
          type: "loading",
          content: (
            <div>
              Waiting for to play again
              {/* <Button danger type="link" onClick={cancelChallenge}>
                Cancel
              </Button> */}
            </div>
          ),
          duration: 0,
        });
      }
    }
  };

  return (
    <div className="tic-tac-toe">
      <h1> TIC-TAC-TOE </h1>
      <h1> YOU ARE {clientMatch.me.toUpperCase()} </h1>
      <div className="game">
        {Array.from("012345678").map((ind) => (
          <Square
            match={match}
            key={ind}
            ind={ind}
            updateSquaresInServer={updateSquaresInServer}
            clsName={squares[ind]}
          />
        ))}
      </div>
      <div className={`turn ${clientMatch?.turn === "x" ? "left" : "right"}`}>
        <Square clsName="x" />
        <Square clsName="o" />
      </div>
      <AnimatePresence>
        {winner && (
          <motion.div
            key={"parent-box"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="winner"
          >
            <motion.div
              key={"child-box"}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="text"
            >
              <motion.h2
                initial={{ scale: 0, y: 100 }}
                animate={{
                  scale: 1,
                  y: 0,
                  transition: {
                    y: { delay: 0.7 },
                    duration: 0.7,
                  },
                }}
              >
                {winner === "x | o" ? "No Winner :/" : "The winner is:"}
              </motion.h2>
              <motion.div
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  transition: {
                    delay: 1.3,
                    duration: 0.2,
                  },
                }}
                className="win"
              >
                {winner === "x | o" ? (
                  <>
                    <Square clsName="x" />
                    <Square clsName="o" />
                  </>
                ) : (
                  <>
                    <Square clsName={winner} />
                  </>
                )}
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  transition: { delay: 1.5, duration: 0.3 },
                }}
              >
                <Button resetGame={resetGame} />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {contextHolder}
    </div>
  );
}

export default TicTacToe;
