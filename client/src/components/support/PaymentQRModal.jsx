import { motion } from "framer-motion";
import QRCode from "react-qr-code";

function PaymentQRModal({
  open,
  onClose,
  amount,
  upiLink,
}) {
  const isMobile =
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.25 }}
       className="w-[92%] max-w-[420px] rounded-3xl bg-[#0b1220] border border-cyan-500/20 shadow-[0_0_50px_rgba(34,211,238,0.15)] p-4"
      >

        <h2 className="text-2xl font-bold text-white text-center">
            <img
                src="/logo.png"
                alt="Shadow Chat"
                className="w-16 h-16 mx-auto mb-3"
            />
          ❤️ Support Shadow Chat
        </h2>

        <p className="text-slate-400 text-center mt-2">
          Keep Shadow Chat free and ad-free ❤️
        </p>
        <div className="border-t border-slate-700 my-5"></div>
        <p className="text-center text-cyan-400 text-2xl font-bold mt-5">
          ₹{amount}
        </p>
        <div className="bg-white rounded-3xl shadow-[0_0_25px_rgba(255,255,255,0.15)] p-5 mt-6 flex justify-center shadow-lg">
          <QRCode
            value={upiLink}
            size={155}
          />
        </div>
        <p className="text-center text-xs text-slate-500 mt-3 leading-5">
          The amount is already filled in.<br />
          Simply scan and complete the payment.
        </p>
        

        <p className="text-center text-slate-400 text-xs mt-3">
            Google Pay • PhonePe • Paytm • BHIM
        </p>

        {isMobile && (
          <button
            onClick={() => (window.location.href = upiLink)}
            className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold"
          >
            📱 Open UPI App
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full mt-3 py-3 rounded-2xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
        >
          Close
        </button>
 

      </motion.div>
    </div>
  );
}

export default PaymentQRModal;