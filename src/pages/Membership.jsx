import React from "react";
import "./Membership.css";

const tiers = [
  {
    id: "lfg-ghin",
    title: "LFG + GHIN",
    price: "$140",
    highlights: ["Full league membership", "GHIN handicap included"],
  },
  {
    id: "lfg-only",
    title: "LFG Only",
    price: "$85",
    highlights: ["League membership only"],
  },
  {
    id: "ghin-only",
    title: "GHIN Only",
    price: "$65",
    highlights: ["GHIN handicap only"],
  },
];

export default function Membership() {
  return (
    <section className="membership-section2 full-bleed">
      <div className="content-card2">
        <h2 className="section-title">Become a Tour Member</h2>
        <p className="blurb2">
          Purchase one of the membership options below to join the 2025 LFG
          Tour. You must have a valid GHIN handicap to compete. If you already
          have one, feel free to purchase the LFG membership only. Otherwise,
          you can purchase a membership and a GHIN and we'll get you a handicap.
        </p>
        <div className="membership-grid2">
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
                <a href="/membership" className="btn-primary tier-cta">
                  Sign Up ▶
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
