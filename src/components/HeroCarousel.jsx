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
];

const SLIDE_INTERVAL = 5000;

export default function HeroCarousel() {
  const [slides, setSlides] = useState(staticSlides);
  const [index, setIndex] = useState(0);
  
  const slide = slides[index] ?? staticSlides[0];
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
  
  const resetTimer = () => {
	  clearInterval(intervalRef.current);
	  intervalRef.current = setInterval(() => {
	    setIndex((i) => (i + 1) % slides.length);
	  }, SLIDE_INTERVAL);
	};

  
  const fmt = (date) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
    
  useEffect(() => {
	  const fetchSlides = async () => {
		const today = new Date();
		const slides = [staticSlides[0]];

		try {
		  const eventsRes = await fetch('/events.json');
		  const events = await eventsRes.json();
		  const upcoming = events
		    .map((e) => ({ ...e, dateObj: new Date(e.date + 'T00:00:00') }))
		    .filter((e) => e.dateObj >= today)
		    .sort((a, b) => a.dateObj - b.dateObj);
		  const next = upcoming[0];

		  if (next) {
		    slides.push({
		      id: next.id,
		      img: `/images/slide2.png`,
		      isEvent: true,
		      label: 'Next Event',
		      name: next.name,
		      date: next.dateObj,
		      course: next.course,
		    });
		  }
		} catch (err) {
		  console.error('Failed to load events:', err);
		}

		try {
		  const postsRes = await fetch('/blog-posts.json');
		  const posts = await postsRes.json();
		  const latest = posts
		    .map((p) => ({ ...p, dateObj: new Date(p.date + 'T00:00:00') }))
		    .sort((a, b) => b.dateObj - a.dateObj)[0];

		  if (latest) {
		    slides.push({
		      id: latest.id || latest.slug,
		      isPost: true,
		      img: '/images/slide3.png',
		      thumbnailUrl: latest.thumbnailUrl,
		      padding: latest.thumbnailPadding,
		      dateObj: latest.dateObj,
		      title: latest.title,
		      slug: latest.slug,
		      excerpt: latest.excerpt,
		    });
		  }
		} catch (err) {
		  console.error('Failed to load posts:', err);
		}

		setSlides(slides);
	  };

	  fetchSlides();
	}, []);
	  
  const intervalRef = useRef(null);

   useEffect(() => {
	  if (slides.length <= 1) return;

	  // Start interval
	  intervalRef.current = setInterval(() => {
	    setIndex((i) => (i + 1) % slides.length);
	  }, SLIDE_INTERVAL);

	  return () => clearInterval(intervalRef.current);
	}, [slides]);
		
   useEffect(() => {
	  if (index >= slides.length) {
		setIndex(0);
	  }
	}, [slides]);


  return (
      <div
      className="hero-carousel"
      onMouseEnter={() => clearTimeout(timeoutRef.current)}
      onMouseLeave={() => resetTimer()}
    >
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={
			`slide${i === index ? ' active' : ''}` +
			(s.isPost ? ' post-wrapper' : '')
		  }
          style={s.img ? { backgroundImage: `url(${s.img})` } : {}}
        >
          <div className="slide-content">
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
		      <p className="label">{s.label}</p>
		      <p className="title">{s.name}</p>
		      <p className="sub">
		        {fmt(s.date)} | {s.course}
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
            ) : s.isPost ? (
              <div className="post-slide">
				<img
				  src={`images/blog-posts/${s.thumbnailUrl}`}
				  alt={s.title}
				  className="post-image"
				  style={{ objectPosition: `center ${s.padding}rem` }}
				/>
				<div className="post-text">
				  <h2 className="post-title">{s.title}</h2>
				  <p className="post-date">{fmt(s.date)}</p>
				  <p className="post-excerpt">{s.excerpt}</p>
				  <a href={`/blog/${s.slug}`} className="btn-primary">
					Read More ▶
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

