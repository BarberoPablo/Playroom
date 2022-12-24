import React, { useState, useEffect } from "react";
import { Breadcrumb, Layout, Modal, theme, message } from "antd";
import Chat from "../Chat/Chat";
import { useNavigate } from "react-router-dom";
import TicTacToe from "../TicTacToe/TicTacToe";
import { socket } from "../../configuration";

const App = () => {
  const { Header, Content, Footer, Sider } = Layout;
  //const games = ["TicTacToe", "Tetris"];
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
      setMatch(match);
      setModalText(`The player ${match.challenger.username} has challenge you to a game of ${match.game}`);
      setOpenChallengeModal(true);
    };

    socket.on("challenge-user", incomingChallenge);

    //  Connect to room after challenge is accepted
    const joinPlaroom = (room, match) => {
      //  Challenger now has access the match
      setMatch(match);
      socket.emit("join-room", room);
      setRenderGame(match.game);
    };

    socket.on("join-playroom", joinPlaroom);

    //  Denied
    const challengeDenied = (match) => {
      setMatch(match);
      messageApi.destroy();
      setPendingResponse(false);
      messageApi.open({
        type: "error",
        content: `${match.challenged.username} doesn't want to play ${match.game}`,
      });
    };

    socket.on("challenge-denied", challengeDenied);

    //  Prueba
    const msg = (message) => {
      console.log(message);
    };

    socket.on("prueba", msg);

    return () => {
      socket.off("join-playroom", joinPlaroom);
      socket.off("prueba", msg);
      socket.off("challenge-user", incomingChallenge);
      socket.off("challenge-denied", challengeDenied);
    };
  }, []);

  //  RENDER GAME
  useEffect(() => {
    const renderVideogame = (room, match) => {
      setRenderGame(match.game);
    };

    if (match?.game) {
      console.log("Aceptó, vamos a jugar");
      socket.on("play", renderVideogame);
    }

    return () => {
      socket.off("play", renderVideogame);
    };
  }, [renderGame]);

  const closeModal = () => {
    setOpenChallengeModal(false);
    socket.emit("challenge-denied", match);
    //setMatch({});
  };

  const acceptChallenge = () => {
    const room = match.challenger.id + match.challenged.id;

    socket.emit("join-room", room);
    console.log("le mando el match", match);
    socket.emit("challenge-accepted", room, match);
    //socket.emit("challenge-accepted", { room, match });

    setOpenChallengeModal(false);
    setRenderGame(match.game);
  };

  const handlePlayGame = (e) => {
    e.preventDefault();
    setChallengeUserButton(false);
    setGameSelected(e.target.innerHTML);
  };

  const handleChallengeUser = (e) => {
    if (!pendingResponse) {
      e.preventDefault();
      socket.emit("challenge-user", gameSelected, e.target.value, storage.getItem("username"));
      setPendingResponse(true);
      messageApi.open({
        type: "loading",
        content: `Waiting for ${e.target.value} to respond...`,
        duration: 0,
      });
    }
  };

  return (
    <Layout
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
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        >
          <button onClick={(e) => handleUsernameChange(e)}> Change username</button>
          <button> Profile</button>
          <button> Achievements</button>
          <button> Logout</button>
        </Header>
        <Content
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
              background: colorBgContainer,
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
          style={{
            textAlign: "center",
          }}
        >
          Ant Design ©2018 Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};
export default App;
