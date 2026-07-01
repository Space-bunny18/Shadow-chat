import { useState } from "react";
import { motion } from "framer-motion";
import PaymentQRModal from "./PaymentQRModal";



function SupportModal({
  open,
  onClose,
  supportAmount,
  setSupportAmount,
}) {

  const [customAmount, setCustomAmount] = useState("");
  const [showQR, setShowQR] = useState(false);
  const amount =
  supportAmount === "custom"
    ? Number(customAmount || 0)
    : supportAmount;

  const upiLink = `upi://pay?pa=${import.meta.env.VITE_UPI_ID}&pn=Shadow%20Chat&am=${amount}&cu=INR`;
const handleSupport = () => {

  if (!amount || amount < 10) {
    alert("Minimum support amount is ₹10");
    return;
  }

  setShowQR(true);

};


  if (!open) return null;

  return (
  <div
  className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
  onClick={() => {
    if (!showQR) onClose();
  }}
>

    <motion.div
      onClick={(e) => e.stopPropagation()}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-md rounded-3xl border border-cyan-500/20 bg-[#0b1220] overflow-hidden shadow-[0_0_60px_rgba(34,211,238,0.15)]"
    >

      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-800">

        <div>

          <h2 className="text-2xl font-bold text-white">
            ❤️ Support Shadow Chat
          </h2>

          <p className="text-slate-400 text-sm mt-1">
            Help keep Shadow Chat free & ad-free.
          </p>

        </div>

        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 transition flex items-center justify-center text-white"
        >
          ✕
        </button>

      </div>

      {/* Body */}
      <div className="p-6">

        <p className="text-slate-400 text-sm text-center mb-6">
          Every contribution helps us build new features ❤️
          </p>

        {/* Donation Options */}

        <div className="grid grid-cols-2 gap-4 mt-4">

          <button
            onClick={() => setSupportAmount(50)}
            className={`rounded-2xl p-3 border transition-all duration-300 ${
              supportAmount === 50
                ? "bg-cyan-500 text-black border-cyan-500 scale-105 shadow-lg shadow-cyan-500/30"
                : "bg-slate-900 border-slate-700 hover:bg-slate-800 hover:scale-105"
            }`}
          >

            <div className="text-2xl">
              ☕
            </div>

            <div className="mt-3 font-bold">
             Coffee
            </div>

            <div className="text-sm opacity-80 mt-1">
              ₹50
            </div>

          </button>

          <button
            onClick={() => setSupportAmount(100)}
            className={`rounded-2xl p-3 border transition-all duration-300 ${
              supportAmount === 100
                ? "bg-cyan-500 text-black border-cyan-500 scale-105 shadow-lg shadow-cyan-500/30"
                : "bg-slate-900 border-slate-700 hover:bg-slate-800 hover:scale-105"
            }`}
          >

            <div className="text-2xl">
              🚀
            </div>

            <div className="mt-3 font-bold">
              Supporter
            </div>

            <div className="text-sm opacity-80 mt-1">
              ₹100
            </div>

          </button>

          <button
            onClick={() => setSupportAmount(250)}
            className={`rounded-2xl p-3 border transition-all duration-300 ${
              supportAmount === 250
                ? "bg-cyan-500 text-black border-cyan-500 scale-105 shadow-lg shadow-cyan-500/30"
                : "bg-slate-900 border-slate-700 hover:bg-slate-800 hover:scale-105"
            }`}
          >

            <div className="text-2xl">
              ❤️
            </div>

            <div className="mt-3 font-bold">
              Hero
            </div>

            <div className="text-sm opacity-80 mt-1">
              ₹250
            </div>

          </button>

          <button
          onClick={() => setSupportAmount("custom")}
          className={`rounded-2xl p-3 border transition-all duration-300 ${
            supportAmount === "custom"
              ? "bg-cyan-500 text-black border-cyan-500 scale-105 shadow-lg shadow-cyan-500/30"
              : "bg-slate-900 border-slate-700 hover:bg-slate-800 hover:scale-105"
          }`}
        >

          <div className="text-2xl">
            ⭐
          </div>

          <div className="mt-3 font-bold">
           Custom
          </div>

          <div className="text-sm opacity-80 mt-1">
            Any Amount
          </div>

        </button>

        </div>
        {supportAmount === "custom" && (

          <div className="mt-5">

          <input
          type="number"
          placeholder="Enter Amount (₹)"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-4 text-white outline-none focus:border-cyan-500"
          />

          </div>

          )}


        {/* Button */}

          <button
            onClick={handleSupport}
            disabled={
              supportAmount === "custom" &&
              !customAmount
            }
            className={`w-full mt-4 py-4 rounded-2xl font-bold transition ${
              supportAmount === "custom" && !customAmount
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-[1.02]"
            }`}
          >

          ❤️ Continue ₹{
          supportAmount === "custom"
          ? (customAmount || "")
          : supportAmount
          }

        </button>

      </div>

    </motion.div>
    <PaymentQRModal
        open={showQR}
        onClose={() => setShowQR(false)}
        amount={amount}
        upiLink={upiLink}
    />
    </div>
);

}

export default SupportModal;