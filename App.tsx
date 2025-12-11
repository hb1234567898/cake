import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, Float } from '@react-three/drei';
import confetti from 'canvas-confetti';
import { CakeScene } from './components/Cake';
import { generateBirthdayWish } from './services/gemini';
import { AppState } from './types';

// Icons
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 9a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-1a4 4 0 10-5.135 6.301 1 1 0 005.135-6.301zM17 3a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6h-1a1 1 0 110-2h1V3a1 1 0 011-1zm-2 9a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INITIAL);
  const [stackStep, setStackStep] = useState(-1); // -1 means nothing, 0=layer1, 1=layer2... 4=candle
  const [wish, setWish] = useState<string>("");
  const [showHappyBirthday, setShowHappyBirthday] = useState(false);
  const [showWish, setShowWish] = useState(false);
  const [loadingWish, setLoadingWish] = useState(false);

  // Pre-fetch a wish
  useEffect(() => {
    const fetchWish = async () => {
      setLoadingWish(true);
      const text = await generateBirthdayWish();
      setWish(text);
      setLoadingWish(false);
    };
    fetchWish();
  }, []);

  const startCelebration = () => {
    setAppState(AppState.STACKING);
    // Start sequence
    // Trigger layer 0 immediately
    setStackStep(0);
  };

  const handleLayerLanded = (index: number) => {
    // When a layer lands, wait a bit then trigger next
    if (index < 3) {
      setTimeout(() => setStackStep(index + 1), 500);
    } else if (index === 3) {
      // Top layer landed, trigger candle
      setTimeout(() => {
          setStackStep(4);
          setAppState(AppState.READY_TO_LIGHT);
      }, 600);
    }
  };

  const lightCandle = useCallback(() => {
    if (appState !== AppState.READY_TO_LIGHT) return;
    
    setAppState(AppState.CELEBRATING);
    
    // Fireworks/Confetti Effect
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#F9A8D4', '#F472B6', '#EC4899', '#FFD700']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#F9A8D4', '#F472B6', '#EC4899', '#FFD700']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Show text sequence
    setShowHappyBirthday(true);

    // After 3 seconds, hide Happy Birthday and show wish
    setTimeout(() => {
      setShowHappyBirthday(false);
      setTimeout(() => {
          setShowWish(true);
          setAppState(AppState.FINISHED);
      }, 1000); // Wait for fade out
    }, 3500);

  }, [appState]);

  return (
    <div className="relative w-full h-screen bg-pink-50">
      
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows camera={{ position: [0, 4, 10], fov: 50 }}>
          <Environment preset="sunset" />
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[5, 10, 5]} 
            intensity={1} 
            castShadow 
            shadow-mapSize-width={1024} 
            shadow-mapSize-height={1024} 
          />
          
          <Float speed={appState === AppState.CELEBRATING ? 2 : 0} rotationIntensity={0.2} floatIntensity={0.5}>
            <CakeScene 
                stackStep={stackStep} 
                onLayerLanded={handleLayerLanded} 
                candleLit={appState === AppState.CELEBRATING || appState === AppState.FINISHED}
                onCandleClick={lightCandle}
            />
          </Float>

          <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
          <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2} minPolarAngle={0} />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center p-4">
        
        {/* Start Button */}
        {appState === AppState.INITIAL && (
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl pointer-events-auto text-center animate-bounce-slow">
            <h1 className="text-3xl font-bold text-pink-600 mb-4 font-handwriting">It's a Special Day!</h1>
            <button 
              onClick={startCelebration}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-bold shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 flex items-center mx-auto"
            >
              <SparklesIcon />
              Build the Cake
            </button>
          </div>
        )}

        {/* Hint for Candle */}
        {appState === AppState.READY_TO_LIGHT && (
            <div className="absolute bottom-20 animate-pulse bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm">
                Tap the candle to light it!
            </div>
        )}

        {/* Happy Birthday Big Text */}
        <div 
          className={`transition-all duration-1000 ease-in-out transform ${showHappyBirthday ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10'}`}
        >
          <h1 className="text-6xl md:text-8xl font-handwriting text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 drop-shadow-lg text-center leading-tight">
            Happy<br/>Birthday!
          </h1>
        </div>

        {/* Final Wish Message */}
        <div 
           className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 pointer-events-none transition-all duration-1000 delay-500 ${showWish ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
        >
          {showWish && (
             <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-2xl p-8 text-center border-2 border-pink-100 pointer-events-auto">
                <div className="mb-4 text-4xl">🎂</div>
                <p className="text-xl md:text-2xl text-gray-800 font-medium leading-relaxed italic">
                  {wish || "May your day be as sweet as this cake!"}
                </p>
                <div className="mt-6 flex justify-center gap-2">
                    {loadingWish ? (
                        <span className="text-xs text-gray-400">Thinking of a new wish...</span>
                    ) : (
                        <button 
                          onClick={async () => {
                             setLoadingWish(true);
                             const newWish = await generateBirthdayWish();
                             setWish(newWish);
                             setLoadingWish(false);
                          }}
                          className="text-xs text-pink-500 underline hover:text-pink-700 cursor-pointer pointer-events-auto"
                        >
                           Generate another wish with Gemini
                        </button>
                    )}
                </div>
                <div className="mt-4">
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-pink-100 text-pink-600 rounded-lg text-sm hover:bg-pink-200 transition pointer-events-auto"
                  >
                    Play Again
                  </button>
                </div>
             </div>
          )}
        </div>

      </div>

      {/* Powered by Gemini Badge */}
      <div className="absolute bottom-4 right-4 z-20 opacity-50 text-[10px] text-gray-500 pointer-events-none">
        Powered by Google Gemini & React Three Fiber
      </div>

    </div>
  );
};

export default App;
