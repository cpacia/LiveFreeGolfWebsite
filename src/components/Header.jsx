// Header.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import logo from "/logo.png"; // Vite serves from public/

const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path
      d="M1 1h4l2.68 13.39a2 2 0 
             0 0 2 1.61h9.72a2 2 0 
             0 0 2-1.61L23 6H6"
    />
  </svg>
);

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleMobile = () => setMobileOpen(prev => !prev);

  return (
    <header className="site-header">
      <div className="container">
        {/* ─── Logo ────────────────────────────────────────────────────────── */}
        <div className="logo">
          <Link to="/">
            <img src={logo} alt="Live Free Golf Logo" />
          </Link>
        </div>

        {/* ─── Normal nav (desktop) ──────────────────────────────────────── */}
        <nav className="main-nav">
          <Link to="/">Home</Link>
          <Link to="/schedule">Schedule</Link>
          <Link to="/standings">Standings</Link>

          <div className="dropdown">
            <button className="dropbtn">Tour Info ▾</button>
            <div className="dropdown-content">
              <Link to="/tour-details">Tour Details</Link>
              <Link to="/match-play">Match Play Tournament</Link>
              <Link to="/colony-cup">Colony Cup</Link>
              <Link to="/disabled-list">Disabled List</Link>
            </div>
          </div>

          <Link to="/courses">Courses</Link>
          <Link to="/blog">News & Recaps</Link>
          <Link to="/shop">Shop</Link>
        </nav>

        {/* ─── Actions (desktop) ─────────────────────────────────────────── */}
        <div className="actions">
          <Link to="/membership" className="btn-register">
            Register ▶
          </Link>
          <Link to="/cart" className="cart-icon" aria-label="View Cart">
            <CartIcon />
          </Link>
        </div>

        {/* ─── Hamburger (mobile only; hidden on desktop via CSS) ────────── */}
        <div
          className={`hamburger${mobileOpen ? " open" : ""}`}
          onClick={toggleMobile}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </div>
      </div>

      {/* ─── Mobile menu (hidden until `mobileOpen === true`) ──────────── */}
      <div
        className="mobile-menu"
        style={{ display: mobileOpen ? "flex" : "none" }}
      >
        <Link to="/">Home</Link>
        <Link to="/schedule">Schedule</Link>
        <Link to="/standings">Standings</Link>

        <div className="dropdown">
          <button className="dropbtn">Tour Info ▾</button>
          <div className="dropdown-content">
            <Link to="/tour-details">Tour Details</Link>
            <Link to="/match-play">Match Play Tournament</Link>
            <Link to="/colony-cup">Colony Cup</Link>
            <Link to="/disabled-list">Disabled List</Link>
          </div>
        </div>

        <Link to="/courses">Courses</Link>
        <Link to="/blog">News & Recaps</Link>
        <Link to="/shop">Shop</Link>
        <hr style={{ borderColor: "rgba(255,255,255,0.2)", margin: "0.5rem 0" }} />
        <Link to="/membership" className="btn-register">
          Register ▶
        </Link>
        <Link to="/cart" className="cart-icon">
          Cart
        </Link>
      </div>
    </header>
  );
}

