import { io } from "socket.io-client";

const URL = process.env.REACT_APP_SERVER_URL || "http://localhost:4000";
const socket = io(URL, { autoConnect: false });

socket.onAny((event, ...args) => {
    console.log(event, args);
});

export default socket;