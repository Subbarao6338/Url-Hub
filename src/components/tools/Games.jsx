import React, { useState, useEffect, useRef } from 'react';

const Games = ({ onResultChange, toolId }) => {
  const [activeTab, setActiveTab] = useState('spin-wheel');

  useEffect(() => {
    if (toolId) {
        if (toolId === 'chess960') setActiveTab('chess-960');
        else if (toolId === 'darts-scoreboard') setActiveTab('darts');
        else setActiveTab(toolId);
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      {!toolId && (<div className="pill-group" style={{ marginBottom: '20px', overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', flexWrap: 'nowrap' }}>
        <button className={`pill ${activeTab === 'spin-wheel' ? 'active' : ''}`} onClick={() => setActiveTab('spin-wheel')}>Spin Wheel</button>
        <button className={`pill ${activeTab === 'spin-bottle' ? 'active' : ''}`} onClick={() => setActiveTab('spin-bottle')}>Spin Bottle</button>
        <button className={`pill ${activeTab === 'team-maker' ? 'active' : ''}`} onClick={() => setActiveTab('team-maker')}>Team Maker</button>
        <button className={`pill ${activeTab === 'tournament' ? 'active' : ''}`} onClick={() => setActiveTab('tournament')}>Tournament</button>
        <button className={`pill ${activeTab === 'scoreboard' ? 'active' : ''}`} onClick={() => setActiveTab('scoreboard')}>Scoreboard</button>
        <button className={`pill ${activeTab === 'chess-clock' ? 'active' : ''}`} onClick={() => setActiveTab('chess-clock')}>Chess Clock</button>
        <button className={`pill ${activeTab === 'chess-960' ? 'active' : ''}`} onClick={() => setActiveTab('chess-960')}>Chess960</button>
        <button className={`pill ${activeTab === 'darts' ? 'active' : ''}`} onClick={() => setActiveTab('darts')}>Darts</button>
        <button className={`pill ${activeTab === 'tictactoe' ? 'active' : ''}`} onClick={() => setActiveTab('tictactoe')}>Tic-Tac-Toe</button>
        <button className={`pill ${activeTab === 'snake' ? 'active' : ''}`} onClick={() => setActiveTab('snake')}>Snake</button>
        <button className={`pill ${activeTab === '2048' ? 'active' : ''}`} onClick={() => setActiveTab('2048')}>2048</button>
      </div>)}

      {activeTab === 'spin-wheel' && <SpinWheelTool />}
      {activeTab === 'spin-bottle' && <SpinBottleTool />}
      {activeTab === 'team-maker' && <TeamMakerTool />}
      {activeTab === 'tournament' && <TournamentMakerTool />}
      {activeTab === 'scoreboard' && <ScoreboardTool />}
      {activeTab === 'chess-clock' && <ChessClockTool />}
      {activeTab === 'chess-960' && <Chess960Tool />}
      {activeTab === 'darts' && <DartsScoreboardTool />}
      {activeTab === 'tictactoe' && <TicTacToeTool />}
      {activeTab === 'snake' && <SnakeGame />}
      {activeTab === '2048' && <Game2048 />}
    </div>
  );
};

const SpinWheelTool = () => {
    const [items, setItems] = useState(['Option 1', 'Option 2', 'Option 3', 'Option 4']);
    const [newItem, setNewItem] = useState('');
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);

    const spin = () => {
        if (isSpinning) return;
        const extraDegrees = 1800 + Math.random() * 1800;
        setRotation(prev => prev + extraDegrees);
        setIsSpinning(true);
        setTimeout(() => setIsSpinning(false), 5000);
    };

    const addItem = () => {
        if (newItem.trim()) {
            setItems([...items, newItem.trim()]);
            setNewItem('');
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '250px', height: '250px', margin: '20px auto' }}>
                <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '4px solid var(--primary)',
                    position: 'relative',
                    transform: `rotate(${rotation}deg)`,
                    transition: 'transform 5s cubic-bezier(0.1, 0, 0.1, 1)',
                    overflow: 'hidden'
                }}>
                    {items.map((item, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '50%',
                            height: '2px',
                            background: 'var(--border)',
                            transformOrigin: 'left center',
                            transform: `rotate(${(i * 360 / items.length)}deg)`
                        }}>
                             <span style={{ position: 'absolute', left: '40px', top: '-10px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{item}</span>
                        </div>
                    ))}
                </div>
                <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', width: '0', height: '0', borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '20px solid #ef4444' }} />
            </div>
            <button className="btn-primary" onClick={spin} disabled={isSpinning}>Spin</button>
            <div style={{ marginTop: '20px' }}>
                <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="New Option" className="pill" style={{ marginRight: '5px' }} />
                <button className="pill" onClick={addItem}>Add</button>
            </div>
            <div style={{ marginTop: '10px', opacity: 0.6 }}>{items.join(', ')}</div>
        </div>
    );
};

const SpinBottleTool = () => {
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);

    const spin = () => {
        if (isSpinning) return;
        const extraDegrees = 1800 + Math.random() * 1800;
        setRotation(prev => prev + extraDegrees);
        setIsSpinning(true);
        setTimeout(() => setIsSpinning(false), 4000);
    };

    return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{
                fontSize: '5rem',
                display: 'inline-block',
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 4s cubic-bezier(0.1, 0, 0.1, 1)'
            }}>
                🍾
            </div>
            <div style={{ marginTop: '40px' }}>
                <button className="btn-primary" onClick={spin} disabled={isSpinning}>Spin the Bottle</button>
            </div>
        </div>
    );
};

const TeamMakerTool = () => {
    const [names, setNames] = useState('');
    const [teamCount, setTeamCount] = useState(2);
    const [teams, setTeams] = useState([]);

    const makeTeams = () => {
        const nameArray = names.split('\n').map(n => n.trim()).filter(Boolean);
        const shuffled = [...nameArray].sort(() => Math.random() - 0.5);
        const newTeams = Array.from({ length: teamCount }, () => []);
        shuffled.forEach((name, i) => {
            newTeams[i % teamCount].push(name);
        });
        setTeams(newTeams);
    };

    return (
        <div>
            <textarea
                className="form-control"
                rows="5"
                placeholder="Enter names (one per line)..."
                value={names}
                onChange={e => setNames(e.target.value)}
                style={{ background: 'var(--surface)', color: 'var(--on-surface)', marginBottom: '15px' }}
            />
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
                <label>Teams:</label>
                <input type="number" value={teamCount} min="2" onChange={e => setTeamCount(parseInt(e.target.value))} className="pill" style={{ width: '60px' }} />
                <button className="btn-primary" onClick={makeTeams} style={{ flex: 1 }}>Divide into Teams</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                {teams.map((team, i) => (
                    <div key={i} style={{ background: 'rgba(var(--primary-rgb), 0.05)', padding: '10px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <strong style={{ display: 'block', marginBottom: '5px' }}>Team {i + 1}</strong>
                        {team.map((name, j) => <div key={j} style={{ fontSize: '0.9rem' }}>{name}</div>)}
                    </div>
                ))}
            </div>
        </div>
    );
};

const TournamentMakerTool = () => {
    const [players, setPlayers] = useState('');
    const [bracket, setBracket] = useState([]);

    const generateBracket = () => {
        const playerArray = players.split('\n').map(p => p.trim()).filter(Boolean);
        const shuffled = [...playerArray].sort(() => Math.random() - 0.5);
        const matches = [];
        for (let i = 0; i < shuffled.length; i += 2) {
            matches.push([shuffled[i], shuffled[i+1] || 'BYE']);
        }
        setBracket(matches);
    };

    return (
        <div>
            <textarea
                className="form-control"
                rows="5"
                placeholder="Enter players (one per line)..."
                value={players}
                onChange={e => setPlayers(e.target.value)}
                style={{ background: 'var(--surface)', color: 'var(--on-surface)', marginBottom: '15px' }}
            />
            <button className="btn-primary" onClick={generateBracket} style={{ width: '100%', marginBottom: '20px' }}>Generate Bracket</button>
            <div style={{ display: 'grid', gap: '10px' }}>
                {bracket.map((match, i) => (
                    <div key={i} style={{ background: 'rgba(var(--primary-rgb), 0.05)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{match[0]}</span>
                        <span style={{ opacity: 0.5 }}>vs</span>
                        <span>{match[1]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ScoreboardTool = () => {
    const [scores, setScores] = useState([{ name: 'Player 1', score: 0 }, { name: 'Player 2', score: 0 }]);
    const [history, setHistory] = useState([]);

    const updateScore = (index, delta) => {
        const newScores = [...scores];
        newScores[index].score += delta;
        setScores(newScores);
        setHistory([{ player: newScores[index].name, delta, time: new Date().toLocaleTimeString() }, ...history].slice(0, 10));
    };

    const reset = () => {
        if (window.confirm("Reset all scores?")) {
            setScores(scores.map(s => ({ ...s, score: 0 })));
            setHistory([]);
        }
    };

    return (
        <div style={{ display: 'grid', gap: '20px' }}>
            <div className="grid grid-2 gap-15">
                {scores.map((s, i) => (
                    <div key={i} className="card p-20 text-center" style={{ border: '2px solid var(--primary-light)' }}>
                        <input
                            value={s.name}
                            onChange={e => {
                                const newScores = [...scores];
                                newScores[i].name = e.target.value;
                                setScores(newScores);
                            }}
                            className="w-full mb-10 text-center font-bold"
                            style={{ background: 'transparent', border: 'none', color: 'var(--on-surface)', fontSize: '1.1rem' }}
                        />
                        <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'var(--primary)', margin: '10px 0' }}>{s.score}</div>
                        <div className="flex-center gap-10">
                            <button className="pill p-8-16" onClick={() => updateScore(i, -1)}>-1</button>
                            <button className="pill active p-8-16" onClick={() => updateScore(i, 1)}>+1</button>
                            <button className="pill p-8-16" onClick={() => updateScore(i, 5)}>+5</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex-gap">
                <button className="pill flex-1" onClick={() => setScores([...scores, { name: `Player ${scores.length + 1}`, score: 0 }])} disabled={scores.length >= 4}>
                    <span className="material-icons" style={{ fontSize: '1.2rem' }}>person_add</span> Add Player
                </button>
                <button className="pill flex-1" onClick={reset}>Reset All</button>
            </div>

            {history.length > 0 && (
                <div className="card p-15">
                    <h4 className="mb-10 opacity-6 uppercase tracking-wider" style={{ fontSize: '0.8rem' }}>Recent History</h4>
                    {history.map((h, i) => (
                        <div key={i} className="flex-between mb-5 opacity-8" style={{ fontSize: '0.9rem' }}>
                            <span>{h.player}</span>
                            <span>{h.delta > 0 ? `+${h.delta}` : h.delta}</span>
                            <span className="opacity-5" style={{ fontSize: '0.7rem' }}>{h.time}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ChessClockTool = () => {
    const [time1, setTime1] = useState(300);
    const [time2, setTime2] = useState(300);
    const [active, setActive] = useState(null); // 1 or 2
    const intervalRef = useRef(null);

    useEffect(() => {
        if (active === 1 && time1 > 0) {
            intervalRef.current = setInterval(() => setTime1(t => t - 1), 1000);
        } else if (active === 2 && time2 > 0) {
            intervalRef.current = setInterval(() => setTime2(t => t - 1), 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [active, time1, time2]);

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    return (
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '10px', height: '300px' }}>
            <button
                onClick={() => setActive(2)}
                disabled={active === 2}
                style={{
                    background: active === 1 ? 'var(--primary)' : 'var(--surface)',
                    color: active === 1 ? 'var(--on-primary)' : 'var(--on-surface)',
                    fontSize: '3rem',
                    borderRadius: '16px',
                    border: '2px solid var(--border)',
                    transform: 'rotate(180deg)'
                }}
            >
                {formatTime(time1)}
            </button>
            <button
                onClick={() => setActive(1)}
                disabled={active === 1}
                style={{
                    background: active === 2 ? 'var(--primary)' : 'var(--surface)',
                    color: active === 2 ? 'var(--on-primary)' : 'var(--on-surface)',
                    fontSize: '3rem',
                    borderRadius: '16px',
                    border: '2px solid var(--border)'
                }}
            >
                {formatTime(time2)}
            </button>
            <div style={{ display: 'flex', gap: '10px', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                 <button className="pill active" onClick={() => setActive(null)}>Pause</button>
                 <button className="pill active" onClick={() => { setTime1(300); setTime2(300); setActive(null); }}>Reset</button>
            </div>
        </div>
    );
};

const Chess960Tool = () => {
    const [position, setPosition] = useState('');
    const generate = () => {
        const pieces = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
        // Simplified randomization (not true 960 rules but generates a position)
        const shuffled = pieces.sort(() => Math.random() - 0.5);
        setPosition(shuffled.join(' '));
    };
    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'monospace', marginBottom: '20px', letterSpacing: '5px' }}>{position || 'R N B Q K B N R'}</div>
            <button className="btn-primary" onClick={generate}>Generate Position</button>
        </div>
    );
};

const DartsScoreboardTool = () => {
    const [score, setScore] = useState(501);
    const [history, setHistory] = useState([]);
    const [input, setInput] = useState('');

    const submitThrow = () => {
        const val = parseInt(input);
        if (isNaN(val) || val > 180) return;
        setHistory([val, ...history]);
        setScore(score - val);
        setInput('');
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--primary)' }}>{score}</div>
            <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
                <input type="number" value={input} onChange={e => setInput(e.target.value)} placeholder="Score" className="pill" style={{ flex: 1 }} />
                <button className="btn-primary" onClick={submitThrow}>Throw</button>
            </div>
            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {history.map((h, i) => <div key={i} style={{ opacity: 0.6 }}>-{h}</div>)}
            </div>
        </div>
    );
};

const TicTacToeTool = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);

    const calculateWinner = (squares) => {
        const lines = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
        }
        return null;
    };

    const handleClick = (i) => {
        if (calculateWinner(board) || board[i]) return;
        const newBoard = [...board];
        newBoard[i] = xIsNext ? 'X' : 'O';
        setBoard(newBoard);
        setXIsNext(!xIsNext);
    };

    const winner = calculateWinner(board);
    const status = winner ? `Winner: ${winner}` : board.every(Boolean) ? 'Draw!' : `Next player: ${xIsNext ? 'X' : 'O'}`;

    return (
        <div className="text-center">
            <div className="mb-20 font-bold" style={{ fontSize: '1.5rem' }}>{status}</div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                maxWidth: '300px',
                margin: '0 auto'
            }}>
                {board.map((cell, i) => (
                    <button
                        key={i}
                        className="pill"
                        onClick={() => handleClick(i)}
                        style={{ height: '80px', fontSize: '2rem', background: cell ? 'var(--primary)' : 'var(--surface)', color: cell ? 'white' : 'inherit' }}
                    >
                        {cell}
                    </button>
                ))}
            </div>
            <button className="btn-primary mt-20 w-full" onClick={() => { setBoard(Array(9).fill(null)); setXIsNext(true); }}>Reset Game</button>
        </div>
    );
};

const SnakeGame = () => {
    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState({ x: 5, y: 5 });
    const [dir, setDir] = useState({ x: 0, y: -1 });
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (gameOver) return;
        const move = setInterval(() => {
            setSnake(s => {
                const head = { x: s[0].x + dir.x, y: s[0].y + dir.y };
                if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || s.find(p => p.x === head.x && p.y === head.y)) {
                    setGameOver(true);
                    return s;
                }
                const newSnake = [head, ...s];
                if (head.x === food.x && head.y === food.y) {
                    setScore(sc => sc + 1);
                    setFood({ x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) });
                } else {
                    newSnake.pop();
                }
                return newSnake;
            });
        }, 150);
        return () => clearInterval(move);
    }, [dir, food, gameOver]);

    const handleKey = (e) => {
        if (e.key === 'ArrowUp' && dir.y === 0) setDir({ x: 0, y: -1 });
        if (e.key === 'ArrowDown' && dir.y === 0) setDir({ x: 0, y: 1 });
        if (e.key === 'ArrowLeft' && dir.x === 0) setDir({ x: -1, y: 0 });
        if (e.key === 'ArrowRight' && dir.x === 0) setDir({ x: 1, y: 0 });
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [dir]);

    return (
        <div className="text-center">
            <div className="mb-10 font-bold">Score: {score}</div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(20, 1fr)',
                width: '300px',
                height: '300px',
                margin: '0 auto',
                background: 'var(--surface)',
                border: '4px solid var(--border)',
                borderRadius: '12px',
                position: 'relative'
            }}>
                {snake.map((p, i) => <div key={i} style={{ gridColumn: p.x + 1, gridRow: p.y + 1, background: 'var(--primary)', borderRadius: '4px' }} />)}
                <div style={{ gridColumn: food.x + 1, gridRow: food.y + 1, background: '#ef4444', borderRadius: '50%' }} />
                {gameOver && <div className="flex-center" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', color: 'white', flexDirection: 'column' }}>
                    <h2>GAME OVER</h2>
                    <button className="pill active" onClick={() => { setSnake([{ x: 10, y: 10 }]); setGameOver(false); setScore(0); }}>Restart</button>
                </div>}
            </div>
            <div className="grid grid-3 mt-20" style={{ maxWidth: '200px', margin: '20px auto' }}>
                <div /> <button className="pill" onClick={() => setDir({ x: 0, y: -1 })}><span className="material-icons">arrow_upward</span></button> <div />
                <button className="pill" onClick={() => setDir({ x: -1, y: 0 })}><span className="material-icons">arrow_back</span></button>
                <button className="pill" onClick={() => setDir({ x: 0, y: 1 })}><span className="material-icons">arrow_downward</span></button>
                <button className="pill" onClick={() => setDir({ x: 1, y: 0 })}><span className="material-icons">arrow_forward</span></button>
            </div>
        </div>
    );
};

const Game2048 = () => {
    const [grid, setGrid] = useState(Array(16).fill(0));
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const init = () => {
        let newGrid = Array(16).fill(0);
        addRandom(newGrid);
        addRandom(newGrid);
        setGrid(newGrid);
        setScore(0);
        setGameOver(false);
    };

    const addRandom = (g) => {
        const empties = g.map((v, i) => v === 0 ? i : null).filter(v => v !== null);
        if (empties.length > 0) {
            g[empties[Math.floor(Math.random() * empties.length)]] = Math.random() > 0.9 ? 4 : 2;
        }
    };

    const move = (direction) => {
        if (gameOver) return;
        let newGrid = [...grid];
        let moved = false;

        const rotate = (g) => {
            let res = Array(16).fill(0);
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    res[c * 4 + (3 - r)] = g[r * 4 + c];
                }
            }
            return res;
        };

        let rotCount = { 'left': 0, 'up': 3, 'right': 2, 'down': 1 }[direction];
        for (let i = 0; i < rotCount; i++) newGrid = rotate(newGrid);

        for (let r = 0; r < 4; r++) {
            let row = newGrid.slice(r * 4, r * 4 + 4).filter(v => v !== 0);
            for (let i = 0; i < row.length - 1; i++) {
                if (row[i] === row[i + 1]) {
                    row[i] *= 2;
                    setScore(s => s + row[i]);
                    row.splice(i + 1, 1);
                    moved = true;
                }
            }
            while (row.length < 4) row.push(0);
            for (let c = 0; c < 4; c++) {
                if (newGrid[r * 4 + c] !== row[c]) moved = true;
                newGrid[r * 4 + c] = row[c];
            }
        }

        for (let i = 0; i < (4 - rotCount) % 4; i++) newGrid = rotate(newGrid);

        if (moved) {
            addRandom(newGrid);
            setGrid(newGrid);
            if (!canMove(newGrid)) setGameOver(true);
        }
    };

    const canMove = (g) => {
        if (g.includes(0)) return true;
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                let v = g[r * 4 + c];
                if (c < 3 && v === g[r * 4 + (c + 1)]) return true;
                if (r < 3 && v === g[(r + 1) * 4 + c]) return true;
            }
        }
        return false;
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') move('left');
            if (e.key === 'ArrowRight') move('right');
            if (e.key === 'ArrowUp') move('up');
            if (e.key === 'ArrowDown') move('down');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [grid, gameOver]);

    useEffect(init, []);

    return (
        <div className="text-center">
             <div className="flex-between mb-10 px-20">
                <div className="font-bold">2048 Nature</div>
                <div className="pill active">Score: {score}</div>
             </div>
             <div style={{
                 display: 'grid',
                 gridTemplateColumns: 'repeat(4, 1fr)',
                 gap: '8px',
                 width: '280px',
                 height: '280px',
                 margin: '0 auto',
                 background: 'var(--border)',
                 padding: '8px',
                 borderRadius: '16px',
                 position: 'relative'
             }}>
                 {grid.map((v, i) => (
                     <div key={i} style={{
                         background: v === 0 ? 'rgba(var(--primary-rgb), 0.05)' : `rgba(var(--primary-rgb), ${Math.min(0.9, 0.1 + Math.log2(v)/12)})`,
                         color: v > 4 ? 'white' : 'var(--on-surface)',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         fontSize: v > 100 ? '1rem' : '1.2rem',
                         fontWeight: '800',
                         borderRadius: '10px',
                         transition: 'all 0.1s ease-in-out'
                     }}>
                         {v > 0 ? v : ''}
                     </div>
                 ))}
                 {gameOver && (
                     <div className="flex-center" style={{ position: 'absolute', inset: 0, background: 'rgba(var(--surface-rgb), 0.8)', borderRadius: '16px', flexDirection: 'column', backdropFilter: 'blur(4px)' }}>
                         <h2 className="mb-10">Game Over!</h2>
                         <button className="btn-primary" onClick={init}>Try Again</button>
                     </div>
                 )}
             </div>
             <div className="grid grid-3 mt-20" style={{ maxWidth: '180px', margin: '20px auto' }}>
                <div /> <button className="pill" onClick={() => move('up')}><span className="material-icons">arrow_upward</span></button> <div />
                <button className="pill" onClick={() => move('left')}><span className="material-icons">arrow_back</span></button>
                <button className="pill" onClick={() => move('down')}><span className="material-icons">arrow_downward</span></button>
                <button className="pill" onClick={() => move('right')}><span className="material-icons">arrow_forward</span></button>
            </div>
        </div>
    );
};

export default Games;
