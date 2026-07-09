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
        neckCircumference: 38
    });
    const [result, setResult] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMeasurements(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

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
                <button className={`pill ${activeTab === 'clothing' ? 'active' : ''}`} onClick={() => setActiveTab('clothing')}>Clothing</button>
                <button className={`pill ${activeTab === 'shoes' ? 'active' : ''}`} onClick={() => setActiveTab('shoes')}>Shoes</button>
                <button className={`pill ${activeTab === 'bra' ? 'active' : ''}`} onClick={() => setActiveTab('bra')}>Bra & Inners</button>
                <button className={`pill ${activeTab === 'rings' ? 'active' : ''}`} onClick={() => setActiveTab('rings')}>Accessories</button>
                <button className={`pill ${activeTab === 'body' ? 'active' : ''}`} onClick={() => setActiveTab('body')}>Body Stats</button>
            </div>

            <div className="grid grid-2-cols gap-15">
                <div className="form-group">
                    <label className="smallest opacity-6 uppercase ml-10">Target</label>
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
