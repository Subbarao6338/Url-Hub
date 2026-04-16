import React, { useState, useEffect } from 'react';

const Calculator = ({ onResultChange }) => {
  const [display, setDisplay] = useState('0');
  const [expr, setExpr] = useState('');

  useEffect(() => {
    if (display !== '0' && display !== 'Error') {
      onResultChange({
        text: display,
        filename: 'calculation.txt'
      });
    } else {
      onResultChange(null);
    }
  }, [display, onResultChange]);

  const handleInput = (val) => {
    if (val === 'C') {
      setExpr('');
      setDisplay('0');
    } else if (val === '=') {
      try {
        if (!expr) return;
        // Basic math evaluation without eval()
        // Using Function constructor as a slightly safer alternative, but ideally use a math library
        const sanitized = expr.replace(/[^-+*/().0-9]/g, '');
        const result = Function('"use strict";return (' + sanitized + ')')();
        const formatted = Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(8)).toString();
        setDisplay(formatted);
        setExpr(formatted);
      } catch (e) {
        setDisplay('Error');
        setExpr('');
      }
    } else {
      let nextExpr = expr;
      if (display === '0' && !isNaN(val)) nextExpr = val;
      else nextExpr += val;
      setExpr(nextExpr);
      setDisplay(nextExpr);
    }
  };

  return (
    <div className="calculator" style={{maxWidth: '320px', margin: '0 auto', background: 'rgba(var(--primary-rgb), 0.05)', padding: '20px', borderRadius: '24px', border: '1px solid rgba(var(--primary-rgb), 0.1)'}}>
      <div id="calc-display" style={{background: 'var(--surface)', padding: '15px', textAlign: 'right', fontSize: '2rem', fontFamily: 'monospace', borderRadius: '12px', marginBottom: '20px', minHeight: '40px', overflow: 'hidden', whiteSpace: 'nowrap', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'}}>
        {display}
      </div>
      <div className="calc-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px'}}>
        <button className="pill" onClick={() => handleInput('C')} style={{color: '#ef4444', fontWeight: 'bold'}}>C</button>
        <button className="pill" onClick={() => handleInput('(')}>(</button>
        <button className="pill" onClick={() => handleInput(')')}>)</button>
        <button className="pill" onClick={() => handleInput('/')} style={{color: 'var(--primary)', fontSize: '1.5rem'}}>÷</button>
        <button className="pill" onClick={() => handleInput('7')}>7</button>
        <button className="pill" onClick={() => handleInput('8')}>8</button>
        <button className="pill" onClick={() => handleInput('9')}>9</button>
        <button className="pill" onClick={() => handleInput('*')} style={{color: 'var(--primary)', fontSize: '1.5rem'}}>×</button>
        <button className="pill" onClick={() => handleInput('4')}>4</button>
        <button className="pill" onClick={() => handleInput('5')}>5</button>
        <button className="pill" onClick={() => handleInput('6')}>6</button>
        <button className="pill" onClick={() => handleInput('-')} style={{color: 'var(--primary)', fontSize: '1.5rem'}}>−</button>
        <button className="pill" onClick={() => handleInput('1')}>1</button>
        <button className="pill" onClick={() => handleInput('2')}>2</button>
        <button className="pill" onClick={() => handleInput('3')}>3</button>
        <button className="pill" onClick={() => handleInput('+')} style={{color: 'var(--primary)', fontSize: '1.5rem'}}>+</button>
        <button className="pill" onClick={() => handleInput('0')}>0</button>
        <button className="pill" onClick={() => handleInput('.')}>.</button>
        <button className="pill" onClick={() => handleInput('=')} style={{gridColumn: 'span 2', background: 'var(--primary)', color: 'white', fontWeight: 'bold', fontSize: '1.5rem'}}>=</button>
      </div>
    </div>
  );
};

export default Calculator;
