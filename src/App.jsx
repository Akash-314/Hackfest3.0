import React, { useState } from 'react';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {/* Loading Screen: Big Hackfest3.0, clean dark green gradient border, no glow, no container */}
      {isLoading && (
        <LoadingScreen onFinish={() => setIsLoading(false)} />
      )}

      {/* Pure Background Image: img.jpg */}
      <div className="bg-image-container">
        <div className="bg-image" />
      </div>

      {/* Main page is kept completely empty after loading page completes */}
    </>
  );
}
