import React, { useState, useEffect } from "react";
import { Breadcrumb, Layout, Modal, theme, message } from "antd";
import Chat from "../Chat/Chat";
import { useNavigate } from "react-router-dom";
import TicTacToe from "../TicTacToe/TicTacToe";
import { socket } from "../../configuration";

const App = () => {
  const { Header, Content, Footer, Sider } = Layout;
  const [collapsed, setCollapsed] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [openChallengeModal, setOpenChallengeModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [challengeUserButton, setChallengeUserButton] = useState(true);
  const [match, setMatch] = useState({});
  const games = ["TicTacToe", "Tetris"];
  const [gameSelected, setGameSelected] = useState(undefined);
  const [pendingResponse, setPendingResponse] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const storage = window.localStorage;

  let navigate = useNavigate();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const handleUsernameChange = (e) => {
    e.preventDefault();
    storage.removeItem("username");
    navigate("/");
  };

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
    return () => {
      socket.off("online-users", getOnlineUsers);
      socket.off("new-online-user", allUsers);
    };
  }, [onlineUsers.length]);

  useEffect(() => {
    //  Challenge user
    const incomingChallenge = (match) => {
      setMatch(match);
      setModalText(`You have been challenged by ${match.challenger.username} to a game of ${match.game}`);
      setOpenChallengeModal(true);
    };

    socket.on("challenge-user", incomingChallenge);

    //  Connect to room after challenge is accepted
    const joinPlaroom = (room) => {
      socket.emit("join-room", room);
    };

    socket.on("join-playroom", joinPlaroom);

    //  Prueba
    const msg = (message) => {
      console.log(message);
    };

    socket.on("prueba", msg);

    return () => {
      socket.off("join-playroom", joinPlaroom);
      socket.off("prueba", msg);
      socket.off("challenge-user", incomingChallenge);
    };
  }, []);

  const closeModal = () => {
    setOpenChallengeModal(false);
    setMatch({});
  };

  const acceptChallenge = () => {
    const room = match.challenger.id + match.challenged.id;

    socket.emit("join-room", room);
    socket.emit("challenge-accepted", room, match.challenger.id);

    setMatch({});
    setOpenChallengeModal(false);
  };

  const handlePlayGame = (e) => {
    e.preventDefault();
    setChallengeUserButton(false);
    setGameSelected(e.target.innerHTML);
  };

  const handleChallengeUser = (e) => {
    if (!pendingResponse) {
      e.preventDefault();
      console.log(`You "${storage.getItem("username")}" have chellenged:`, e.target.value);
      socket.emit("challenge-user", gameSelected, e.target.value, storage.getItem("username"));
      setPendingResponse(true);
      //loading popup message:
      console.log(match);
      messageApi.open({
        type: "loading",
        content: `Waiting for ${e.target.value} to respond...`,
        duration: 0,
      });
    }
  };

  useEffect(() => {
    //  Challenge user
    const challengeResponse = (match) => {
      messageApi.destroy;
      setPendingResponse(true);
      setMatch(match);
      setModalText(`You have been challenged by ${match.challenger.username} to a game of ${match.game}`);
      setOpenChallengeModal(true);
    };

    socket.on("challenge-response", challengeResponse);

    return () => {
      socket.off("challenge-response", challengeResponse);
    };
  }, [pendingResponse]);

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
            {
              <div>
                <h1>Select a game to play!</h1>
                {games.length > 0 &&
                  games.map((game) => (
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
            }

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
