import io from "socket.io-client";

export const configuration = {
  //WSSURL: "http://localhost:3001",
  //WSSURL: "https://playroom-production.up.railway.app/",
  WSSURL: "https://playroom-psi.vercel.app/",
};

export const socket = io(configuration.WSSURL);
