import React, { useEffect, useRef } from 'react';

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
  const containerRef = useRef(null);

  useEffect(() => {
    if (window.Alpine && containerRef.current) {
      window.Alpine.initTree(containerRef.current);
    } else {
      const handleAlpine = () => {
        if (containerRef.current) {
          window.Alpine.initTree(containerRef.current);
        }
      };
      document.addEventListener('alpine:init', handleAlpine);
      return () => document.removeEventListener('alpine:init', handleAlpine);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      x-data={`{
        selectedRegion: '${initialRegion || ""}',
        resultText: '',
        searchQuery: '',
        selectRegion(regionName) {
          this.selectedRegion = regionName;
          this.resultText = '';
          this.searchQuery = '';
        },
        getStyleDetails(styleName, description) {
          this.resultText = 'Traditional Style: ' + styleName + '\\n\\nDescription: ' + description;
        },
        clearAll() {
          this.selectedRegion = '';
          this.resultText = '';
          this.searchQuery = '';
        }
      }`}
      className="card p-25 glass-card grid gap-20"
    >
      <div className="flex-between flex-wrap gap-10">
        <h3 className="m-0 flex-center gap-10">
          <span className="material-icons" style={{ color: 'var(--brand-accent)' }}>temple_hindu</span>
          Traditional & Ethnic Guide
        </h3>
        <button
          type="button"
          className="pill small"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
          x-show="selectedRegion"
          x-on:click="clearAll()"
        >
          Reset View
        </button>
      </div>

      <p className="smallest opacity-6 m-0">
        Explore a curated library of historical, cultural, and regional styles from around the world.
      </p>

      {/* Region Selector Pills */}
      <div className="pill-group scrollable-x">
        {TRADITIONAL_DATA.regions.map(region => (
          <button
            key={region.name}
            type="button"
            className="pill"
            x-bind:class={`selectedRegion === '${region.name}' ? 'active' : ''`}
            x-on:click={`selectRegion('${region.name}')`}
          >
            {region.name}
          </button>
        ))}
      </div>

      {/* Dynamic Search Filter Bar (Visible when a region is selected) */}
      <div x-show="selectedRegion" className="form-group text-left" style={{ display: 'none' }}>
        <label className="smallest opacity-6 uppercase ml-10">Filter Styles</label>
        <div className="relative">
          <input
            type="text"
            x-model="searchQuery"
            className="pill w-full text-center small"
            placeholder="Search styles (e.g., Saree, Kimono)..."
            style={{ paddingRight: '40px' }}
          />
          <span className="material-icons absolute opacity-4" style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>search</span>
        </div>
      </div>

      {/* Style Grids per Region */}
      {TRADITIONAL_DATA.regions.map(region => (
        <div
          key={region.name}
          x-show={`selectedRegion === '${region.name}'`}
          className="category-grid"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', display: 'none' }}
        >
          {region.styles.map(style => (
            <div
              key={style.name}
              className="card p-15 text-center cursor-pointer hover-scale"
              x-show={`!searchQuery || '${style.name.toLowerCase().replace(/'/g, "\\'")}'.includes(searchQuery.toLowerCase())`}
              x-on:click={`getStyleDetails('${style.name.replace(/'/g, "\\'")}', '${style.description.replace(/'/g, "\\'")}')`}
            >
              <div className="card-title font-bold" style={{ color: 'var(--brand-accent)' }}>{style.name}</div>
            </div>
          ))}
        </div>
      ))}

      {/* Default Prompt when no region is selected */}
      <div x-show="!selectedRegion" className="text-center opacity-6 p-20 border-radius-12" style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-color)' }}>
        <span className="material-icons display-block mb-10" style={{ fontSize: '2.5rem', color: 'var(--brand-accent)' }}>explore</span>
        <div>Select a region pill above to explore traditional and ethnic garments.</div>
      </div>

      {/* Dynamic results card managed by Alpine.js */}
      <div x-show="resultText" className="animate-fadeIn mt-20" style={{ display: 'none' }}>
        <div className="flex-between mb-5">
          <span className="smallest opacity-6 uppercase font-bold tracking-wider">Style Detail</span>
          <button
            type="button"
            className="pill smallest active"
            style={{ background: 'var(--brand-accent)', borderColor: 'var(--brand-accent)' }}
            x-on:click="navigator.clipboard.writeText(resultText); alert('Style details copied to clipboard!')"
          >
            <span className="material-icons" style={{ fontSize: '1rem' }}>content_copy</span> Copy Details
          </button>
        </div>
        <div className="card p-20 text-left relative" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
          <pre className="m-0 font-mono small" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-primary)', lineHeight: '1.5' }} x-text="resultText"></pre>
        </div>
      </div>
    </div>
  );
};

export default TraditionalGuide;
