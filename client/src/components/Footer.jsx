function Footer() {
  return (
    <footer className="w-full border-t border-slate-800 bg-[#08111f] mt-16">

      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">

          {/* Left */}

          <div className="text-center lg:text-left">

            <h2 className="text-white font-bold text-xl">
              ❤️ Shadow Chat
            </h2>

            <p className="text-slate-400 mt-2 max-w-sm">
              Secure real-time chat rooms built for fast,
              simple and private conversations.
            </p>

          </div>

          {/* Right */}

          <div className="flex flex-wrap justify-center gap-6 text-sm">

            <button className="text-slate-400 hover:text-cyan-400 transition">
              Privacy
            </button>

            <button className="text-slate-400 hover:text-cyan-400 transition">
              Terms
            </button>

            <button className="text-slate-400 hover:text-cyan-400 transition">
              Refund
            </button>

            <button className="text-slate-400 hover:text-cyan-400 transition">
              Contact
            </button>

          </div>

        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 text-center text-slate-500 text-sm">

          © {new Date().getFullYear()} Shadow Chat.
          Built with ❤️ by Space Bunny.

        </div>

      </div>

    </footer>
  );
}

export default Footer;