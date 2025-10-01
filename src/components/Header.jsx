// Header.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import logo from "/logo.png"; // Vite serves from public/
import { useCart } from "../context/CartContext";

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
  const toggleMobile = () => setMobileOpen((prev) => !prev);
  const { items, openCart } = useCart(); // ← new
  // sum up all quantities
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const MobileLink = ({ to, children, className }) => (
    <Link to={to} className={className} onClick={() => setMobileOpen(false)}>
      {children}
    </Link>
  );

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
              <Link to="/past-champions">Past Champions</Link>
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
          <button
            type="button"
            className="cart-icon"
            onClick={openCart}
            aria-label="View Cart"
            {...(itemCount > 0 && { "data-count": itemCount })}
          >
            <CartIcon />
          </button>
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
        <MobileLink to="/">Home</MobileLink>
        <MobileLink to="/schedule">Schedule</MobileLink>
        <MobileLink to="/standings">Standings</MobileLink>

        <div className="dropdown">
          <button className="dropbtn">Tour Info ▾</button>
          <div className="dropdown-content">
            <MobileLink to="/tour-details">Tour Details</MobileLink>
            <MobileLink to="/match-play">Match Play Tournament</MobileLink>
            <MobileLink to="/colony-cup">Colony Cup</MobileLink>
            <MobileLink to="/disabled-list">Disabled List</MobileLink>
          </div>
        </div>

        <MobileLink to="/courses">Courses</MobileLink>
        <MobileLink to="/blog">News & Recaps</MobileLink>
        <MobileLink to="/shop">Shop</MobileLink>
        <hr
          style={{ borderColor: "rgba(255,255,255,0.2)", margin: "0.5rem 0" }}
        />
        <MobileLink to="/membership" className="btn-register">
          Register ▶
        </MobileLink>
        <button
          type="button"
          className="cart-icon"
          onClick={openCart}
          aria-label="View Cart"
          {...(itemCount > 0 && { "data-count": itemCount })}
        >
          Cart
        </button>
      </div>
    </header>
  );
}
