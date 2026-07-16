import React, { useEffect, useRef } from 'react';

const AgeCalculator = () => {
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
        dob: '',
        ageText: '',
        calculate() {
          if (!this.dob) return;
          const diff = new Date() - new Date(this.dob);
          const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
          const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
          this.ageText = years + ' Years, ' + months + ' Months';
        }
      }"
      className="card p-30 glass-card grid gap-15 text-center"
    >
      <h3>Age Calculator</h3>
      <input
        type="date"
        className="pill w-full"
        x-model="dob"
      />
      <button
        type="button"
        className="btn-primary"
        x-on:click="calculate()"
      >
        Calculate Age
      </button>
      <div
        x-show="ageText"
        className="text-2xl font-bold mt-10"
        style={{ display: 'none' }}
        x-text="ageText"
      ></div>
    </div>
  );
};

export default AgeCalculator;
