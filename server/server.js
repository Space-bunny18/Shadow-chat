const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const roomMessages = {};
const roomUsers = {};

io.on("connection", (socket) => {

  console.log("USER CONNECTED:", socket.id);

  socket.on("join_room", ({ room, username }) => {

    if (!room || !username) return;

    socket.leaveAll();

    socket.join(room);

    socket.room = room;
    socket.username = username;

    if (!roomUsers[room]) {
      roomUsers[room] = [];
    }

    // REMOVE DUPLICATES
    roomUsers[room] = roomUsers[room].filter(
      (user) => user.username !== username
    );

    roomUsers[room].push({
      id: socket.id,
      username,
    });

    io.to(room).emit(
      "room_users",
      roomUsers[room]
    );

    if (!roomMessages[room]) {
      roomMessages[room] = [];
    }

    socket.emit(
      "room_history",
      roomMessages[room]
    );

    const joinMessage = {
      id: Date.now() + Math.random(),
      system: true,
      text: `${username} joined the chat`,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    roomMessages[room].push(joinMessage);

    io.to(room).emit(
      "system_message",
      joinMessage
    );

  });

  socket.on("send_message", (messageData) => {

    const room = messageData.room;

    if (!room) return;

    if (!roomMessages[room]) {
      roomMessages[room] = [];
    }

    roomMessages[room].push(messageData);

    io.to(room).emit(
      "receive_message",
      messageData
    );

  });

  socket.on("typing", ({ room, username }) => {

    socket.to(room).emit("typing", {
      username,
    });

  });

  socket.on("disconnect", () => {

    const room = socket.room;
    const username = socket.username;

    console.log("USER DISCONNECTED:", socket.id);

    if (room && roomUsers[room]) {

      roomUsers[room] = roomUsers[room].filter(
        (user) => user.id !== socket.id
      );

      io.to(room).emit(
        "room_users",
        roomUsers[room]
      );

      const leaveMessage = {
        id: Date.now() + Math.random(),
        system: true,
        text: `${username} left the chat`,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      if (!roomMessages[room]) {
        roomMessages[room] = [];
      }

      roomMessages[room].push(
        leaveMessage
      );

      io.to(room).emit(
        "system_message",
        leaveMessage
      );

      if (roomUsers[room].length === 0) {
        delete roomUsers[room];
        delete roomMessages[room];
      }

    }

  });

});

app.get("/", (req, res) => {
  res.send("Shadow Chat Server Running");
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON ${PORT}`);
});