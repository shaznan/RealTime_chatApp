import React, { useState, useEffect } from "react";
import "./chat.css";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";

// NOTE:
// 1) emit => Sending message
// 2) on => Listening for message

let socket;
const Chat = () => {
  const location = useLocation();
  const [userName, setUserName] = useState("");
  const [userRoom, setUserRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const ENDPOINT = "http://localhost:8000/";

  //establish connection to backend
  const { name, room } = location.state;
  useEffect(() => {
    socket = io(ENDPOINT, { transports: ["websocket"] });

    setUserName(name);
    setUserRoom(room);

    //The second arguement is passing some props to socketio
    //Third arguement is for the callback in BE (for error handling)
    socket.emit("join", { name, room }, () => {});

    return () => {
      socket.disconnect();
      //turn socket connection for this one person off
      socket.off();
    };
  }, [ENDPOINT, name, room]);

  //Handle welcome messages
  useEffect(() => {
    socket.on("message", (message) => {
      setMessages([...messages, message]);
    });
  }, [messages]);

  //function for sening message
  const sendMessage = (e) => {
    if (message) {
      socket.emit("sendMessage", message, () => setMessage(""));
    }
  };

  return (
    <div className="outerContainer">
      <div className="container">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? sendMessage(e) : null)}
        />
      </div>
    </div>
  );
};

export default Chat;
