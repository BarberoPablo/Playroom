import React, { useState, useEffect } from "react";
import { Breadcrumb, Layout, Modal, theme, message, Button } from "antd";
import Chat from "../Chat/Chat";
import { useNavigate } from "react-router-dom";
import TicTacToe from "../TicTacToe/TicTacToe";
import { socket } from "../../configuration";
import iceCreams from "../../assets/helados.png";
import "./App.css";

const App = () => {
  const { Header, Content, Footer, Sider } = Layout;
  const [collapsed, setCollapsed] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [openChallengeModal, setOpenChallengeModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [challengeUserButton, setChallengeUserButton] = useState(true);
  const [match, setMatch] = useState({});
  const [gameSelected, setGameSelected] = useState(undefined);
  const [pendingResponse, setPendingResponse] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [renderGame, setRenderGame] = useState("");
  const storage = window.localStorage;

  let navigate = useNavigate();
  const games = {
    TicTacToe: <TicTacToe match={match} />,
    Tetris: <div> hola </div>,
  };

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const handleUsernameChange = (e) => {
    e.preventDefault();
    storage.removeItem("username");
    navigate("/");
  };

  //  ONLINE USERS
  useEffect(() => {
    //  Online users
    socket.emit("online-users");

    const getOnlineUsers = (users) => {
      const usersOnline = Object.keys(users).filter((user) => user !== storage.getItem("username"));
      setOnlineUsers(usersOnline);
    };

    socket.on("online-users", getOnlineUsers);

    //  New online user
    const allUsers = (message) => {
      setOnlineUsers(message);
    };
    socket.on("new-online-user", allUsers);

    //  Unmount component
    return () => {
      socket.off("online-users", getOnlineUsers);
      socket.off("new-online-user", allUsers);
    };
  }, [onlineUsers.length]);

  //  CHALLENGES
  useEffect(() => {
    //  Challenge user
    const incomingChallenge = (match) => {
      //  Match with room
      setMatch(match);
      setModalText(
        `The player ${match.challenger.username} has challenge you to a game of ${match.game}`
      );
      setOpenChallengeModal(true);
    };

    //  Cancel challenge
    const cancelChallenge = () => {
      setOpenChallengeModal(false);
    };

    socket.on("close-modal", cancelChallenge);

    socket.on("challenge-user", incomingChallenge);

    const joinPlaroom = (incomingMatch) => {
      //  Connect to room after challenge is accepted
      //  Challenger now has access the match
      const challangerMatch = { ...incomingMatch, me: "x" };
      setMatch(challangerMatch);
      socket.emit("join-room", incomingMatch.room);
      setRenderGame(incomingMatch.game);
    };

    socket.on("join-playroom", joinPlaroom);

    //  Denied
    const challengeDenied = (match) => {
      messageApi.destroy();
      setPendingResponse(false);
      messageApi.open({
        type: "error",
        content: `${match.challenged.username} doesn't want to play ${match.game}`,
      });
    };

    socket.on("challenge-denied", challengeDenied);

    //  Unmount component
    return () => {
      socket.off("challenge-user", incomingChallenge);
      socket.off("close-modal", cancelChallenge);
      socket.off("join-playroom", joinPlaroom);
      socket.off("challenge-denied", challengeDenied);
    };
  }, []);

  //  RENDER GAME
  useEffect(() => {
    const renderVideogame = (match) => {
      setRenderGame(match.game);
    };

    if (match?.game) {
      socket.on("play", renderVideogame);
    }

    //  Unmount component
    return () => {
      socket.off("play", renderVideogame);
    };
  }, [renderGame]);

  const closeModal = () => {
    setOpenChallengeModal(false);
    socket.emit("challenge-denied", match);
  };

  const acceptChallenge = () => {
    socket.emit("join-room", match.room);
    socket.emit("challenge-accepted", match);

    setOpenChallengeModal(false);
    setRenderGame(match.game);
  };

  const handlePlayGame = (e) => {
    e.preventDefault();
    setChallengeUserButton(false);
    setGameSelected(e.target.innerHTML);
  };

  const cancelChallenge = (e) => {
    e.preventDefault();
    messageApi.destroy();
    setPendingResponse(false);
    socket.emit("challenge-canceled");
  };

  const handleChallengeUser = (e) => {
    if (!pendingResponse) {
      e.preventDefault();
      socket.emit("challenge-user", gameSelected, e.target.value, storage.getItem("username"));
      setPendingResponse(true);
      messageApi.open({
        type: "loading",
        content: (
          <div>
            Waiting for {e.target.value} to respond...
            <Button danger type="link" onClick={cancelChallenge}>
              Cancel
            </Button>
          </div>
        ),
        duration: 0,
      });
    }
  };

  return (
    <Layout
      className="wata"
      style={{
        minHeight: "100vh",
      }}
    >
      <Sider
        style={{ position: "relative", color: "white" }}
        /* collapsible */
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <Chat />
      </Sider>

      <Layout className="site-layout">
        <Header
          className="site-header"
          style={{
            background: (0, 0, 0, 0.5),
            borderBottom: "black dotted",
            //width: "100% ",
          }}
        >
          <button onClick={(e) => handleUsernameChange(e)}> Change username</button>
          <button> Profile</button>
          <button> Achievements</button>
          <button> Logout</button>
        </Header>
        <Content
          className="site-content"
          style={{
            margin: "0 16px",
          }}
        >
          <Breadcrumb
            style={{
              margin: "16px 0",
            }}
          />
          <div
            style={{
              padding: 24,
              minHeight: 360,
              //background: colorBgContainer,
            }}
          >
            {renderGame ? (
              games[renderGame]
            ) : (
              <div>
                <h1>Select a game to play!</h1>
                {Object.keys(games).length > 0 &&
                  Object.keys(games).map((game) => (
                    <button key={game} onClick={(e) => handlePlayGame(e)}>
                      {game}
                    </button>
                  ))}
                <h1>Challenge a user!</h1>
                {
                  //challengeUserButton
                  onlineUsers.length > 0 &&
                    onlineUsers.map((user) => {
                      return (
                        <button
                          disabled={challengeUserButton}
                          key={user}
                          value={user}
                          onClick={(e) => handleChallengeUser(e)}
                        >
                          {user}
                        </button>
                      );
                    })
                }
                {contextHolder}
              </div>
            )}

            <Modal
              title="You have been challenged!"
              open={openChallengeModal}
              onOk={acceptChallenge}
              onCancel={closeModal}
            >
              <p>{modalText}</p>
            </Modal>
          </div>
        </Content>
        <Footer
          className="site-footer"
          style={{
            textAlign: "center",
            background: (0, 0, 0, 0.5),
          }}
        >
          Created by Pablo Barbero
        </Footer>
      </Layout>
    </Layout>
  );
};
export default App;
