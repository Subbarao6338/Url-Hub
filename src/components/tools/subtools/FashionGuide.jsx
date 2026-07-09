import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const FASHION_DATA = {
  bodyShapes: {
    women: [
      { name: "Hourglass", features: "Shoulders and hips are similar width, with a clearly defined waist.", tips: "Emphasize your waist with belts, wrap dresses, and high-waisted bottoms." },
      { name: "Pear (Triangle)", features: "Hips are wider than shoulders and bust.", tips: "Add volume to your upper body with ruffles, boat necks, and statement necklaces. Keep bottoms simple and dark." },
      { name: "Inverted Triangle", features: "Shoulders or bust are wider than hips.", tips: "Create volume on the bottom with A-line skirts, wide-leg pants, and flared dresses." },
      { name: "Rectangle (Straight)", features: "Shoulders, bust, and hips are similar width with little waist definition.", tips: "Create curves with peplum tops, sweetheart necklines, and structured jackets." },
      { name: "Apple (Round)", features: "Weight is carried mostly in the midsection and upper body.", tips: "Opt for empire waists, V-necklines, and monochromatic looks to elongate the torso." }
    ],
    men: [
      { name: "Trapezoid", features: "Broad shoulders and chest with relatively narrow waist and hips.", tips: "Most styles fit well. Experiment with different patterns and cuts." },
      { name: "Inverted Triangle", features: "Broad shoulders and chest with very narrow waist and hips.", tips: "Add bulk to the lower body with straight-leg pants and horizontal stripes around the waist." },
      { name: "Rectangle", features: "Shoulders are about the same width as the waist and hips.", tips: "Layer clothes to create volume and use structured blazers to broaden shoulders." },
      { name: "Triangle", features: "Shoulders are narrower than the waist and hips.", tips: "Use shoulder pads in jackets and avoid horizontal stripes around the waist." },
      { name: "Oval", features: "Weight is concentrated in the center of the torso.", tips: "Vertical stripes and dark colors help create a slimming effect. Avoid oversized clothing." }
    ]
  },
  styleTypes: [
    { name: "Minimalist", description: "Clean lines, neutral colors, and a focus on quality basics." },
    { name: "Bohemian", description: "Flowy fabrics, earthy tones, and eclectic patterns." },
    { name: "Streetwear", description: "Casual, comfortable clothing inspired by urban culture." },
    { name: "Preppy", description: "Classic, neat style inspired by university uniforms." },
    { name: "Avant-Garde", description: "Experimental, bold, and artistic fashion that pushes boundaries." }
  ],
  fabrics: [
    { name: "Cotton", description: "Natural, breathable, and durable. Ideal for everyday wear.", care: "Machine wash cold, tumble dry low. Iron while slightly damp." },
    { name: "Linen", description: "Lightweight, breathable, made from flax fibers. High moisture absorbency.", care: "Hand wash or machine wash on delicate. Air dry. Iron on high heat with steam." },
    { name: "Silk", description: "Luxurious, natural protein fiber. Temperature regulating.", care: "Dry clean preferred. Hand wash with cool water and mild detergent. Never wring." },
    { name: "Wool", description: "Warm, moisture-wicking, and wrinkle-resistant.", care: "Hand wash in cool water or dry clean. Lay flat to dry. Avoid high heat." },
    { name: "Polyester", description: "Synthetic, durable, wrinkle-resistant, and quick-drying.", care: "Machine wash warm, tumble dry low. Low heat iron if needed." },
    { name: "Denim", description: "Sturdy cotton twill fabric, typically indigo-dyed.", care: "Wash inside out in cold water. Air dry to prevent shrinkage and fading." }
  ]
};

const FashionGuide = ({ initialTab = 'body-shape', allowedTabs = null }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [gender, setGender] = useState('women');
  const [result, setResult] = useState(null);

  const getBodyShapeAdvice = (shape) => {
    setResult({
      text: `Fashion Advice for ${shape.name} Shape:\n\nFeatures: ${shape.features}\n\nStyling Tips: ${shape.tips}`
    });
  };

  const getStyleAdvice = (style) => {
    setResult({
      text: `Style Profile: ${style.name}\n\nDescription: ${style.description}\n\nKey Pieces: Invest in versatile pieces that fit this aesthetic to build a cohesive wardrobe.`
    });
  };

  const TABS = [
    { id: 'body-shape', label: 'Body Shape Guide' },
    { id: 'style-types', label: 'Style Profiles' },
    { id: 'fabrics', label: 'Fabric Encyclopedia' }
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
              onClick={() => { setActiveTab(tab.id); setResult(null); }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'body-shape' && (
        <>
          <div className="form-group">
            <label className="smallest opacity-6 uppercase ml-10">Target</label>
            <select className="pill w-full" value={gender} onChange={e => setGender(e.target.value)}>
              <option value="women">Women</option>
              <option value="men">Men</option>
            </select>
          </div>
          <div className="category-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {FASHION_DATA.bodyShapes[gender].map(shape => (
              <div key={shape.name} className="card p-15 text-center" onClick={() => getBodyShapeAdvice(shape)}>
                <div className="card-title">{shape.name}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'style-types' && (
        <div className="category-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {FASHION_DATA.styleTypes.map(style => (
            <div key={style.name} className="card p-15 text-center" onClick={() => getStyleAdvice(style)}>
              <div className="card-title">{style.name}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'fabrics' && (
        <div className="category-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {FASHION_DATA.fabrics.map(fabric => (
            <div key={fabric.name} className="card p-15 text-center" onClick={() => setResult({
              text: `Fabric: ${fabric.name}\n\nDescription: ${fabric.description}\n\nCare Instructions: ${fabric.care}`
            })}>
              <div className="card-title">{fabric.name}</div>
            </div>
          ))}
        </div>
      )}

      <ToolResult result={result} />
    </div>
  );
};

export default FashionGuide;
