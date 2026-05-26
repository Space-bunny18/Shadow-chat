import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { motion } from "framer-motion";
import EmojiPicker from "emoji-picker-react";

const socket = io("http://localhost:5000", {
transports: ["websocket"],
});

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

const [showSidebar, setShowSidebar] =
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

const generateRoom = () => {

const randomRoom =
"room-" +
Math.random()
.toString(36)
.substring(2, 8);

setRoom(randomRoom);

setGeneratedRoom(randomRoom);

};

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

const handleImageUpload = (e) => {

const file = e.target.files[0];

if (!file) return;

const reader = new FileReader();

reader.onloadend = () => {

setImage(reader.result);

};

reader.readAsDataURL(file);

};

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

const stopRecording = () => {

mediaRecorder.stop();

setIsRecording(false);

};

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

setMessage("");
setImage(null);
setAudio(null);
setReplyingTo(null);
setShowEmojiPicker(false);

}

};

const onEmojiClick = (emojiData) => {

setMessage(
(prev) => prev + emojiData.emoji
);

};

useEffect(() => {

socket.off("room_history");
socket.off("receive_message");
socket.off("room_users");
socket.off("system_message");
socket.off("typing");

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

useEffect(() => {

chatEndRef.current?.scrollIntoView({
behavior: "smooth",
});

}, [chat]);

if (!joined) {

return (

<div className="h-[100dvh] relative overflow-hidden flex items-center justify-center bg-black p-4">

<div className="absolute w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-20 top-[-100px] left-[-100px]"></div>

<div className="absolute w-[400px] h-[400px] bg-cyan-500 rounded-full blur-[120px] opacity-20 bottom-[-100px] right-[-100px]"></div>

<div className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/10 p-8 rounded-[32px] shadow-2xl w-full max-w-[380px]">

<div className="flex justify-center mb-6">

<div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-3xl font-bold text-white shadow-2xl">

S

</div>

</div>

<h1 className="text-4xl font-extrabold text-center text-white mb-3">

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
className="w-full p-4 rounded-2xl bg-slate-950/60 text-white outline-none border border-slate-700"
/>

<input
type="text"
placeholder="Enter Room ID"
value={room}
onChange={(e) =>
setRoom(e.target.value)
}
className="w-full p-4 rounded-2xl bg-slate-950/60 text-white outline-none border border-slate-700 mt-4"
/>

{generatedRoom && (

<div className="mt-4 bg-slate-900 border border-cyan-500 text-cyan-400 p-3 rounded-xl text-sm text-center break-all">

{generatedRoom}

</div>

)}

<button
onClick={generateRoom}
className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-2xl"
>

Generate Room

</button>

<button
onClick={joinChat}
className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-2xl font-bold"
>

Enter Secure Chat

</button>

</div>

</div>

);

}

return (

<div className="h-[100dvh] bg-black flex overflow-hidden">

{/* SIDEBAR */}
<div
className={`
fixed md:relative z-50
top-0 left-0 h-full
w-[260px]
bg-slate-950
border-r border-slate-800
flex flex-col
transition-transform duration-300
${
showSidebar
? "translate-x-0"
: "-translate-x-full md:translate-x-0"
}
`}
>

<div className="p-6 border-b border-slate-800 flex justify-between items-center">

<div>

<h1 className="text-2xl font-bold text-white">

Shadow Chat

</h1>

<p className="text-slate-400 text-sm">

Secure Rooms

</p>

</div>

<button
onClick={() =>
setShowSidebar(false)
}
className="md:hidden text-white text-2xl"
>

×

</button>

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
<div className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(circle_at_top,#172554,black_60%)]">

{/* NAVBAR */}
<div className="bg-white/5 backdrop-blur-lg border-b border-white/10 p-4 flex justify-between items-center">

<div className="flex items-center gap-3">

<button
onClick={() =>
setShowSidebar(true)
}
className="md:hidden text-white text-2xl"
>

☰

</button>

<div>

<h1 className="text-xl md:text-2xl font-bold text-white">

Secure Room

</h1>

<p className="text-slate-400 text-xs md:text-sm">

Temporary conversation

</p>

</div>

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

</div>

</div>

{/* CHAT */}
<div className="flex-1 overflow-y-auto p-3 space-y-4">

{chat.map((msg, index) => (

<div
key={index}
className={
msg.system
? "flex justify-center"
: msg.user === username
? "flex justify-end"
: "flex justify-start"
}
>

<div className="max-w-[85%] sm:max-w-[70%]">

{!msg.system &&
msg.user !== username && (

<p className="text-cyan-300 text-xs mb-1 ml-2">

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
className={`px-4 py-3 rounded-2xl break-words overflow-hidden ${
msg.system
? "bg-slate-900 text-slate-300 text-xs border border-cyan-500/20"
: msg.user === username
? "bg-[#3797F0] text-white"
: "bg-[#262626] text-white"
}`}
>

{msg.text && (

<div className="flex flex-wrap items-end gap-2">

<span className="text-sm">

{msg.text}

</span>

<span className="text-[10px] opacity-70">

{msg.time}

</span>

</div>

)}

{msg.image && (

<img
src={msg.image}
alt="shared"
className="mt-2 rounded-2xl max-w-full object-cover"
/>

)}

{msg.audio && (

<div className="mt-2">

<audio
controls
src={msg.audio}
className="w-full max-w-[220px]"
/>

</div>

)}

</motion.div>

</div>

</div>

))}

<div ref={chatEndRef}></div>

</div>

{/* TYPING */}
{typingUser &&
typingUser !== username && (

<div className="px-4 pb-2 text-sm text-cyan-400">

{typingUser} is typing...

</div>

)}

{/* INPUT */}
<div className="p-3 border-t border-white/10 flex items-center gap-2 bg-black">

<label className="bg-slate-800 text-white w-[50px] h-[50px] rounded-2xl flex items-center justify-center cursor-pointer flex-shrink-0">

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

<button
onClick={() => {

if (isRecording) {

stopRecording();

} else {

startRecording();

}

}}
className={`w-[50px] h-[50px] rounded-2xl text-white flex-shrink-0 ${
isRecording
? "bg-red-500"
: "bg-slate-800"
}`}
>

🎤

</button>

<div className="relative flex-shrink-0">

<button
onClick={() =>
setShowEmojiPicker(
!showEmojiPicker
)
}
className="bg-slate-800 text-white w-[50px] h-[50px] rounded-2xl"
>

😀

</button>

{showEmojiPicker && (

<div className="absolute bottom-16 left-0 scale-75 origin-bottom-left z-50">

<EmojiPicker
onEmojiClick={
onEmojiClick
}
theme="dark"
/>

</div>

)}

</div>

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
className="flex-1 min-w-0 bg-slate-900 text-white rounded-2xl px-4 h-[50px] outline-none border border-slate-700"
/>

<motion.button
whileTap={{
scale: 0.95,
}}
onClick={sendMessage}
className="bg-gradient-to-r from-blue-500 to-cyan-500 px-5 md:px-8 h-[50px] rounded-2xl text-white font-semibold flex-shrink-0"
>

Send

</motion.button>

</div>

</div>

</div>

);

}

export default App;