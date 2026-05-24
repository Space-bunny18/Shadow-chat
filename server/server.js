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

// STORE ROOM MESSAGES
const roomMessages = {};

// STORE ROOM USERS
const roomUsers = {};

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  // JOIN ROOM
  socket.on(
    "join_room",
    ({ room, username }) => {

      socket.join(room);

      socket.room = room;
      socket.username = username;

      // CREATE ROOM IF NOT EXISTS
      if (!roomUsers[room]) {

        roomUsers[room] = [];

      }

      // REMOVE DUPLICATES
      roomUsers[room] =
        roomUsers[room].filter(
          (user) =>
            user.id !== socket.id
        );

      // ADD USER
      roomUsers[room].push({
        id: socket.id,
        username,
      });

      // SEND USERS LIST
      io.to(room).emit(
        "room_users",
        roomUsers[room]
      );

      // CREATE ROOM HISTORY
      if (!roomMessages[room]) {

        roomMessages[room] = [];

      }

      // SEND OLD MESSAGES
      socket.emit(
        "room_history",
        roomMessages[room]
      );

      // SYSTEM MESSAGE
      const systemMessage = {
        id: Date.now(),

        system: true,

        text: `${username} joined the chat`,

        time:
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
      };

      roomMessages[room].push(
        systemMessage
      );

      io.to(room).emit(
        "system_message",
        systemMessage
      );

    }
  );

  // SEND MESSAGE
  socket.on(
    "send_message",
    (data) => {

      const room = data.room;

      // CREATE ROOM STORAGE
      if (!roomMessages[room]) {

        roomMessages[room] = [];

      }

      // SAVE MESSAGE
      roomMessages[room].push(data);

      // SEND TO OTHERS
      socket.to(room).emit(
        "receive_message",
        data
      );

    }
  );

  // TYPING
  socket.on(
    "typing",
    ({ room, username }) => {

      socket.to(room).emit(
        "typing",
        {
          username,
        }
      );

    }
  );

  // DISCONNECT
  socket.on("disconnect", () => {

    console.log(
      "User disconnected:",
      socket.id
    );

    const room = socket.room;

    if (
      room &&
      roomUsers[room]
    ) {

      // REMOVE USER
      roomUsers[room] =
        roomUsers[room].filter(
          (user) =>
            user.id !== socket.id
        );

      // UPDATE USERS
      io.to(room).emit(
        "room_users",
        roomUsers[room]
      );

      // LEAVE MESSAGE
      const leaveMessage = {
        id: Date.now(),

        system: true,

        text: `${socket.username} left the chat`,

        time:
          new Date().toLocaleTimeString([], {
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

      // DELETE EMPTY ROOM
      if (
        roomUsers[room].length === 0
      ) {

        delete roomUsers[room];

        delete roomMessages[room];

      }

    }

  });

});

// TEST ROUTE
app.get("/", (req, res) => {

  res.send("Shadow Chat Server Running");

});

// START SERVER
const PORT = 5000;

server.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});