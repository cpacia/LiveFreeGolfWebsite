import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="links">
          <a href="/">Home</a>
          <a href="/schedule">Schedule</a>
          <a href="/standings">Standings</a>
          <a href="/shop">Shop</a>
          <a href="/membership">Membership</a>
        </div>
        <div className="social">
          {/* Placeholder icons; replace with real icons or links */}
          <a href="#">FB</a>
          <a href="#">IG</a>
          <a href="#">TW</a>
        </div>
        <div className="newsletter">
          <input
            type="email"
            placeholder="Sign up for updates"
            aria-label="Newsletter email"
          />
          <button>Subscribe ▶</button>
        </div>
      </div>
    </footer>
  );
}

