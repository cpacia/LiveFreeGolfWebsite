import React from "react";
import "./MembershipSection.css";

const tiers = [
  {
    id: "lfg-ghin",
    title: "LFG + GHIN",
    price: "$140",
    highlights: ["Full league membership", "GHIN handicap included"],
    url: "/listing/ghin-membership",
  },
  {
    id: "lfg-only",
    title: "LFG Only",
    price: "$85",
    highlights: ["League membership only"],
    url: "/listing/membership",
  },
  {
    id: "ghin-only",
    title: "GHIN Only",
    price: "$65",
    highlights: ["GHIN handicap only"],
    url: "/listing/ghin-only",
  },
];

export default function MembershipSection() {
  return (
    <section className="membership-section full-bleed">
      <h2 className="section-title">Join the Tour</h2>
      <div className="membership-grid">
        <div className="swiper">
          {tiers.map((tier) => (
            <div key={tier.id} className="tier-card">
              <h3 className="tier-title">{tier.title}</h3>
              <p className="tier-price">{tier.price}</p>
              <ul className="tier-highlights">
                {tier.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
              <a href={tier.url} className="btn-primary tier-cta">
                Sign Up ▶
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
