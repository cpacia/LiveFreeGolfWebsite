// Header.jsx
import React, { useState } from "react";
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

  const toggleMobile = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <header className="site-header">
      <div className="container">
        {/* ─── Logo ────────────────────────────────────────────────────────── */}
        <div className="logo">
          <a href="/">
            <img src={logo} alt="Live Free Golf Logo" />
          </a>
        </div>

        {/* ─── Normal nav (desktop) ──────────────────────────────────────── */}
        <nav className="main-nav">
          <a href="/">Home</a>
          <a href="/schedule">Schedule</a>
          <a href="/standings">Standings</a>
          <div className="dropdown">
            <button className="dropbtn">Tour Info ▾</button>
            <div className="dropdown-content">
              <a href="/tour-details">Tour Details</a>
              <a href="/match-play">Match Play Tournament</a>
              <a href="/colony-cup">Colony Cup</a>
              <a href="/disabled-list">Disabled List</a>
            </div>
          </div>
          <a href="/courses">Courses</a>
          <a href="/blog">News & Recaps</a>
          <a href="/shop">Shop</a>
        </nav>

        {/* ─── Actions (desktop) ─────────────────────────────────────────── */}
        <div className="actions">
          <a href="/membership" className="btn-register">
            Register ▶
          </a>
          <a href="/cart" className="cart-icon" aria-label="View Cart">
            <CartIcon />
          </a>
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
        {/* Note: repeating the same links as .main-nav, but stacked */}
        <a href="/">Home</a>
        <a href="/schedule">Schedule</a>
        <a href="/standings">Standings</a>
        <div className="dropdown">
          <button className="dropbtn">Tour Info ▾</button>
          <div className="dropdown-content">
            <a href="/tour-details">Tour Details</a>
            <a href="/match-play">Match Play Tournament</a>
            <a href="/colony-cup">Colony Cup</a>
            <a href="/disabled-list">Disabled List</a>
          </div>
        </div>
        <a href="/courses">Courses</a>
        <a href="/blog">News & Recaps</a>
        <a href="/shop">Shop</a>
        <hr
          style={{ borderColor: "rgba(255,255,255,0.2)", margin: "0.5rem 0" }}
        />
        <a href="/membership" className="btn-register">
          Register ▶
        </a>
        <a href="/cart" className="cart-icon">
          Cart
        </a>
      </div>
    </header>
  );
}
