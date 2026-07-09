import React, { useState, useMemo } from 'react';
import ToolResult from '../ToolResult';

const SIZE_CHARTS = {
    women: {
        dresses: [
            { label: "XXS", us: "00", eu: "30", bust: 78, waist: 60, hips: 86 },
            { label: "XS", us: "0-2", eu: "32-34", bust: 82, waist: 64, hips: 90 },
            { label: "S", us: "4-6", eu: "36-38", bust: 87, waist: 69, hips: 95 },
            { label: "M", us: "8-10", eu: "40-42", bust: 93, waist: 75, hips: 101 },
            { label: "L", us: "12-14", eu: "44-46", bust: 100, waist: 82, hips: 108 },
            { label: "XL", us: "16-18", eu: "48-50", bust: 109, waist: 91, hips: 117 },
            { label: "XXL", us: "20", eu: "52", bust: 119, waist: 101, hips: 127 }
        ],
        tops: [
            { label: "XXS", us: "00", eu: "30", bust: 78, waist: 60 },
            { label: "XS", us: "0-2", eu: "32-34", bust: 82, waist: 64 },
            { label: "S", us: "4-6", eu: "36-38", bust: 87, waist: 69 },
            { label: "M", us: "8-10", eu: "40-42", bust: 93, waist: 75 },
            { label: "L", us: "12-14", eu: "44-46", bust: 100, waist: 82 },
            { label: "XL", us: "16-18", eu: "48-50", bust: 109, waist: 91 },
            { label: "XXL", us: "20", eu: "52", bust: 119, waist: 101 }
        ],
        outerwear: [
            { label: "XXS", us: "00", eu: "30", bust: 82, waist: 64 },
            { label: "XS", us: "0-2", eu: "32-34", bust: 86, waist: 68 },
            { label: "S", us: "4-6", eu: "36-38", bust: 91, waist: 73 },
            { label: "M", us: "8-10", eu: "40-42", bust: 97, waist: 79 },
            { label: "L", us: "12-14", eu: "44-46", bust: 104, waist: 86 },
            { label: "XL", us: "16-18", eu: "48-50", bust: 113, waist: 95 },
            { label: "XXL", us: "20", eu: "52", bust: 123, waist: 105 }
        ],
        bottoms: [
            { label: "XXS", us: "24", eu: "30", waist: 60, hips: 86 },
            { label: "XS", us: "25-26", eu: "32-34", waist: 64, hips: 90 },
            { label: "S", us: "27-28", eu: "36-38", waist: 69, hips: 95 },
            { label: "M", us: "29-30", eu: "40-42", waist: 75, hips: 101 },
            { label: "L", us: "31-32", eu: "44-46", waist: 82, hips: 108 },
            { label: "XL", us: "33-34", eu: "48-50", waist: 91, hips: 117 },
            { label: "XXL", us: "36", eu: "52", waist: 101, hips: 127 }
        ]
    },
    men: {
        tops: [
            { label: "XS", us: "34", chest: 86, waist: 71 },
            { label: "S", us: "36", chest: 91, waist: 76 },
            { label: "M", us: "38-40", chest: 101, waist: 86 },
            { label: "L", us: "42-44", chest: 111, waist: 96 },
            { label: "XL", us: "46-48", chest: 121, waist: 106 },
            { label: "XXL", us: "50-52", chest: 132, waist: 117 }
        ],
        outerwear: [
            { label: "XS", us: "36", chest: 91, waist: 76 },
            { label: "S", us: "38", chest: 96, waist: 81 },
            { label: "M", us: "40-42", chest: 106, waist: 91 },
            { label: "L", us: "44-46", chest: 116, waist: 101 },
            { label: "XL", us: "48-50", chest: 126, waist: 111 },
            { label: "XXL", us: "52-54", chest: 137, waist: 122 }
        ],
        bottoms: [
            { label: "XS", us: "28", waist: 71, hips: 86 },
            { label: "S", us: "30-32", waist: 81, hips: 96 },
            { label: "M", us: "34-36", waist: 91, hips: 106 },
            { label: "L", us: "38-40", waist: 101, hips: 116 },
            { label: "XL", us: "42-44", waist: 111, hips: 126 },
            { label: "XXL", us: "46", waist: 121, hips: 136 }
        ]
    },
    traditional: {
        indian_women: [
            { label: "XS", us: "0-2", bust: 81, waist: 66, hips: 91, kurta: "32" },
            { label: "S", us: "4-6", bust: 86, waist: 71, hips: 96, kurta: "34" },
            { label: "M", us: "8-10", bust: 91, waist: 76, hips: 101, kurta: "36" },
            { label: "L", us: "12-14", bust: 96, waist: 81, hips: 106, kurta: "38" },
            { label: "XL", us: "16-18", bust: 101, waist: 86, hips: 111, kurta: "40" },
            { label: "XXL", us: "20-22", bust: 106, waist: 91, hips: 116, kurta: "42" }
        ],
        indian_men: [
            { label: "XS", chest: 86, waist: 76, kurta: "34" },
            { label: "S", chest: 91, waist: 81, kurta: "36" },
            { label: "M", chest: 96, waist: 86, kurta: "38" },
            { label: "L", chest: 101, waist: 91, kurta: "40" },
            { label: "XL", chest: 106, waist: 96, kurta: "42" },
            { label: "XXL", chest: 111, waist: 101, kurta: "44" }
        ],
        general: [
            { label: "S", us: "4-6", bust: 86, waist: 71, hips: 96, kurta: "N/A" },
            { label: "M", us: "8-10", bust: 91, waist: 76, hips: 101, kurta: "N/A" },
            { label: "L", us: "12-14", bust: 96, waist: 81, hips: 106, kurta: "N/A" }
        ]
    }
};

const SizeGuide = ({ initialTab = 'clothing', allowedTabs = null }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [gender, setGender] = useState('women');
    const [subType, setSubType] = useState('dresses');
    const [unit, setUnit] = useState('cm');
    const [measurements, setMeasurements] = useState({
        bust: 90,
        underbust: 75,
        waist: 70,
        hips: 95,
        footLength: 25,
        height: 170,
        weight: 70,
        ringDiameter: 17,
        wristCircumference: 160,
        neckCircumference: 38,
        inseam: 76,
        headCircumference: 57,
        handCircumference: 20
    });
    const [result, setResult] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMeasurements(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'clothing') {
            setSubType(gender === 'women' ? 'dresses' : 'tops');
        } else if (tab === 'inners') {
            setSubType('bras');
        } else if (tab === 'traditional') {
            setSubType(gender === 'women' ? 'indian_women' : 'indian_men');
        }
    };

    const handleGenderChange = (val) => {
        setGender(val);
        if (activeTab === 'clothing') {
            setSubType(val === 'women' ? 'dresses' : 'tops');
        } else if (activeTab === 'traditional') {
            setSubType(val === 'women' ? 'indian_women' : 'indian_men');
        }
    };

    const getRecommendedSize = (chart, m) => {
        if (!chart || chart.length === 0) return { label: "N/A" };
        let bestFit = chart[0];
        for (const entry of chart) {
            let matches = true;
            if (entry.bust && m.bust > entry.bust + 2) matches = false;
            if (entry.chest && m.chest > entry.chest + 2) matches = false;
            if (entry.waist && m.waist > entry.waist + 2) matches = false;
            if (entry.hips && m.hips > entry.hips + 2) matches = false;

            if (matches) {
                bestFit = entry;
                break;
            }
            bestFit = entry;
        }
        return bestFit;
    };

    const convertClothingSize = () => {
        const { bust, waist, hips, height } = measurements;
        const m = {
            bust: unit === 'inch' ? bust * 2.54 : bust,
            chest: unit === 'inch' ? bust * 2.54 : bust,
            waist: unit === 'inch' ? waist * 2.54 : waist,
            hips: unit === 'inch' ? hips * 2.54 : hips,
            height: unit === 'inch' ? height * 2.54 : height
        };

        let sizeData = "";
        if (activeTab === 'traditional') {
            const chart = SIZE_CHARTS.traditional[subType];
            const recommendation = getRecommendedSize(chart, m);
            sizeData = `Recommended Size: ${recommendation.label}\nKurta/Regional Size: ${recommendation.kurta}\nUS approx: ${recommendation.us || 'N/A'}`;
        } else if (gender === 'children') {
            if (m.height < 80) sizeData = "Age: 9-12 Months (Size 80)";
            else if (m.height < 92) sizeData = "Age: 1-2 Years (Size 92)";
            else if (m.height < 104) sizeData = "Age: 3-4 Years (Size 104)";
            else if (m.height < 116) sizeData = "Age: 5-6 Years (Size 116)";
            else if (m.height < 128) sizeData = "Age: 7-8 Years (Size 128)";
            else if (m.height < 140) sizeData = "Age: 9-10 Years (Size 140)";
            else sizeData = "Age: 11+ Years (Size 152+)";
        } else {
            const chart = SIZE_CHARTS[gender][subType] || SIZE_CHARTS[gender]['tops'];
            const recommendation = getRecommendedSize(chart, m);
            sizeData = `Recommended Size: ${recommendation.label}\nUS: ${recommendation.us || 'N/A'}\nEU: ${recommendation.eu || 'N/A'}`;
        }

        setResult({
            text: `${subType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Guide (${gender}):\n${sizeData}\n\nMeasurements: ${m.bust.toFixed(1)}/${m.waist.toFixed(1)}/${m.hips.toFixed(1)} cm`
        });
    };

    const calculateInnerSize = () => {
        if (subType === 'bras') {
            const { bust, underbust } = measurements;
            const bustInch = unit === 'cm' ? bust / 2.54 : bust;
            const underbustInch = unit === 'cm' ? underbust / 2.54 : underbust;
            const roundedUnderbust = Math.round(underbustInch);
            const calcBand = roundedUnderbust % 2 === 0 ? roundedUnderbust + 4 : roundedUnderbust + 5;
            const diff = Math.round(bustInch - calcBand);
            const cups = ['AA', 'A', 'B', 'C', 'D', 'DD/E', 'DDD/F', 'G', 'H', 'I', 'J'];
            const cup = diff >= 0 && diff < cups.length ? cups[diff] : (diff < 0 ? 'AA' : 'K+');
            const euBand = Math.round(underbust / 5) * 5;
            setResult({
                text: `Bra Size Prediction:\nUS/UK: ${calcBand}${cup}\nEU: ${euBand}${cup}\n\nNote: Inners fit vary greatly by brand and style.`
            });
        } else {
            const { waist, hips } = measurements;
            const h = unit === 'inch' ? hips * 2.54 : hips;
            let size = "M";
            if (h < 90) size = "XS";
            else if (h < 95) size = "S";
            else if (h < 102) size = "M";
            else if (h < 110) size = "L";
            else if (h < 118) size = "XL";
            else size = "XXL+";

            setResult({
                text: `${subType.charAt(0).toUpperCase() + subType.slice(1)} Size Prediction:\nRecommended: ${size}\n\nBased on Hips: ${h.toFixed(1)}cm`
            });
        }
    };

    const convertShoeSize = () => {
        const { footLength } = measurements;
        const cm = unit === 'inch' ? footLength * 2.54 : footLength;
        const eu = (cm * 1.5) + 2;
        const uk = gender === 'men' ? (cm / 2.54) * 3 - 25 : (cm / 2.54) * 3 - 23;
        const us = gender === 'men' ? (cm / 2.54) * 3 - 24 : (cm / 2.54) * 3 - 21;
        const jp = cm;
        const kr = cm * 10; // Korean size is usually mm
        setResult({
            text: `Estimated Shoe Sizes (${gender}):\nEU: ${Math.round(eu)}\nUK: ${uk.toFixed(1)}\nUS: ${us.toFixed(1)}\nJP: ${jp.toFixed(1)}cm\nKR: ${kr.toFixed(0)}mm\nFoot Length: ${cm.toFixed(1)}cm`
        });
    };

    const convertAccessories = () => {
        const { ringDiameter, wristCircumference, neckCircumference, headCircumference, handCircumference } = measurements;
        const d = unit === 'inch' ? ringDiameter * 25.4 : ringDiameter;
        const wrist = unit === 'inch' ? wristCircumference * 25.4 : wristCircumference;
        const neck = unit === 'inch' ? neckCircumference * 25.4 : neckCircumference;
        const head = unit === 'inch' ? headCircumference * 2.54 : headCircumference;
        const hand = unit === 'inch' ? handCircumference * 2.54 : handCircumference;

        // Ring Size
        const usRing = (d * 3.14159 - 36.5) / 2.55;

        // Wrist Size
        let wristSize = wrist < 140 ? "Very Small" : wrist < 160 ? "Small" : wrist < 180 ? "Medium" : wrist < 200 ? "Large" : "Extra Large";

        // Hat Size (US)
        const hatSizeUS = (head / 2.54) / Math.PI;
        let hatLabel = "M";
        if (head < 54) hatLabel = "XS";
        else if (head < 56) hatLabel = "S";
        else if (head < 58) hatLabel = "M";
        else if (head < 60) hatLabel = "L";
        else if (head < 62) hatLabel = "XL";
        else hatLabel = "XXL";

        // Glove Size
        const gloveSizeInch = hand / 2.54;
        let gloveLabel = "M";
        if (gloveSizeInch < 7) gloveLabel = "XS";
        else if (gloveSizeInch < 8) gloveLabel = "S";
        else if (gloveSizeInch < 9) gloveLabel = "M";
        else if (gloveSizeInch < 10) gloveLabel = "L";
        else gloveLabel = "XL";

        // Belt Size
        const waistInch = unit === 'cm' ? measurements.waist / 2.54 : measurements.waist;
        const beltSize = Math.ceil(waistInch) + 2;

        setResult({
            text: `Accessories & Headwear:\n💍 Ring (US): ${usRing.toFixed(1)}\n⌚ Wrist: ${wristSize} (${wrist.toFixed(1)}mm)\n👔 Neck: ${(neck / 25.4).toFixed(1)}in / ${neck.toFixed(0)}mm\n👒 Hat Size: ${hatLabel} (US ${hatSizeUS.toFixed(2)})\n🧤 Glove Size: ${gloveLabel} (${gloveSizeInch.toFixed(1)}in)\n👖 Belt Size: ${beltSize}in / ${Math.round(beltSize * 2.54)}cm`
        });
    };

    const calculateBodyIndices = () => {
        const { weight, height, waist, hips, bust } = measurements;
        const b = unit === 'inch' ? bust * 2.54 : bust;
        const w = unit === 'inch' ? waist * 2.54 : waist;
        const h = unit === 'inch' ? hips * 2.54 : hips;

        const hMeters = unit === 'inch' ? (height * 2.54) / 100 : height / 100;
        const wKg = unit === 'inch' ? weight * 0.453592 : weight;
        const bmi = hMeters > 0 ? wKg / (hMeters * hMeters) : 0;
        const whr = hips > 0 ? waist / hips : 0;
        let bmiCat = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";

        // Body Shape Logic (Simplified)
        let bodyShape = "Not determined";
        if (gender === 'women') {
            const bustHipDiff = Math.abs(b - h);
            const isHourglass = bustHipDiff <= 5 && (b - w) >= 20 && (h - w) >= 20;
            const isPear = (h - b) > 5 && (h - w) >= 20;
            const isInvertedTriangle = (b - h) > 5 && (b - w) >= 20;
            const isRectangle = bustHipDiff <= 5 && (b - w) < 20 && (h - w) < 20;
            const isApple = (w >= b) && (w >= h);

            if (isHourglass) bodyShape = "Hourglass";
            else if (isPear) bodyShape = "Pear (Triangle)";
            else if (isInvertedTriangle) bodyShape = "Inverted Triangle";
            else if (isApple) bodyShape = "Apple (Round)";
            else if (isRectangle) bodyShape = "Rectangle (Straight)";
        } else if (gender === 'men') {
            if (b > h * 1.05) bodyShape = "Inverted Triangle / V-Taper";
            else if (w > b && w > h) bodyShape = "Oval / Apple";
            else if (Math.abs(b - h) < 5 && Math.abs(b - w) < 5) bodyShape = "Rectangle";
            else if (h > b) bodyShape = "Triangle";
            else bodyShape = "Trapezoid (Standard)";
        }

        setResult({
            text: `Body Stats & Shape:\nBMI: ${bmi.toFixed(1)} (${bmiCat})\nWaist-to-Hip: ${whr.toFixed(2)}\nEstimated Shape: ${bodyShape}\n\nNote: Shapes are estimates based on standard ratios.`
        });
    };

    const getStyleTips = () => {
        if (activeTab === 'traditional') {
            return "Traditional styles often use natural fabrics like Silk or Cotton. For a perfect fit, prioritize the bust/chest measurement as it determines the drape.";
        }
        if (activeTab === 'clothing') {
            return "Modern fashion varies by brand. If you are between sizes, consider the fabric elasticity; go for the smaller size for stretchy knits and the larger for structured woven fabrics.";
        }
        if (activeTab === 'body') {
            return "Dressing for your body shape: Hourglass looks great with waist definition. Pear shapes benefit from structured shoulders. Inverted triangles look balanced with wide-leg pants.";
        }
        return null;
    };

    const TABS = [
        { id: 'clothing', label: 'Clothing' },
        { id: 'traditional', label: 'Traditional' },
        { id: 'inners', label: 'Inners' },
        { id: 'shoes', label: 'Shoes' },
        { id: 'rings', label: 'Accessories' },
        { id: 'body', label: 'Body Stats' }
    ];

    const filteredTabs = allowedTabs ? TABS.filter(t => allowedTabs.includes(t.id)) : TABS;

    return (
        <div className="card p-20 glass-card grid gap-20">
            {filteredTabs.length > 1 && (
                <div className="pill-group scrollable-x">
                    {filteredTabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`pill ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => handleTabChange(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}

            <div className="grid grid-2-cols gap-15">
                <div className="form-group">
                    <label className="smallest opacity-6 uppercase ml-10">Target</label>
                    <select className="pill w-full" value={gender} onChange={e => handleGenderChange(e.target.value)}>
                        <option value="women">Women</option>
                        <option value="men">Men</option>
                        <option value="children">Children</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="smallest opacity-6 uppercase ml-10">Unit</label>
                    <select className="pill w-full" value={unit} onChange={e => setUnit(e.target.value)}>
                        <option value="cm">Metric (cm/kg)</option>
                        <option value="inch">Imperial (in/lb)</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-10">
                {(activeTab === 'clothing' || activeTab === 'traditional') && (
                    <>
                        {gender !== 'children' && activeTab === 'clothing' && (
                            <div className="form-group">
                                <label className="smallest opacity-6 uppercase ml-10">Clothing Type</label>
                                <select className="pill w-full" value={subType} onChange={e => setSubType(e.target.value)}>
                                    {gender === 'women' && <option value="dresses">Dresses & Jumpsuits</option>}
                                    <option value="tops">Tops & Blouses</option>
                                    <option value="bottoms">Pants & Skirts</option>
                                    <option value="outerwear">Outerwear & Coats</option>
                                </select>
                            </div>
                        )}

                        {activeTab === 'traditional' && (
                            <div className="form-group">
                                <label className="smallest opacity-6 uppercase ml-10">Traditional Type</label>
                                <select className="pill w-full" value={subType} onChange={e => setSubType(e.target.value)}>
                                    <option value={gender === 'women' ? 'indian_women' : 'indian_men'}>Indian (Kurta/Saree)</option>
                                    <option value="general">Global Traditional (General)</option>
                                </select>
                            </div>
                        )}
                        <div className="grid grid-2-cols gap-10">
                            {(subType !== 'bottoms' || gender === 'children') && (
                                <div className="form-group">
                                    <label>{gender === 'men' ? 'Chest' : 'Bust'} ({unit})</label>
                                    <input type="number" name="bust" className="pill w-full" value={measurements.bust} onChange={handleInputChange} />
                                </div>
                            )}
                            <div className="form-group">
                                <label>Waist ({unit})</label>
                                <input type="number" name="waist" className="pill w-full" value={measurements.waist} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="grid grid-2-cols gap-10">
                            {(subType !== 'tops' || gender === 'children') && (
                                <div className="form-group">
                                    <label>Hips ({unit})</label>
                                    <input type="number" name="hips" className="pill w-full" value={measurements.hips} onChange={handleInputChange} />
                                </div>
                            )}
                            {gender === 'children' && (
                                <div className="form-group">
                                    <label>Height ({unit})</label>
                                    <input type="number" name="height" className="pill w-full" value={measurements.height} onChange={handleInputChange} />
                                </div>
                            )}
                        </div>
                        <button className="btn-primary" onClick={convertClothingSize}>Get Clothing Size</button>
                    </>
                )}

                {activeTab === 'inners' && (
                    <>
                        <div className="form-group">
                            <label className="smallest opacity-6 uppercase ml-10">Inner Type</label>
                            <select className="pill w-full" value={subType} onChange={e => setSubType(e.target.value)}>
                                <option value="bras">Bras & Bralettes</option>
                                <option value="briefs">Briefs & Panties</option>
                                <option value="shapewear">Shapewear</option>
                            </select>
                        </div>
                        {subType === 'bras' ? (
                            <div className="grid grid-2-cols gap-10">
                                <div className="form-group">
                                    <label>Full Bust ({unit})</label>
                                    <input type="number" name="bust" className="pill w-full" value={measurements.bust} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Underbust ({unit})</label>
                                    <input type="number" name="underbust" className="pill w-full" value={measurements.underbust} onChange={handleInputChange} />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-2-cols gap-10">
                                <div className="form-group">
                                    <label>Waist ({unit})</label>
                                    <input type="number" name="waist" className="pill w-full" value={measurements.waist} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Hips ({unit})</label>
                                    <input type="number" name="hips" className="pill w-full" value={measurements.hips} onChange={handleInputChange} />
                                </div>
                            </div>
                        )}
                        <button className="btn-primary" onClick={calculateInnerSize}>Calculate Inner Size</button>
                    </>
                )}

                {activeTab === 'shoes' && (
                    <>
                        <div className="form-group">
                            <label>Foot Length ({unit})</label>
                            <input type="number" name="footLength" className="pill w-full" value={measurements.footLength} onChange={handleInputChange} />
                        </div>
                        <button className="btn-primary" onClick={convertShoeSize}>Convert Shoe Size</button>
                    </>
                )}

                {activeTab === 'rings' && (
                    <>
                        <div className="grid grid-2-cols gap-10">
                            <div className="form-group">
                                <label>Ring Diameter (mm)</label>
                                <input type="number" name="ringDiameter" className="pill w-full" value={measurements.ringDiameter} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Wrist ({unit})</label>
                                <input type="number" name="wristCircumference" className="pill w-full" value={measurements.wristCircumference} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="grid grid-2-cols gap-10">
                            <div className="form-group">
                                <label>Neck ({unit})</label>
                                <input type="number" name="neckCircumference" className="pill w-full" value={measurements.neckCircumference} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Head Circ. ({unit})</label>
                                <input type="number" name="headCircumference" className="pill w-full" value={measurements.headCircumference} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Hand Circ. ({unit})</label>
                            <input type="number" name="handCircumference" className="pill w-full" value={measurements.handCircumference} onChange={handleInputChange} />
                        </div>
                        <button className="btn-primary" onClick={convertAccessories}>Calculate Accessory Sizes</button>
                    </>
                )}

                {activeTab === 'body' && (
                    <>
                        <div className="grid grid-2-cols gap-10">
                            <div className="form-group">
                                <label>Height ({unit})</label>
                                <input type="number" name="height" className="pill w-full" value={measurements.height} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Weight ({unit === 'cm' ? 'kg' : 'lb'})</label>
                                <input type="number" name="weight" className="pill w-full" value={measurements.weight} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="grid grid-2-cols gap-10">
                            <div className="form-group">
                                <label>Waist ({unit})</label>
                                <input type="number" name="waist" className="pill w-full" value={measurements.waist} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Hips ({unit})</label>
                                <input type="number" name="hips" className="pill w-full" value={measurements.hips} onChange={handleInputChange} />
                            </div>
                        </div>
                        <button className="btn-primary" onClick={calculateBodyIndices}>Calculate Indices</button>
                    </>
                )}
            </div>

            <ToolResult result={result} />

            {getStyleTips() && (
                <div className="p-15 border-top opacity-8 smallest italic">
                    <strong>Style Tip:</strong> {getStyleTips()}
                </div>
            )}
        </div>
    );
};

export default SizeGuide;
