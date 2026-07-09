import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const TRADITIONAL_DATA = {
  regions: [
    {
      name: "India",
      styles: [
        { name: "Saree", description: "A long drape worn by women, available in various fabrics like Silk (Banarasi, Kanjivaram) and Cotton." },
        { name: "Kurta Pajama", description: "A common outfit for men consisting of a long shirt and trousers." },
        { name: "Lehenga Choli", description: "A three-piece outfit including a long skirt, blouse, and dupatta, often worn for celebrations." }
      ]
    },
    {
      name: "East Asia",
      styles: [
        { name: "Kimono (Japan)", description: "A traditional Japanese T-shaped garment with long sleeves and wrapped around the body." },
        { name: "Hanbok (Korea)", description: "Traditional Korean dress characterized by vibrant colors and simple lines without pockets." },
        { name: "Cheongsam/Qipao (China)", description: "A high-necked, close-fitting dress for women." }
      ]
    },
    {
      name: "Middle East & North Africa",
      styles: [
        { name: "Thobe/Dishdasha", description: "An ankle-length robe, usually with long sleeves, worn by men in Arab countries." },
        { name: "Abaya", description: "A simple, loose over-garment, essentially a robe-like dress, worn by some women in the Muslim world." },
        { name: "Kaftan", description: "A variant of the robe or tunic, worn in several cultures around the world for thousands of years." }
      ]
    },
    {
      name: "Tribal & Indigenous",
      styles: [
        { name: "Maasai Shuka (East Africa)", description: "Vibrantly colored cloth, often red, wrapped around the body by the Maasai people." },
        { name: "Kente Cloth (West Africa)", description: "A silk and cotton fabric of interwoven cloth strips, native to the Akan ethnic group of South Ghana." },
        { name: "Native American Regalia", description: "Traditional clothing worn for ceremonial purposes, varying significantly by tribe." }
      ]
    }
  ]
};

const TraditionalGuide = ({ initialRegion = null }) => {
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [result, setResult] = useState(null);

  const getStyleDetails = (style) => {
    setResult({
      text: `Traditional Style: ${style.name}\n\nDescription: ${style.description}`
    });
  };

  return (
    <div className="card p-20 glass-card grid gap-20">
      <div className="pill-group scrollable-x">
        {TRADITIONAL_DATA.regions.map(region => (
          <button
            key={region.name}
            className={`pill ${selectedRegion === region.name ? 'active' : ''}`}
            onClick={() => { setSelectedRegion(region.name); setResult(null); }}
          >
            {region.name}
          </button>
        ))}
      </div>

      {selectedRegion ? (
        <div className="category-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {TRADITIONAL_DATA.regions.find(r => r.name === selectedRegion).styles.map(style => (
            <div key={style.name} className="card p-15 text-center" onClick={() => getStyleDetails(style)}>
              <div className="card-title">{style.name}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center opacity-6 p-20">Select a region to explore traditional styles.</div>
      )}

      <ToolResult result={result} />
    </div>
  );
};

export default TraditionalGuide;
