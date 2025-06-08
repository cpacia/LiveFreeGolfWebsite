import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import TourDetails from "./pages/TourDetails";
import Membership from "./pages/Membership";
import Courses from "./pages/Courses";
import Standings from "./pages/Standings";
import Schedule from "./pages/Schedule";
import MatchPlay from "./pages/MatchPlay";
import DisabledList from "./pages/DisabledList";
import ColonyCup from "./pages/ColonyCup";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import Results from "./pages/Results";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Shop from "./pages/Shop";
import ProductPage from "./pages/ProductPage";
import AdminRoute from "./components/AdminRoute";
import AdminSchedule from "./components/AdminSchedule";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="full-bleed">
        <Header />
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tour-details" element={<TourDetails />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/standings" element={<Standings />} />
        <Route path="/disabled-list" element={<DisabledList />} />
        <Route path="/match-play" element={<MatchPlay />} />
        <Route path="/colony-cup" element={<ColonyCup />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/listing/:handle" element={<ProductPage />} />
        <Route path="/results" element={<Results />} />
        <Route path="/admin/*" element={<AdminRoute />} />
      </Routes>

      <div className="full-bleed">
        <Footer />
      </div>
    </BrowserRouter>
  );
}
