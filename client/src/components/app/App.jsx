import React, { useState, useEffect } from "react";
import { Layout, Modal, theme, message, Button, Tooltip, Space, Card } from "antd";
import { UserOutlined, GithubOutlined, LinkedinOutlined } from "@ant-design/icons";
import Chat from "../chat/Chat";
import { useNavigate } from "react-router-dom";
import TicTacToe from "../TicTacToe/TicTacToe";
import { socket } from "../../configuration";
import "./App.css";
import UserCard from "../../assets/Avatars/UserCard";

const App = () => {
  const { Header, Content, Footer, Sider } = Layout;
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [openChallengeModal, setOpenChallengeModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [match, setMatch] = useState({});
  const [gameSelected, setGameSelected] = useState(undefined);
  const [pendingResponse, setPendingResponse] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [renderGame, setRenderGame] = useState("");
  const storage = window.localStorage;
  const username = storage.getItem("username");
  const avatar = storage.getItem("avatar");
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

  useEffect(() => {
    if (!username) {
      navigate("/");
    } else {
      socket.emit("new-username", username, avatar, false);
    }
  }, []);

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
      console.log("viene", match);
      setMatch(match);
      setModalText(
        `The player ${match.challenger.username} has challenge you to a game of ${match.game}`
      );
      setOpenChallengeModal(true);
    };

    socket.on("challenge-user", incomingChallenge);

    //  Challenge CANCELED
    const cancelChallenge = () => {
      setOpenChallengeModal(false);
    };

    socket.on("close-modal", cancelChallenge);

    //  Challenged ACCEPTED
    const joinPlaroom = (incomingMatch) => {
      socket.emit("join-room", incomingMatch.room);

      socket.emit("new-username", username, avatar, true);

      setRenderGame(incomingMatch.game);
    };

    socket.on("join-playroom", joinPlaroom);

    //  Challenge DENIED
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
    setModalText({});
    setOpenChallengeModal(false);
    socket.emit("challenge-denied", match);
  };

  const acceptChallenge = () => {
    //  Connect to room and tell challenger to connect to room
    socket.emit("join-room", match.room);
    socket.emit("challenge-accepted", match);
    //  User now is playing, change state in server
    socket.emit("new-username", username, avatar, true);

    setOpenChallengeModal(false);
    setRenderGame(match.game);
  };

  const handlePlayGame = (e) => {
    e.preventDefault();
    setGameSelected(e.target.innerHTML);
  };

  const cancelChallenge = (e) => {
    e.preventDefault();
    setMatch({});
    messageApi.destroy();
    setPendingResponse(false);
    socket.emit("challenge-canceled");
  };

  const handleChallengeUser = (e, user) => {
    e.preventDefault();
    if (gameSelected) {
      if (!pendingResponse) {
        //  Match creation
        const newMatch = {
          turn: "x",
          room: socket.id + user.id,
          game: gameSelected,
          challenged: {
            id: user.id,
            username: user.username,
          },
          challenger: {
            id: socket.id,
            username: storage.getItem("username"),
          },
          me: "x",
        };
        setMatch(newMatch);

        socket.emit("challenge-user", newMatch);

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
    } else {
      message.error("First select a game to play!", 2.5);
    }
  };

  return (
    <Layout
      className="wata"
      style={{
        minHeight: "100vh",
      }}
    >
      <Sider style={{ position: "relative", color: "white", backgroundColor: "#3D518C" }}>
        <Chat />
      </Sider>

      <Layout className="site-layout">
        <Header
          className="site-header"
          style={{
            //background: (100, 100, 100, 0.5),
            backgroundColor: "transparent",
            width: "100% ",
          }}
        >
          <UserCard
            user={{ username: storage.getItem("username"), avatar: storage.getItem("avatar") }}
            size={90.5}
            me={true}
          />

          <Tooltip title="Change username">
            <Button
              disabled={renderGame}
              type="default"
              icon={<UserOutlined />}
              onClick={(e) => handleUsernameChange(e)}
            >
              {/* primary ghost dashed link text default */}
              {username}
            </Button>
          </Tooltip>
        </Header>
        <Content
          className="site-content"
          style={{
            margin: "0 16px",
          }}
        >
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
                <Space direction="vertical" size="large" className="Space">
                  <Card size="small" className="Card">
                    <div className="game-section">
                      <h1>Select a game to play!</h1>
                      {Object.keys(games).length > 0 &&
                        Object.keys(games).map((game) => (
                          <button key={game} onClick={(e) => handlePlayGame(e)}>
                            {game}
                          </button>
                        ))}
                    </div>
                  </Card>

                  <Card size="large" className="Card">
                    <div className="online-users-section">
                      <h1>Challenge a user!</h1>
                      {onlineUsers.length > 0 &&
                        onlineUsers.map((user) => {
                          return (
                            !user.isPlaying && (
                              <UserCard
                                user={user}
                                key={user.id}
                                size={180}
                                click={handleChallengeUser}
                              />
                            )
                          );
                        })}
                    </div>
                  </Card>

                  {onlineUsers.length !== 0 && (
                    <Card className="Card" size="">
                      <div className="playing-users-section">
                        <h1>Users already playing</h1>
                        {onlineUsers.length > 0 &&
                          onlineUsers.map((user) => {
                            return (
                              user.isPlaying && (
                                <UserCard
                                  user={user}
                                  key={user.id + 1}
                                  size={90}
                                  click={handleChallengeUser}
                                  me={true}
                                />
                              )
                            );
                          })}
                      </div>
                    </Card>
                  )}

                  {contextHolder}
                </Space>
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
          <GithubOutlined style={{ fontSize: "25px" }} />{" "}
          <LinkedinOutlined style={{ fontSize: "25px" }} />
          Created by Pablo Barbero
        </Footer>
      </Layout>
    </Layout>
  );
};
export default App;
