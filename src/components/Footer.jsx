import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="links">
          <a href="/">Home</a>
          <a href="/membership">Membership</a>
          <a href="mailto:chad@livefreegolf.com">Contact</a>
        </div>
        <div className="social">
          {/* Placeholder icons; replace with real icons or links */}
		    <a href="https://www.facebook.com/groups/1737858913125122" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
		<svg xmlns="http://www.w3.org/2000/svg" className="social-icon" viewBox="0 0 24 24" fill="currentColor">
		  <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2v-3h2v-2c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2v1.8h2.2l-.4 3h-1.8v7A10 10 0 0022 12z" />
		</svg>
	  </a>
	  <a href="https://www.youtube.com/@livefreegolf" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
		<svg xmlns="http://www.w3.org/2000/svg" className="social-icon" viewBox="0 0 24 24" fill="currentColor">
		  <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.7-.8-2.2-.9C16.2 5 12 5 12 5s-4.2 0-6.8.1c-.6.1-1.5.1-2.2.9-.6.6-.8 2-.8 2s-.2 1.6-.2 3.1v1.8c0 1.6.2 3.1.2 3.1s.2 1.4.8 2c.8.8 1.9.8 2.3.9 1.6.1 6.7.2 6.7.2s4.2 0 6.8-.1c.6-.1 1.5-.1 2.2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.1V11c0-1.6-.2-3.1-.2-3.1zM10 15V9l5.5 3-5.5 3z"/>
		</svg>
	  </a>
	  <a href="https://www.bluegolf.com/amateur/programs/nhgaclublivefreegc/index.html" target="_blank" rel="noopener noreferrer" aria-label="BlueGolf">
  <img src="https://cdn.bluegolf.com/images/www/organizers/logo_b_grey.svg" alt="BlueGolf" className="social-icon" />
</a>
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

