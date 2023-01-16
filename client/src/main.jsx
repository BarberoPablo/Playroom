import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./components/app/App";
import Chat from "./components/Chat/Chat";
import Home from "./components/Home/Home";
import "./main.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<App />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
