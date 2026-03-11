import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import jsPDF from 'jspdf';
import { ClipLoader } from 'react-spinners';
import { motion, AnimatePresence } from 'framer-motion';
import { predictImage } from '../services/apiService';


function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [inputMode, setInputMode] = useState('file');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {
      });
    }
  }, [cameraOn]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (cameraOn) stopCamera();
    setFile(selected);
    setError('');
    setResult(null);

    if (selected && !selected.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      setFile(null);
      setPreview(null);
      return;
    }

    if (selected) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
    }
  };

  const switchInputMode = (mode) => {
    setInputMode(mode);
    setError('');
    setResult(null);
    if (mode === 'file' && cameraOn) {
      stopCamera();
    }
  };

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Webcam is not supported in this browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;

      setCameraOn(true);
      setError('');
      setResult(null);
    } catch (err) {
      setError('Unable to access webcam. Please allow camera permission.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  };

  const captureFromCamera = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera is not ready yet.');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      setError('Camera is warming up. Please try capture again.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        setError('Failed to capture image from webcam.');
        return;
      }

      const capturedFile = new File([blob], `webcam_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const objectUrl = URL.createObjectURL(blob);

      setFile(capturedFile);
      setPreview(objectUrl);
      setError('');
      setResult(null);
      stopCamera();
    }, 'image/jpeg', 0.95);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);
      const data = await predictImage(formData);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Server Error');
    } finally {
      setLoading(false);
    }
  };

  const handleMoreInfo = (label) => {
    navigate(`/details/${encodeURIComponent(label)}`, {
      state: { 
        resultImage: result.result_image,
        originalImage: result.filename,
        confidence: result.predictions.find(p => p.label === label)?.confidence
      }
    });
  };

  const getExplanationText = (label) => {
    const explanations = {
      'Acral Lentiginous Melanoma': 'A serious form of skin cancer under or around the nail. Early medical diagnosis is important.',
      'Beaus Line': 'Horizontal lines on the nail that can appear after illness, stress, or nutritional deficiency.',
      'Blue Finger': 'Bluish nail color usually linked to circulation or oxygen-related issues that need evaluation.',
      'Clubbing': 'Rounded fingertip and curved nail changes that may be associated with heart or lung conditions.',
      'Healthy Nail': 'The nail appears normal with no significant disease pattern detected by the model.',
      'Onychogryphosis': 'Thickened, overgrown nail often requiring podiatric or dermatology care for proper management.',
      'Pitting': 'Small dents in the nail surface, commonly associated with psoriasis or other inflammatory conditions.',
    };

    return explanations[label] || 'No detailed explanation available for this condition.';
  };

  const handleDownloadReport = async () => {
    if (!result?.filename || !result?.predictions) return;
    setGenerating(true);
  
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
  
    const logo = new Image();
    logo.src = '/logo.png';
  
    logo.onload = async () => {
      doc.addImage(logo, 'PNG', 80, 10, 50, 20);
  
      doc.setFontSize(22);
      doc.setTextColor(88, 24, 69);
      doc.text('Nail Disease Diagnostic Report', 105, 40, { align: 'center' });
      doc.line(30, 45, 180, 45);
  
      const today = new Date();
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Date: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`, 30, 52);
      doc.text(`Patient Name: __________________________`, 30, 62);
      doc.text(`Doctor Name:  __________________________`, 30, 70);
  
      // Fetch analyzed result image (with detection boxes)
      const imageUrl = `${API_ENDPOINTS.STATIC_RESULTS}/${result.result_image}`;
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const objectURL = URL.createObjectURL(blob);
  
        const img = new Image();
        img.src = objectURL;
  
        img.onload = () => {
          doc.addImage(img, 'JPEG', 40, 80, 130, 80);
  
          let y = 170;
          result.predictions.forEach((p, index) => {
            doc.setFontSize(14);
            doc.setTextColor(255, 99, 71);
            doc.text(`Prediction ${index + 1}`, 30, y);
            y += 8;
  
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text(`• Label:`, 35, y);
            doc.setTextColor(34, 139, 34);
            doc.text(p.label, 55, y);
            y += 6;
  
            doc.setTextColor(0);
            doc.text(`• Confidence:`, 35, y);
            doc.setTextColor(34, 139, 34);
            doc.text(`${p.confidence}%`, 65, y);
            y += 6;
  
            doc.setTextColor(0);
            doc.text(`• Explanation:`, 35, y);
            y += 6;

            doc.setTextColor(34, 139, 34);
            const explanation = getExplanationText(p.label);
            const wrappedExplanation = doc.splitTextToSize(explanation, 130);
            doc.text(wrappedExplanation, 40, y);
            y += wrappedExplanation.length * 6 + 6;
  
            if (y > 260) {
              doc.addPage();
              y = 20;
            }
          });
  
          doc.setFontSize(12);
          doc.setTextColor(0);
          doc.text('Signature: __________________________', 30, 280);
  
          doc.setFontSize(10);
          doc.setTextColor(150);
          doc.text('Generated by Nail Disease Detection System', 105, 290, { align: 'center' });
  
          // Show in new tab
          const blob = doc.output('blob');
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
  
          setGenerating(false);
        };
  
        img.onerror = () => {
          console.error('Failed to load image for PDF');
          setGenerating(false);
        };
  
      } catch (err) {
        console.error('Failed to fetch image:', err);
        setGenerating(false);
      }
    };
  
    logo.onerror = () => {
      console.error('Logo failed to load.');
      setGenerating(false);
    };
  };
  
  const handleBackToUpload = () => {
    setResult(null);
    setFile(null);
    setPreview(null);
    setError('');
    stopCamera();
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-6 bg-cover bg-center"
      style={{ backgroundImage: "url('/upload.jpg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-purple-900/50 to-orange-900/60 backdrop-blur-sm z-0" />

      <div className="relative z-10 w-full max-w-xl bg-black bg-opacity-60 p-8 rounded-2xl shadow-2xl text-white backdrop-blur-md border border-purple-500 overflow-y-auto h-full">
        <AnimatePresence mode="wait">
          {!result && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                Upload Nail Image
              </h1>
              <p className="text-sm text-gray-400 mb-6 text-center">
                Upload a nail image to detect potential diseases using AI.
              </p>

              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => switchInputMode('file')}
                  className={`flex-1 py-2 rounded-lg font-semibold ${
                    inputMode === 'file'
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  Use File
                </button>
                <button
                  type="button"
                  onClick={() => switchInputMode('webcam')}
                  className={`flex-1 py-2 rounded-lg font-semibold ${
                    inputMode === 'webcam'
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  Use Webcam
                </button>
              </div>

              {inputMode === 'file' && (
                <div className="border-2 border-dashed border-purple-400 rounded-lg p-6 text-center mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-pink-500 font-medium hover:underline"
                  >
                    Drag & drop or <span className="bg-pink-600 px-2 py-1 rounded text-white ml-2">Browse</span>
                  </label>
                </div>
              )}

              {inputMode === 'webcam' && (
                <>
                  <div className="flex gap-2 mb-4">
                    {!cameraOn ? (
                      <button
                        onClick={startCamera}
                        type="button"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg"
                      >
                        Start Webcam
                      </button>
                    ) : (
                      <button
                        onClick={stopCamera}
                        type="button"
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg"
                      >
                        Stop Webcam
                      </button>
                    )}

                    <button
                      onClick={captureFromCamera}
                      type="button"
                      disabled={!cameraOn}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg"
                    >
                      Capture Photo
                    </button>
                  </div>

                  {cameraOn && (
                    <div className="mb-4">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full rounded-lg border border-gray-600 shadow-md"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  )}
                </>
              )}

              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mb-4 w-64 mx-auto rounded-lg shadow-md border border-gray-600"
                />
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-2 rounded-lg transition duration-200"
              >
                {loading ? <ClipLoader size={24} color="#fff" /> : 'Upload & Predict'}
              </button>

              {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-900 p-4 rounded-lg border border-purple-500 shadow-lg"
            >
              {result.filename && (
                <div className="mb-4">
                  <div className="mb-6 text-center">
                    <h2 className="text-lg font-semibold text-purple-400 mb-2">Predicted Results</h2>
                    <div className="relative inline-block w-[300px]">
                      <img
                        src={`${API_ENDPOINTS.STATIC_RESULTS}/${result.result_image}`}
                        alt="Result with Predictions"
                        className="w-full h-auto rounded-md border border-purple-600 shadow-lg object-contain"
                      />
                      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {result.predictions[0]?.label}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {result.predictions && (
                <>
                  <h2 className="text-lg font-semibold text-purple-300 mb-2">Predicted Results:</h2>
                  {result.predictions.map((p, i) => (
                    <div key={i} className="mb-3 p-3 border border-gray-700 rounded-md bg-gray-800">
                      <p><strong>Label:</strong> {p.label}</p>
                      <p><strong>Confidence:</strong> {p.confidence}%</p>
                      
                      <button
                        onClick={() => handleMoreInfo(p.label)}
                        className="mt-2 text-sm text-blue-400 underline hover:text-blue-300"
                      >
                        Show More
                      </button>
                    </div>
                  ))}
                </>
              )}

              <button
                onClick={handleDownloadReport}
                className="mt-4 p-2 bg-pink-600 hover:bg-pink-700 text-white rounded w-full"
              >
                Preview & Download Report
              </button>

              {generating && (
                <p className="text-center text-sm text-yellow-300 mt-2 animate-pulse">
                  Generating PDF report...
                </p>
              )}

              <button
                onClick={handleBackToUpload}
                className="mt-2 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded w-full"
              >
                Back to Upload
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Upload;
