import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiSearch, HiCalendar, HiLocationMarker, HiCurrencyRupee, HiArrowRight } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

const allEvents = [
  { id: 1, title: 'Golden Gala Night', cat: 'corporate', date: 'Jul 15, 2026', city: 'Mumbai', price: '₹15,000', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600', desc: 'An exclusive black-tie evening of luxury dining and live jazz.' },
  { id: 2, title: 'Midnight Music Festival', cat: 'festival', date: 'Aug 20, 2026', city: 'Goa', price: '₹5,000', img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600', desc: 'Three-day music extravaganza with top international DJs.' },
  { id: 3, title: 'Royal Wedding Showcase', cat: 'wedding', date: 'Jun 10, 2026', city: 'Jaipur', price: '₹2,000', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600', desc: 'Discover the finest in luxury wedding planning.' },
  { id: 4, title: 'Tech Innovation Summit', cat: 'conference', date: 'Sep 5, 2026', city: 'Bangalore', price: '₹8,000', img: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600', desc: 'Join industry leaders at the most anticipated tech conference.' },
  { id: 5, title: 'Exclusive Birthday Bash', cat: 'birthday', date: 'Jul 25, 2026', city: 'Delhi', price: '₹25,000', img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600', desc: 'Premium birthday celebration with custom themes.' },
  { id: 6, title: 'Concert Under The Stars', cat: 'concert', date: 'Aug 10, 2026', city: 'Pune', price: '₹7,500', img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600', desc: 'Intimate acoustic concert with Grammy-nominated artists.' },
  { id: 7, title: 'Corporate Team Retreat', cat: 'corporate', date: 'Sep 15, 2026', city: 'Manali', price: '₹35,000', img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600', desc: 'Transform your team with adventure and strategy workshops.' },
  { id: 8, title: 'Charity Masquerade Ball', cat: 'private', date: 'Oct 31, 2026', city: 'Hyderabad', price: '₹12,000', img: 'https://images.unsplash.com/photo-1492684223f8-343a7beedee9?w=600', desc: 'Dine, dance, and donate at our annual masquerade.' },
];

const categories = ['all', 'wedding', 'corporate', 'concert', 'festival', 'birthday', 'conference', 'private'];

const EventsPage = () => {
  const [filter, setFilter] = useState('all');
  const promoScrollRef = useRef(null);

  useEffect(() => {
    const el = promoScrollRef.current;
    if (!el) return;
    let interval;
    const autoScroll = () => {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: el.clientWidth, behavior: 'smooth' });
      }
    };
    interval = setInterval(autoScroll, 4000);
    const pause = () => clearInterval(interval);
    const resume = () => { clearInterval(interval); interval = setInterval(autoScroll, 4000); };

    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);
    el.addEventListener('touchstart', pause);
    el.addEventListener('touchend', resume);

    return () => {
      clearInterval(interval);
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
      el.removeEventListener('touchstart', pause);
      el.removeEventListener('touchend', resume);
    };
  }, []);

  const filtered = allEvents.filter(e => {
    const matchCat = filter === 'all' || e.cat === filter;
    return matchCat;
  });

  return (
    <div>
      {/* ═══════ FLIPKART-STYLE HERO CAROUSEL ═══════ */}
      <section style={{ position: 'relative', width: '100%', overflow: 'hidden', background: '#050505' }}>
        <div
          ref={promoScrollRef}
          style={{
            display: 'flex',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            height: '100vh',
            minHeight: '500px'
          }}
          className="hide-scrollbar"
        >
          <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>

          {/* Slide 1: Original Events Hero */}
          <div style={{ flex: '0 0 100%', scrollSnapAlign: 'start', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 20px 40px' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'url(https://images.unsplash.com/photo-1492684223f8-343a7beedee9?w=1600) center/cover', filter: 'brightness(0.25)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.7), rgba(10,10,10,0.95))' }} />
            <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '800px', width: '100%' }}>
              <span className="section-subtitle" style={{ display: 'block', marginBottom: '16px', fontSize: 'clamp(0.7rem, 2vw, 0.9rem)' }}>Discover</span>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(3rem, 8vw, 5rem)', color: '#fff', lineHeight: 1.1, marginBottom: '16px' }}>Our <span className="text-gradient">Events</span></h1>
              <p style={{ color: '#9999b3', fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(1rem, 2vw, 1.2rem)', margin: '0 auto', maxWidth: '600px', lineHeight: 1.6 }}>Curated experiences that redefine excellence</p>
            </motion.div>
          </div>

          {/* Promotional Slides */}
          {[
            {
              bg: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600',
              badge: 'Exclusive Corporate Deal',
              title: 'Elevate Your Next Gala',
              highlight: 'Corporate Gala',
              desc: 'Get a massive 15% off on all-inclusive corporate event planning when you book for a group of 100+ attendees.',
              btn: 'View Deal',
              link: '/contact'
            },
            {
              bg: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600',
              badge: 'Limited Time Offer',
              title: 'Premium Wedding Packages',
              highlight: 'Packages',
              desc: 'Book now and receive complimentary drone videography and a custom VIP red carpet setup for your special day.',
              btn: 'Claim Offer',
              link: '/contact'
            },
            {
              bg: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600',
              badge: 'Premium Package Add-on',
              title: 'Cinematic Aftermovies',
              highlight: 'Event Aftermovies',
              desc: 'Add a cinematic video shoot to your event booking today and preserve your memories in stunning 4K quality.',
              btn: 'Add to Package',
              link: '/gallery'
            }
          ].map((ad, idx) => (
            <div key={idx} style={{
              flex: '0 0 100%',
              scrollSnapAlign: 'start',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '100px 20px 40px',
              background: `url(${ad.bg}) center/cover`
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.4) 100%), linear-gradient(to top, rgba(10,10,10,0.8) 0%, transparent 50%)', zIndex: 0 }} />

              <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start', padding: '0 10px' }}>
                <span style={{ background: '#C9A84C', color: '#0a0a0a', padding: '6px 14px', borderRadius: '4px', fontSize: 'clamp(0.6rem, 2vw, 0.85rem)', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>{ad.badge}</span>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 7vw, 4.5rem)', color: '#fff', lineHeight: 1.1, margin: 0, maxWidth: '800px' }}>
                  {ad.title.replace(ad.highlight, '')} <span style={{ color: '#FFD700' }}>{ad.highlight}</span>
                </h3>
                <p style={{ color: '#e0e0eb', fontSize: 'clamp(0.9rem, 2vw, 1.2rem)', margin: '10px 0 20px', maxWidth: '600px', lineHeight: 1.5 }}>{ad.desc}</p>
                <Link to={ad.link} className="btn" style={{ background: '#fff', color: '#0a0a0a', padding: '14px 36px', borderRadius: '30px', fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 4px 20px rgba(255,255,255,0.2)', transition: 'all 0.3s ease', display: 'inline-flex', alignItems: 'center' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 25px rgba(255,255,255,0.4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,255,255,0.2)'; }}>
                  {ad.btn} <HiArrowRight style={{ marginLeft: '8px' }} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div style={{ position: 'absolute', bottom: '30px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '10px', zIndex: 10 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(201,168,76,0.5)', border: '1px solid #C9A84C' }} />
          ))}
        </div>
      </section>

      {/* Filters */}
      <section style={{ background: '#111111', borderBottom: '1px solid rgba(201,168,76,0.1)', padding: '32px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: '#fff', marginBottom: '12px' }}>Curated Selections</h3>
            <p style={{ color: '#7a7a99', fontFamily: "'Outfit', sans-serif", fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>Filter through our exclusive collection of bespoke event experiences</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                style={{
                  padding: '8px 20px', borderRadius: '20px', fontSize: '0.8rem', fontFamily: "'Outfit', sans-serif", fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase', border: '1px solid', cursor: 'pointer', transition: 'all 0.3s ease',
                  background: filter === cat ? 'linear-gradient(135deg, #C9A84C, #FFD700)' : 'transparent',
                  color: filter === cat ? '#0a0a0a' : '#C9A84C',
                  borderColor: filter === cat ? 'transparent' : 'rgba(201,168,76,0.3)'
                }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="section" style={{ background: '#0a0a0a' }}>
        <div className="container">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#7a7a99' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '16px' }}>No events found for this category</p>
              <button onClick={() => setFilter('all')} className="btn btn-outline">Clear Filters</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '28px' }}>
              {filtered.map((ev, i) => (
                <motion.div key={ev.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.5, delay: i * 0.1 } } }}
                  whileHover={{ y: -8 }}
                  style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(201,168,76,0.1)', background: '#1a1a1a', transition: 'all 0.3s ease' }}>
                  <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                    <img src={ev.img} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                    <div style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(201,168,76,0.9)', color: '#0a0a0a', padding: '5px 14px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', fontFamily: "'Outfit', sans-serif" }}>
                      {ev.cat}
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(transparent, rgba(26,26,26,0.9))' }} />
                  </div>
                  <div style={{ padding: '24px' }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', color: '#fff', marginBottom: '10px' }}>{ev.title}</h3>
                    <p style={{ color: '#7a7a99', fontSize: '0.9rem', marginBottom: '16px', lineHeight: 1.6 }}>{ev.desc}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
                      <div style={{ display: 'flex', gap: '16px', color: '#9999b3', fontSize: '0.8rem', fontFamily: "'Outfit', sans-serif" }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><HiCalendar style={{ color: '#C9A84C' }} /> {ev.date}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><HiLocationMarker style={{ color: '#C9A84C' }} /> {ev.city}</span>
                      </div>
                      <span style={{ color: '#C9A84C', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>{ev.price}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EventsPage;
