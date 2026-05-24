import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { motion } from "framer-motion";
import EmojiPicker from "emoji-picker-react";

const socket = io("http://localhost:5000");

function App() {

  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [generatedRoom, setGeneratedRoom] =
    useState("");

  const [joined, setJoined] = useState(false);

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const [users, setUsers] = useState([]);
  const [typingUser, setTypingUser] =
    useState("");

  const [showEmojiPicker, setShowEmojiPicker] =
    useState(false);

  const [image, setImage] = useState(null);

  const [replyingTo, setReplyingTo] =
    useState(null);

  const [mediaRecorder, setMediaRecorder] =
    useState(null);

  const [isRecording, setIsRecording] =
    useState(false);

  const [audio, setAudio] = useState(null);

  const chatEndRef = useRef(null);

  // AVATAR COLORS
  const avatarColors = [
    "bg-blue-500",
    "bg-cyan-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-red-500",
  ];

  const getAvatarColor = (name) => {

    let total = 0;

    for (let i = 0; i < name.length; i++) {

      total += name.charCodeAt(i);

    }

    return avatarColors[
      total % avatarColors.length
    ];

  };

  // GENERATE ROOM
  const generateRoom = () => {

    const randomRoom =
      "room-" +
      Math.random()
        .toString(36)
        .substring(2, 8);

    setRoom(randomRoom);

    setGeneratedRoom(randomRoom);

  };

  // JOIN ROOM
  const joinChat = () => {

    if (
      username.trim() !== "" &&
      room.trim() !== ""
    ) {

      socket.emit("join_room", {
        room,
        username,
      });

      setJoined(true);

    }

  };

  // IMAGE UPLOAD
  const handleImageUpload = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {

      setImage(reader.result);

    };

    reader.readAsDataURL(file);

  };

  // START RECORDING
  const startRecording = async () => {

    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

    const recorder = new MediaRecorder(stream);

    let chunks = [];

    recorder.ondataavailable = (e) => {

      chunks.push(e.data);

    };

    recorder.onstop = () => {

      const blob = new Blob(chunks, {
        type: "audio/webm",
      });

      const audioUrl =
        URL.createObjectURL(blob);

      setAudio(audioUrl);

    };

    recorder.start();

    setMediaRecorder(recorder);

    setIsRecording(true);

  };

  // STOP RECORDING
  const stopRecording = () => {

    mediaRecorder.stop();

    setIsRecording(false);

  };

  // SEND MESSAGE
  const sendMessage = () => {

    if (
      message.trim() !== "" ||
      image ||
      audio
    ) {

      const msgData = {
        id: Date.now(),

        room,

        user: username,

        text: message,

        image,

        audio,

        replyTo: replyingTo,

        reactions: {},

        time:
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
      };

      socket.emit(
        "send_message",
        msgData
      );

      setChat((prev) => [
        ...prev,
        msgData,
      ]);

      setMessage("");
      setImage(null);
      setAudio(null);
      setReplyingTo(null);
      setShowEmojiPicker(false);

    }

  };

  // REACTIONS
  const addReaction = (
    messageId,
    emoji
  ) => {

    setChat((prev) =>
      prev.map((msg) => {

        if (msg.id === messageId) {

          const reactions =
            msg.reactions || {};

          return {
            ...msg,

            reactions: {
              ...reactions,

              [emoji]:
                (reactions[emoji] || 0) + 1,
            },
          };

        }

        return msg;

      })
    );

  };

  // EMOJI
  const onEmojiClick = (emojiData) => {

    setMessage(
      (prev) => prev + emojiData.emoji
    );

  };

  // SOCKET EVENTS
  useEffect(() => {

    socket.on(
      "room_history",
      (messages) => {

        setChat(messages);

      }
    );

    socket.on(
      "receive_message",
      (data) => {

        setChat((prev) => [
          ...prev,
          data,
        ]);

      }
    );

    socket.on(
      "room_users",
      (usersList) => {

        setUsers(usersList);

      }
    );

    socket.on(
      "system_message",
      (data) => {

        setChat((prev) => [
          ...prev,
          data,
        ]);

      }
    );

    socket.on("typing", (data) => {

      setTypingUser(data.username);

      setTimeout(() => {

        setTypingUser("");

      }, 1500);

    });

    return () => {

      socket.off("room_history");
      socket.off("receive_message");
      socket.off("room_users");
      socket.off("system_message");
      socket.off("typing");

    };

  }, []);

  // AUTO SCROLL
  useEffect(() => {

    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [chat]);

  // JOIN SCREEN
  if (!joined) {

    return (
      <div className="h-screen relative overflow-hidden flex items-center justify-center bg-black p-4">

        {/* BACKGROUND */}
        <div className="absolute w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-20 top-[-100px] left-[-100px]"></div>

        <div className="absolute w-[400px] h-[400px] bg-cyan-500 rounded-full blur-[120px] opacity-20 bottom-[-100px] right-[-100px]"></div>

        {/* CARD */}
        <div className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[32px] shadow-2xl w-full max-w-[380px]">

          <div className="flex justify-center mb-6">

            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-3xl font-bold text-white shadow-2xl">

              S

            </div>

          </div>

          <h1 className="text-5xl font-extrabold text-center text-white mb-3">

            Shadow Chat

          </h1>

          <p className="text-slate-300 text-center mb-8">

            Secure • Temporary • Private

          </p>

          {/* USERNAME */}
          <input
            type="text"
            placeholder="Choose Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className="w-full p-4 rounded-2xl bg-slate-950/60 text-white outline-none border border-slate-700 focus:border-cyan-400 transition-all"
          />

          {/* ROOM */}
          <input
            type="text"
            placeholder="Enter Room ID"
            value={room}
            onChange={(e) =>
              setRoom(e.target.value)
            }
            className="w-full p-4 rounded-2xl bg-slate-950/60 text-white outline-none border border-slate-700 focus:border-cyan-400 transition-all mt-4"
          />

          {/* GENERATED ROOM */}
          {generatedRoom && (

            <div className="mt-4 bg-slate-900 border border-cyan-500 text-cyan-400 p-3 rounded-xl text-sm text-center">

              {generatedRoom}

            </div>

          )}

          <button
            onClick={generateRoom}
            className="w-full mt-4 bg-slate-800 hover:bg-slate-700 transition-all text-white p-4 rounded-2xl font-semibold"
          >

            Generate Room

          </button>

          <button
            onClick={joinChat}
            className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 transition-all text-white p-4 rounded-2xl font-bold shadow-2xl"
          >

            Enter Secure Chat

          </button>

        </div>

      </div>
    );

  }

  // MAIN CHAT SCREEN
  return (

    <div className="h-screen bg-black flex overflow-hidden">

      {/* SIDEBAR */}
      <div className="hidden md:flex w-[230px] bg-slate-950 border-r border-slate-800 flex-col">

        <div className="p-6 border-b border-slate-800">

          <h1 className="text-3xl font-bold text-white">

            Shadow Chat

          </h1>

          <p className="text-slate-400 mt-2 text-sm">

            Temporary Secure Rooms

          </p>

        </div>

        {/* ROOM */}
        <div className="p-5 border-b border-slate-800">

          <p className="text-slate-400 text-sm">

            ROOM ID

          </p>

          <div className="mt-2 bg-slate-900 p-3 rounded-xl text-cyan-400 text-sm break-all">

            {room}

          </div>

        </div>

        {/* USERS */}
        <div className="flex-1 overflow-y-auto p-5">

          <div className="flex justify-between items-center mb-5">

            <h2 className="text-white font-semibold">

              Online Users

            </h2>

            <div className="bg-cyan-500 text-black text-xs px-2 py-1 rounded-full font-bold">

              {users.length}

            </div>

          </div>

          <div className="flex flex-col gap-3">

            {users.map((user, index) => (

              <div
                key={index}
                className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center gap-3"
              >

                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getAvatarColor(
                    user.username
                  )}`}
                >

                  {user.username
                    .charAt(0)
                    .toUpperCase()}

                </div>

                <div>

                  <div className="text-white text-sm font-medium">

                    {user.username}

                  </div>

                  <div className="text-green-400 text-xs">

                    Online

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* MAIN CHAT */}
      <div className="flex-1 flex flex-col bg-[radial-gradient(circle_at_top,#172554,black_60%)]">

        {/* NAVBAR */}
        <div className="bg-white/5 backdrop-blur-lg border-b border-white/10 p-4 md:p-5 flex justify-between items-center">

          <div>

            <h1 className="text-xl md:text-2xl font-bold text-white">

              Secure Room

            </h1>

            <p className="text-slate-400 text-xs md:text-sm mt-1">

              Temporary conversation

            </p>

          </div>

          <div className="flex items-center gap-3">

            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getAvatarColor(
                username
              )}`}
            >

              {username
                .charAt(0)
                .toUpperCase()}

            </div>

            <div className="hidden md:block text-white font-semibold">

              {username}

            </div>

          </div>

        </div>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2 max-w-[900px] w-full mx-auto">

          {chat.map((msg, index) => (

            <div
              key={index}
              className={
                msg.system
                  ? "self-center"
                  : msg.user === username
                  ? "self-end mr-2"
                  : "self-start ml-2"
              }
            >

              {/* USERNAME */}
              {!msg.system &&
                msg.user !== username && (

                  <p className="text-[11px] text-cyan-300 mb-1 ml-2 font-medium">

                    {msg.user}

                  </p>

              )}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.2,
                }}
                className={`group inline-flex items-center w-auto max-w-[320px] px-4 py-2 rounded-[18px] transition-all duration-200 ${
                  msg.system
                    ? "text-[11px] text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-cyan-500/20"
                    : msg.user === username
                    ? "bg-[#3797F0] text-white"
                    : "bg-[#262626] text-white"
                }`}
              >

                {/* TEXT + TIME */}
                {msg.text && (

                  <div className="flex items-center gap-1">

                    <span className="text-[15px] break-words">

                      {msg.text}

                    </span>

                    <span className="text-[10px] opacity-60 whitespace-nowrap">

                      {msg.time}

                    </span>

                  </div>

                )}

                {/* IMAGE */}
                {msg.image && (

                  <img
                    src={msg.image}
                    alt="shared"
                    className="mt-2 rounded-2xl max-w-full"
                  />

                )}

                {/* AUDIO */}
                {msg.audio && (

                  <div className="mt-2 bg-black/20 rounded-xl p-2">

                    <audio
                      controls
                      src={msg.audio}
                      className="w-[220px] h-8"
                    />

                  </div>

                )}

              </motion.div>

            </div>

          ))}

          <div ref={chatEndRef}></div>

        </div>

        {/* TYPING */}
        {typingUser &&
          typingUser !== username && (

            <div className="px-4 pb-2 text-sm text-cyan-400 animate-pulse">

              {typingUser} is typing...

            </div>

          )}

        {/* INPUT */}
        <div className="p-3 bg-black/40 backdrop-blur-2xl border-t border-white/5 flex gap-3 items-center">

          {/* IMAGE */}
          <label className="bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-2xl h-[50px] flex items-center justify-center cursor-pointer">

            📷

            <input
              type="file"
              accept="image/*"
              onChange={
                handleImageUpload
              }
              className="hidden"
            />

          </label>

          {/* MIC */}
          <button
            onClick={() => {

              if (isRecording) {

                stopRecording();

              } else {

                startRecording();

              }

            }}
            className={`px-4 rounded-2xl h-[50px] text-white ${
              isRecording
                ? "bg-red-500 animate-pulse"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >

            🎤

          </button>

          {/* EMOJI */}
          <div className="relative">

            <button
              onClick={() =>
                setShowEmojiPicker(
                  !showEmojiPicker
                )
              }
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-2xl h-[50px]"
            >

              😀

            </button>

            {showEmojiPicker && (

              <div className="absolute bottom-16 left-0 z-50 scale-90 origin-bottom-left">

                <EmojiPicker
                  onEmojiClick={
                    onEmojiClick
                  }
                  theme="dark"
                />

              </div>

            )}

          </div>

          {/* INPUT */}
          <input
            type="text"
            placeholder="Type a secure message..."
            value={message}
            onChange={(e) => {

              setMessage(
                e.target.value
              );

              socket.emit("typing", {
                room,
                username,
              });

            }}
            onKeyDown={(e) => {

              if (
                e.key === "Enter"
              ) {

                sendMessage();

              }

            }}
            className="flex-1 px-5 h-[50px] rounded-2xl bg-slate-900 text-white outline-none border border-slate-700 focus:border-blue-500"
          />

          {/* SEND */}
          <motion.button
            whileTap={{
              scale: 0.95,
            }}
            whileHover={{
              scale: 1.03,
            }}
            onClick={sendMessage}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 transition-all px-8 h-[50px] rounded-2xl text-white font-semibold"
          >

            Send

          </motion.button>

        </div>

      </div>

    </div>
  );

}

export default App;