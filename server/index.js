const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const router = require("./router");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const PORT = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    //if error comes from addUser function, we will send it to front end
    if (error) return callback(error);

    //sends a message to FE (lets the user know that he has joined)
    socket.emit("message", {
      user: "admin",
      text: `${user.name}, Welcome to the room ${user.room}`,
    });

    //send a message to FE (lets everyone besides the user know that he has joined)
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name}, has joined!` });

    //Adds user to a room
    socket.join(user.room);
  });

  socket.on("disconnect", () => {
    console.log("The user has disconnected");
  });
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started at port ${PORT}`));
