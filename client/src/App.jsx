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

  // REPLY
  const [replyingTo, setReplyingTo] =
    useState(null);

  // VOICE STATES
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

  // AVATAR COLOR
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
      Math.random().toString(36).substring(2, 8);

    setRoom(randomRoom);

    setGeneratedRoom(randomRoom);

  };

  // JOIN CHAT
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
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      socket.emit("send_message", msgData);

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

  // MESSAGE REACTION
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
      <div className="h-screen relative overflow-hidden flex items-center justify-center bg-black">

        <div className="absolute w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-20 top-[-100px] left-[-100px] animate-pulse"></div>

        <div className="absolute w-[400px] h-[400px] bg-cyan-500 rounded-full blur-[120px] opacity-20 bottom-[-100px] right-[-100px] animate-pulse"></div>

        <div className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/10 p-10 rounded-[30px] shadow-2xl w-[380px]">

          <div className="flex justify-center mb-5">

            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-3xl font-bold text-white shadow-2xl">

              S

            </div>

          </div>

          <h1 className="text-5xl font-extrabold text-center text-white mb-3 tracking-wide">

            Shadow Chat

          </h1>

          <p className="text-slate-300 text-center mb-8">

            Secure • Temporary • Private

          </p>

          <input
            type="text"
            placeholder="Choose Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className="w-full p-4 rounded-2xl bg-slate-950/60 text-white outline-none border border-slate-700 focus:border-cyan-400 transition-all duration-300"
          />

          <input
            type="text"
            placeholder="Enter Room ID"
            value={room}
            onChange={(e) =>
              setRoom(e.target.value)
            }
            className="w-full p-4 rounded-2xl bg-slate-950/60 text-white outline-none border border-slate-700 focus:border-cyan-400 transition-all duration-300 mt-4"
          />

          {generatedRoom && (
            <div className="mt-4 bg-slate-900/70 border border-cyan-500 text-cyan-400 p-3 rounded-xl text-sm text-center">

              Room Created:
              <strong>
                {" "}
                {generatedRoom}
              </strong>

            </div>
          )}

          {generatedRoom && (
            <button
              onClick={() => {

                navigator.clipboard.writeText(
                  generatedRoom
                );

                alert(
                  "Room ID Copied!"
                );

              }}
              className="w-full mt-3 bg-cyan-600 hover:bg-cyan-700 transition-all duration-300 text-white p-3 rounded-xl font-semibold"
            >
              Copy Invite Code
            </button>
          )}

          <button
            onClick={generateRoom}
            className="w-full mt-4 bg-slate-800 hover:bg-slate-700 transition-all duration-300 text-white p-4 rounded-2xl font-semibold border border-slate-700"
          >
            Generate Private Room
          </button>

          <button
            onClick={joinChat}
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] transition-all duration-300 text-white p-4 rounded-2xl font-bold shadow-2xl"
          >
            Enter Secure Chat
          </button>

        </div>

      </div>
    );

  }

  // CHAT SCREEN
  return (
    <div className="h-screen bg-black flex">

      {/* SIDEBAR */}
      <div className="w-[280px] bg-slate-950 border-r border-slate-800 flex flex-col">

        <div className="p-6 border-b border-slate-800">

          <h1 className="text-3xl font-bold text-white">
            Shadow Chat
          </h1>

          <p className="text-slate-400 mt-2 text-sm">
            Temporary Secure Rooms
          </p>

        </div>

        <div className="p-5 border-b border-slate-800">

          <p className="text-slate-400 text-sm">
            ROOM ID
          </p>

          <div className="mt-2 bg-slate-900 p-3 rounded-xl text-cyan-400 text-sm break-all">

            {room}

          </div>

        </div>

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

            {users.map(
              (user, index) => (

                <div
                  key={index}
                  className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3"
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

              )
            )}

          </div>

        </div>

      </div>

      {/* MAIN CHAT */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-black">

        {/* NAVBAR */}
        <div className="bg-white/5 backdrop-blur-lg border-b border-white/10 p-5 flex justify-between items-center">

          <div>

            <h1 className="text-2xl font-bold text-white">
              Secure Room
            </h1>

            <p className="text-slate-400 text-sm mt-1">
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

            <div className="text-white font-semibold">
              {username}
            </div>

          </div>

        </div>

        {/* CHAT */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

          {chat.map((msg, index) => (

            <motion.div
              key={index}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.25,
              }}
              className={`max-w-[340px] p-4 rounded-2xl shadow-lg ${
                msg.system
                  ? "self-center text-slate-300 text-sm bg-slate-900/80 px-5 py-2 rounded-lg border border-cyan-500/20 backdrop-blur-md shadow-lg"
                  : msg.user === username
                  ? "bg-blue-600 self-end text-white"
                  : "bg-slate-800 self-start text-white"
              }`}
            >

              {!msg.system && (

                <div className="flex items-center gap-3 mb-2">

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getAvatarColor(
                      msg.user
                    )}`}
                  >
                    {msg.user
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <p className="text-sm opacity-80">
                    {msg.user}
                  </p>

                </div>

              )}

              {/* REPLY MESSAGE */}
              {msg.replyTo && (

                <div className="mb-3 border-l-4 border-cyan-400 bg-black/20 p-2 rounded-lg">

                  <p className="text-xs text-cyan-400 font-semibold">

                    {msg.replyTo.user}

                  </p>

                  <p className="text-xs text-slate-300 truncate">

                    {msg.replyTo.text || "Attachment"}

                  </p>

                </div>

              )}

              {msg.text && (
                <p>{msg.text}</p>
              )}

              {msg.image && (

                <img
                  src={msg.image}
                  alt="shared"
                  className="mt-3 rounded-xl max-w-full border border-white/10"
                />

              )}

              {msg.audio && (

                <audio
                  controls
                  src={msg.audio}
                  className="mt-3 w-full"
                />

              )}

              {/* REACTION BUTTONS */}
              {!msg.system && (

                <div className="relative group mt-3">

                  <button className="text-xs text-slate-400 hover:text-white transition-all">

                    Add Reaction 😊

                  </button>

                  <div className="absolute left-0 mt-2 hidden group-hover:flex gap-2 bg-slate-900 border border-slate-700 p-2 rounded-xl shadow-2xl z-50">

                    {[
                      "👍",
                      "❤️",
                      "🔥",
                      "😂",
                    ].map((emoji) => (

                      <button
                        key={emoji}
                        onClick={() =>
                          addReaction(
                            msg.id,
                            emoji
                          )
                        }
                        className="hover:scale-125 transition-all text-lg"
                      >
                        {emoji}
                      </button>

                    ))}

                  </div>

                </div>

              )}

              {/* REACTION COUNT */}
              {msg.reactions && (

                <div className="flex gap-2 mt-2 flex-wrap">

                  {Object.entries(
                    msg.reactions
                  ).map(
                    ([emoji, count]) => (

                      <div
                        key={emoji}
                        className="bg-slate-700 px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                      >
                        <span>
                          {emoji}
                        </span>

                        <span className="text-slate-300 text-xs">
                          {count}
                        </span>

                      </div>

                    )
                  )}

                </div>

              )}

              {/* REPLY BUTTON */}
              {!msg.system && (

                <button
                  onClick={() =>
                    setReplyingTo(msg)
                  }
                  className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-all"
                >
                  Reply
                </button>

              )}

              <p className="text-[11px] opacity-60 mt-2 text-right">
                {msg.time}
              </p>

            </motion.div>

          ))}

          <div ref={chatEndRef}></div>

        </div>

        {/* TYPING */}
        {typingUser &&
          typingUser !== username && (

            <div className="px-6 pb-2 text-sm text-cyan-400 animate-pulse">

              {typingUser} is typing...

            </div>

          )}

        {/* REPLY PREVIEW */}
        {replyingTo && (

          <div className="px-5 pb-3">

            <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-3 flex justify-between items-center">

              <div>

                <p className="text-cyan-400 text-sm font-semibold">

                  Replying to {replyingTo.user}

                </p>

                <p className="text-slate-300 text-sm truncate">

                  {replyingTo.text || "Attachment"}

                </p>

              </div>

              <button
                onClick={() =>
                  setReplyingTo(null)
                }
                className="text-red-400 hover:text-red-300 text-xl"
              >
                ×
              </button>

            </div>

          </div>

        )}

        {/* IMAGE PREVIEW */}
        {image && (

          <div className="px-5 pb-3">

            <div className="relative inline-block">

              <img
                src={image}
                alt="preview"
                className="w-40 rounded-2xl border border-slate-700 shadow-lg"
              />

              <button
                onClick={() =>
                  setImage(null)
                }
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 w-7 h-7 rounded-full text-white font-bold shadow-lg"
              >
                ×
              </button>

            </div>

          </div>

        )}

        {/* AUDIO PREVIEW */}
        {audio && (

          <div className="px-5 pb-3">

            <audio
              controls
              src={audio}
              className="w-full"
            />

          </div>

        )}

        {/* INPUT AREA */}
        <div className="p-5 bg-white/5 backdrop-blur-lg border-t border-white/10 flex gap-4 items-center">

          {/* IMAGE */}
          <label className="bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-xl h-[56px] flex items-center justify-center cursor-pointer">

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

          {/* VOICE */}
          <button
            onClick={() => {

              if (isRecording) {

                stopRecording();

              } else {

                startRecording();

              }

            }}
            className={`px-4 rounded-xl h-[56px] text-white ${
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
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-xl h-[56px]"
            >
              😀
            </button>

            {showEmojiPicker && (

              <div className="absolute bottom-16 left-0 z-50">

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
            className="flex-1 p-4 rounded-xl bg-slate-900 text-white outline-none border border-slate-700 focus:border-blue-500"
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
            className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 px-8 h-[56px] rounded-xl text-white font-semibold"
          >
            Send
          </motion.button>

        </div>

      </div>

    </div>
  );

}

export default App;