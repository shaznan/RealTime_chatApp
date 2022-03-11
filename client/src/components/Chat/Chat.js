import React, { useState, useEffect } from "react";
import "./chat.css";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";

let socket;
const Chat = () => {
  const location = useLocation();
  const [userName, setUserName] = useState("");
  const [userRoom, setUserRoom] = useState("");
  const ENDPOINT = "http://localhost:8000/";

  const { name, room } = location.state;

  useEffect(() => {
    //establish connection to backend
    socket = io(ENDPOINT, { transports: ["websocket"] });
    setUserName(name);
    setUserRoom(room);

    //The second arguement is passing some props to socketio
    //Third arguement is for the callback in BE (for error handling)
    socket.emit("join", { name, room }, () => {});

    return () => {
      socket.emit("disconnect");
      //turn socket connection for this one person off
      socket.off();
    };
  }, [ENDPOINT, name, room]);

  return <div>Chat</div>;
};

export default Chat;
