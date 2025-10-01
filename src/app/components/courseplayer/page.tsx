'use client';
import { useEffect, useRef } from 'react';
import logo from '../../assets/logo.png'; // Import the logo correctly

interface MuxPlayerProps {
  logoUrl?: string; // Make this optional, fallback to default imported logo
}

export default function MuxPlayer({ logoUrl }: MuxPlayerProps) {
  const playerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!playerRef.current) return;

    const playerEl = playerRef.current;

    const handleLoaded = () => console.log('Mux player loaded');
    const handleEnded = () => console.log('Video ended');

    // Attach event listeners
    playerEl.addEventListener('loadedmetadata', handleLoaded);
    playerEl.addEventListener('ended', handleEnded);

    return () => {
      playerEl.removeEventListener('loadedmetadata', handleLoaded);
      playerEl.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div style={{ position: 'relative', paddingTop: '56.25%' }}>
      {/* Mux Player */}
      <mux-player
        ref={playerRef}
        stream-type="on-demand"
        playback-id="Myua00O02XzXXQ1hbkVV2zSks1SrfzNPYIbOdjjTE4a2U"
        metadata-video-title="Test Video"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        controls
        autoplay={false}
      ></mux-player>

      {/* Logo Overlay */}
      <img
        src={logoUrl || logo.src} // Use provided URL or default imported logo
        alt="Logo"
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '150px',      // Adjust logo size
          height: 'auto',
          zIndex: 10,
          pointerEvents: 'none', // Allow clicks to pass through
        }}
      />

      {/* Include Mux Player script */}
      <script src="https://cdn.jsdelivr.net/npm/@mux/mux-player"></script>
    </div>
  );
}
