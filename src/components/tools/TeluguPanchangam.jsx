import React, { useState } from 'react';

const TeluguPanchangam = () => {
  const now = new Date();
  const [date, setDate] = useState(now.toISOString().split('T')[0]);
  const [time, setTime] = useState(now.toTimeString().split(' ')[0].substring(0, 5));
  const [tz, setTz] = useState(5.5);
  const [lat, setLat] = useState(17.3850);
  const [lng, setLng] = useState(78.4867);
  const [results, setResults] = useState(null);

  const rev = (angle) => angle - Math.floor(angle / 360.0) * 360.0;
  const getJulianDate = (date) => (date.getTime() / 86400000) - (date.getTimezoneOffset() / 1440) + 2440587.5;
  const getAyanamsa = (jd) => 23.85 + 1.397 * ((jd - 2451545.0) / 36525);
  const getSunLongitude = (jd) => {
    const d = jd - 2451543.5;
    const w = 282.9404 + 4.70935e-5 * d;
    const e = 0.016709 - 1.151e-9 * d;
    const M = rev(356.0470 + 0.9856002585 * d);
    const E = M + (180/Math.PI) * e * Math.sin(M * Math.PI/180) * (1 + e * Math.cos(M * Math.PI/180));
    const x = Math.cos(E * Math.PI/180) - e;
    const y = Math.sin(E * Math.PI/180) * Math.sqrt(1 - e*e);
    return rev(Math.atan2(y, x) * 180/Math.PI + w);
  };
  const getMoonLongitude = (jd) => {
    const d = jd - 2451543.5;
    const N = rev(125.1228 - 0.0529538083 * d);
    const i = 5.1454;
    const w = rev(318.0634 + 0.1643573223 * d);
    const a = 60.2666;
    const e = 0.054900;
    const M = rev(115.3654 + 13.0649929509 * d);
    let E = M + (180/Math.PI) * e * Math.sin(M * Math.PI/180) * (1 + e * Math.cos(M * Math.PI/180));
    for(let j=0; j<3; j++) E = E - (E - (180/Math.PI) * e * Math.sin(E * Math.PI/180) - M) / (1 - e * Math.cos(E * Math.PI/180));
    const x = a * (Math.cos(E * Math.PI/180) - e);
    const y = a * Math.sqrt(1 - e*e) * Math.sin(E * Math.PI/180);
    const v = Math.atan2(y, x) * 180/Math.PI;
    const xecl = Math.cos(N * Math.PI/180) * Math.cos((v+w) * Math.PI/180) - Math.sin(N * Math.PI/180) * Math.sin((v+w) * Math.PI/180) * Math.cos(i * Math.PI/180);
    const yecl = Math.sin(N * Math.PI/180) * Math.cos((v+w) * Math.PI/180) + Math.cos(N * Math.PI/180) * Math.sin((v+w) * Math.PI/180) * Math.cos(i * Math.PI/180);
    return rev(Math.atan2(yecl, xecl) * 180/Math.PI);
  };

  const calculate = () => {
    const dt = new Date(`${date}T${time}`);
    const jdLocal = getJulianDate(dt);
    const browserOffsetHours = -dt.getTimezoneOffset() / 60;
    const jdUT = jdLocal - (browserOffsetHours / 24.0);
    const jdSelectedLocal = jdUT + (tz / 24.0);

    const sunLong = getSunLongitude(jdUT);
    const moonLong = getMoonLongitude(jdUT);
    const ayanamsa = getAyanamsa(jdUT);
    const nirayanaMoon = rev(moonLong - ayanamsa);

    let diff = moonLong - sunLong;
    if (diff < 0) diff += 360;

    const tithis = ["Padyami", "Vidiya", "Tadiya", "Chavithi", "Panchami", "Shashti", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Pournami", "Padyami (Bahula)", "Vidiya (Bahula)", "Tadiya (Bahula)", "Chavithi (Bahula)", "Panchami (Bahula)", "Shashti (Bahula)", "Saptami (Bahula)", "Ashtami (Bahula)", "Navami (Bahula)", "Dashami (Bahula)", "Ekadashi (Bahula)", "Dwadashi (Bahula)", "Trayodashi (Bahula)", "Chaturdashi (Bahula)", "Amavasya"];
    const nakshatras = ["Aswini", "Bharani", "Krittika", "Rohini", "Mrigasira", "Arudra", "Punarvasu", "Pushyami", "Aslesha", "Makha", "Pubba", "Uttara", "Hasta", "Chitra", "Swati", "Visakha", "Anuradha", "Jyeshta", "Moola", "Poorvashada", "Uttarashada", "Sravanam", "Dhanishta", "Satabhisham", "Poorvabhadra", "Uttarabhadra", "Revati"];
    const rasis = ["Mesham", "Vrushabham", "Midhunam", "Karkatakam", "Simham", "Kanya", "Thula", "Vrushchikam", "Dhanassu", "Makaram", "Kumbham", "Meenam"];

    setResults({
      tithi: tithis[Math.floor(diff / 12)],
      nakshatra: nakshatras[Math.floor(nirayanaMoon / (360/27))],
      pada: Math.floor((nirayanaMoon % (360/27)) / (360/108)) + 1,
      rasi: rasis[Math.floor(nirayanaMoon / 30)],
      vara: ["Sunday (Aditya)", "Monday (Somu)", "Tuesday (Mangala)", "Wednesday (Budha)", "Thursday (Guru)", "Friday (Sukra)", "Saturday (Sani)"][(Math.floor(jdSelectedLocal + 0.5) + 1) % 7]
    });
  };

  return (
    <div className="tool-form">
      <div className="form-group"><label>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
      <div className="form-group"><label>Time</label><input type="time" value={time} onChange={e => setTime(e.target.value)} /></div>
      <div className="form-group"><label>Timezone Offset</label><input type="number" step="0.5" value={tz} onChange={e => setTz(parseFloat(e.target.value))} /></div>
      <button className="btn-primary" onClick={calculate}>Calculate Details</button>
      {results && (
        <div className="tool-result" style={{ marginTop: '1.5rem' }}>
          <h3>Telugu Panchangam</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><span style={{ opacity: 0.6 }}>Tithi:</span> {results.tithi}</div>
            <div><span style={{ opacity: 0.6 }}>Nakshatra:</span> {results.nakshatra}</div>
            <div><span style={{ opacity: 0.6 }}>Pada:</span> {results.pada}</div>
            <div><span style={{ opacity: 0.6 }}>Rasi:</span> {results.rasi}</div>
            <div><span style={{ opacity: 0.6 }}>Vara:</span> {results.vara}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeluguPanchangam;
