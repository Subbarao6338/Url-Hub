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
    },
    {
      name: "Europe",
      styles: [
        { name: "Dirndl (Germany/Austria)", description: "A traditional feminine dress with a tight bodice, blouse, full skirt, and apron." },
        { name: "Lederhosen (Germany/Austria)", description: "Short or knee-length breeches made of leather, traditionally worn by men." },
        { name: "Kilts (Scotland)", description: "A knee-length non-bifurcated skirt-type garment with pleats at the back, originating in the traditional dress of Gaelic men and boys." },
        { name: "Flamenco Dress (Spain)", description: "A tight-fitting dress to the hip, which then spreads out in several ruffles to the ankle." }
      ]
    },
    {
      name: "Americas",
      styles: [
        { name: "Poncho (South America)", description: "A well-known garment designed to keep the body warm or dry, consisting of a large sheet of fabric with an opening in the center for the head." },
        { name: "Guayabera (Caribbean/Latin America)", description: "A men's summer shirt, worn outside the trousers, distinguished by two vertical rows of closely sewn pleats." },
        { name: "Huipil (Mexico/Central America)", description: "A traditional, loose-fitting tunic, generally made from two or three rectangular pieces of fabric which are then joined together with stitching." }
      ]
    },
    {
      name: "Southeast Asia",
      styles: [
        { name: "Batik (Indonesia/Malaysia)", description: "A technique of wax-resist dyeing applied to whole cloth, or cloth made using this technique." },
        { name: "Áo Dài (Vietnam)", description: "A Vietnamese national garment, worn by both sexes but now most commonly by women, consisting of a long tunic that is split on the sides and worn over trousers." },
        { name: "Barong Tagalog (Philippines)", description: "An embroidered formal shirt and considered the national dress of the Philippines. It is lightweight and worn untucked over an undershirt." }
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
