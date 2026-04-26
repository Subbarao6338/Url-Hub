import React, { useState, useEffect } from 'react';

const MathTools = ({ onResultChange, toolId }) => {
  const [activeTab, setActiveTab] = useState('percentages');

  useEffect(() => {
    if (toolId) {
        if (toolId === 'prime-factors') setActiveTab('primes');
        else setActiveTab(toolId);
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      {!toolId && (
        <div className="pill-group" style={{ marginBottom: '20px', overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', flexWrap: 'nowrap' }}>
          <button className={`pill ${activeTab === 'percentages' ? 'active' : ''}`} onClick={() => setActiveTab('percentages')}>Percentages</button>
          <button className={`pill ${activeTab === 'geometry' ? 'active' : ''}`} onClick={() => setActiveTab('geometry')}>Geometry</button>
          <button className={`pill ${activeTab === 'pythagoras' ? 'active' : ''}`} onClick={() => setActiveTab('pythagoras')}>Pythagoras</button>
          <button className={`pill ${activeTab === 'proportions' ? 'active' : ''}`} onClick={() => setActiveTab('proportions')}>Proportions</button>
          <button className={`pill ${activeTab === 'ruffini' ? 'active' : ''}`} onClick={() => setActiveTab('ruffini')}>Ruffini</button>
          <button className={`pill ${activeTab === 'quadratic' ? 'active' : ''}`} onClick={() => setActiveTab('quadratic')}>Quadratic</button>
          <button className={`pill ${activeTab === 'fractions' ? 'active' : ''}`} onClick={() => setActiveTab('fractions')}>Fractions</button>
          <button className={`pill ${activeTab === 'gcd-lcm' ? 'active' : ''}`} onClick={() => setActiveTab('gcd-lcm')}>GCD/LCM</button>
          <button className={`pill ${activeTab === 'primes' ? 'active' : ''}`} onClick={() => setActiveTab('primes')}>Primes</button>
          <button className={`pill ${activeTab === 'fibonacci' ? 'active' : ''}`} onClick={() => setActiveTab('fibonacci')}>Fibonacci</button>
          <button className={`pill ${activeTab === 'statistics' ? 'active' : ''}`} onClick={() => setActiveTab('statistics')}>Statistics</button>
          <button className={`pill ${activeTab === 'matrix' ? 'active' : ''}`} onClick={() => setActiveTab('matrix')}>Matrix</button>
        </div>
      )}

      {activeTab === 'percentages' && <PercentagesTool />}
      {activeTab === 'geometry' && <GeometryTool />}
      {activeTab === 'pythagoras' && <PythagorasTool />}
      {activeTab === 'proportions' && <ProportionsTool />}
      {activeTab === 'ruffini' && <RuffiniTool />}
      {activeTab === 'quadratic' && <QuadraticTool />}
      {activeTab === 'fractions' && <FractionsTool />}
      {activeTab === 'gcd-lcm' && <GcdLcmTool />}
      {activeTab === 'primes' && <PrimesTool />}
      {activeTab === 'fibonacci' && <FibonacciTool />}
      {activeTab === 'statistics' && <StatisticsTool />}
      {activeTab === 'matrix' && <MatrixTool />}
    </div>
  );
};

const PercentagesTool = () => {
    const [val1, setVal1] = useState('');
    const [val2, setVal2] = useState('');
    const [res, setRes] = useState(null);

    const calc = (type) => {
        const a = parseFloat(val1);
        const b = parseFloat(val2);
        if (isNaN(a) || isNaN(b)) return;
        if (type === 'percentOf') setRes(a * (b / 100));
        else if (type === 'whatPercent') setRes((a / b) * 100);
        else if (type === 'discount') setRes(a - (a * (b / 100)));
    };

    return (
        <div className="grid gap-10">
            <input type="number" value={val1} onChange={e => setVal1(e.target.value)} placeholder="Value A" className="pill" />
            <input type="number" value={val2} onChange={e => setVal2(e.target.value)} placeholder="Value B / %" className="pill" />
            <div className="flex-gap">
                <button className="pill active flex-1" onClick={() => calc('percentOf')}>A% of B</button>
                <button className="pill active flex-1" onClick={() => calc('whatPercent')}>A is what % of B</button>
                <button className="pill active flex-1" onClick={() => calc('discount')}>A with B% discount</button>
            </div>
            {res !== null && <div className="text-center mt-10" style={{ fontSize: '1.5rem' }}>Result: {res.toFixed(2)}</div>}
        </div>
    );
};

const GeometryTool = () => {
    const [shape, setShape] = useState('circle');
    const [v1, setV1] = useState('');
    const [v2, setV2] = useState('');
    const [res, setRes] = useState(null);

    const calc = () => {
        const a = parseFloat(v1);
        const b = parseFloat(v2);
        if (shape === 'circle') setRes({ area: Math.PI * a**2, circ: 2 * Math.PI * a });
        else if (shape === 'rect') setRes({ area: a * b, circ: 2 * (a + b) });
        else if (shape === 'tri') setRes({ area: 0.5 * a * b });
    };

    return (
        <div>
            <select value={shape} onChange={e => setShape(e.target.value)} className="pill w-full mb-10">
                <option value="circle">Circle (v1=radius)</option>
                <option value="rect">Rectangle (v1=w, v2=h)</option>
                <option value="tri">Triangle (v1=base, v2=height)</option>
            </select>
            <input type="number" value={v1} onChange={e => setV1(e.target.value)} placeholder="Value 1" className="pill w-full mb-10" />
            {shape !== 'circle' && <input type="number" value={v2} onChange={e => setV2(e.target.value)} placeholder="Value 2" className="pill w-full mb-10" />}
            <button className="btn-primary w-full" onClick={calc}>Calculate</button>
            {res && (
                <div className="text-center mt-20">
                    {res.area && <div>Area: {res.area.toFixed(2)}</div>}
                    {res.circ && <div>Circumference/Perim: {res.circ.toFixed(2)}</div>}
                </div>
            )}
        </div>
    );
};

const PythagorasTool = () => {
    const [a, setA] = useState('');
    const [b, setB] = useState('');
    const [c, setC] = useState('');

    const solve = () => {
        const va = parseFloat(a);
        const vb = parseFloat(b);
        const vc = parseFloat(c);
        if (!isNaN(va) && !isNaN(vb)) setC(Math.sqrt(va**2 + vb**2).toFixed(2));
        else if (!isNaN(va) && !isNaN(vc)) setB(Math.sqrt(vc**2 - va**2).toFixed(2));
        else if (!isNaN(vb) && !isNaN(vc)) setA(Math.sqrt(vc**2 - vb**2).toFixed(2));
    };

    return (
        <div className="grid gap-10">
            <input type="number" value={a} onChange={e => setA(e.target.value)} placeholder="Side a" className="pill" />
            <input type="number" value={b} onChange={e => setB(e.target.value)} placeholder="Side b" className="pill" />
            <input type="number" value={c} onChange={e => setC(e.target.value)} placeholder="Hypotenuse c" className="pill" />
            <button className="btn-primary" onClick={solve}>Solve Missing Side</button>
        </div>
    );
};

const ProportionsTool = () => {
    const [a, setA] = useState('');
    const [b, setB] = useState('');
    const [c, setC] = useState('');
    const [d, setD] = useState('');

    const solve = () => {
        const va = parseFloat(a); const vb = parseFloat(b);
        const vc = parseFloat(c); const vd = parseFloat(d);
        if (isNaN(va)) setA((vb * vc) / vd);
        else if (isNaN(vb)) setB((va * vd) / vc);
        else if (isNaN(vc)) setC((va * vd) / vb);
        else if (isNaN(vd)) setD((vb * vc) / va);
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                <input type="number" value={a} onChange={e => setA(e.target.value)} className="pill" style={{ width: '60px' }} />
                <span>/</span>
                <input type="number" value={b} onChange={e => setB(e.target.value)} className="pill" style={{ width: '60px' }} />
                <span>=</span>
                <input type="number" value={c} onChange={e => setC(e.target.value)} className="pill" style={{ width: '60px' }} />
                <span>/</span>
                <input type="number" value={d} onChange={e => setD(e.target.value)} className="pill" style={{ width: '60px' }} />
            </div>
            <button className="btn-primary" onClick={solve} style={{ width: '100%' }}>Solve X</button>
        </div>
    );
};

const RuffiniTool = () => {
    const [poly, setPoly] = useState(''); // e.g. 1,-2,1
    const [root, setRoot] = useState('');
    const [res, setRes] = useState(null);

    const calc = () => {
        const coeffs = poly.split(',').map(Number);
        const r = Number(root);
        const result = [];
        let current = coeffs[0];
        result.push(current);
        for (let i = 1; i < coeffs.length; i++) {
            current = coeffs[i] + current * r;
            result.push(current);
        }
        setRes(result);
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <input value={poly} onChange={e => setPoly(e.target.value)} placeholder="Coefficients (e.g. 1,-2,1)" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <input value={root} onChange={e => setRoot(e.target.value)} placeholder="Root (r)" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <button className="btn-primary" onClick={calc} style={{ width: '100%' }}>Run Ruffini</button>
            {res && <div style={{ marginTop: '15px' }}>Result: {res.join(', ')} (Last is remainder)</div>}
        </div>
    );
};

const QuadraticTool = () => {
    const [a, setA] = useState('');
    const [b, setB] = useState('');
    const [c, setC] = useState('');
    const [res, setRes] = useState(null);

    const solve = () => {
        const va = parseFloat(a); const vb = parseFloat(b); const vc = parseFloat(c);
        const disc = vb**2 - 4 * va * vc;
        if (disc < 0) setRes('No real roots');
        else {
            const x1 = (-vb + Math.sqrt(disc)) / (2 * va);
            const x2 = (-vb - Math.sqrt(disc)) / (2 * va);
            setRes(`x1 = ${x1.toFixed(2)}, x2 = ${x2.toFixed(2)}`);
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '10px' }}>
                <input value={a} onChange={e => setA(e.target.value)} placeholder="a" className="pill" style={{ width: '50px' }} />
                <span>x² +</span>
                <input value={b} onChange={e => setB(e.target.value)} placeholder="b" className="pill" style={{ width: '50px' }} />
                <span>x +</span>
                <input value={c} onChange={e => setC(e.target.value)} placeholder="c" className="pill" style={{ width: '50px' }} />
                <span>= 0</span>
            </div>
            <button className="btn-primary" onClick={solve} style={{ width: '100%' }}>Solve</button>
            {res && <div style={{ marginTop: '15px' }}>{res}</div>}
        </div>
    );
};

const FractionsTool = () => {
    const [num, setNum] = useState('');
    const [den, setDen] = useState('');
    const [res, setRes] = useState(null);

    const simplify = () => {
        let n = parseInt(num);
        let d = parseInt(den);
        const findGCD = (a, b) => b === 0 ? a : findGCD(b, a % b);
        const common = findGCD(n, d);
        setRes(`${n / common} / ${d / common}`);
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <input value={num} onChange={e => setNum(e.target.value)} placeholder="Numerator" className="pill" style={{ width: '100%', marginBottom: '5px' }} />
            <div style={{ height: '2px', background: 'var(--border)', margin: '10px 0' }} />
            <input value={den} onChange={e => setDen(e.target.value)} placeholder="Denominator" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <button className="btn-primary" onClick={simplify} style={{ width: '100%' }}>Simplify</button>
            {res && <div style={{ marginTop: '15px', fontSize: '1.5rem' }}>{res}</div>}
        </div>
    );
};

const GcdLcmTool = () => {
    const [a, setA] = useState('');
    const [b, setB] = useState('');
    const [res, setRes] = useState(null);

    const calc = () => {
        let va = parseInt(a); let vb = parseInt(b);
        const findGCD = (x, y) => y === 0 ? x : findGCD(y, x % y);
        const gcd = findGCD(va, vb);
        const lcm = (va * vb) / gcd;
        setRes({ gcd, lcm });
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <input value={a} onChange={e => setA(e.target.value)} placeholder="Num A" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <input value={b} onChange={e => setB(e.target.value)} placeholder="Num B" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <button className="btn-primary" onClick={calc} style={{ width: '100%' }}>Calculate</button>
            {res && (
                <div style={{ marginTop: '15px' }}>
                    <div>GCD: {res.gcd}</div>
                    <div>LCM: {res.lcm}</div>
                </div>
            )}
        </div>
    );
};

const PrimesTool = () => {
    const [num, setNum] = useState('');
    const [res, setRes] = useState(null);

    const factorize = () => {
        let n = parseInt(num);
        const factors = [];
        let d = 2;
        while (n > 1) {
            while (n % d === 0) {
                factors.push(d);
                n /= d;
            }
            d++;
        }
        setRes(factors);
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <input value={num} onChange={e => setNum(e.target.value)} placeholder="Number" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <button className="btn-primary" onClick={factorize} style={{ width: '100%' }}>Prime Factorization</button>
            {res && <div style={{ marginTop: '15px' }}>Factors: {res.join(' × ')}</div>}
        </div>
    );
};

const FibonacciTool = () => {
    const [num, setNum] = useState(10);
    const [res, setRes] = useState([]);
    const calc = () => {
        let n = parseInt(num);
        let series = [0, 1];
        for (let i = 2; i < n; i++) series.push(series[i - 1] + series[i - 2]);
        setRes(series.slice(0, n));
    };
    return (
        <div style={{ textAlign: 'center' }}>
            <input type="number" value={num} onChange={e => setNum(e.target.value)} placeholder="Count" className="pill w-full mb-10" />
            <button className="btn-primary w-full" onClick={calc}>Generate Series</button>
            {res.length > 0 && <div className="mt-20 scrollable-x p-10 card" style={{ fontSize: '1.1rem' }}>{res.join(', ')}</div>}
        </div>
    );
};

const StatisticsTool = () => {
    const [input, setInput] = useState('');
    const [res, setRes] = useState(null);
    const calc = () => {
        const nums = input.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n)).sort((a, b) => a - b);
        if (nums.length === 0) return;
        const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
        const median = nums.length % 2 === 0 ? (nums[nums.length/2 - 1] + nums[nums.length/2]) / 2 : nums[Math.floor(nums.length/2)];
        const counts = {};
        nums.forEach(n => counts[n] = (counts[n] || 0) + 1);
        let maxCount = 0;
        let mode = [];
        for (let n in counts) {
            if (counts[n] > maxCount) {
                maxCount = counts[n];
                mode = [n];
            } else if (counts[n] === maxCount) {
                mode.push(n);
            }
        }
        setRes({ mean, median, mode: mode.join(', '), min: nums[0], max: nums[nums.length-1], range: nums[nums.length-1] - nums[0] });
    };
    return (
        <div style={{ textAlign: 'center' }}>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Numbers (comma separated)" className="pill w-full mb-10" />
            <button className="btn-primary w-full" onClick={calc}>Calculate Stats</button>
            {res && (
                <div className="grid-2 mt-20" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="card p-10"><div className="opacity-6">Mean</div>{res.mean.toFixed(2)}</div>
                    <div className="card p-10"><div className="opacity-6">Median</div>{res.median}</div>
                    <div className="card p-10"><div className="opacity-6">Mode</div>{res.mode}</div>
                    <div className="card p-10"><div className="opacity-6">Range</div>{res.range}</div>
                </div>
            )}
        </div>
    );
};

const MatrixTool = () => {
    const [size, setSize] = useState(2);
    const [matrixA, setMatrixA] = useState([[0,0], [0,0]]);
    const [matrixB, setMatrixB] = useState([[0,0], [0,0]]);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const newArr = Array.from({ length: size }, () => Array(size).fill(0));
        setMatrixA(newArr);
        setMatrixB(newArr);
    }, [size]);

    const multiply = () => {
        const res = Array.from({ length: size }, () => Array(size).fill(0));
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                for (let k = 0; k < size; k++) {
                    res[i][j] += matrixA[i][k] * matrixB[k][j];
                }
            }
        }
        setResult(res);
    };

    const updateCell = (matrix, setMatrix, row, col, val) => {
        const newMatrix = [...matrix];
        newMatrix[row][col] = parseFloat(val) || 0;
        setMatrix(newMatrix);
    };

    return (
        <div>
            <div className="flex-center mb-20 gap-10">
                <button className={`pill ${size === 2 ? 'active' : ''}`} onClick={() => setSize(2)}>2x2</button>
                <button className={`pill ${size === 3 ? 'active' : ''}`} onClick={() => setSize(3)}>3x3</button>
            </div>

            <div className="grid gap-20" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div>
                    <label className="uppercase font-semibold opacity-6 mb-10 block">Matrix A</label>
                    {matrixA.map((row, i) => (
                        <div key={i} className="flex-gap mb-5">
                            {row.map((cell, j) => (
                                <input key={j} type="number" value={cell} onChange={e => updateCell(matrixA, setMatrixA, i, j, e.target.value)} className="pill w-full p-8-16" />
                            ))}
                        </div>
                    ))}
                </div>
                <div>
                    <label className="uppercase font-semibold opacity-6 mb-10 block">Matrix B</label>
                    {matrixB.map((row, i) => (
                        <div key={i} className="flex-gap mb-5">
                            {row.map((cell, j) => (
                                <input key={j} type="number" value={cell} onChange={e => updateCell(matrixB, setMatrixB, i, j, e.target.value)} className="pill w-full p-8-16" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <button className="btn-primary w-full mt-20" onClick={multiply}>Multiply A × B</button>

            {result && (
                <div className="mt-20 text-center">
                    <label className="uppercase font-semibold opacity-6 mb-10 block">Result</label>
                    {result.map((row, i) => (
                        <div key={i} className="flex-center gap-10 mb-5">
                            {row.map((cell, j) => (
                                <div key={j} className="pill active p-8-16 min-w-50">{cell}</div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MathTools;
