import React, { useState, useEffect } from "react";
import { Breadcrumb, Layout, Modal, theme } from "antd";
import Chat from "../Chat/Chat";
import { useNavigate } from "react-router-dom";
import TicTacToe from "../TicTacToe/TicTacToe";
import { socket } from "../../configuration";

const App = () => {
  const { Header, Content, Footer, Sider } = Layout;
  const [collapsed, setCollapsed] = useState(false);
  const [openChallengeModal, setOpenChallengeModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [match, setMatch] = useState({});

  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const storage = window.localStorage;

  let navigate = useNavigate();

  const games = [<TicTacToe />];
  const [renderGame, setRenderGame] = useState(-1);

  const handleUsernameChange = (e) => {
    e.preventDefault();
    storage.removeItem("username");
    navigate("/");
  };

  const handlePlayTicTacToe = (e) => {
    e.preventDefault();
    setRenderGame(0);
  };

  useEffect(() => {
    const challengeResponse = (match) => {
      console.log("You have been challenged", match);
      setMatch(match);
      //window.alert(`You have been challenged by: ${match.challenger.username} GAME: ${match.game}`);
      setModalText(`You have been challenged by: ${match.challenger.username} GAME: ${match.game}`);
      setOpenChallengeModal(true);
    };

    socket.on("challenge-user", challengeResponse);

    return () => {
      socket.off("challenge-user", challengeResponse);
    };
  }, []);

  const closeModal = () => {
    setOpenChallengeModal(false);
  };

  const acceptChallenge = () => {
    socket.emit("chellenge-accepted", match);
    setMatch({});
    setOpenChallengeModal(false);
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

          <button onClick={(e) => handlePlayTicTacToe(e)}> Play TicTacToe</button>
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
            {renderGame === -1 ? <h1>Select a game to play!</h1> : games[renderGame]}

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
