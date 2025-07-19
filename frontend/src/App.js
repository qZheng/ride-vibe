import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DiscoverPage from './DiscoverPage';
import UploadPage from './UploadPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DiscoverPage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
