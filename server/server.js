const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://shadow-chat-cyan.vercel.app"
  ],
  credentials: true,
}));
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://shadow-chat-cyan.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true,
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
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 10) {
      return res.status(400).json({
        success: false,
        message: "Minimum amount is ₹10",
      });
    }

    const options = {
      amount: amount * 100, // Razorpay uses paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Order creation failed",
    });
  }
});
app.post("/verify-payment", (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body.toString())
      .digest("hex");

    const isAuthentic =
      expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Verification error",
    });
  }
});

app.get("/", (req, res) => {
  res.send("Shadow Chat Server Running");
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON ${PORT}`);
});