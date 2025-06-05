import React from "react";
import "./SponsorsCarousel.css";

const sponsors = [
  { src: "/images/FASTENAL.png", link: "https://www.fastenal.com/" },
  { src: "/images/impact-fire.png", link: "https://impactfireservices.com/" },
  { src: "/images/izzo.png", link: "https://izzo.com" },
  { src: "/images/bnice.png", link: "https://bnicedetailing.com/" },
];

export default function SponsorsCarousel() {
  return (
    <section className="sponsors-carousel">
      <h2>Sponsors</h2>
      <div className="sponsors-track">
        {sponsors.map(({ src, link }, i) => (
          <div key={i} className="sponsor-item">
            <a href={link} target="_blank" rel="noopener noreferrer">
              <img src={src} alt={`Sponsor ${i + 1}`} />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
