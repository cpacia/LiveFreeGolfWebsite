import React from 'react';
import HeroCarousel from '../components/HeroCarousel';
import BlurbSection from '../components/BlurbSection';
import MembershipCards from '../components/MembershipCards';
import EventsPreview from '../components/EventsPreview';
import StandingsSnapshot from '../components/StandingsSnapshot';
import SponsorsCarousel from '../components/SponsorsCarousel';

export default function Home() {
  return (
    <div>
		<div className="full-bleed">
			<HeroCarousel />
		</div>
		<div className="container">
			<BlurbSection
				title="About Live Free Golf"
				text="Live Free Golf (LFG) is a competitive amateur league based in New Hampshire, dedicated to fostering community, fair play, and fun. Join us for our seasonal events, track your standings, and grab some LFG gear!"
				cta={{ text: 'Learn More on Tour Info', href: '/tour-info' }}
				  />
				  <MembershipCards
				memberships={[
				  { title: 'LFG + GHIN', price: '$X', href: '/membership#lfg-ghin' },
				  { title: 'LFG Only', price: '$Y', href: '/membership#lfg-only' },
				  { title: 'GHIN Only', price: '$Z', href: '/membership#ghin-only' },
				]}
			/>
			<EventsPreview limit={3} eventsEndpoint="/data/events.json" />
		</div>
    </div>
  );
}

