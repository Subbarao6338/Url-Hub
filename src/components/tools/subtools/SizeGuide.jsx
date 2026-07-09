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
        bottoms: [
            { label: "XS", us: "28", waist: 71, hips: 86 },
            { label: "S", us: "30-32", waist: 81, hips: 96 },
            { label: "M", us: "34-36", waist: 91, hips: 106 },
            { label: "L", us: "38-40", waist: 101, hips: 116 },
            { label: "XL", us: "42-44", waist: 111, hips: 126 },
            { label: "XXL", us: "46", waist: 121, hips: 136 }
        ]
    }
};

const SizeGuide = () => {
    const [activeTab, setActiveTab] = useState('clothing');
    const [subType, setSubType] = useState('dresses');
import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const SizeGuide = () => {
    const [activeTab, setActiveTab] = useState('clothing');
    const [gender, setGender] = useState('women');
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
        inseam: 76
        neckCircumference: 38
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
        }
    };

    const handleGenderChange = (val) => {
        setGender(val);
        if (activeTab === 'clothing') {
            setSubType(val === 'women' ? 'dresses' : 'tops');
        }
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
            // Briefs/Panties/Shapewear
            const { waist, hips } = measurements;
            const w = unit === 'inch' ? waist * 2.54 : waist;
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
    const calculateBraSize = () => {
        const { bust, underbust } = measurements;
        let bandSize, cupSize, standard;

        // Simplified Bra Calculation (Standard US/UK method)
        // Convert to inches if in cm
        const bustInch = unit === 'cm' ? bust / 2.54 : bust;
        const underbustInch = unit === 'cm' ? underbust / 2.54 : underbust;

        // Band size: round underbust to nearest even number and add 4 if even, 5 if odd (traditional)
        // Modern fitting often uses underbust + 0-2 inches, but we'll use a common standard.
        const roundedUnderbust = Math.round(underbustInch);
        const calcBand = roundedUnderbust % 2 === 0 ? roundedUnderbust + 4 : roundedUnderbust + 5;

        const diff = Math.round(bustInch - calcBand);
        const cups = ['AA', 'A', 'B', 'C', 'D', 'DD/E', 'DDD/F', 'G', 'H', 'I', 'J'];
        const cup = diff >= 0 && diff < cups.length ? cups[diff] : (diff < 0 ? 'AA' : 'K+');

        // EU Band is roughly underbust in cm rounded to nearest 5
        const euBand = Math.round(underbust / 5) * 5;

        setResult({
            text: `Calculated Bra Size:\nUS/UK: ${calcBand}${cup}\nEU: ${euBand}${cup}\n\nNote: This is a guide. Actual fit may vary by brand.`
        });
    };

    const convertShoeSize = () => {
        const { footLength } = measurements;
        const cm = unit === 'inch' ? footLength * 2.54 : footLength;
        const eu = (cm * 1.5) + 2;
        const uk = gender === 'men' ? (cm / 2.54) * 3 - 25 : (cm / 2.54) * 3 - 23;
        const us = gender === 'men' ? (cm / 2.54) * 3 - 24 : (cm / 2.54) * 3 - 21;
        setResult({
            text: `Estimated Shoe Sizes (${gender}):\nEU: ${Math.round(eu)}\nUK: ${uk.toFixed(1)}\nUS: ${us.toFixed(1)}\nFoot Length: ${cm.toFixed(1)}cm`
        });
    };

    const getRecommendedSize = (chart, m) => {
        // Find best fit in chart.
        // We prioritize the largest required size among multiple measurements.
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
            bestFit = entry; // Keep updating to last if none match
        }
        return bestFit;
    };

    const convertClothingSize = () => {
        const { bust, waist, hips, inseam, height } = measurements;
        const m = {
            bust: unit === 'inch' ? bust * 2.54 : bust,
            chest: unit === 'inch' ? bust * 2.54 : bust,
            waist: unit === 'inch' ? waist * 2.54 : waist,
            hips: unit === 'inch' ? hips * 2.54 : hips,
            inseam: unit === 'inch' ? inseam * 2.54 : inseam,
            height: unit === 'inch' ? height * 2.54 : height
        };

        let sizeData = "";
        if (gender === 'children') {
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
            text: `${subType.charAt(0).toUpperCase() + subType.slice(1)} Guide (${gender}):\n${sizeData}\n\nMeasurements used: ${m.bust}/${m.waist}/${m.hips} cm`
        });

        // Formulas (approximate)
        const eu = (cm * 1.5) + 2;
        const uk = gender === 'men' ? (cm / 2.54) * 3 - 25 : (cm / 2.54) * 3 - 23;
        const us = gender === 'men' ? (cm / 2.54) * 3 - 24 : (cm / 2.54) * 3 - 21;

        setResult({
            text: `Estimated Shoe Sizes for ${gender}:\nEU: ${Math.round(eu)}\nUK: ${uk.toFixed(1)}\nUS: ${us.toFixed(1)}\nCM: ${cm.toFixed(1)}`
        });
    };

    const convertClothingSize = () => {
        const { bust, waist, hips } = measurements;
        const b = unit === 'inch' ? bust * 2.54 : bust;
        const w = unit === 'inch' ? waist * 2.54 : waist;
        const h = unit === 'inch' ? hips * 2.54 : hips;

        let sizeData = "";
        if (gender === 'women') {
            if (b < 80) sizeData = "Size: XXS / US 00 / EU 30";
            else if (b < 84) sizeData = "Size: XS / US 0-2 / EU 32-34";
            else if (b < 90) sizeData = "Size: S / US 4-6 / EU 36-38";
            else if (b < 97) sizeData = "Size: M / US 8-10 / EU 40-42";
            else if (b < 104) sizeData = "Size: L / US 12-14 / EU 44-46";
            else if (b < 114) sizeData = "Size: XL / US 16-18 / EU 48-50";
            else sizeData = "Size: XXL+ / US 20+ / EU 52+";
        } else if (gender === 'men') {
            if (w < 75) sizeData = "Size: XS / US 28";
            else if (w < 82) sizeData = "Size: S / US 30-32";
            else if (w < 90) sizeData = "Size: M / US 34-36";
            else if (w < 98) sizeData = "Size: L / US 38-40";
            else if (w < 106) sizeData = "Size: XL / US 42-44";
            else sizeData = "Size: XXL+ / US 46+";
        } else { // Children
            const height = measurements.height;
            if (height < 80) sizeData = "Age: 9-12 Months (Size 80)";
            else if (height < 92) sizeData = "Age: 1-2 Years (Size 92)";
            else if (height < 104) sizeData = "Age: 3-4 Years (Size 104)";
            else if (height < 116) sizeData = "Age: 5-6 Years (Size 116)";
            else if (height < 128) sizeData = "Age: 7-8 Years (Size 128)";
            else if (height < 140) sizeData = "Age: 9-10 Years (Size 140)";
            else sizeData = "Age: 11+ Years (Size 152+)";
        }

        setResult({ text: `Clothing Guide (${gender}):\n${sizeData}\nBased on measurements: ${unit === 'cm' ? `${b}/${w}/${h} cm` : `${bust}/${waist}/${hips} inch`}` });
    };

    const convertAccessories = () => {
        const { ringDiameter, wristCircumference, neckCircumference } = measurements;
        const d = unit === 'inch' ? ringDiameter * 25.4 : ringDiameter;
        const wrist = unit === 'inch' ? wristCircumference * 25.4 : wristCircumference;
        const neck = unit === 'inch' ? neckCircumference * 25.4 : neckCircumference;
        const usRing = (d * 3.14159 - 36.5) / 2.55;
        let wristSize = wrist < 140 ? "Very Small" : wrist < 160 ? "Small" : wrist < 180 ? "Medium" : wrist < 200 ? "Large" : "Extra Large";
        setResult({
            text: `Accessories Sizes:\n💍 Ring (US): ${usRing.toFixed(1)}\n⌚ Wrist: ${wristSize} (${wrist.toFixed(1)}mm)\n👔 Neck: ${(neck/25.4).toFixed(1)}in / ${neck.toFixed(0)}mm`

        // US Ring Size approx
        const usRing = (d * 3.14159 - 36.5) / 2.55;

        let wristSize = "";
        if (wrist < 140) wristSize = "Very Small / Petites";
        else if (wrist < 160) wristSize = "Small";
        else if (wrist < 180) wristSize = "Medium";
        else if (wrist < 200) wristSize = "Large";
        else wristSize = "Extra Large";

        setResult({
            text: `Accessories & Ornaments:\n\n` +
                  `💍 Ring Size (US): ${usRing.toFixed(1)} (Diam: ${d.toFixed(1)}mm)\n` +
                  `⌚ Wrist Size: ${wristSize} (${wrist.toFixed(1)}mm)\n` +
                  `👔 Neck Size: ${neck.toFixed(1)}mm / ${(neck/25.4).toFixed(1)}in\n\n` +
                  `Bracelet length typically wrist + 1-2cm.`
        });
    };

    const calculateBodyIndices = () => {
        const { weight, height, waist, hips } = measurements;
        const hMeters = unit === 'inch' ? (height * 2.54) / 100 : height / 100;
        const wKg = unit === 'inch' ? weight * 0.453592 : weight;
        const bmi = hMeters > 0 ? wKg / (hMeters * hMeters) : 0;
        const whr = hips > 0 ? waist / hips : 0;
        let bmiCat = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
        setResult({
            text: `Body Stats:\nBMI: ${bmi.toFixed(1)} (${bmiCat})\nWaist-to-Hip: ${whr.toFixed(2)}\n\nRecommended WHR: <0.9 (M), <0.85 (W)`
        const wKg = weight; // Assume weight is in kg for now

        const bmi = hMeters > 0 ? wKg / (hMeters * hMeters) : 0;
        const whr = hips > 0 ? waist / hips : 0;

        let bmiCat = "";
        if (bmi < 18.5) bmiCat = "Underweight";
        else if (bmi < 25) bmiCat = "Normal weight";
        else if (bmi < 30) bmiCat = "Overweight";
        else bmiCat = "Obese";

        setResult({
            text: `Body Indices:\nBMI: ${bmi.toFixed(1)} (${bmiCat})\nWaist-to-Hip Ratio: ${whr.toFixed(2)}\n\nWHR > 0.90 (men) or > 0.85 (women) indicates abdominal obesity.`
        });
    };

    return (
        <div className="card p-20 glass-card grid gap-20">
            <div className="pill-group scrollable-x">
                <button className={`pill ${activeTab === 'clothing' ? 'active' : ''}`} onClick={() => handleTabChange('clothing')}>Clothing</button>
                <button className={`pill ${activeTab === 'inners' ? 'active' : ''}`} onClick={() => handleTabChange('inners')}>Inners</button>
                <button className={`pill ${activeTab === 'shoes' ? 'active' : ''}`} onClick={() => handleTabChange('shoes')}>Shoes</button>
                <button className={`pill ${activeTab === 'rings' ? 'active' : ''}`} onClick={() => handleTabChange('rings')}>Accessories</button>
                <button className={`pill ${activeTab === 'body' ? 'active' : ''}`} onClick={() => handleTabChange('body')}>Body Stats</button>
                <button className={`pill ${activeTab === 'clothing' ? 'active' : ''}`} onClick={() => setActiveTab('clothing')}>Clothing</button>
                <button className={`pill ${activeTab === 'shoes' ? 'active' : ''}`} onClick={() => setActiveTab('shoes')}>Shoes</button>
                <button className={`pill ${activeTab === 'bra' ? 'active' : ''}`} onClick={() => setActiveTab('bra')}>Bra & Inners</button>
                <button className={`pill ${activeTab === 'rings' ? 'active' : ''}`} onClick={() => setActiveTab('rings')}>Accessories</button>
                <button className={`pill ${activeTab === 'body' ? 'active' : ''}`} onClick={() => setActiveTab('body')}>Body Stats</button>
            </div>

            <div className="grid grid-2-cols gap-15">
                <div className="form-group">
                    <label className="smallest opacity-6 uppercase ml-10">Target</label>
                    <select className="pill w-full" value={gender} onChange={e => handleGenderChange(e.target.value)}>
                    <select className="pill w-full" value={gender} onChange={e => setGender(e.target.value)}>
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
                {activeTab === 'clothing' && (
                    <>
                        {gender !== 'children' && (
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
                            {subType === 'bottoms' && gender === 'men' && (
                                <div className="form-group">
                                    <label>Inseam ({unit})</label>
                                    <input type="number" name="inseam" className="pill w-full" value={measurements.inseam} onChange={handleInputChange} />
                                </div>
                            )}
                        <div className="form-group">
                            <label>Bust/Chest ({unit})</label>
                            <input type="number" name="bust" className="pill w-full" value={measurements.bust} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Waist ({unit})</label>
                            <input type="number" name="waist" className="pill w-full" value={measurements.waist} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Hips ({unit})</label>
                            <input type="number" name="hips" className="pill w-full" value={measurements.hips} onChange={handleInputChange} />
                        </div>
                        {gender === 'children' && (
                            <div className="form-group">
                                <label>Height ({unit})</label>
                                <input type="number" name="height" className="pill w-full" value={measurements.height} onChange={handleInputChange} />
                            </div>
                        )}
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
                {activeTab === 'shoes' && (
                    <>
                        <div className="form-group">
                            <label>Foot Length ({unit})</label>
                            <input type="number" name="footLength" className="pill w-full" value={measurements.footLength} onChange={handleInputChange} />
                        </div>
                        <button className="btn-primary" onClick={convertShoeSize}>Convert Shoe Size</button>
                    </>
                )}

                {activeTab === 'bra' && (
                    <>
                        <div className="form-group">
                            <label>Full Bust ({unit})</label>
                            <input type="number" name="bust" className="pill w-full" value={measurements.bust} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Underbust ({unit})</label>
                            <input type="number" name="underbust" className="pill w-full" value={measurements.underbust} onChange={handleInputChange} />
                        </div>
                        <button className="btn-primary" onClick={calculateBraSize}>Calculate Bra Size</button>
                    </>
                )}

                {activeTab === 'rings' && (
                    <>
                        <div className="form-group">
                            <label>Ring Internal Diameter (mm)</label>
                            <input type="number" name="ringDiameter" className="pill w-full" value={measurements.ringDiameter} onChange={handleInputChange} />
                        </div>
                        <div className="grid grid-2-cols gap-10">
                            <div className="form-group">
                                <label>Wrist ({unit})</label>
                                <input type="number" name="wristCircumference" className="pill w-full" value={measurements.wristCircumference} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Neck ({unit})</label>
                                <input type="number" name="neckCircumference" className="pill w-full" value={measurements.neckCircumference} onChange={handleInputChange} />
                            </div>
                        <div className="form-group">
                            <label>Wrist Circumference ({unit})</label>
                            <input type="number" name="wristCircumference" className="pill w-full" value={measurements.wristCircumference} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Neck Circumference ({unit})</label>
                            <input type="number" name="neckCircumference" className="pill w-full" value={measurements.neckCircumference} onChange={handleInputChange} />
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
        </div>
    );
};

export default SizeGuide;
