import React, { useState, useEffect } from 'react';
import Lobby from './lobby';
import PlayPage from './chess/components/playPage';
import { BrowserRouter, Route, Routes, createBrowserRouter, RouterProvider } from 'react-router-dom';
import socket from './chess/socket';
import AnimatedBackground from './chess/components/animatedBackground/animatedBackground.js';
import Chessboard from './chess/components/chessboard/chessboard.tsx';
import './App.css';

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Lobby />
    },
    {
      path: "/play",
      element: <PlayPage />
    },
    {
      path: "/dev",
      element: <Chessboard />
    }
    
  ]);

  return (
    <>
      <AnimatedBackground />
      <RouterProvider router={router} />
    </>
  );
}

export default App;