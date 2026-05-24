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

// STORE ALL ROOM MESSAGES
const roomMessages = {};

// STORE ALL ROOM USERS
const roomUsers = {};

io.on("connection", (socket) => {

  console.log(
    "USER CONNECTED:",
    socket.id
  );

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

      // CHECK IF USER ALREADY EXISTS
      const existingUser =
        roomUsers[room].find(
          (user) =>
            user.username === username
        );

      // ADD USER ONLY IF NOT EXISTS
      if (!existingUser) {

        roomUsers[room].push({
          id: socket.id,
          username,
        });

      }

      console.log(
        "ROOM USERS:",
        roomUsers[room]
      );

      // SEND UPDATED USERS
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

      // SYSTEM JOIN MESSAGE
      const joinMessage = {

        id:
          Date.now() +
          Math.random(),

        system: true,

        text: `${username} joined the chat`,

        time:
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),

      };

      roomMessages[room].push(
        joinMessage
      );

      io.to(room).emit(
        "system_message",
        joinMessage
      );

    }
  );

  // SEND CHAT MESSAGE
  socket.on(
    "send_message",
    (messageData) => {

      const room =
        messageData.room;

      if (!roomMessages[room]) {

        roomMessages[room] = [];

      }

      roomMessages[room].push(
        messageData
      );

      io.to(room).emit(
        "receive_message",
        messageData
      );

    }
  );

  // TYPING EVENT
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
  socket.on(
    "disconnect",
    () => {

      console.log(
        "USER DISCONNECTED:",
        socket.id
      );

      const room =
        socket.room;

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

          id:
            Date.now() +
            Math.random(),

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

        console.log(
          "UPDATED USERS:",
          roomUsers[room]
        );

        // DELETE EMPTY ROOM
        if (
          roomUsers[room].length === 0
        ) {

          delete roomUsers[room];

          delete roomMessages[room];

        }

      }

    }
  );

});

// TEST ROUTE
app.get("/", (req, res) => {

  res.send(
    "Shadow Chat Server Running"
  );

});

// START SERVER
const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {

  console.log(
    `SERVER RUNNING ON ${PORT}`
  );

});