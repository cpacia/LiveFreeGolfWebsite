import React, { useState, useEffect, useRef } from 'react';
import './HeroCarousel.css';

 const staticSlides = [
   {
     id: 'blurb',                      // ← unique key
     img: '/images/slide1.png',
     isBlurb: true,
     blurbTitle: 'About Live Free Golf',
     blurbText: '…',
     cta: { text: 'Learn More', href: '/tour-info' }
   },
   {
     id: 'champion',                   // ← unique key
     img: '/images/slide2.jpg',
     headline: 'Congrats to Jane Smith, Spring Stroke Play Champion!',
     ctas: [{ text: 'View Results', href: '/schedule#event-123' }],
   }
];

export default function HeroCarousel() {
  const [slides, setSlides] = useState(staticSlides);
  const [index, setIndex] = useState(0);
  
  const slide = slides[index] || staticSlides[0];
  const timeoutRef = useRef(null);

  const prev = () => {
	  setIndex((i) => (i === 0 ? slides.length - 1 : i - 1));
	  clearTimeout(timeoutRef.current);
	};

	const next = () => {
	  setIndex((i) => (i >= slides.length - 1 ? 0 : i + 1));
	  clearTimeout(timeoutRef.current);
	};
  
   // Advance slide
  const advance = () => {
	  setIndex((i) => (i >= slides.length - 1 ? 0 : i + 1));
  };

  
  const fmt = (date) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
    
  useEffect(() => {
    fetch('/events.json')
      .then((res) => res.json())
      .then((events) => {
        const today = new Date();
        const upcoming = events
          .map((e) => ({ ...e, dateObj: new Date(e.date) }))
          .filter((e) => e.dateObj >= today)
          .sort((a, b) => a.dateObj - b.dateObj);
        const next = upcoming[0];
        if (next) {
          const nextSlide = {
            id: next.id,
            img: `/images/slide2.png`, // your event–specific background
            isEvent: true,
            label: 'Next Event',
            name: next.name,
            date: next.dateObj,
            course: next.course,
          };
          // Build new slides: blurb, nextEvent, then the rest of staticSlides (excluding the blurb at 0)
          setSlides([staticSlides[0], nextSlide, ...staticSlides.slice(1)]);
        }
      })
      .catch(console.error);
  }, []);
  
  useEffect(() => {
	  // Clear any existing timer
	  if (timeoutRef.current) {
	    clearTimeout(timeoutRef.current);
	  }
	  // Set a new timer to advance slides after 5 seconds
	  timeoutRef.current = setTimeout(advance, 5000);

	  // Clean up on unmount
	  return () => {
	    clearTimeout(timeoutRef.current);
	  };
	}, [index, slides.length]); 

  return (
      <div
      className="hero-carousel"
      onMouseEnter={() => clearTimeout(timeoutRef.current)}
      onMouseLeave={() => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(advance, 3000);
      }}
    >
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`slide${i === index ? ' active' : ''}`}
          style={s.img ? { backgroundImage: `url(${s.img})` } : {}}
        >
          <div className="overlay">
            {s.isBlurb ? (
              <div className="blurb-card">
				  <h2>Live Free Golf Tour</h2>
				  <p>
					New Hampshire amateur golf at its finest!
				  </p>
				  <a href="/tour-info" className="btn-primary">
					Learn More ▶
				  </a>
				</div>
            ) : s.isEvent ? (
              <div className="event-card">
		      <p className="label">{slide.label}</p>
		      <p className="title">{slide.name}</p>
		      <p className="sub">
		        {fmt(slide.date)} | {slide.course}
		      </p>
		      <div className="cta-group">
		        <a href="/schedule" className="btn-secondary">
		          View Schedule
		        </a>
		        <a href="/membership" className="btn-primary">
		          Register Now
		        </a>
		      </div>
		    </div>
            ) : (
              <>
				  <h1>{slide.headline}</h1>
				  <div className="cta-group">
		           {s.ctas.map((cta) => (
		             <a key={cta.text} href={cta.href} className="btn-primary">
		               {cta.text}
		             </a>
		           ))}
		         </div>
				</>
            )}
          </div>
        </div>
      ))}
 
    <button
		className="nav prev"
		onClick={() => {
		prev(); resetTimer();
		}}
       ><span className="chevron">‹</span></button>
      <button
		className="nav next"
		onClick={() => {
		next(); resetTimer();
		}}
		   ><span className="chevron">›</span></button>
    </div>
  );
}

