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
    <div
      ref={containerRef}
      x-data="{
        target: '',
        left: 'Set Target',
        intervalId: null,
        init() {
          this.intervalId = setInterval(() => {
            if (!this.target) {
              this.left = 'Set Target';
              return;
            }
            const ms = new Date(this.target) - new Date();
            if (ms < 0) {
              this.left = 'Expired';
            } else {
              const d = Math.floor(ms / 86400000);
              const h = Math.floor((ms % 86400000) / 3600000);
              const m = Math.floor((ms % 3600000) / 60000);
              const s = Math.floor((ms % 60000) / 1000);
              this.left = d + 'd ' + h + 'h ' + m + 'm ' + s + 's';
            }
          }, 1000);
        },
        destroy() {
          if (this.intervalId) {
            clearInterval(this.intervalId);
          }
        }
      }"
      className="card p-30 glass-card text-center grid gap-15"
    >
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
