import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const DICTIONARY = {
    "hello": "namaskaram (నమస్కారం)",
    "world": "prapancham (ప్రపంచం)",
    "friend": "snehitudu (స్నేహితుడు)",
    "work": "panu (పని)",
    "book": "pustakam (పుస్తకం)",
    "water": "neeru (నీరు)",
    "food": "aharam (ఆహారం)",
    "good": "manchi (మంచి)",
    "bad": "chedu (చెడు)",
    "time": "samayam (సమయం)",
    "day": "roju (రోజు)",
    "night": "ratri (రాత్రి)",
    "love": "prema (ప్రేమ)",
    "peace": "shanti (శాంతి)",
    "happiness": "santosham (సంతోషం)",
    "thank you": "dhanyavadalu (ధన్యవాదాలు)",
    "please": "dayachesi (దయచేసి)",
    "yes": "avunu (అవును)",
    "no": "kadu (కాదు)",
    "how are you": "ela unnavu? (ఎలా ఉన్నావు?)",
    "brother": "tammudu (తమ్ముడు) / anna (అన్న)",
    "sister": "chellelu (చెల్లెలు) / akka (అక్క)",
    "mother": "amma (అమ్మ)",
    "father": "nanna (నాన్న)",
    "son": "kumarudu (కుమారుడు)",
    "daughter": "kumartu (కుమార్తె)",
    "house": "illu (ఇల్లు)",
    "city": "nagaram (నగరం)",
    "village": "gramam (గ్రామం)",
    "school": "badu (బడి)",
    "knowledge": "jnanam (జ్ఞానం)",
    "money": "dabbu (డబ్బు)",
    "health": "arogyam (ఆరోగ్యం)",
    "family": "kutumbam (కుటుంబం)",
    "friendship": "sneham (స్నేహం)",
    "education": "vidya (విద్య)",
    "medicine": "mandhu (మందు)",
    "nature": "prakruti (ప్రకృతి)",
    "earth": "bhoomi (భూమి)",
    "sky": "akasham (ఆకాశం)",
    "sun": "suryudu (సూర్యుడు)",
    "moon": "chandrudu (చంద్రుడు)",
    "fire": "aggu (అగ్ని)",
    "air": "gali (గాలి)",
    "tree": "chettu (చెట్టు)",
    "flower": "puvvu (పువ్వు)",
    "student": "vidyarthi (విద్యార్థి)",
    "teacher": "upadhyayudu (ఉపాధ్యాయుడు)",
    "life": "jivitham (జీవితం)",
    "dream": "kala (కల)",
    "truth": "nijam (నిజం)",
    "help": "sahayam (సహాయం)",
    "road": "dari (దారి)",
    "travel": "prayanam (ప్రయాణం)",
    "success": "vijayam (విజయం)",
    "strength": "balam (బలం)"
};

const DocTranslator = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);

    const offlineTranslate = () => {
        if (!input.trim()) return;

        let translated = input;

        // Sort keys by length descending to match longest phrases first
        const sortedKeys = Object.keys(DICTIONARY).sort((a, b) => b.length - a.length);

        sortedKeys.forEach(key => {
            // Regex to match the word while considering punctuation and ignoring case
            const regex = new RegExp(`(?<=\\s|^|[.,!?;])${key}(?=\\s|$|[.,!?;])`, 'gi');
            translated = translated.replace(regex, (matched) => {
                return DICTIONARY[key.toLowerCase()];
            });
        });

        if (translated === input) {
            setResult({ text: "No matching phrases found in offline dictionary. Try common words or greetings.", isNote: true });
        } else {
            setResult({ text: translated, filename: 'translation.txt' });
        }
    };

    return (
        <div className="card p-30 glass-card text-center grid gap-15">
            <h3>Common Phrase Translator (Offline)</h3>
            <p className="smallest opacity-6">Instant English to Telugu phrase mapping. Powered by an expanded local dictionary with punctuation support.</p>
            <textarea className="pill w-full" rows="6" style={{borderRadius: '16px', padding: '15px'}} value={input} onChange={e=>setInput(e.target.value)} placeholder="Type 'hello friend, how are you? My mother is at home'..." />
            <div className="flex-center gap-10">
                <button className="btn-primary flex-1" onClick={offlineTranslate}>
                    <span className="material-icons mr-10">translate</span>
                    Translate Offline
                </button>
                <button className="pill" onClick={() => { setInput(''); setResult(null); }}>Clear</button>
            </div>
            <ToolResult result={result} />
            <div className="mt-10 p-15 bg-surface rounded-lg border text-left">
                <span className="smallest uppercase opacity-6 block mb-10 font-bold">Supported Phrases (Sample):</span>
                <div className="flex-wrap gap-5 flex">
                    {Object.keys(DICTIONARY).slice(0, 20).map(k => <span key={k} className="badge smallest" style={{background: 'var(--primary-glow)'}}>{k}</span>)}
                    <span className="badge smallest">...and many more</span>
                </div>
            </div>
        </div>
    );
};

export default DocTranslator;
