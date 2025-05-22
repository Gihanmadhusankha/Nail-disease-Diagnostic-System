import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/Header";

const Home = () => {
  return (
    <div
      className="relative min-h-screen flex flex-col bg-cover bg-center px-4"
      style={{ backgroundImage: "url('/doc.jpg')" }}
    >
      {/* Header */}
      <Header />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-purple-900/50 to-orange-900/60 backdrop-blur-sm z-0" />

      {/* Rotating Logo - OUTSIDE the card */}
      <motion.img
  src="/logo2.png"
  alt="Logo"
  className="w-28 h-28 mx-auto mt-20 mb-4 rounded-full border-4 border-black-400 shadow-[0_0_20px_rgba(192,132,252,0.8)] z-10 relative"
  animate={{
    rotate: [0, 360],
    y: [0, -10, 0],
    scale: [1, 1.05, 1]
  }}
  transition={{
    
    scale: {
      repeat: Infinity,
      duration: 2,
      ease: "easeInOut",
      repeatType: "mirror"
    }
  }}
/>



      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-3xl w-full text-center bg-black bg-opacity-70 p-10 md:p-12 rounded-3xl shadow-2xl text-white backdrop-blur-md border border-purple-500 mx-auto mt-4"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-400 to-orange-300 bg-clip-text text-transparent mb-4"
        >
          Nail Disease Detection System
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-md md:text-lg text-gray-300 mb-8 leading-relaxed"
        >
          Upload a nail image to detect possible diseases using our AI-powered prediction tool.
          Fast, accurate, and crucial for early detection.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link
            to="/upload"
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
          >
            Get Started
          </Link>
          <Link
            to="/history"
            className="bg-white hover:bg-purple-100 text-purple-700 border border-purple-400 font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
          >
            View History
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
