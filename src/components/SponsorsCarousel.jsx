import React from 'react';
import './SponsorsCarousel.css';

// Example sponsor logos imported or referenced from /public
const sponsors = [
  '/images/sponsor1.png',
  '/images/sponsor2.png',
  '/images/sponsor3.png',
  '/images/sponsor4.png',
];

export default function SponsorsCarousel() {
  return (
    <section className="sponsors-carousel">
      <div className="sponsors-track">
        {sponsors.map((src, i) => (
          <div key={i} className="sponsor-item">
            <img src={src} alt={`Sponsor ${i + 1}`} />
          </div>
        ))}
        {/* Duplicate for infinite scroll effect */}
        {sponsors.map((src, i) => (
          <div key={i + sponsors.length} className="sponsor-item">
            <img src={src} alt={`Sponsor ${i + 1}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

