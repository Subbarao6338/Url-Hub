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
      <div className="pill-group" style={{ marginBottom: '20px', overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', flexWrap: 'nowrap' }}>
        <button className={`pill ${activeTab === 'spin-wheel' ? 'active' : ''}`} onClick={() => setActiveTab('spin-wheel')}>Spin Wheel</button>
        <button className={`pill ${activeTab === 'spin-bottle' ? 'active' : ''}`} onClick={() => setActiveTab('spin-bottle')}>Spin Bottle</button>
        <button className={`pill ${activeTab === 'team-maker' ? 'active' : ''}`} onClick={() => setActiveTab('team-maker')}>Team Maker</button>
        <button className={`pill ${activeTab === 'tournament' ? 'active' : ''}`} onClick={() => setActiveTab('tournament')}>Tournament</button>
        <button className={`pill ${activeTab === 'scoreboard' ? 'active' : ''}`} onClick={() => setActiveTab('scoreboard')}>Scoreboard</button>
        <button className={`pill ${activeTab === 'chess-clock' ? 'active' : ''}`} onClick={() => setActiveTab('chess-clock')}>Chess Clock</button>
        <button className={`pill ${activeTab === 'chess-960' ? 'active' : ''}`} onClick={() => setActiveTab('chess-960')}>Chess960</button>
        <button className={`pill ${activeTab === 'darts' ? 'active' : ''}`} onClick={() => setActiveTab('darts')}>Darts</button>
      </div>

      {activeTab === 'spin-wheel' && <SpinWheelTool />}
      {activeTab === 'spin-bottle' && <SpinBottleTool />}
      {activeTab === 'team-maker' && <TeamMakerTool />}
      {activeTab === 'tournament' && <TournamentMakerTool />}
      {activeTab === 'scoreboard' && <ScoreboardTool />}
      {activeTab === 'chess-clock' && <ChessClockTool />}
      {activeTab === 'chess-960' && <Chess960Tool />}
      {activeTab === 'darts' && <DartsScoreboardTool />}
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
    const [scores, setScores] = useState([{ name: 'Team 1', score: 0 }, { name: 'Team 2', score: 0 }]);

    const updateScore = (index, delta) => {
        const newScores = [...scores];
        newScores[index].score += delta;
        setScores(newScores);
    };

    return (
        <div style={{ display: 'grid', gap: '20px' }}>
            {scores.map((s, i) => (
                <div key={i} style={{ background: 'var(--surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <input
                        value={s.name}
                        onChange={e => {
                            const newScores = [...scores];
                            newScores[i].name = e.target.value;
                            setScores(newScores);
                        }}
                        style={{ background: 'transparent', border: 'none', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', width: '100%', color: 'var(--on-surface)' }}
                    />
                    <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--primary)', margin: '10px 0' }}>{s.score}</div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button className="pill" onClick={() => updateScore(i, -1)}>-1</button>
                        <button className="pill" onClick={() => updateScore(i, 1)}>+1</button>
                        <button className="pill" onClick={() => updateScore(i, 5)}>+5</button>
                    </div>
                </div>
            ))}
            <button className="pill" onClick={() => setScores([...scores, { name: `Team ${scores.length + 1}`, score: 0 }])}>Add Team</button>
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

export default Games;
