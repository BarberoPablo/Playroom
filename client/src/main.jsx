import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./components/app/App";
import Chat from "./components/chat/Chat";
import Home from "./components/home/Home";
import "./main.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/play" element={<App />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  </BrowserRouter>
);
