import React, { useState, useEffect } from "react";
import { Breadcrumb, Layout, Modal, theme, message, Button } from "antd";
import Chat from "../chat/Chat";
import { useNavigate } from "react-router-dom";
import TicTacToe from "../TicTacToe/TicTacToe";
import { socket } from "../../configuration";
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

  /* useEffect(() => {
    const username = storage.getItem("username");

    if (!username) {
      navigate("/");
    } else {
      socket.emit("new-username", username);
    }
  }, []); */

  //  ONLINE USERS
  useEffect(() => {
    //  Online users
    socket.emit("online-users");

    const getOnlineUsers = (users) => {
      const myUsername = storage.getItem("username");
      const usersOnline = [];
      for (const user in users) {
        if (users[user].username !== myUsername) {
          usersOnline.push(users[user]);
        }
      }
      setOnlineUsers(usersOnline);
    };

    socket.on("online-users", getOnlineUsers);

    //  New online user
    const allUsers = (users) => {
      setOnlineUsers(users);
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

    socket.on("challenge-user", incomingChallenge);

    //  Cancel challenge
    const cancelChallenge = () => {
      setOpenChallengeModal(false);
    };

    socket.on("close-modal", cancelChallenge);

    const joinPlaroom = (incomingMatch) => {
      //  Challenger now has access the match and connects to room
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

    //  User disconnected, destroy match
    const destroyMatchAndGoBackHome = () => {
      //  If there are any previous alerts, destroy them and show a new one
      messageApi.destroy();
      message.destroy();
      setMatch({});

      message.loading("Opponent has disconnected from the game. Reloading menu...", 6);
      setTimeout(function () {
        location.reload();
      }, 5800);
    };

    socket.on("opponent-disconnected", destroyMatchAndGoBackHome);

    //  Other player wants to play again
    const playAgainAlert = () => {
      messageApi.destroy();
      message.loading("The other player is ready to play again", 0);
    };

    socket.on("wants-to-play-again", playAgainAlert);

    //  Destroy alerts before new game
    const destroyAlerts = () => {
      message.destroy();
    };
    socket.on("client-reset-game", destroyAlerts);

    //  Unmount component
    return () => {
      socket.off("challenge-user", incomingChallenge);
      socket.off("close-modal", cancelChallenge);
      socket.off("join-playroom", joinPlaroom);
      socket.off("challenge-denied", challengeDenied);
      socket.off("opponent-disconnected", destroyMatchAndGoBackHome);
      socket.off("wants-to-play-again", playAgainAlert);
      socket.off("client-reset-game", destroyAlerts);
    };
  }, []);

  const closeModal = () => {
    setOpenChallengeModal(false);
    socket.emit("challenge-denied", match);
  };

  const acceptChallenge = () => {
    //  Connect to room and tell challenger to connect to room
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

  const handleChallengeUser = (e, user) => {
    e.preventDefault();
    if (!pendingResponse) {
      socket.emit("challenge-user", gameSelected, user, storage.getItem("username"));
      setPendingResponse(true);
      messageApi.open({
        type: "loading",
        content: (
          <div>
            Waiting for {user.username} to respond...
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
          <button disabled={renderGame} onClick={(e) => handleUsernameChange(e)}>
            Change username
          </button>
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
                          key={user.id}
                          value={user.username}
                          onClick={(e) => handleChallengeUser(e, user)}
                        >
                          {user.username}
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
