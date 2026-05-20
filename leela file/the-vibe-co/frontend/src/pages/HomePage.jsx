import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { HiArrowRight, HiStar, HiCalendar, HiUsers, HiSparkles, HiMusicNote, HiHeart, HiGlobe, HiX, HiLocationMarker, HiDeviceMobile, HiHome } from 'react-icons/hi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } };
const stagger = { visible: { transition: { staggerChildren: 0.15 } } };

const stats = [
  // { number: '500+', label: 'Events Delivered', icon: <HiCalendar /> },
  // { number: '50K+', label: 'Happy Guests', icon: <HiUsers /> },
  // { number: '120+', label: 'Corporate Clients', icon: <HiGlobe /> },
  // { number: '98%', label: 'Satisfaction Rate', icon: <HiStar /> },
];

const services = [
  { icon: <HiHeart size={32} />, title: 'Weddings', desc: 'Elegant ceremonies crafted with love, luxury, and unforgettable moments.' },
  { icon: <HiGlobe size={32} />, title: 'Corporate Events', desc: 'Professional gatherings that inspire, engage, and leave lasting impressions.' },
  { icon: <HiMusicNote size={32} />, title: 'Concerts & Festivals', desc: 'Electrifying live experiences with world-class sound and production.' },
  { icon: <HiSparkles size={32} />, title: 'Private Parties', desc: 'Exclusive celebrations tailored to your style and personality.' },
  { icon: <HiCalendar size={32} />, title: 'Conferences', desc: 'Seamless summits and seminars with cutting-edge technology.' },
  { icon: <HiStar size={32} />, title: 'Luxury Galas', desc: 'Black-tie affairs with refined elegance and sophistication.' },
];

const featuredEvents = [
  { title: 'Golden Gala Night', cat: 'Corporate', date: 'Jul 15, 2026', city: 'Mumbai', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600' },
  { title: 'Midnight Music Festival', cat: 'Festival', date: 'Aug 20, 2026', city: 'Goa', img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600' },
  { title: 'Royal Wedding Showcase', cat: 'Wedding', date: 'Jun 10, 2026', city: 'Jaipur', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600' },
];

const partners = [
  { name: 'Taj Hotels', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=100&fit=crop' },
  { name: 'Marriott Bonvoy', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200&h=100&fit=crop' },
  { name: 'Moët & Chandon', img: 'https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?w=200&h=100&fit=crop' },
  { name: 'Sabyasachi Couture', img: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=200&h=100&fit=crop' },
  { name: 'Bose Professional', img: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=200&h=100&fit=crop' },
];


const HomePage = () => {
  const { user } = useAuth();
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const promoScrollRef = React.useRef(null);
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 1, delay: Math.random() * 5, dur: Math.random() * 4 + 4,
    }))
  );

  const [reviewsData, setReviewsData] = useState({ reviews: [], stats: { total: 0, average: 0, percentage: 0 } });
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    rating: 5,
    comment: ''
  });
  const [reviewStatus, setReviewStatus] = useState('');

  useEffect(() => {
    if (user) {
      setReviewForm(prev => ({
        ...prev,
        name: prev.name || user.name,
        email: prev.email || user.email
      }));
    }
  }, [user]);

  useEffect(() => {
    fetchReviews();

    // Auto-scroll logic for Top Promo Banner
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

  const fetchReviews = async () => {
    try {
      const res = await axios.get('/api/reviews');
      setReviewsData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewStatus('Submitting...');
    try {
      await axios.post('/api/reviews', reviewForm);
      setReviewStatus('Review submitted successfully!');
      fetchReviews();
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewStatus('');
        setReviewForm({ name: '', email: '', rating: 5, comment: '' });
      }, 2000);
    } catch (err) {
      setReviewStatus('Error submitting review');
    }
  };

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
            height: 'calc(var(--vh, 1vh) * 100)',
            minHeight: '600px'
          }}
          className="hide-scrollbar"
        >
          <style>{`
            .hide-scrollbar::-webkit-scrollbar { display: none; }
            @media (max-width: 768px) {
              .hero-slide-content { padding: 0 20px !important; }
              .promo-dots { display: none !important; }
            }
          `}</style>

          {/* Slide 1: Original Hero */}
          <div style={{ flex: '0 0 100%', scrollSnapAlign: 'start', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 20px 40px' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'url(https://images.unsplash.com/photo-1492684223f8-343a7beedee9?w=1600) center/cover', filter: 'brightness(0.25)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,10,10,0.92) 0%, rgba(26,26,26,0.4) 50%, rgba(10,10,10,0.92) 100%)' }} />
            {particles.map(p => (
              <motion.div key={p.id} animate={{ y: [0, -20, 0], opacity: [0.1, 0.4, 0.1] }} transition={{ duration: p.dur, repeat: Infinity, delay: p.delay }}
                style={{ position: 'absolute', left: p.left, top: p.top, width: p.size, height: p.size, background: '#C9A84C', borderRadius: '50%' }} />
            ))}
            <motion.div style={{ y: heroY, position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '900px', width: '100%' }} className="hero-slide-content">
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(0.6rem, 2vw, 0.8rem)', letterSpacing: '4px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '20px' }}>
                ✦ Premium Event Organisation ✦
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
                style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.2rem, 8vw, 5.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '20px', color: '#fff' }}>
                Where Every <br />
                <span style={{ background: 'linear-gradient(90deg, #C9A84C, #FFD700, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', backgroundSize: '200% auto', animation: 'shimmer 3s linear infinite' }}>
                  Moment Shines
                </span>
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.7 }}
                style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', color: '#9999b3', maxWidth: '600px', margin: '0 auto 30px', fontFamily: "'Outfit', sans-serif", lineHeight: 1.8 }}>
                We craft extraordinary experiences that captivate, inspire, and leave lasting impressions.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.6 }}
                style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/events" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '0.85rem' }}>Explore Events <HiArrowRight /></Link>
                <Link to="/services" className="btn btn-outline" style={{ padding: '12px 28px', fontSize: '0.85rem' }}>Plan Your Event</Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Promotional Slides */}
          {[
            {
              bg: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1600',
              badge: 'Hyperlocal Search',
              title: 'Elite Services Near Your Place',
              highlight: 'Services Near You',
              desc: 'Find top event coordinators and service members close to you. Book directly on your mobile at home.',
              btn: 'Search Nearby',
              link: '/services'
            },
            {
              bg: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600',
              badge: 'Special Offer',
              title: 'Luxury Wedding Planning',
              highlight: 'Wedding Planning',
              desc: 'Book your dream wedding today and get an exclusive 10% early-bird discount on all decor packages.',
              btn: 'Learn More',
              link: '/services'
            },
            {
              bg: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600',
              badge: 'Exclusive',
              title: 'Elite Corporate Galas',
              highlight: 'Corporate Galas',
              desc: 'Impress your clients with a world-class corporate experience managed by our expert coordinators.',
              btn: 'View Service',
              link: '/services'
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

              <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', padding: '0 10px', textAlign: 'center' }}>
                <span style={{ background: '#C9A84C', color: '#0a0a0a', padding: '5px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>{ad.badge}</span>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 6vw, 4rem)', color: '#fff', lineHeight: 1.1, margin: 0, maxWidth: '800px' }}>
                  {ad.title}
                </h3>
                <p style={{ color: '#e0e0eb', fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)', margin: '10px 0 20px', maxWidth: '600px', lineHeight: 1.5 }}>{ad.desc}</p>
                <Link to={ad.link} className="btn" style={{ background: '#fff', color: '#0a0a0a', padding: '12px 32px', borderRadius: '30px', fontWeight: 700, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center' }}>
                  {ad.btn} <HiArrowRight style={{ marginLeft: '8px' }} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Dots (Visual Indicator) */}
        <div className="promo-dots" style={{ position: 'absolute', bottom: '30px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '10px', zIndex: 10 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(201,168,76,0.5)', border: '1px solid #C9A84C' }} />
          ))}
        </div>
      </section>


      {/* ═══════ STATS ═══════ */}
      {/* <section style={{ background: '#111111', borderTop: '1px solid rgba(201,168,76,0.1)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px', padding: '40px 20px' }}>
          {stats.map((s, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              style={{ textAlign: 'center' }}>
              <div style={{ color: '#C9A84C', fontSize: '1.5rem', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{s.number}</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#7a7a99' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section> */}

      {/* ═══════ SERVICES ═══════ */}
      <section className="section" style={{ background: '#0a0a0a' }}>
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="section-header">
            <span className="section-subtitle">What We Do</span>
            <h2>Our <span className="text-gradient">Premium</span> Services</h2>
            <div className="gold-line" />
            <p>From concept to execution, we deliver unparalleled event experiences</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {services.map((svc, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -8, borderColor: 'rgba(201,168,76,0.5)' }}
                style={{ padding: '40px 32px', background: 'linear-gradient(145deg, rgba(26,26,26,0.9), rgba(17,17,17,0.95))', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '12px', transition: 'all 0.3s ease', cursor: 'pointer' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(201,168,76,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A84C', marginBottom: '24px', border: '1px solid rgba(201,168,76,0.15)' }}>
                  {svc.icon}
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#fff', marginBottom: '12px' }}>{svc.title}</h3>
                <p style={{ color: '#7a7a99', lineHeight: 1.7 }}>{svc.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ HYPERLOCAL MOBILE SERVICE SECTION ═══════ */}
      <section className="section" style={{ background: '#070707', borderTop: '1px solid rgba(201,168,76,0.05)', overflow: 'hidden', position: 'relative' }}>
        {/* Glowing Background Radial Accents */}
        <div style={{ position: 'absolute', top: '50%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(201, 168, 76, 0.05) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(201, 168, 76, 0.03) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 0 }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '60px', justifyContent: 'center' }}>
            
            {/* Left Column: Visual Mobile Simulator Mockup */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              style={{ flex: '1 1 320px', display: 'flex', justifyContent: 'center', minWidth: '280px' }}
            >
              {/* Premium Phone Container */}
              <div style={{
                width: '310px',
                height: '540px',
                background: '#111',
                borderRadius: '40px',
                border: '6px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(201,168,76,0.08)',
                position: 'relative',
                overflow: 'hidden',
                padding: '15px'
              }}>
                {/* Speaker Notch */}
                <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '110px', height: '22px', background: '#000', borderRadius: '0 0 15px 15px', zIndex: 10 }} />
                
                {/* Simulated Screen Content */}
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '15px', padding: '15px 5px 0' }}>
                  {/* App Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', marginTop: '10px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#C9A84C', letterSpacing: '1px', fontFamily: "'Playfair Display', serif" }}>THE VIBE CO.</span>
                    <HiDeviceMobile size={16} color="#7a7a99" />
                  </div>
                  
                  {/* Location Picker simulation */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <HiLocationMarker color="#C9A84C" size={16} />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.55rem', color: '#555577', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Location</div>
                      <div style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 600 }}>Nearby Home (Local Search)</div>
                    </div>
                  </div>

                  {/* Simulated list of nearby services */}
                  <div style={{ fontSize: '0.6rem', color: '#555577', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'left', fontWeight: 700 }}>Top Services Near You</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'hidden' }}>
                    
                    {/* Simulator Card 1 */}
                    <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.01)', padding: '8px 10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.02)' }}>
                      <div style={{ width: '32px', height: '32px', minWidth: '32px', borderRadius: '6px', background: 'rgba(201,168,76,0.08)', color: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HiHeart size={14} />
                      </div>
                      <div style={{ textAlign: 'left', flex: 1 }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>Elite Catering & Decor</div>
                        <div style={{ fontSize: '0.55rem', color: '#555577' }}>0.8 km • Active Nearby</div>
                        <div style={{ display: 'flex', gap: '1px', marginTop: '2px' }}>
                          {[...Array(5)].map((_, i) => <HiStar key={i} size={6} color="#C9A84C" />)}
                        </div>
                      </div>
                    </div>

                    {/* Simulator Card 2 */}
                    <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.01)', padding: '8px 10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.02)' }}>
                      <div style={{ width: '32px', height: '32px', minWidth: '32px', borderRadius: '6px', background: 'rgba(201,168,76,0.08)', color: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HiSparkles size={14} />
                      </div>
                      <div style={{ textAlign: 'left', flex: 1 }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>Luxury Sound & Light</div>
                        <div style={{ fontSize: '0.55rem', color: '#555577' }}>1.5 km • Booked Today</div>
                        <div style={{ display: 'flex', gap: '1px', marginTop: '2px' }}>
                          {[...Array(5)].map((_, i) => <HiStar key={i} size={6} color="#C9A84C" />)}
                        </div>
                      </div>
                    </div>

                    {/* Simulator Card 3 */}
                    <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.01)', padding: '8px 10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.02)' }}>
                      <div style={{ width: '32px', height: '32px', minWidth: '32px', borderRadius: '6px', background: 'rgba(201,168,76,0.08)', color: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HiMusicNote size={14} />
                      </div>
                      <div style={{ textAlign: 'left', flex: 1 }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>Premium Photographers</div>
                        <div style={{ fontSize: '0.55rem', color: '#555577' }}>2.3 km • Highly Rated</div>
                        <div style={{ display: 'flex', gap: '1px', marginTop: '2px' }}>
                          {[...Array(5)].map((_, i) => <HiStar key={i} size={6} color="#C9A84C" />)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Simulator button */}
                  <div style={{ marginTop: 'auto', background: '#C9A84C', color: '#000', padding: '10px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 800, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Find Services Nearby
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Copy & Value Proposition */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              style={{ flex: '1.2 1 400px', minWidth: '300px', textAlign: 'left' }}
            >
              <span style={{ color: '#C9A84C', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 700, display: 'block', marginBottom: '15px' }}>
                <HiLocationMarker style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} size={16} /> Hyperlocal Event Solutions
              </span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', marginBottom: '20px', lineHeight: 1.2 }}>
                Find Your Service <span className="text-gradient">Nearby</span>, Straight From Home
              </h2>
              <div className="gold-line" style={{ margin: '15px 0', width: '80px', height: '3px', background: '#C9A84C' }} />
              
              <p style={{ color: '#7a7a99', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '20px' }}>
                Planning an extraordinary event shouldn't require leaving your living room. With **THE VIBE CO.**'s mobile-responsive hyperlocal network, discover and contract premium service members operating in your immediate neighborhood.
              </p>
              
              <p style={{ color: '#7a7a99', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '35px' }}>
                Filter options by location, city, and state to find vendors close to your venue. Browse their verified portfolios, view pricing packages, and initiate real-time conversations—all directly on your **mobile phone** while resting **at home**.
              </p>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <Link to="/services" className="btn btn-primary" style={{ padding: '16px 36px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                  <HiLocationMarker /> Search Services Nearby
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontSize: '0.9rem' }}>
                  <HiHome size={18} color="#C9A84C" />
                  <span>100% Home Comfort</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ═══════ FEATURED EVENTS ═══════ */}
      {/* <section className="section" style={{ background: '#111111' }}>
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="section-header">
            <span className="section-subtitle">Upcoming</span>
            <h2>Featured <span className="text-gradient">Events</span></h2>
            <div className="gold-line" />
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
            {featuredEvents.map((ev, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -8 }}
                style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(201,168,76,0.1)', background: '#1a1a1a', transition: 'all 0.3s ease' }}>
                <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                  <img src={ev.img} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                  <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(201,168,76,0.9)', color: '#0a0a0a', padding: '6px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, fontFamily: "'Outfit', sans-serif", letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {ev.cat}
                  </div>
                </div>
                <div style={{ padding: '28px' }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: '#fff', marginBottom: '12px' }}>{ev.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#7a7a99', fontSize: '0.85rem', fontFamily: "'Outfit', sans-serif" }}>
                    <span>📅 {ev.date}</span>
                    <span>📍 {ev.city}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to="/events" className="btn btn-outline">View All Events <HiArrowRight /></Link>
          </div>
        </div>
      </section> */}

      {/* ═══════ TESTIMONIALS & REVIEWS ═══════ */}
      <section className="section" style={{ background: '#111111', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '60px', alignItems: 'start' }}>

            {/* Left Column: Stats & Actions */}
            <div style={{ position: 'sticky', top: '100px' }}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="section-header" style={{ textAlign: 'left', marginBottom: '40px' }}>
                <span className="section-subtitle">Real Experiences</span>
                <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Client <span className="text-gradient">Reviews</span></h2>
                <div className="gold-line" style={{ margin: '20px 0' }} />
                <p style={{ color: '#9999b3', marginTop: '20px' }}>Don't just take our word for it. See what our clients have to say about their unforgettable experiences.</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'linear-gradient(145deg, rgba(26,26,26,0.8), rgba(17,17,17,0.9))', padding: '24px', borderRadius: '16px', border: '1px solid rgba(201,168,76,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                  <div style={{ textAlign: 'center', paddingRight: '20px', borderRight: '1px solid rgba(201,168,76,0.2)' }}>
                    <div style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 800, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{reviewsData.stats.average}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '4px' }}>
                      {[...Array(5)].map((_, j) => <HiStar key={j} style={{ color: j < Math.round(reviewsData.stats.average) ? '#C9A84C' : '#333', fontSize: '0.9rem' }} />)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>{reviewsData.stats.percentage}% Satisfaction</div>
                    <div style={{ fontSize: '0.85rem', color: '#7a7a99' }}>Based on {reviewsData.stats.total} verified reviews</div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button onClick={() => setIsReviewModalOpen(true)} className="btn btn-primary" style={{ padding: '14px 28px', flex: 1, justifyContent: 'center' }}>
                  Write a Review
                </button>
                <Link to="/reviews" className="btn btn-outline" style={{ padding: '14px 28px', flex: 1, justifyContent: 'center' }}>
                  View All Reviews
                </Link>
              </motion.div>
            </div>

            {/* Right Column: Reviews List */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              maxHeight: '800px',
              overflowY: 'auto',
              paddingRight: '10px',
            }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', color: '#7a7a99', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Top 10 Recent Reviews</h3>
              {reviewsData.reviews.length > 0 ? reviewsData.reviews.map((t, i) => (
                <motion.div key={t._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ x: -8 }}
                  style={{ position: 'relative', padding: '32px', background: '#1a1a1a', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '20px', transition: 'all 0.4s ease' }}>
                  {/* Decorative Quote Icon */}
                  <div style={{ position: 'absolute', top: '20px', right: '30px', opacity: 0.05, fontSize: '6rem', fontFamily: 'serif', color: '#C9A84C', lineHeight: 1 }}>"</div>

                  <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', position: 'relative', zIndex: 2 }}>
                    {[...Array(5)].map((_, j) => <HiStar key={j} style={{ color: j < t.rating ? '#C9A84C' : '#333', fontSize: '1.2rem' }} />)}
                  </div>
                  <p style={{ color: '#d4d4e6', lineHeight: 1.8, marginBottom: '24px', fontSize: '0.95rem', position: 'relative', zIndex: 2 }}>"{t.comment}"</p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 2 }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #FFD700)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0a0a', fontSize: '1.2rem', fontWeight: 'bold', fontFamily: "'Playfair Display', serif" }}>
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>{t.name}</div>
                      <div style={{ color: '#7a7a99', fontSize: '0.8rem', letterSpacing: '1px' }}>{new Date(t.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div style={{ color: '#7a7a99', textAlign: 'center', padding: '40px', border: '1px dashed rgba(201,168,76,0.3)', borderRadius: '16px' }}>
                  No reviews yet. Be the first to share your experience!
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: '#111', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '100%', border: '1px solid rgba(201,168,76,0.2)', position: 'relative' }}>
              <button onClick={() => setIsReviewModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}><HiX /></button>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: '#fff', marginBottom: '20px' }}>Write a Review</h3>

              {reviewStatus && <div style={{ color: reviewStatus.includes('success') ? '#4ade80' : '#C9A84C', marginBottom: '16px' }}>{reviewStatus}</div>}

              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <input className="form-input" placeholder="Your Name" required value={reviewForm.name} onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <input className="form-input" type="email" placeholder="Your Email" required value={reviewForm.email} onChange={e => setReviewForm({ ...reviewForm, email: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'block', color: '#C9A84C', fontSize: '0.85rem', marginBottom: '8px' }}>Rating</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <HiStar
                        key={star}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        style={{
                          cursor: 'pointer',
                          fontSize: '2rem',
                          color: star <= reviewForm.rating ? '#FFD700' : '#333',
                          transition: 'color 0.2s ease, transform 0.2s ease',
                          transform: star <= reviewForm.rating ? 'scale(1.1)' : 'scale(1)'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = star <= reviewForm.rating ? 'scale(1.1)' : 'scale(1)' }}
                      />
                    ))}
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <textarea className="form-input" placeholder="Share your experience..." required value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} style={{ minHeight: '100px' }}></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>Submit Review</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ PARTNERS ═══════ */}
      {/* <section className="section" style={{ background: '#0a0a0a', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="section-header" style={{ marginBottom: '40px' }}>
            <span className="section-subtitle">Our Network</span>
            <h2>Collaborating <span className="text-gradient">Partners</span></h2>
            <div className="gold-line" />
            <p style={{ color: '#9999b3', marginTop: '20px', maxWidth: '600px', marginInline: 'auto' }}>We partner with the world's finest venues, caterers, and vendors to ensure your event is nothing short of spectacular.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px', marginTop: '50px' }}>
            {partners.map((partner, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -5, scale: 1.05 }}
                style={{
                  background: '#111',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(201,168,76,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '15px',
                  flex: '1 1 120px',
                  maxWidth: '200px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}>
                <div style={{ width: '100%', height: '80px', overflow: 'hidden', borderRadius: '8px' }}>
                  <img src={partner.img} alt={partner.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8, filter: 'grayscale(50%)' }} />
                </div>
                <div style={{ color: '#d4d4e6', fontFamily: "'Outfit', sans-serif", fontSize: '0.9rem', fontWeight: 500, textAlign: 'center' }}>{partner.name}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section> */}

      {/* ═══════ CTA ═══════ */}
      <section style={{ position: 'relative', padding: '120px 0', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'url(https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1600) center/cover', filter: 'brightness(0.15)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,10,10,0.9), rgba(201,168,76,0.08), rgba(10,10,10,0.9))' }} />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <span className="section-subtitle">Ready to Begin?</span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700, color: '#fff', marginBottom: '24px' }}>
            Let's Create Something <span className="text-gradient">Extraordinary</span>
          </h2>
          <p style={{ color: '#9999b3', maxWidth: '550px', margin: '0 auto 40px', fontSize: '1.05rem' }}>
            Every great event begins with a conversation. Tell us your vision and we'll bring it to life.
          </p>
          <Link to="/services" className="btn btn-primary" style={{ padding: '18px 48px', fontSize: '1rem' }}>
            Start Planning <HiArrowRight />
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
