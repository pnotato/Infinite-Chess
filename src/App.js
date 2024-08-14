import React, { useState, useEffect } from 'react';
import Lobby from './lobby';
import PlayPage from './chess/components/playPage';
import { BrowserRouter, Route, Routes, createBrowserRouter, RouterProvider } from 'react-router-dom';
import socket from './chess/socket';
import AnimatedBackground from './animatedBackground';

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Lobby />
    },
    {
      path: "/play",
      element: <PlayPage />
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