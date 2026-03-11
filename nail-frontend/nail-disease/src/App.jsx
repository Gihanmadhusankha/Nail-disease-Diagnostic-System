import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Upload from './pages/Upload';
import History from './pages/History';
import Home from './pages/Home';
import DiseaseDetails from './pages/DiseaseDetails';
import NailCare from './pages/NailCare';
import Disease from './pages/Disease';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/history" element={<History />} />
        <Route path="/details/:disease" element={<DiseaseDetails />} />
        <Route path="/nail-care" element={<NailCare />} />
        <Route path="/disease" element={<Disease />} />
      </Routes>
    </Router>
  );
}

export default App;
