import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

const categories = ['All', 'Weddings', 'Corporate', 'Concerts', 'Festivals', 'Private'];

const images = [
  { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600', cat: 'Weddings', title: 'Royal Wedding Setup' },
  { src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600', cat: 'Corporate', title: 'Golden Gala Evening' },
  { src: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600', cat: 'Concerts', title: 'Live Concert Vibes' },
  { src: 'https://images.unsplash.com/photo-1492684223f8-343a7beedee9?w=600', cat: 'Festivals', title: 'Festival Night' },
  { src: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600', cat: 'Private', title: 'Birthday Celebration' },
  { src: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600', cat: 'Corporate', title: 'Innovation Summit' },
  { src: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600', cat: 'Concerts', title: 'Under The Stars' },
  { src: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600', cat: 'Corporate', title: 'Team Retreat' },
  { src: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600', cat: 'Festivals', title: 'Music Festival' },
  { src: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600', cat: 'Concerts', title: 'DJ Night' },
  { src: 'https://images.unsplash.com/photo-1478146059778-26a4c1fd8f7d?w=600', cat: 'Weddings', title: 'Elegant Reception' },
  { src: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=600', cat: 'Private', title: 'Luxury Party' },
];

const GalleryPage = () => {
  const [active, setActive] = useState('All');
  const [selected, setSelected] = useState(null);
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

  const filtered = active === 'All' ? images : images.filter(img => img.cat === active);

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

          {/* Slide 1: Original Gallery Hero */}
          <div style={{ flex: '0 0 100%', scrollSnapAlign: 'start', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 20px 40px' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'url(https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600) center/cover', filter: 'brightness(0.25)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.7), rgba(10,10,10,0.95))' }} />
            <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '800px', width: '100%' }}>
              <span className="section-subtitle" style={{ display: 'block', marginBottom: '16px', fontSize: 'clamp(0.7rem, 2vw, 0.9rem)' }}>Portfolio</span>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(3rem, 8vw, 5rem)', color: '#fff', lineHeight: 1.1, marginBottom: '16px' }}>Our <span className="text-gradient">Gallery</span></h1>
              <p style={{ color: '#9999b3', fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(1rem, 2vw, 1.2rem)', margin: '0 auto', maxWidth: '600px', lineHeight: 1.6 }}>Moments captured, memories preserved</p>
            </motion.div>
          </div>

          {/* Promotional Slides */}
          {[
            {
              bg: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600',
              badge: 'Premium Package Add-on',
              title: 'Cinematic Aftermovies',
              highlight: 'Event Aftermovies',
              desc: 'Add a cinematic video shoot to your event booking today and preserve your memories in stunning 4K quality.',
              btn: 'Add to Package',
              link: '/contact'
            },
            {
              bg: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600',
              badge: 'Exclusive Corporate Deal',
              title: 'Elevate Your Next Gala',
              highlight: 'Corporate Gala',
              desc: 'Get a massive 15% off on all-inclusive corporate event planning when you book for a group of 100+ attendees.',
              btn: 'View Deal',
              link: '/services'
            },
            {
              bg: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600',
              badge: 'Limited Time Offer',
              title: 'Premium Wedding Packages',
              highlight: 'Packages',
              desc: 'Book now and receive complimentary drone videography and a custom VIP red carpet setup for your special day.',
              btn: 'Claim Offer',
              link: '/contact'
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

      {/* Filter Tabs */}
      <section style={{ background: '#111111', borderBottom: '1px solid rgba(201,168,76,0.1)', padding: '24px 0' }}>
        <div className="container" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActive(cat)}
              style={{
                padding: '8px 24px', borderRadius: '20px', fontSize: '0.8rem', fontFamily: "'Outfit', sans-serif", fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase', border: '1px solid', cursor: 'pointer', transition: 'all 0.3s ease',
                background: active === cat ? 'linear-gradient(135deg, #C9A84C, #FFD700)' : 'transparent',
                color: active === cat ? '#0a0a0a' : '#C9A84C',
                borderColor: active === cat ? 'transparent' : 'rgba(201,168,76,0.3)'
              }}>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section" style={{ background: '#0a0a0a' }}>
        <div className="container">
          <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            <AnimatePresence>
              {filtered.map((img, i) => (
                <motion.div key={img.src} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ y: -6 }}
                  onClick={() => setSelected(img)}
                  style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(201,168,76,0.1)', aspectRatio: i % 3 === 0 ? '4/5' : '4/3' }}>
                  <img src={img.src} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 50%, rgba(10,10,10,0.85))', opacity: 0, transition: 'opacity 0.3s ease' }}
                    onMouseEnter={e => e.target.style.opacity = 1}
                    onMouseLeave={e => e.target.style.opacity = 0}>
                  </div>
                  <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 2 }}>
                    <div style={{ fontSize: '0.7rem', color: '#C9A84C', fontFamily: "'Outfit', sans-serif", letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>{img.cat}</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#fff' }}>{img.title}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', cursor: 'pointer' }}>
            <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              src={selected.src} alt={selected.title}
              style={{ maxWidth: '90%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px', border: '2px solid rgba(201,168,76,0.3)' }} />
            <div style={{ position: 'absolute', bottom: '40px', textAlign: 'center', color: '#fff' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem' }}>{selected.title}</div>
              <div style={{ color: '#C9A84C', fontSize: '0.8rem', fontFamily: "'Outfit', sans-serif", letterSpacing: '2px', textTransform: 'uppercase' }}>{selected.cat}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPage;
