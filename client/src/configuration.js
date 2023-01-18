import io from "socket.io-client";

export const configuration = {
  //WSSURL: "http://localhost:3001",
  //WSSURL: "https://playroom-psi.vercel.app/",

  WSSURL: "https://playroom-production.up.railway.app/",
};

export const socket = io(configuration.WSSURL);
