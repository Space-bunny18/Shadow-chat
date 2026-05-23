import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const chatEndRef = useRef(null);

  const joinChat = () => {
    if (username.trim() !== "" && room.trim() !== "") {
      socket.emit("join_room", room);

      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (message.trim() !== "") {
      const msgData = {
        room,
        user: username,
        text: message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      socket.emit("send_message", msgData);

      setChat((prev) => [...prev, msgData]);

      setMessage("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chat]);

  if (!joined) {
    return (
      <div className="h-screen relative overflow-hidden flex items-center justify-center bg-black">

        {/* Animated Background */}
        <div className="absolute w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-20 top-[-100px] left-[-100px] animate-pulse"></div>

        <div className="absolute w-[400px] h-[400px] bg-cyan-500 rounded-full blur-[120px] opacity-20 bottom-[-100px] right-[-100px] animate-pulse"></div>

        {/* Card */}
        <div className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/10 p-10 rounded-[30px] shadow-2xl w-[380px]">

          {/* Logo */}
          <div className="flex justify-center mb-5">

            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-3xl font-bold text-white shadow-2xl">

              S

            </div>

          </div>

          <h1 className="text-5xl font-extrabold text-center text-white mb-3 tracking-wide">

            Shadow Chat

          </h1>

          <p className="text-slate-300 text-center mb-8">

            Secure • Private • Encrypted

          </p>

          <input
            type="text"
            placeholder="Choose Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-4 rounded-2xl bg-slate-950/60 text-white outline-none border border-slate-700 focus:border-cyan-400 transition-all duration-300"
          />

          <input
            type="text"
            placeholder="Enter Room ID"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full p-4 rounded-2xl bg-slate-950/60 text-white outline-none border border-slate-700 focus:border-cyan-400 transition-all duration-300 mt-4"
          />

          <button
            onClick={joinChat}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] transition-all duration-300 text-white p-4 rounded-2xl font-bold shadow-2xl"
          >
            Enter Secure Chat
          </button>

          <div className="flex justify-center gap-3 mt-8">

            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>

            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>

            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex flex-col">

      {/* Navbar */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/10 p-5 flex justify-between items-center">

        <h1 className="text-2xl font-bold text-white">
          Shadow Chat
        </h1>

        <div className="flex items-center gap-4">

          <div className="text-slate-300 text-sm">
            Room: <span className="text-cyan-400">{room}</span>
          </div>

          <div className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></div>

          <div className="text-white font-semibold">
            {username}
          </div>

        </div>

      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

        {chat.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[300px] p-4 rounded-2xl shadow-lg ${
              msg.user === username
                ? "bg-blue-600 self-end text-white"
                : "bg-slate-800 self-start text-white"
            }`}
          >
            <p className="text-sm opacity-70 mb-1">
              {msg.user}
            </p>

            <p>
              {msg.text}
            </p>

            <p className="text-[11px] opacity-60 mt-2 text-right">
              {msg.time}
            </p>
          </div>
        ))}

        <div ref={chatEndRef}></div>

      </div>

      {/* Input Area */}
      <div className="p-5 bg-white/5 backdrop-blur-lg border-t border-white/10 flex gap-4">

        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          className="flex-1 p-4 rounded-xl bg-slate-900 text-white outline-none border border-slate-700 focus:border-blue-500"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 px-8 rounded-xl text-white font-semibold"
        >
          Send
        </button>

      </div>

    </div>
  );
}

export default App;