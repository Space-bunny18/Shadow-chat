import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center px-6">
      <div className="text-center">

        <h1 className="text-8xl font-bold text-cyan-400">
          404
        </h1>

        <h2 className="text-3xl text-white mt-4">
          Page Not Found
        </h2>

        <p className="text-slate-400 mt-3 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link
          to="/"
          className="inline-block mt-8 px-8 py-3 rounded-xl bg-cyan-500 text-black font-semibold hover:scale-105 transition"
        >
          Return Home
        </Link>

      </div>
    </div>
  );
}