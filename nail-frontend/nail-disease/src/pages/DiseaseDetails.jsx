import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';

const diseaseDetails = {
  "Acral Lentiginous Melanoma": {
    advice: "If a fingernail or toenail has a new or changing dark streak, it’s time to see a dermatologist for a skin cancer check...",
    treatment: "Surgical removal, possible chemotherapy or radiation."
  },
  "Beaus Line": {
    advice: "Monitor for underlying conditions like malnutrition or illness...",
    treatment: "Treat the underlying cause; nails usually regrow normally."
  },
  "Blue Finger": {
    advice: "Check for circulation issues or cyanosis.",
    treatment: "Improve oxygen flow, seek medical advice if persistent."
  },
  "Clubbing": {
    advice: "May indicate lung or heart disease; see a doctor.",
    treatment: "Treat underlying health condition (e.g., COPD, heart disease)."
  },
  "Healthy Nail": {
    advice: "Your nail looks healthy!",
    treatment: "No treatment needed."
  },
  "Koilonychia": {
    advice: "Could indicate iron deficiency anemia.",
    treatment: "Iron supplements, dietary changes."
  },
  "Lindsay-s Nail": {
    advice: "Often seen in chronic kidney disease patients.",
    treatment: "Manage underlying kidney condition."
  },
  "Muehrcke's Lines": {
    advice: "Can be due to hypoalbuminemia.",
    treatment: "If albumin is too low, IV albumin may be administered."
  },
  "Onychogryphosis": {
    advice: `Overgrown, thick nail, often resembling a ram's horn...`,
    treatment: "Medical trimming or permanent nail bed removal."
  },
  "Pitting": {
    advice: "May be a sign of psoriasis or alopecia areata.",
    treatment: "Topical steroids, phototherapy or systemic treatment."
  },
  "Terry's Nail": {
    advice: "May indicate liver or heart failure.",
    treatment: "Treat underlying liver/cardiac disease."
  }
};

function DiseaseDetails() {
  const { disease } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const decodedDisease = decodeURIComponent(disease);
  const details = diseaseDetails[decodedDisease];
  const resultImage = location.state?.resultImage;
  const predictions = location.state?.predictions || [];

  return (
    <div className="relative min-h-screen bg-cover bg-center bg-no-repeat bg-[url('/upload.jpg')]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>

      <Header />

      <div className="relative z-10 px-6 pt-24 pb-16 max-w-4xl mx-auto text-white">
        <button
          onClick={() => navigate('/')}
          className="mb-8 inline-flex items-center gap-2 text-blue-300 hover:text-blue-500 font-medium transition duration-200"
        >
          <span className="text-lg">←</span> Back to Upload
        </button>

        <div className="bg-gray-900 bg-opacity-80 p-8 rounded-2xl shadow-2xl border border-purple-500 transition-all duration-300 hover:shadow-purple-700">
          <h1 className="text-4xl font-extrabold text-purple-300 mb-6">{decodedDisease}</h1>

          {resultImage && resultImage.includes('.') && (
            <img
              src={`http://localhost:5000/static/uploads/${resultImage.replace(/\\/g, '/')}`}
              alt="Analyzed result"
              className="w-full max-h-[400px] object-contain mb-6 border-2 border-purple-400 rounded-xl"
            />
          )}

          {details ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-purple-400 mb-2">Advice</h2>
                <p className="whitespace-pre-line text-lg leading-relaxed text-gray-200">
                  {details.advice}
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-green-400 mb-2">Treatment</h2>
                <p className="whitespace-pre-line text-lg leading-relaxed text-gray-200">
                  {details.treatment}
                </p>
              </div>
            </>
          ) : (
            <p className="text-red-400 text-lg mt-6">No additional information available for this disease.</p>
          )}

          {predictions.length > 1 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-yellow-300 mb-3">Other Detected Conditions</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                {predictions
                  .filter((d) => d !== decodedDisease)
                  .map((d, index) => (
                    <li
                      key={index}
                      className="cursor-pointer text-blue-300 hover:text-blue-500 underline"
                      onClick={() =>
                        navigate(`/details/${encodeURIComponent(d)}`, {
                          state: { resultImage, predictions }
                        })
                      }
                    >
                      {d}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DiseaseDetails;
