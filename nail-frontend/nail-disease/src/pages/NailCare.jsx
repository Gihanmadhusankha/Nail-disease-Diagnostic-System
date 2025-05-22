import React from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const nailTips = [
  {
    title: "Tips for Healthy Nails",
    description: "Nails reflect our overall health, which is why proper nail care is so important. Here are dermatologists’ tips for keeping your nails healthy.",
    image: "/nail-changes.jpg",
    link: "/advice/nail-changes"
  },
  {
    title: "Biting Your Nails? How to Stop",
    description: "Nail biting typically begins in childhood and can continue through adulthood. These tips can help.",
    image: "/nail-biting.jpg",
    link: "/advice/nail-biting"
  },
  {
    title: "Injured Nail: How to Treat it at Home",
    description: "Learn when to treat an injured nail at home, what brings relief, and how to protect it.",
    image: "/injured-nail.jpg",
    link: "/advice/injured-nail"
  }
];

function NailCare() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-gray-900 text-white pt-24 px-4">
        <div className="max-w-6xl mx-auto py-12">
          {/* Animated Title */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-center mb-12 bg-gradient-to-r from-white-300 via-purple-200 to-orange-400 bg-clip-text text-transparent"
          >
            Nail Care Tips & Advice
          </motion.h1>

          <div className="grid md:grid-cols-3 gap-8">
            {nailTips.map((tip, index) => (
              <motion.div
                key={index}
                onClick={() => navigate(tip.link)}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-purple-800 via-black to-purple-900 text-white rounded-2xl shadow-lg hover:shadow-purple-600 border border-purple-700 hover:border-orange-400 cursor-pointer overflow-hidden transition"
              >
                <img
                  src={tip.image}
                  alt={tip.title}
                  className="h-48 w-full object-cover"
                />
                <div className="p-5">
                  <h2 className="text-lg font-bold text-orange-300 mb-2">
                    {tip.title}
                  </h2>
                  <p className="text-gray-300 text-sm">{tip.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default NailCare;
