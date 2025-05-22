import React from 'react';
import Header from '../components/Header';
import { motion } from 'framer-motion';

const nailDiseases = [
  { title: "Acral Lentiginous Melanoma", image: "/nails/melanoma.png" },
  { title: "Beau's Lines", image: "/nails/beaus-line.jpg" },
  { title: "Blue Finger", image: "/nails/blue-finger.jpg" },
  { title: "Clubbing", image: "/nails/clubbing.jpg" },
  { title: "Healthy Nail", image: "/nails/healthy.jpg" },
  { title: "Koilonychia", image: "/nails/koilonychia.jpg" },
  { title: "Muehrcke's Lines", image: "/nails/muehrckes-lines.jpg" },
  { title: "Onychogryphosis", image: "/nails/onychogryphosis.jpg" },
  { title: "Pitting", image: "/nails/pitting.jpg" },
  { title: "Terry's Nail", image: "/nails/terry.png" }
];

function Disease() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-gray-900 text-white pt-24 px-4">
        <div className="max-w-6xl mx-auto py-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-center mb-12 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 bg-clip-text text-transparent"
          >
            Nail Disease Gallery
          </motion.h1>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {nailDiseases.map((disease, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-purple-800 via-black to-purple-900 text-white rounded-2xl shadow-lg hover:shadow-purple-600 border border-purple-700 hover:border-orange-400 cursor-pointer overflow-hidden transition"
              >
                <img
                  src={disease.image}
                  alt={disease.title}
                  className="h-48 w-full object-cover"
                  onError={(e) => { e.target.src = '/nails/default.jpg'; }}
                />
                <div className="p-5">
                  <h2 className="text-lg font-bold text-orange-300">
                    {disease.title}
                  </h2>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Disease;
