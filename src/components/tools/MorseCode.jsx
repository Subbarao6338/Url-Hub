import React, { useState, useEffect } from 'react';

const MorseCode = ({ onResultChange }) => {
  const morseMap = { 'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----', ' ': '/' };
  const revMorseMap = Object.fromEntries(Object.entries(morseMap).map(([k, v]) => [v, k]));

  const [text, setText] = useState('');
  const [code, setCode] = useState('');

  const toMorse = (val) => {
    setText(val);
    setCode(val.toUpperCase().split('').map(c => morseMap[c] || (c === '\n' ? '\n' : '')).join(' ').replace(/\s+/g, ' ').trim());
  };

  const fromMorse = (val) => {
    setCode(val);
    setText(val.trim().split(' ').map(c => revMorseMap[c] || (c === '/' ? ' ' : '')).join(''));
  };

  useEffect(() => {
    onResultChange({
      text: `Text: ${text}\nMorse: ${code}`,
      filename: 'morse_code.txt'
    });
  }, [text, code, onResultChange]);

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>Text</label>
        <textarea rows="3" placeholder="Hello World" value={text} onChange={(e) => toMorse(e.target.value)} />
      </div>
      <div style={{ textAlign: 'center', margin: '10px 0' }}><span className="material-icons" style={{ opacity: 0.3 }}>expand_more</span></div>
      <div className="form-group">
        <label>Morse Code</label>
        <textarea rows="3" placeholder=".... . .-.. .-.. ---" value={code} onChange={(e) => fromMorse(e.target.value)} />
      </div>
    </div>
  );
};

export default MorseCode;
