import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Header from './components/Header';
import Footer from './components/Footer';
import SponsorsCarousel from './components/SponsorsCarousel';
import Home from './pages/Home';
import TourDetails from './pages/TourDetails';
import Membership from './pages/Membership';
import Courses from './pages/Courses';
import './App.css'

export default function App() {
  // For now, you can switch pages manually or install react-router later.
  const currentPage = window.location.pathname;

  let Content = Home;
  if (currentPage.startsWith('/tour-details')) Content = TourDetails;
  else if (currentPage.startsWith('/courses')) Content = Courses;
  else if (currentPage.startsWith('/membership')) Content = Membership;

  return (
    <>
      {/* full‑bleed header */}
      <div className="full-bleed">
        <Header />
      </div>
      
      {/* page content */}
      <Content />

      {/* full‑bleed footer */}
      <div className="full-bleed">
        <Footer />
      </div>
    </>
  );
}

