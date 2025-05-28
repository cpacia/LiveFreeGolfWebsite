import React from 'react';
import './MembershipCards.css';

export default function MembershipCards({ memberships }) {
  return (
    <section className="membership-cards">
      <h2>Join the League</h2>
      <div className="cards-container">
        {memberships.map((m) => (
          <div key={m.title} className="card">
            <h3>{m.title}</h3>
            <p className="price">{m.price}</p>
            <a href={m.href} className="btn-primary">
              Learn More
            </a>
          </div>
        ))}
      </div>
      <a href="/membership" className="btn-register-large">
        Register Now ▶
      </a>
    </section>
  );
}

