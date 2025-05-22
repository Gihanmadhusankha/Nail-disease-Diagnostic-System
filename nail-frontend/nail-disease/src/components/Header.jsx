import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="bg-gradient-to-r from-purple-900 via-black to-purple-900 p-4 shadow-md fixed top-0 left-0 right-0 z-20 border-b border-purple-700">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <img
            src="/logo2.png"
            alt="Logo"
            className="w-10 h-10 rounded-full border border-purple-500 shadow-md"
          />
          <Link
            to="/"
             className="text-white text-2xl  font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent animate-pulse"
          >
             Nail Disease Detection
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/nail-care"
            className="text-white hover:text-pink-300 transition duration-300"
          >
            Nail Care Basics
          </Link>
          <Link
            to="/disease"
            className="text-white hover:text-pink-300 transition duration-300"
          >
            Diseases
          </Link>
        </nav>

        {/* Mobile Hamburger */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-white focus:outline-none"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <Link
            to="/nail-care"
            className="block text-white hover:text-pink-300 transition duration-300"
            onClick={() => setIsOpen(false)}
          >
            Nail Care Basics
          </Link>
          <Link
            to="/disease"
            className="block text-white hover:text-pink-300 transition duration-300"
            onClick={() => setIsOpen(false)}
          >
            Diseases
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
