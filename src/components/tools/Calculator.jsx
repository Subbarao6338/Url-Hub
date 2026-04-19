import React, { useState, useEffect } from 'react';
import { evaluate } from 'mathjs';

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
        const result = evaluate(expr);
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
      else if (display === 'Error') nextExpr = val;
      else nextExpr += val;
      setExpr(nextExpr);
      setDisplay(nextExpr);
    }
  };

  const buttons = [
    ['(', ')', 'C', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=']
  ];

  return (
    <div className="calculator" style={{maxWidth: '360px', margin: '0 auto', background: 'rgba(var(--primary-rgb), 0.05)', padding: '24px', borderRadius: '32px', border: '1px solid rgba(var(--primary-rgb), 0.1)', boxShadow: 'var(--shadow-lg)'}}>
      <div id="calc-display" style={{
        background: 'var(--surface-solid)',
        padding: '20px',
        textAlign: 'right',
        fontSize: '2.5rem',
        fontFamily: 'monospace',
        borderRadius: '16px',
        marginBottom: '24px',
        minHeight: '80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)',
        color: 'var(--on-surface)'
      }}>
        <div style={{fontSize: '0.9rem', opacity: 0.5, marginBottom: '4px', height: '1.2em'}}>{expr}</div>
        <div>{display}</div>
      </div>
      <div className="calc-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px'}}>
        {buttons.flat().map((btn) => (
          <button
            key={btn}
            className="pill"
            onClick={() => handleInput(btn)}
            style={{
              height: '60px',
              fontSize: '1.25rem',
              gridColumn: btn === '=' ? 'span 2' : 'span 1',
              background: btn === '=' ? 'var(--primary)' : (['/', '*', '-', '+', 'C', '(', ')'].includes(btn) ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--surface)'),
              color: btn === '=' ? 'var(--on-primary)' : (btn === 'C' ? '#ef4444' : 'var(--on-surface)'),
              border: '1px solid var(--border)',
              borderRadius: '16px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            {btn === '/' ? '÷' : btn === '*' ? '×' : btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calculator;
