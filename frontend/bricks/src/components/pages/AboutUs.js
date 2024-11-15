import React from 'react'
import '../Css/AboutUs.css'
import NavBar from '../component/NavBar';
import nonImage from '../Pics/Non.png'
import dukdikImage from '../Pics/Dukdik.jpg'
import Location1 from '../Pics/Location1.jpg'
import Location2 from '../Pics/Location2.jpg'
import Location3 from '../Pics/Location3.jpg'
import Location4 from '../Pics/Location4.jpg'

const AboutUs = () => {
  return (
    <div className="about-page">
      <NavBar />
      <main className="content">
        <section className="hero">
          <div className="hero-content">
            <h1 className="title">About Bricks</h1>
            <p className="subtitle">"Build your assets, one brick at a time"</p>
            <div className="mission-content">
              <h2>Our Mission</h2>
              <p>
                At Bricks, we started with a simple idea: real estate investment should be within reach for everyone, not just the wealthy. Our platform is designed to break down the barriers to property ownership, offering an opportunity for people of all backgrounds to grow their wealth one brick at a time.
              </p>
              <p>
                We're excited to have you with us on this journey toward making real estate more inclusive and accessible.
              </p>
            </div>
          </div>
          <div className="hero-images">
            <img src={Location1} alt="Location 1" className="location-image location-1" />
            <img src={Location2} alt="Location 2" className="location-image location-2" />
            <img src={Location3} alt="Location 3" className="location-image location-3" />
            <img src={Location4} alt="Location 4" className="location-image location-4" />
          </div>
        </section>

        <section className="team">
          <h2>Meet Our Team</h2>
          <div className="team-members">
            <div className="team-member">
              <img src={nonImage} alt="Non" className="member-image" />
              <div className="member-info">
                <h3>Hi, I'm Non</h3>
                <p className="member-role">Founder of Bricks</p>
                <p className="member-description">
                  This platform is the culmination of my journey through CodeCamp 17, where I set out to build something that could democratize real estate investing. Bricks is my final project, driven by a passion to make property ownership more accessible to everyone, no matter their financial background.
                </p>
              </div>
            </div>
            <div className="team-member">
              <img src={dukdikImage} alt="Dukdik" className="member-image" />
              <div className="member-info">
                <h3>Hey, I'm Dukdik</h3>
                <p className="member-role">Chief Cuteness Officer</p>
                <p className="member-description">
                  I like snacks and sleep. My main job is to keep the team's spirits high and remind everyone to take breaks for cuddles and playtime.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default AboutUs