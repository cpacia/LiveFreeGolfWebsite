import React from 'react';
import './SponsorsCarousel.css';

// Example sponsor logos imported or referenced from /public
const sponsors = [
  '/images/FASTENAL.png',
  '/images/izzo.png',
  '/images/impact-fire.png',
];
const links = [
  'https://www.fastenal.com/',
  'https://impactfireservices.com/',
  'https://izzo.com',
];

export default function SponsorsCarousel() {
  return (
    <section className="sponsors-carousel">
      
      <div className="sponsors-track">
        {sponsors.map((src, i) => (
          <div key={i} className="sponsor-item">
            <a href={links[i]} target="_blank" rel="noopener noreferrer">
            	<img src={src} alt={`Sponsor ${i + 1}`} />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

