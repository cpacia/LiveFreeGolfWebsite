import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Header from './components/Header';
import Footer from './components/Footer';
import SponsorsCarousel from './components/SponsorsCarousel';
import Home from './pages/Home';
//import Schedule from './pages/Schedule';
//import Standings from './pages/Standings';
import './App.css'

export default function App() {
  // For now, you can switch pages manually or install react-router later.
  const currentPage = window.location.pathname;

  let Content = Home;
  if (currentPage.startsWith('/schedule')) Content = Schedule;
  else if (currentPage.startsWith('/standings')) Content = Standings;

  return (
    <>
      {/* full‑bleed header */}
      <div className="full-bleed">
        <Header />
      </div>
      
      {/* page content */}
      <Content />
      
      {/* full‑bleed sponsors */}
      <div className="full-bleed">
        <SponsorsCarousel />
      </div>

      {/* full‑bleed footer */}
      <div className="full-bleed">
        <Footer />
      </div>
    </>
  );
}

