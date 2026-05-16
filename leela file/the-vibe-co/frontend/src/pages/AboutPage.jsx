import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiArrowRight, HiStar, HiUsers, HiHeart, HiSparkles } from 'react-icons/hi';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { visible: { transition: { staggerChildren: 0.15 } } };

const team = [
  { name: 'Arjun Malhotra', role: 'Founder & Creative Director', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
  { name: 'Meera Krishnan', role: 'Head of Operations', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
  { name: 'Vikram Singh', role: 'Production Manager', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400' },
  { name: 'Nisha Patel', role: 'Design Lead', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400' },
];

const values = [
  { icon: <HiStar size={28} />, title: 'Excellence', desc: 'Every detail matters. We pursue perfection in every aspect of event planning.' },
  { icon: <HiHeart size={28} />, title: 'Passion', desc: 'We pour our hearts into creating experiences that move and inspire people.' },
  { icon: <HiSparkles size={28} />, title: 'Innovation', desc: 'Pushing creative boundaries to deliver fresh, unique event concepts.' },
  { icon: <HiUsers size={28} />, title: 'Collaboration', desc: 'Working closely with clients to turn their visions into unforgettable realities.' },
];

const AboutPage = () => (
  <div>
    {/* Hero */}
    <section style={{ position: 'relative', height: '50vh', minHeight: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'url(https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1600) center/cover', filter: 'brightness(0.15)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.7), rgba(10,10,10,0.95))' }} />
      <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ position: 'relative', zIndex: 2, textAlign: 'center', width: '100%', padding: '0 20px', maxWidth: '800px' }}>
        <span className="section-subtitle">Our Story</span>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#fff' }}>About <span className="text-gradient">Us</span></h1>
        <p style={{ color: '#9999b3', fontFamily: "'Outfit', sans-serif", marginTop: '8px' }}>The passion behind the perfection</p>
      </motion.div>
    </section>

    {/* Story */}
    <section className="section" style={{ background: '#0a0a0a' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '60px', alignItems: 'center' }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <span className="section-subtitle">Since 2018</span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: '#fff', marginBottom: '24px' }}>
            Crafting <span className="text-gradient">Unforgettable</span> Experiences
          </h2>
          <p style={{ color: '#9999b3', lineHeight: 1.9, marginBottom: '20px' }}>
            THE VIBE CO. was born from a simple belief: every event should be a masterpiece. Founded in 2018, we've grown from a passionate team of dreamers into one of India's most sought-after event management companies.
          </p>
          <p style={{ color: '#7a7a99', lineHeight: 1.9, marginBottom: '32px' }}>
            Our approach combines creative vision with meticulous execution. We don't just plan events — we design immersive experiences that engage all senses and create memories that last a lifetime. From the initial spark of an idea to the final applause, we're with you every step of the way.
          </p>
          <Link to="/contact" className="btn btn-primary">Work With Us <HiArrowRight /></Link>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div style={{ position: 'relative' }}>
            <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=600" alt="About THE VIBE CO."
              style={{ width: '100%', borderRadius: '16px', border: '1px solid rgba(201,168,76,0.2)' }} />
            <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '150px', height: '150px', background: 'linear-gradient(135deg, #C9A84C, #FFD700)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(201,168,76,0.3)' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 800, color: '#0a0a0a' }}>8+</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#0a0a0a', fontFamily: "'Outfit', sans-serif" }}>Years</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Values */}
    <section className="section" style={{ background: '#111111' }}>
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="section-header">
          <span className="section-subtitle">What Drives Us</span>
          <h2>Our <span className="text-gradient">Values</span></h2>
          <div className="gold-line" />
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          {values.map((v, i) => (
            <motion.div key={i} variants={fadeUp} whileHover={{ y: -6 }}
              style={{ padding: '36px', textAlign: 'center', background: 'linear-gradient(145deg, rgba(26,26,26,0.9), rgba(17,17,17,0.95))', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '16px', transition: 'all 0.3s ease' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(201,168,76,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A84C', margin: '0 auto 20px', border: '1px solid rgba(201,168,76,0.2)' }}>{v.icon}</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: '#fff', marginBottom: '12px' }}>{v.title}</h3>
              <p style={{ color: '#7a7a99', fontSize: '0.9rem', lineHeight: 1.7 }}>{v.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* Team */}
    <section className="section" style={{ background: '#0a0a0a' }}>
      <div className="container">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="section-header">
          <span className="section-subtitle">The People</span>
          <h2>Meet Our <span className="text-gradient">Team</span></h2>
          <div className="gold-line" />
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px' }}>
          {team.map((t, i) => (
            <motion.div key={i} variants={fadeUp} whileHover={{ y: -6 }}
              style={{ textAlign: 'center', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(201,168,76,0.1)', background: '#1a1a1a', transition: 'all 0.3s ease' }}>
              <div style={{ 
                height: '280px', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #111, #1a1a1a)',
                borderBottom: '1px solid rgba(201,168,76,0.1)'
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(201,168,76,0.2), transparent)',
                  border: '2px solid #C9A84C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(201,168,76,0.15)'
                }}>
                  <span style={{ 
                    fontFamily: "'Playfair Display', serif", 
                    fontSize: '2.5rem', 
                    fontWeight: 700,
                    background: 'linear-gradient(90deg, #C9A84C, #FFD700)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {t.name ? `${t.name.charAt(0).toUpperCase()}${t.name.charAt(t.name.length - 1).toUpperCase()}` : 'TC'}
                  </span>
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: '#fff', marginBottom: '6px' }}>{t.name}</h3>
                <p style={{ color: '#C9A84C', fontSize: '0.8rem', fontFamily: "'Outfit', sans-serif", letterSpacing: '1px' }}>{t.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  </div>
);

export default AboutPage;
