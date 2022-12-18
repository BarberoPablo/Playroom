import io from "socket.io-client";

export const configuration = {
  WSSURL: "http://localhost:3001",
};

export const socket = io(configuration.WSSURL);
