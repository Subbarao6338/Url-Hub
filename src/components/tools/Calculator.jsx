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
    ['sin', 'cos', 'tan', 'C'],
    ['sqrt', 'pow', 'pi', 'e'],
    ['(', ')', '%', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', 'exp', '=']
  ];

  const handleFunc = (func) => {
    if (func === 'sqrt') {
        setExpr(expr + 'sqrt(');
        setDisplay(expr + 'sqrt(');
    } else if (func === 'pow') {
        setExpr(expr + '^');
        setDisplay(expr + '^');
    } else if (func === 'pi' || func === 'e') {
        setExpr(expr + (func === 'pi' ? 'pi' : 'e'));
        setDisplay(expr + (func === 'pi' ? 'π' : 'e'));
    } else if (func === 'exp') {
        setExpr(expr + 'exp(');
        setDisplay(expr + 'exp(');
    } else {
        setExpr(expr + func + '(');
        setDisplay(expr + func + '(');
    }
  };

  const getBtnClass = (btn) => {
    if (btn === '=') return 'calc-btn eq';
    if (btn === 'C') return 'calc-btn clear';
    if (['/', '*', '-', '+', '(', ')', 'sin', 'cos', 'tan', 'sqrt', 'pow', '%', 'pi', 'e', 'exp'].includes(btn)) return 'calc-btn op';
    return 'calc-btn';
  };

  return (
    <div className="calculator">
      <div className="calc-display">
        <div className="expr">{expr}</div>
        <div className="val">{display}</div>
      </div>
      <div className="calc-grid">
        {buttons.flat().map((btn) => (
          <button
            key={btn}
            className={getBtnClass(btn)}
            onClick={() => {
                if (['sin', 'cos', 'tan', 'sqrt', 'pow', 'pi', 'e', 'exp'].includes(btn)) handleFunc(btn);
                else handleInput(btn);
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
