import React, { useEffect, useRef } from 'react';

const Countdown = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (window.Alpine && containerRef.current) {
      window.Alpine.initTree(containerRef.current);
    } else {
      const handleAlpine = () => {
        if (containerRef.current) {
          window.Alpine.initTree(containerRef.current);
        }
      };
      document.addEventListener('alpine:init', handleAlpine);
      return () => document.removeEventListener('alpine:init', handleAlpine);
    }
  }, []);

  return (
    <div ref={containerRef} x-data="countdown" className="card p-30 glass-card text-center grid gap-15">
      <h3>Event Countdown</h3>
      <input
        type="datetime-local"
        className="pill w-full"
        x-model="target"
      />
      <div
        className="text-3xl font-mono"
        x-text="left"
      >
        Set Target
      </div>
    </div>
  );
};

export default Countdown;
