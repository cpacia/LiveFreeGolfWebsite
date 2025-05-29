import React from 'react';
import HeroCarousel from '../components/HeroCarousel';
import BlurbSection from '../components/BlurbSection';
import MembershipCards from '../components/MembershipSection';
import EventsAndRankings from '../components/EventsAndRankingsSection';
import SponsorsCarousel from '../components/SponsorsCarousel';

export default function Home() {
  return (
    <div>
		<div className="full-bleed">
			<HeroCarousel />
		</div>
		<div className="content">
			<MembershipCards/>
			<EventsAndRankings limit={3} eventsEndpoint="/data/events.json" />
		</div>
		
		 {/* full‑bleed sponsors */}
		 <div className="full-bleed">
			<SponsorsCarousel />
		 </div>
    </div>
  );
}

