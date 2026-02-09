import { useState, Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Settings2, Volume2, VolumeX, Heart, Play, Activity } from 'lucide-react';
import HandTracker from './components/HandTracker';
import ParticleSystem from './components/ParticleSystem';
import { useHand } from './context/HandContext';
import PhotoLayer from './components/PhotoLayer';

export default function App() {
  const [pattern, setPattern] = useState('scatter');
  const [color, setColor] = useState('#FFB6C1');
  const [customText, setCustomText] = useState('HAPPY VALENTINE');
  const [showUI, setShowUI] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [handsVisible, setHandsVisible] = useState(0);
  const [isHandOpen, setIsHandOpen] = useState(false);
  const audioRef = useRef(null);

  const isMobile = window.innerWidth <= 768;
  const particleCount = 3000;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      if (!isMuted && hasStarted) {
        audioRef.current.play().catch(() => { });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMuted, hasStarted]);

  useEffect(() => {
    if (hasStarted) {
      if (handsVisible > 0 && !isHandOpen) {
        setPattern('text_valentine');
      } else {
        setPattern('scatter');
      }
    }
  }, [handsVisible, isHandOpen, hasStarted]);

  const startApp = () => {
    setHasStarted(true);
    setIsMuted(false);
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => { });
    }
  };

  return (
    <main style={{ background: '#000', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>

      <div className="watermark">from adan</div>


      {/* CLONED PHOTO WALL (2 Hands PALMS) - Kept as DOM for full screen performance */}
      <div className={`photo-wall ${(handsVisible >= 2 && isHandOpen) ? 'active' : ''}`}>
        {[...Array(isMobile ? 30 : 100)].map((_, i) => (
          <div
            key={i}
            className="wall-item-container"
            style={{
              '--rot': `${(Math.random() - 0.5) * 30}deg`,
              '--delay': `${(i % 12) * 0.08}s`
            }}
          >
            <img src={i % 2 === 0 ? "/couple1.jpeg" : "/couple2.jpeg"} className="wall-item" alt="forever" />
            <span className="mini-heart" style={{ top: '10%', left: '10%', animationDelay: '0.2s' }}>❤️</span>
            <span className="mini-heart" style={{ bottom: '15%', right: '12%', animationDelay: '0.5s' }}>💖</span>
            <span className="mini-heart" style={{ top: '20%', right: '15%', animationDelay: '0.8s', fontSize: '10px' }}>💕</span>
          </div>
        ))}
      </div>

      {!hasStarted && (
        <div className="premium-start-screen">
          {[...Array(isMobile ? 4 : 8)].map((_, i) => (
            <Heart key={i} className="floating-bg-heart" size={120 + i * 40} color="#FF1493"
              style={{ left: `${Math.random() * 80}%`, top: `${Math.random() * 80}%`, animationDelay: `${i * 2}s` }} />
          ))}

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Heart size={80} color="#FF1493" fill="#FF1493" style={{ marginBottom: 25, filter: 'drop-shadow(0 0 40px #FF1493)' }} className="pulse" />
            <h1 className="main-title" style={{ letterSpacing: '8px' }}>FOR MY SWEET HEART</h1>

            <div className="instruction-box">
              <span className="instruction-emoji" title="Buka: Hambur Kebahagiaan">🖐️</span>
              <span className="instruction-emoji" title="Kepal: Pesan Sejuta Sayang">✊</span>
              <span className="instruction-emoji" title="Dua Kepal: 3D PHOTO VORTEX">👊👊</span>
              <span className="instruction-emoji" title="2 Tangan Terbuka: Clone Story">🙌</span>
            </div>

            <button onClick={startApp} className="glow-button">
              <Play size={26} fill="white" /> OPEN YOUR GIFT
            </button>
          </div>
        </div>
      )}

      {/* UI Controls */}
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 200, display: 'flex', gap: 15 }}>
        <button className="ui-toggle-btn-small" style={{ width: 45, height: 45, border: 'none', background: 'rgba(255,255,255,0.08)', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(10px)' }} onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? <VolumeX size={20} color="white" /> : <Volume2 size={20} color="#FF69B4" />}
        </button>
        <button className="ui-toggle-btn-small" style={{ width: 45, height: 45, border: 'none', background: 'rgba(255,255,255,0.08)', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(10px)' }} onClick={() => setShowUI(!showUI)}>
          <Settings2 size={20} color="white" />
        </button>
      </div>

      <audio ref={audioRef} loop src="/song.mp3" />

      {/* Main 3D Experience */}
      <div style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0, zIndex: 1, background: '#000' }}>
        <Canvas dpr={isMobile ? 1 : [1, 1.5]} gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={55} />
          <color attach="background" args={['#000000']} />
          <Suspense fallback={<mesh><textGeometry args={['LOADING...', { size: 1, height: 0.1 }]} /></mesh>}>
            <ParticleSystem pattern={pattern} color={color} customText={customText} count={particleCount} hasStarted={hasStarted} />
            <PhotoLayer onHandCountChange={setHandsVisible} onOpennessChange={setIsHandOpen} />
          </Suspense>
        </Canvas>
      </div>


      {showUI && (
        <div className="ui-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}><span style={{ fontWeight: '800', color: 'white', fontSize: '14px' }}>SETTINGS</span><button onClick={() => setShowUI(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px' }}>×</button></div>
          <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '8px' }}>CUSTOM MESSAGE</label>
          <input className="text-input" style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', width: '100%', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} value={customText} onChange={(e) => setCustomText(e.target.value.toUpperCase())} placeholder="TYPE MESSAGE..." />
        </div>
      )}
      <HandTracker />
    </main>
  );
}
