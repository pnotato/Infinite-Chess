import React, { useState, useEffect } from 'react';
import Lobby from './lobby';
import PlayPage from './chess/components/playPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<></>} />
        <Route index element={<Lobby />} />
        <Route path="play" element={<PlayPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;