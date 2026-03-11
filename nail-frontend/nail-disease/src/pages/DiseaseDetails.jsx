import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { API_ENDPOINTS } from '../config/api';
import { ClipLoader } from 'react-spinners';
import { fetchDiseaseExplanation } from '../services/apiService';
import jsPDF from 'jspdf';

function DiseaseDetails() {
  const { disease } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [aiExplanation, setAiExplanation] = useState('');
  const [geminiExplanation, setGeminiExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [error, setError] = useState('');

  const decodedDisease = decodeURIComponent(disease);
  const resultImage = location.state?.resultImage;
  const confidence = location.state?.confidence;

  useEffect(() => {
    const fetchExplanation = async () => {
      setLoading(true);
      setError('');
      setGeminiExplanation('');
      try {
        const data = await fetchDiseaseExplanation(decodedDisease);
        if (data.unavailable) {
          setAiExplanation(getBasicInfo(decodedDisease));
          setError('AI explanation endpoint is not available. Showing local information.');
        } else {
          setAiExplanation(data.explanation);
          setGeminiExplanation(data.explanation);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load AI explanation. Using basic information.');
        setAiExplanation(getBasicInfo(decodedDisease));
      } finally {
        setLoading(false);
      }
    };

    fetchExplanation();
  }, [decodedDisease]);

  const getBasicInfo = (diseaseName) => {
    const basicInfo = {
      "Acral Lentiginous Melanoma": "A rare but serious form of skin cancer affecting nails. Requires immediate medical attention.",
      "Beaus Line": "Horizontal grooves in nails indicating temporary growth interruption. Usually resolves as nail grows.",
      "Blue Finger": "Bluish discoloration indicating poor circulation or oxygen levels. Seek medical evaluation.",
      "Clubbing": "Enlarged fingertips and curved nails, often related to lung or heart conditions.",
      "Healthy Nail": "Your nails appear healthy! Continue good nail care practices.",
      "pitting": "Small depressions in nails, often associated with psoriasis or alopecia areata.",
      "Onychogryphosis": "Severely thickened, curved nails requiring professional medical care.",
      
    };
    return basicInfo[diseaseName] || "Please consult a healthcare professional for accurate diagnosis and treatment.";
  };

  const formatAIResponse = (text) => {
    // Convert markdown-like formatting to HTML
    return text.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h3 key={index} className="text-xl font-bold text-purple-300 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
      } else if (line.startsWith('*')) {
        return <p key={index} className="text-gray-200 ml-4 mb-1">{line}</p>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else if (line.match(/^\d+\./)) {
        return <p key={index} className="text-gray-200 font-semibold mt-3 mb-1">{line}</p>;
      } else {
        return <p key={index} className="text-gray-200 mb-2 leading-relaxed">{line}</p>;
      }
    });
  };

  const handleDownloadPdf = async () => {
    if (!geminiExplanation) {
      setError('Gemini explanation is required to generate the PDF report.');
      return;
    }

    setGeneratingPdf(true);

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;

      doc.setFontSize(18);
      doc.setTextColor(88, 24, 69);
      doc.text('Nail Disease Explanation Report', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Disease: ${decodedDisease}`, margin, 32);
      if (confidence) {
        doc.text(`Confidence: ${confidence}%`, margin, 40);
      }

      const generatedAt = new Date().toLocaleString();
      doc.setFontSize(10);
      doc.text(`Generated: ${generatedAt}`, margin, confidence ? 47 : 40);

      let y = confidence ? 58 : 51;

      if (resultImage) {
        try {
          const imageUrl = `${API_ENDPOINTS.STATIC_RESULTS}/${resultImage}`;
          const response = await fetch(imageUrl);
          const imageBlob = await response.blob();

          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(imageBlob);
          });

          const imageElement = await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = dataUrl;
          });

          const maxImageWidth = maxWidth;
          const maxImageHeight = 90;
          const imageScale = Math.min(maxImageWidth / imageElement.width, maxImageHeight / imageElement.height);
          const imageWidth = imageElement.width * imageScale;
          const imageHeight = imageElement.height * imageScale;
          const imageX = (pageWidth - imageWidth) / 2;

          doc.setFontSize(13);
          doc.setTextColor(88, 24, 69);
          doc.text('Analyzed Image (Bounding Box)', margin, y);
          y += 6;

          const imageFormat = imageBlob.type?.includes('png') ? 'PNG' : 'JPEG';
          doc.addImage(dataUrl, imageFormat, imageX, y, imageWidth, imageHeight);
          y += imageHeight + 10;
        } catch {
          setError('Failed to include analyzed image in PDF. Downloaded report contains explanation text only.');
          y += 2;
        }
      }

      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(13);
      doc.setTextColor(88, 24, 69);
      doc.text('Gemini AI Explanation', margin, y);
      y += 8;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);

      const cleanExplanation = geminiExplanation
        .replace(/\*\*/g, '')
        .replace(/^\*\s?/gm, '- ')
        .trim();

      const lines = doc.splitTextToSize(cleanExplanation, maxWidth);
      const lineHeight = 6;

      lines.forEach((line) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });

      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      y += 6;
      doc.setDrawColor(220, 53, 69);
      doc.rect(margin, y, maxWidth, 16);
      doc.setFontSize(9);
      doc.setTextColor(120, 0, 0);
      doc.text('Medical disclaimer: This report is for educational use and is not a medical diagnosis.', margin + 2, y + 6);
      doc.text('Please consult a qualified healthcare provider for professional advice.', margin + 2, y + 12);

      doc.save(`${decodedDisease.replace(/\s+/g, '_')}_gemini_report.pdf`);
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-cover bg-center bg-no-repeat bg-[url('/upload.jpg')]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>

      <Header />

      <div className="relative z-10 px-6 pt-24 pb-16 max-w-5xl mx-auto text-white">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-blue-300 hover:text-blue-500 font-medium transition duration-200"
        >
          <span className="text-lg">←</span> Back
        </button>

        <div className="bg-gray-900 bg-opacity-90 p-8 rounded-2xl shadow-2xl border border-purple-500 transition-all duration-300 hover:shadow-purple-700">
          {/* Disease Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-extrabold text-purple-300 mb-2">{decodedDisease}</h1>
            {confidence && (
              <p className="text-lg text-green-400">Detection Confidence: {confidence}%</p>
            )}
          </div>

          {/* Result Image */}
          {resultImage && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-purple-400 mb-4">Analyzed Image</h2>
              <img
                src={`${API_ENDPOINTS.STATIC_RESULTS}/${resultImage}`}
                alt="Analysis Result"
                className="w-full max-w-2xl max-h-[320px] mx-auto object-contain mb-4 border-2 border-purple-400 rounded-xl shadow-lg"
              />
              <p className="text-sm text-gray-400 italic">Image showing detected nail condition with bounding boxes</p>
            </div>
          )}

          {/* AI-Generated Explanation */}
          <div className="bg-gray-800 bg-opacity-60 p-6 rounded-xl border border-purple-400">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-semibold text-purple-300">
                AI-Powered Detailed Explanation
              </h2>
              <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-xs rounded-full">
                Gemini AI
              </span>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <ClipLoader size={50} color="#a78bfa" />
                <p className="mt-4 text-purple-300 animate-pulse">Generating comprehensive explanation...</p>
              </div>
            )}

            {error && !loading && (
              <div className="bg-yellow-900 bg-opacity-50 border border-yellow-500 rounded-lg p-4 mb-4">
                <p className="text-yellow-200">⚠️ {error}</p>
              </div>
            )}

            {!loading && aiExplanation && (
              <div className="prose prose-invert max-w-none">
                {formatAIResponse(aiExplanation)}
              </div>
            )}

            {!loading && geminiExplanation && (
              <div className="mt-6">
                <button
                  onClick={handleDownloadPdf}
                  disabled={generatingPdf}
                  className="px-5 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200"
                >
                  {generatingPdf ? 'Generating PDF...' : 'Download Gemini PDF Report'}
                </button>
              </div>
            )}
          </div>

          {/* Medical Disclaimer */}
          <div className="mt-8 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-300 mb-2">⚕️ Medical Disclaimer</h3>
            <p className="text-sm text-gray-300">
              This AI-generated information is for educational purposes only and should not replace professional medical advice. 
              Please consult a qualified healthcare provider or dermatologist for accurate diagnosis and treatment of any nail condition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiseaseDetails;
