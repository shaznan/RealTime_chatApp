const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const router = require("./router");
const cors = require("cors");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const PORT = process.env.PORT || 8000;

const app = express();

const server = http.createServer(app);
const io = socketio(server);

// NOTE:
// 1) emit => Sending message
// 2) on => Listening for message

io.on("connection", (socket) => {
  //1) Handle socket when joining
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

    //join user to a chat room
    socket.join(user.room);

    //send all the users in a room
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  //2) Handle socket sending messages
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
  });

  //3) Handle socket when disconnecting
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

app.use(router);
app.use(cors);

server.listen(PORT, () => console.log(`Server has started at port ${PORT}`));
