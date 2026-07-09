import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const UnitConverter = () => {
    const [value, setValue] = useState(1);
    const [fromUnit, setFromUnit] = useState('meters');
    const [toUnit, setToUnit] = useState('kilometers');
    const [category, setCategory] = useState('length');
    const [result, setResult] = useState(null);

    const units = {
        length: {
            meters: 1,
            kilometers: 0.001,
            miles: 0.000621371,
            feet: 3.28084,
            inches: 39.3701,
            yards: 1.09361,
            centimeters: 100,
            millimeters: 1000
        },
        weight: {
            kilograms: 1,
            grams: 1000,
            pounds: 2.20462,
            ounces: 35.274,
            milligrams: 1000000,
            tons: 0.001
        },
        area: {
            square_meters: 1,
            square_kilometers: 0.000001,
            square_miles: 3.861e-7,
            acres: 0.000247105,
            hectares: 0.0001
        },
        volume: {
            liters: 1,
            milliliters: 1000,
            gallons: 0.264172,
            cubic_meters: 0.001,
            cups: 4.22675
        },
        time: {
            seconds: 1,
            minutes: 1/60,
            hours: 1/3600,
            days: 1/86400,
            weeks: 1/604800
        },
        digital: {
            bytes: 1,
            kilobytes: 1/1024,
            megabytes: 1/Math.pow(1024, 2),
            gigabytes: 1/Math.pow(1024, 3),
            terabytes: 1/Math.pow(1024, 4),
            petabytes: 1/Math.pow(1024, 5)
        },
        speed: {
            meters_per_second: 1,
            kilometers_per_hour: 3.6,
            miles_per_hour: 2.23694,
            knots: 1.94384
        },
        force: {
            newtons: 1,
            kilonewtons: 0.001,
            pound_force: 0.224809,
            dynes: 100000
        },
        pressure: {
            pascals: 1,
            kilopascals: 0.001,
            bar: 0.00001,
            psi: 0.000145038,
            atmospheres: 9.8692e-6
        },
        energy: {
            joules: 1,
            kilojoules: 0.001,
            calories: 0.239006,
            kilocalories: 0.000239006,
            watt_hours: 0.000277778,
            kilowatt_hours: 2.7778e-7
        },
        power: {
            watts: 1,
            kilowatts: 0.001,
            horsepower: 0.00134102,
            btu_per_hour: 3.41214
        },
        data_transfer: {
            bps: 1,
            kbps: 1/1000,
            Mbps: 1/Math.pow(1000, 2),
            Gbps: 1/Math.pow(1000, 3),
            Tbps: 1/Math.pow(1000, 4),
            KiBps: 1/1024,
            MiBps: 1/Math.pow(1024, 2),
            GiBps: 1/Math.pow(1024, 3)
        },
        angle: {
            degrees: 1,
            radians: Math.PI / 180,
            gradians: 400 / 360,
            arcminutes: 60,
            arcseconds: 3600
        },
        frequency: {
            hertz: 1,
            kilohertz: 0.001,
            megahertz: 1e-6,
            gigahertz: 1e-9,
            terahertz: 1e-12
        },
        fuel_consumption: {
            km_per_liter: 'km/l',
            liters_per_100km: 'l/100km',
            miles_per_gallon: 'mpg'
        },
        temp: { celsius: 'c', fahrenheit: 'f', kelvin: 'k' }
    };

    const convert = () => {
        let res;
        if (category === 'temp') {
            let celsius;
            if (fromUnit === 'celsius') celsius = value;
            else if (fromUnit === 'fahrenheit') celsius = (value - 32) * 5/9;
            else celsius = value - 273.15;

            if (toUnit === 'celsius') res = celsius;
            else if (toUnit === 'fahrenheit') res = (celsius * 9/5) + 32;
            else res = celsius + 273.15;
        } else if (category === 'fuel_consumption') {
            // Base unit: km/l
            let kml;
            if (fromUnit === 'km_per_liter') kml = value;
            else if (fromUnit === 'liters_per_100km') kml = value === 0 ? 0 : 100 / value;
            else if (fromUnit === 'miles_per_gallon') kml = value * 0.425144;

            if (toUnit === 'km_per_liter') res = kml;
            else if (toUnit === 'liters_per_100km') res = kml === 0 ? 0 : 100 / kml;
            else if (toUnit === 'miles_per_gallon') res = kml / 0.425144;
        } else {
            const base = value / units[category][fromUnit];
            res = base * units[category][toUnit];
        }

        const formattedFrom = fromUnit.replace(/_/g, ' ');
        const formattedTo = toUnit.replace(/_/g, ' ');
        setResult({
            text: `${value} ${formattedFrom} = ${res.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${formattedTo}`,
            value: res
        });
    };

    return (
        <div className="grid gap-15 card p-20 glass-card">
            <div className="form-group">
                <label className="smallest opacity-6 uppercase ml-10">Category</label>
                <select className="pill w-full" value={category} onChange={e=>{
                    const newCat = e.target.value;
                    setCategory(newCat);
                    const catUnits = Object.keys(units[newCat]);
                    setFromUnit(catUnits[0]);
                    setToUnit(catUnits[1] || catUnits[0]);
                }}>
                    <option value="length">📏 Length</option>
                    <option value="weight">⚖️ Weight</option>
                    <option value="area">🌍 Area</option>
                    <option value="volume">🧪 Volume</option>
                    <option value="time">⏱️ Time</option>
                    <option value="digital">💾 Digital Storage</option>
                    <option value="data_transfer">📡 Data Transfer Rate</option>
                    <option value="speed">🚀 Speed</option>
                    <option value="force">💥 Force</option>
                    <option value="pressure">🌬️ Pressure</option>
                    <option value="energy">🔋 Energy</option>
                    <option value="power">⚡ Power</option>
                    <option value="angle">📐 Angle</option>
                    <option value="frequency">📻 Frequency</option>
                    <option value="fuel_consumption">🚗 Fuel Consumption</option>
                    <option value="temp">🌡️ Temperature</option>
                </select>
            </div>

            <div className="form-group">
                <label className="smallest opacity-6 uppercase ml-10">Input Value</label>
                <input type="number" className="pill w-full" value={value} onChange={e=>setValue(parseFloat(e.target.value) || 0)} />
            </div>

            <div className="grid grid-2-cols gap-10">
                <div className="form-group">
                    <label className="smallest opacity-6 uppercase ml-10">From</label>
                    <select className="pill w-full" value={fromUnit} onChange={e=>setFromUnit(e.target.value)}>
                        {Object.keys(units[category]).map(u=><option key={u} value={u}>{u.replace(/_/g, ' ')}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="smallest opacity-6 uppercase ml-10">To</label>
                    <select className="pill w-full" value={toUnit} onChange={e=>setToUnit(e.target.value)}>
                        {Object.keys(units[category]).map(u=><option key={u} value={u}>{u.replace(/_/g, ' ')}</option>)}
                    </select>
                </div>
            </div>

            <button className="btn-primary w-full" onClick={convert}>
                <span className="material-icons mr-10">sync</span>
                Convert Units
            </button>

            <ToolResult result={result} />
        </div>
    );
};

export default UnitConverter;
