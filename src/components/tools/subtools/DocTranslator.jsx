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
    "bad": "chedu (చేడు)",
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
    "fire": "nippu (నిప్పు) / agni (అగ్ని)",
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
    "strength": "balam (బలం)",
    "mountain": "parvatam (పర్వతం)",
    "river": "nadi (నది)",
    "ocean": "samudram (సముద్రం)",
    "forest": "adavulu (అడవి)",
    "animal": "jantuvu (జంతువు)",
    "bird": "pakshi (పక్షి)",
    "man": "purushudu (పురుషుడు)",
    "woman": "stree (స్త్రీ)",
    "child": "pilla (పిల్ల)",
    "old": "paatha (పాత)",
    "new": "kotha (కొత్త)",
    "big": "pedda (పెద్ద)",
    "small": "chinna (చిన్న)",
    "hot": "vediga (వేడిగా)",
    "cold": "challaga (చల్లగా)",
    "fast": "veganga (వేగంగా)",
    "slow": "mellanuga (మెల్లగా)",
    "eat": "thinu (తిను)",
    "drink": "thagu (త్రాగు)",
    "sleep": "niddara (నిద్ర)",
    "run": "parugetthu (పరుగెత్తు)",
    "walk": "naduvu (నడువు)",
    "speak": "matladu (మాట్లాడు)",
    "listen": "vinu (విను)",
    "see": "chudu (చూడు)",
    "write": "rayi (రాయి)",
    "read": "chaduuvu (చదువు)",
    "give": "ivvu (ఇవ్వు)",
    "take": "teesuko (తీసుకో)",
    "where is": "ekkada undi? (ఎక్కడ ఉంది?)",
    "what is": "emiటి? (ఏమిటి?)",
    "who is": "evaru? (ఎవరు?)",
    "when": "eppudu? (ఎప్పుడు?)",
    "why": "enduku? (ఎందుకు?)",
    "how": "ela? (ఎలా?)",
    "name": "peru (పేరు)",
    "my name is": "na peru (నా పేరు)",
    "i am": "nenu (నేను)",
    "you are": "nuvvu (నువ్వు)",
    "they are": "varu (వారు)",
    "we are": "memu (మేము)",
    "come here": "ikkadiki ra (ఇక్కడికి రా)",
    "go there": "akkadiki vellu (అక్కడికి వెళ్ళు)",
    "sit down": "koorchondi (కూర్చోండి)",
    "stand up": "nilabudu (నిలబడు)",
    "don't": "vadu (వద్దు)",
    "stop": "apu (ఆపు)",
    "start": "modalupettu (మొదలుపెట్టు)",
    "wait": "agu (ఆగు)",
    "today": "ee roju (ఈ రోజు)",
    "tomorrow": "repu (రేపు)",
    "yesterday": "ninna (నిన్న)",
    "now": "ippudu (ఇప్పుడు)",
    "later": "taruvata (తరువాత)",
    "always": "eppudu (ఎప్పుడూ)",
    "never": "eppudu kadu (ఎప్పుడూ కాదు)",
    "maybe": "bahusha (బహుశా)",
    "beautiful": "andhamaina (అందమైన)",
    "strong": "balamaina (బలమైన)",
    "weak": "neersanga (నీరసంగా)",
    "happy": "santoshamga (సంతోషంగా)",
    "sad": "vicharangaa (విచారంగా)",
    "angry": "kopamga (కోపంగా)",
    "tired": "alasata (అలసట)",
    "hungry": "akali (ఆకలి)",
    "thirsty": "dappika (దప్పిక)"
};

const LANGUAGES = [
    { code: 'te', name: 'Telugu (తెలుగు)' },
    { code: 'es', name: 'Spanish (Español)' },
    { code: 'fr', name: 'French (Français)' },
    { code: 'de', name: 'German (Deutsch)' },
    { code: 'it', name: 'Italian (Italiano)' },
    { code: 'hi', name: 'Hindi (हिन्दी)' },
    { code: 'ja', name: 'Japanese (日本語)' },
    { code: 'zh', name: 'Chinese (中文)' }
];

const DocTranslator = () => {
    const [input, setInput] = useState('');
    const [targetLang, setTargetLang] = useState('te');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const translateOnline = async () => {
        if (!input.trim()) return;
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/doc-adv/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: input,
                    target_lang: targetLang,
                    source_lang: 'en'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'API request failed');
            }

            const data = await response.json();
            if (data.translated_text) {
                setResult({
                    text: data.translated_text,
                    filename: `translated_${targetLang}.txt`,
                    meta: { source: 'Google Translator API (via Backend)' }
                });
            } else {
                throw new Error('Translation data not found in response');
            }
        } catch (e) {
            console.warn("Online translation failed, falling back to offline dictionary:", e.message);
            // Fallback to offline translation if target language is Telugu
            if (targetLang === 'te') {
                runOfflineTranslation();
            } else {
                setResult({
                    error: `Translation failed: ${e.message}. (Offline fallback is only supported for English to Telugu).`
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const runOfflineTranslation = () => {
        let translated = input;

        // Sort keys by length descending to match longest phrases first
        const sortedKeys = Object.keys(DICTIONARY).sort((a, b) => b.length - a.length);

        sortedKeys.forEach(key => {
            const regex = new RegExp(`(?<=\\s|^|[.,!?;])${key}(?=\\s|$|[.,!?;])`, 'gi');
            translated = translated.replace(regex, (matched) => {
                return DICTIONARY[key.toLowerCase()];
            });
        });

        if (translated === input) {
            setResult({
                text: translated,
                isNote: true,
                note: "No matching phrases found in offline dictionary. Offline fallback is only available for simple words/greetings."
            });
        } else {
            setResult({
                text: translated,
                filename: 'offline_translation.txt',
                meta: { source: 'Local Dictionary (Offline Fallback)' }
            });
        }
    };

    return (
        <div className="card p-30 glass-card text-center grid gap-15">
            <h3>Online Document Translator</h3>
            <p className="smallest opacity-6">Translate English text into multiple languages using the public MyMemory Translation API, with local English-to-Telugu fallback.</p>

            <div className="grid grid-2-cols gap-10 text-left">
                <div className="form-group">
                    <label className="smallest opacity-6 uppercase ml-10">Source Language</label>
                    <select className="pill w-full" disabled>
                        <option>English</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="smallest opacity-6 uppercase ml-10">Target Language</label>
                    <select className="pill w-full" value={targetLang} onChange={e => setTargetLang(e.target.value)}>
                        {LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <textarea
                className="pill w-full"
                rows="6"
                style={{borderRadius: '16px', padding: '15px'}}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type or paste English text to translate..."
            />

            <div className="flex-center gap-10">
                <button className="btn-primary flex-1" onClick={translateOnline} disabled={loading}>
                    <span className="material-icons mr-10">translate</span>
                    {loading ? 'Translating...' : 'Translate'}
                </button>
                <button className="pill" onClick={() => { setInput(''); setResult(null); }} disabled={loading}>Clear</button>
            </div>

            <ToolResult result={result} />

            <div className="mt-10 p-15 bg-surface rounded-lg border text-left">
                <span className="smallest uppercase opacity-6 block mb-10 font-bold">Local Offline Dictionary Phrases (Telugu fallback):</span>
                <div className="flex-wrap gap-5 flex">
                    {Object.keys(DICTIONARY).slice(0, 15).map(k => (
                        <span key={k} className="badge smallest" style={{background: 'var(--primary-glow)'}}>{k}</span>
                    ))}
                    <span className="badge smallest">...and many more</span>
                </div>
            </div>
        </div>
    );
};

export default DocTranslator;
