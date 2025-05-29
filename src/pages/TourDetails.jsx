import React, { useEffect } from 'react';
import './TourDetails.css';

export default function TourDetailsPage() {
  useEffect(() => {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".sidebar nav a");

    const observer = new IntersectionObserver(
      (entries) => {
        let visible = entries
	  .filter(entry => entry.isIntersecting)
	  .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

	if (visible.length > 0) {
	  const id = visible[0].target.getAttribute("id");
	  navLinks.forEach(link => link.classList.remove("active"));
	  document
	    .querySelector(`.sidebar nav a[href="#${id}"]`)
	    ?.classList.add("active");
	}
      },
      { threshold: 0.2 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);


  return (
    <div className="tour-details-layout">
      <aside className="sidebar">
        <nav>
          <a href="#about">About</a>
          <a href="#structure">League Structure</a>
          <a href="#skins">Skins</a>
          <a href="#teams">Teams</a>
          <a href="#rules">Rules</a>
          <a href="#points">Point System</a>
        </nav>
      </aside>

      <main className="scrolling-content">
        <section id="about">
          <h2>About</h2>
          <p>The Live Free Golf Tour is a competitive but friendly amateur league based in New Hampshire. We play on great courses and value camaraderie and good play.</p>
        </section>

        <section id="structure">
          <h2>League Structure</h2>
          <ul>
            <li>10–12 event season running from May to September</li>
            <li>Net stroke play format using full handicap</li>
            <li>Optional match play tournament</li>
            <li>End-of-season Colony Cup team competition</li>
            <li>Point-based standings to determine champion</li>
            <li>Skins game at every event</li>
          </ul>
        </section>

        <section id="skins">
          <h2>Skins</h2>
          <p>Skins are awarded to the lowest unique score on each hole. If no unique low score is recorded, the skin rolls over to the next hole.</p>
        </section>

        <section id="teams">
          <h2>Teams</h2>
          <p>Team play occurs during the Colony Cup where players are split into two teams and compete across a variety of match formats.</p>
        </section>

        <section id="rules">
          <h2>Rules Addendums</h2>
          <ul>
            <li>All OB is stroke and distance unless otherwise noted</li>
            <li>Lost balls follow USGA rules unless local rule allows drop</li>
            <li>Preferred lies allowed only when posted before event</li>
            <li>Max score is double par unless posted otherwise</li>
            <li>Pace of play is enforced with group warnings and penalties</li>
          </ul>
        </section>

        <section id="points">
          <h2>Season Point System</h2>
          <table>
            <thead>
              <tr><th>Place</th><th>Regular Season Events</th><th>Mid Majors</th><th>Majors</th><th>1st Playoff Event</th><th>2nd Playoff Event</th><th>Championship Starting Strokes</th></tr>
            </thead>
            <tbody>
              <tr><td>1st</td><td>100</td><td>125</td><td>150</td><td>175</td><td>200</td><td>-9</td></tr>
              <tr><td>2nd</td><td>85</td><td>115</td><td>125</td><td>150</td><td>175</td><td>-7</td></tr>
              <tr><td>3rd</td><td>75</td><td>100</td><td>120</td><td>140</td><td>150</td><td>-6</td></tr>
              <tr><td>4th</td><td>65</td><td>95</td><td>115</td><td>130</td><td>140</td><td>-6</td></tr>
              <tr><td>5th</td><td>60</td><td>90</td><td>110</td><td>120</td><td>130</td><td>-5</td></tr>
              <tr><td>6th</td><td>55</td><td>85</td><td>105</td><td>110</td><td>120</td><td>-5</td></tr>
              <tr><td>7th</td><td>50</td><td>80</td><td>100</td><td>100</td><td>110</td><td>-4</td></tr>
              <tr><td>8th</td><td>45</td><td>75</td><td>95</td><td>95</td><td>100</td><td>-4</td></tr>
              <tr><td>9th</td><td>40</td><td>70</td><td>90</td><td>90</td><td>95</td><td>-3</td></tr>
              <tr><td>10th</td><td>35</td><td>65</td><td>85</td><td>85</td><td>90</td><td>-3</td></tr>
              <tr><td>11th</td><td>34</td><td>60</td><td>80</td><td>80</td><td>85</td><td>-2</td></tr>
              <tr><td>12th</td><td>33</td><td>55</td><td>75</td><td>75</td><td>80</td><td>-2</td></tr>
              <tr><td>13th</td><td>32</td><td>50</td><td>70</td><td>70</td><td>75</td><td>-1</td></tr>
              <tr><td>14th</td><td>31</td><td>45</td><td>65</td><td>65</td><td>70</td><td>-1</td></tr>
              <tr><td>15th</td><td>30</td><td>44</td><td>60</td><td>60</td><td>65</td><td>-1</td></tr>
              <tr><td>16th</td><td>29</td><td>43</td><td>55</td><td>55</td><td>60</td><td>-1</td></tr>
              <tr><td>17th</td><td>28</td><td>42</td><td>50</td><td>50</td><td>55</td><td>E</td></tr>
              <tr><td>18th</td><td>27</td><td>41</td><td>49</td><td>49</td><td>50</td><td>E</td></tr>
              <tr><td>19th</td><td>26</td><td>40</td><td>48</td><td>48</td><td>49</td><td>E</td></tr>
              <tr><td>20th</td><td>25</td><td>39</td><td>47</td><td>47</td><td>48</td><td>E</td></tr>
              <tr><td>21th</td><td>24</td><td>38</td><td>46</td><td>46</td><td>47</td><td>E</td></tr>
              <tr><td>22rd</td><td>23</td><td>37</td><td>45</td><td>45</td><td>46</td><td>E</td></tr>
              <tr><td>23th</td><td>22</td><td>36</td><td>44</td><td>44</td><td>45</td><td>E</td></tr>
              <tr><td>24th</td><td>21</td><td>35</td><td>43</td><td>43</td><td>44</td><td>E</td></tr>
              <tr><td>25th</td><td>20</td><td>34</td><td>42</td><td>42</td><td>43</td><td></td></tr>
              <tr><td>26th</td><td>20</td><td>33</td><td>41</td><td>41</td><td>42</td><td></td></tr>
              <tr><td>27th</td><td>20</td><td>32</td><td>40</td><td>40</td><td>41</td><td></td></tr>
              <tr><td>28th</td><td>20</td><td>31</td><td>40</td><td>40</td><td>40</td><td></td></tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
} 

