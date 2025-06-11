import React, { useEffect } from "react";
import "./TourDetails.css";

export default function TourDetailsPage() {
  useEffect(() => {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".sidebar nav a");

    const observer = new IntersectionObserver(
      (entries) => {
        let visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          const id = visible[0].target.getAttribute("id");
          navLinks.forEach((link) => link.classList.remove("active"));
          document
            .querySelector(`.sidebar nav a[href="#${id}"]`)
            ?.classList.add("active");
        }
      },
      { threshold: 0.2 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  // ---- NEW: on first render (and on future hash changes), scroll to the section
  useEffect(() => {
    function scrollToHash() {
      const hash = window.location.hash;
      if (hash) {
        // Remove the leading “#”
        const id = hash.substring(1);
        const target = document.getElementById(id);
        if (target) {
          // scrollIntoView will cause the inner “scrolling-content” to move
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }

    // On mount, try to scroll if there’s already a hash
    scrollToHash();

    // Also listen for any future hash changes (e.g. user clicks another anchor)
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return (
    <div className="tour-details-layout">
      <aside className="sidebar">
        <nav>
          <a href="#about">About</a>
          <a href="#structure">Tour Structure</a>
          <a href="#skins">Skins</a>
          <a href="#teams">Teams</a>
          <a href="#rules">Rules</a>
          <a href="#points">Point System</a>
        </nav>
      </aside>

      <main className="scrolling-content">
        <section id="about">
          <h2>About Live Free Golf</h2>
          <p>
            <span>
              The Live Free Golf Tour (LFGT) is a 12‑event, season‑long
              competition across premier courses in New Hampshire and
              Massachusetts, designed to bring out the best in every golfer.
              Events are played at 80–90% handicap, so whether you’re shooting
              your lowest round or simply out to have fun, everyone has a shot
              at victory.
            </span>
            <span>
              You don’t need to play them all—enter as few or as many events as
              you like—and at the end of the season we’ll count your six best
              finishes toward the regular‑season points championship. Points
              accumulate Sunday afternoons throughout the season, and the
              players with the highest totals will qualify for the playoffs and
              a chance at the crown—and bragging rights.
            </span>
            <span>
              We’ll help you get a proper GHIN account—just purchase it right on
              our homepage—and you’re welcome to request preferred tee times
              throughout the season.
            </span>
            Ready to see how you perform under pressure? Join the Live Free Golf
            Tour and tee off with friends for a season of great golf, fun
            competition, and a chance to prove you’re the best.
          </p>
        </section>

        <section id="structure">
          <h2>Tour Structure</h2>
          <ul>
            <li>
              There are 12 regular season events plus two playoff events and a
              Championship.
            </li>
            <li>
              Similar to the FedEx Cup, players earn points based on their
              leaderboard finish.
            </li>
            <li>
              Only your top six point totals count toward your season total.
            </li>
            <li>
              The two playoff events are open to all members regardless of standing and award up 
              to double the points.
            </li>
            <li>
              The top 24 players in points after the second
              playoff event qualify for the Championship.
            </li>
            <li>
              The Championship uses a "starting strokes" format whereby players
              start the tournament with different scores relative to par based
              on their season long point total.
            </li>
          </ul>
        </section>

        <section id="skins">
          <h2>Skins</h2>
          <p>
            A portion of the registration fees is placed into the skins
            pool. The pool is divided equally among all 18 holes. The player
            with the lowest net score on a hole wins that skin. If two or more
            players tie for lowest, no one wins—those skins carry over to holes
            with a unique low score. Only 50% of your handicap strokes are
            applied when calculating net scores for skins.
          </p>
        </section>

        <section id="teams">
          <h2>Teams</h2>
          <p>
            Every event except the Championship has a team event that runs
            simultaneously. Players are placed into better ball teams of four.
            The lowest individual score on the hole is your team's score for
            that hole. Each member of the winning team earns 15 bonus points
            toward the season‑long race. 85% of handicap strokes are typically
            used for team play.
          </p>
        </section>

        <section id="rules">
          <h2>Rules</h2>
          <ol>
            <li>
              All Men will play from the same designated tee. Exceptions can be
              made if agreed upon. All Women from the Women’s Tee.
            </li>
            <li>
              All players will play at a percentage of their course or GHIN
              handicap.
            </li>
            <li>
              It is preferred that all members have an active GHIN handicap.
              However, a player without a GHIN will be able to play at an
              approximated GHIN. (The committee has the ability to change a
              player's unofficial handicap after a round depending on results)
            </li>
            <li>
              White Stakes. We at Live Free Golf are not pros. Neither are you.
              We will be playing all White OB Stakes as a MANDATORY Lateral Drop
              for a 1 stroke penalty. You may NOT play the ball as it lies but
              you may take the drop as if you were taking a Red Stake Lateral
              Drop for 1 stroke penalty. 2 club lengths from estimated point of
              entry.
            </li>
            <li>
              <span>
                Red/Yellow Staked Hazards are now played exactly the same
                options with one exception for Red Stakes (2 club lengths from
                point of entry). Each option incurs a 1 stroke penalty. You may
                also play the ball as it lies if you find it.
              </span>{" "}
              <span>
                See Rules Video:{" "}
                <a href="https://www.youtube.com/watch?v=gfjY8G79MEI">
                  {" "}
                  Red/Yellow Stake Penalty Rule 5a
                </a>
              </span>{" "}
              No Stakes but clearly defined trouble areas/hazards, mainly wood
              lines and water may be played as a Red Stake Penalty areas.{" "}
              <b>Always ask the group consensus if this situation occurs.</b>
            </li>
            <li>
              Unplayable Rule - See Rule Video:{" "}
              <a href="https://www.youtube.com/watch?v=j2x8atu-W_U">
                Unplayable Rule
              </a>
            </li>
            <li>
              We ask that all groups keep 1 official scorecard and 1 or 2
              non-official scorecards and confirm all scores at the end of the
              round.
            </li>
            <li>
              Golfers will have 3 minutes to look for their ball. All other
              players should play their shots in order to keep Pace of Play.
              Please have identifying marks on your ball and let your group
              know.
            </li>
            <li>
              The ball will be played up in your own fairways. The ball shall be
              placed no more than a scorecards distance away from original spot.
            </li>
            <li>
              Mud Ball. This would apply in the rough, with a group consensus a
              ball can be deemed to have excessive mud. The ball would be
              cleaned and dropped (not placed) as close to the original spot as
              possible.
            </li>
            <li>
              Unlikely Lie Relief (Ground Under Repair not marked). If and only
              if, the group consensus is that your ball ended up in an unlikely
              lie then you may take a free drop. Extended Cart Path (dirt that
              should be grass but carts have driven on it), non-grass area (a
              wet/mud patch surrounded by 99% rough), standing water rule always
              applies (pooling water at feet).
            </li>
            <li>
              Cart Path Relief can be taken on either side of the Cart Path one
              club length off the Cart Path but no closer to the hole.
            </li>
            <li>
              Preferred lie in bunkers will be stated prior to the Tournamant.
              In a situation where a player has an abnormal lie, the player may
              rake and place the ball with the groups permission.
            </li>
            <li>
              Max score on any hole for any player is 5 over par 3=8, 4=9. 5=10
            </li>
            <li>
              After a players 3rd missed Putt from the same Green he may pick up
              and add 1 stroke.
            </li>
            <li>
              FALL GOLF RULE/PLUGGING RULE – When there are Leaves or it is Wet
              out, all players need to pay attention to each other’s shots. If
              the group agrees that a shot was in play but not found because
              Leaves or Plug then the player may take a free drop in an area
              agreed upon by the group.
            </li>
            <li>
              Common sense rule: Just use common sense when any situation
              arises. Please try to have 2 other playing partners agree with a
              ruling and move on.
            </li>
            <li>Play Ready Golf!</li>
            <li>
              All gps, phones, rangefinders, or anything you want to use may be
              used to help gain information.
            </li>
            <li>
              Players who may miss an event are able play prior to the day of
              the event if they are not able to make it to the scheduled event
              as long as they have a good history of attendance and play with a
              fellow League member (The league members score will not count)
              that is approved by the commissioner and board members, also must
              give 10+ days of notice that they will not able to make the event.
            </li>
          </ol>
        </section>

        <section id="points">
          <h2>Season Point System</h2>
          <div className="details-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Place</th>
                  <th>Regular Season Events</th>
                  <th>Mid Majors</th>
                  <th>Majors</th>
                  <th>1st Playoff Event</th>
                  <th>2nd Playoff Event</th>
                  <th>Championship Starting Strokes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1st</td>
                  <td>100</td>
                  <td>125</td>
                  <td>150</td>
                  <td>175</td>
                  <td>200</td>
                  <td>-9</td>
                </tr>
                <tr>
                  <td>2nd</td>
                  <td>85</td>
                  <td>115</td>
                  <td>125</td>
                  <td>150</td>
                  <td>175</td>
                  <td>-7</td>
                </tr>
                <tr>
                  <td>3rd</td>
                  <td>75</td>
                  <td>100</td>
                  <td>120</td>
                  <td>140</td>
                  <td>150</td>
                  <td>-6</td>
                </tr>
                <tr>
                  <td>4th</td>
                  <td>65</td>
                  <td>95</td>
                  <td>115</td>
                  <td>130</td>
                  <td>140</td>
                  <td>-6</td>
                </tr>
                <tr>
                  <td>5th</td>
                  <td>60</td>
                  <td>90</td>
                  <td>110</td>
                  <td>120</td>
                  <td>130</td>
                  <td>-5</td>
                </tr>
                <tr>
                  <td>6th</td>
                  <td>55</td>
                  <td>85</td>
                  <td>105</td>
                  <td>110</td>
                  <td>120</td>
                  <td>-5</td>
                </tr>
                <tr>
                  <td>7th</td>
                  <td>50</td>
                  <td>80</td>
                  <td>100</td>
                  <td>100</td>
                  <td>110</td>
                  <td>-4</td>
                </tr>
                <tr>
                  <td>8th</td>
                  <td>45</td>
                  <td>75</td>
                  <td>95</td>
                  <td>95</td>
                  <td>100</td>
                  <td>-4</td>
                </tr>
                <tr>
                  <td>9th</td>
                  <td>40</td>
                  <td>70</td>
                  <td>90</td>
                  <td>90</td>
                  <td>95</td>
                  <td>-3</td>
                </tr>
                <tr>
                  <td>10th</td>
                  <td>35</td>
                  <td>65</td>
                  <td>85</td>
                  <td>85</td>
                  <td>90</td>
                  <td>-3</td>
                </tr>
                <tr>
                  <td>11th</td>
                  <td>34</td>
                  <td>60</td>
                  <td>80</td>
                  <td>80</td>
                  <td>85</td>
                  <td>-2</td>
                </tr>
                <tr>
                  <td>12th</td>
                  <td>33</td>
                  <td>55</td>
                  <td>75</td>
                  <td>75</td>
                  <td>80</td>
                  <td>-2</td>
                </tr>
                <tr>
                  <td>13th</td>
                  <td>32</td>
                  <td>50</td>
                  <td>70</td>
                  <td>70</td>
                  <td>75</td>
                  <td>-1</td>
                </tr>
                <tr>
                  <td>14th</td>
                  <td>31</td>
                  <td>45</td>
                  <td>65</td>
                  <td>65</td>
                  <td>70</td>
                  <td>-1</td>
                </tr>
                <tr>
                  <td>15th</td>
                  <td>30</td>
                  <td>44</td>
                  <td>60</td>
                  <td>60</td>
                  <td>65</td>
                  <td>-1</td>
                </tr>
                <tr>
                  <td>16th</td>
                  <td>29</td>
                  <td>43</td>
                  <td>55</td>
                  <td>55</td>
                  <td>60</td>
                  <td>-1</td>
                </tr>
                <tr>
                  <td>17th</td>
                  <td>28</td>
                  <td>42</td>
                  <td>50</td>
                  <td>50</td>
                  <td>55</td>
                  <td>E</td>
                </tr>
                <tr>
                  <td>18th</td>
                  <td>27</td>
                  <td>41</td>
                  <td>49</td>
                  <td>49</td>
                  <td>50</td>
                  <td>E</td>
                </tr>
                <tr>
                  <td>19th</td>
                  <td>26</td>
                  <td>40</td>
                  <td>48</td>
                  <td>48</td>
                  <td>49</td>
                  <td>E</td>
                </tr>
                <tr>
                  <td>20th</td>
                  <td>25</td>
                  <td>39</td>
                  <td>47</td>
                  <td>47</td>
                  <td>48</td>
                  <td>E</td>
                </tr>
                <tr>
                  <td>21st</td>
                  <td>24</td>
                  <td>38</td>
                  <td>46</td>
                  <td>46</td>
                  <td>47</td>
                  <td>E</td>
                </tr>
                <tr>
                  <td>22nd</td>
                  <td>23</td>
                  <td>37</td>
                  <td>45</td>
                  <td>45</td>
                  <td>46</td>
                  <td>E</td>
                </tr>
                <tr>
                  <td>23rd</td>
                  <td>22</td>
                  <td>36</td>
                  <td>44</td>
                  <td>44</td>
                  <td>45</td>
                  <td>E</td>
                </tr>
                <tr>
                  <td>24th</td>
                  <td>21</td>
                  <td>35</td>
                  <td>43</td>
                  <td>43</td>
                  <td>44</td>
                  <td>E</td>
                </tr>
                <tr>
                  <td>25th</td>
                  <td>20</td>
                  <td>34</td>
                  <td>42</td>
                  <td>42</td>
                  <td>43</td>
                  <td></td>
                </tr>
                <tr>
                  <td>26th</td>
                  <td>20</td>
                  <td>33</td>
                  <td>41</td>
                  <td>41</td>
                  <td>42</td>
                  <td></td>
                </tr>
                <tr>
                  <td>27th</td>
                  <td>20</td>
                  <td>32</td>
                  <td>40</td>
                  <td>40</td>
                  <td>41</td>
                  <td></td>
                </tr>
                <tr>
                  <td>28th</td>
                  <td>20</td>
                  <td>31</td>
                  <td>40</td>
                  <td>40</td>
                  <td>40</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
