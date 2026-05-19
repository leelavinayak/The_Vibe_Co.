import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiCalendar, 
  HiLocationMarker, 
  HiCurrencyRupee, 
  HiArrowRight, 
  HiClock, 
  HiX, 
  HiPlus, 
  HiMinus, 
  HiCheckCircle, 
  HiInformationCircle 
} from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const fadeUp = { 
  hidden: { opacity: 0, y: 30 }, 
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } 
};

const categories = ['all', 'wedding', 'corporate', 'concert', 'festival', 'birthday', 'conference', 'private', 'other'];

const EventsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const promoScrollRef = useRef(null);

  // Booking States
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [tickets, setTickets] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookedDetails, setBookedDetails] = useState(null);

  // Auto-scroll logic for top promo carousel
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
    interval = setInterval(autoScroll, 5000);
    const pause = () => clearInterval(interval);
    const resume = () => { clearInterval(interval); interval = setInterval(autoScroll, 5000); };

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
  }, [events]);

  // Fetch events from backend API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = { status: 'upcoming' };
      if (filter !== 'all') {
        params.category = filter;
      }
      const { data } = await axios.get('/api/events', { params });
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  // Reset booking modal state
  const openBookingModal = (event) => {
    setSelectedEvent(event);
    setTickets(1);
    setSpecialRequests('');
    setBookingSuccess(false);
    setBookingError('');
    setBookedDetails(null);
  };

  // Handle Event Booking
  const handleConfirmBooking = async () => {
    if (!user) {
      // Redirect to login page and return back to /events
      navigate('/login', { state: { from: '/events' } });
      return;
    }

    try {
      setIsBooking(true);
      setBookingError('');

      const payload = {
        event: selectedEvent._id,
        tickets,
        specialRequests
      };

      const { data } = await axios.post('/api/bookings', payload);
      
      setBookedDetails({
        bookingId: data._id,
        tickets: data.tickets,
        totalAmount: data.totalAmount,
        title: selectedEvent.title,
        date: selectedEvent.date,
        time: selectedEvent.time,
        venue: selectedEvent.venue
      });
      setBookingSuccess(true);
      
      // Refresh events list to reflect capacity/attendees updates
      fetchEvents();
    } catch (error) {
      console.error('Failed to create booking:', error);
      setBookingError(
        error.response?.data?.message || 
        'An error occurred while finalizing your booking. Please try again.'
      );
    } finally {
      setIsBooking(false);
    }
  };

  // Helper formatting functions
  const getEventImage = (ev) => ev.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800';
  const getEventCategory = (ev) => ev.category || 'other';
  const getEventPrice = (ev) => {
    const p = ev.price;
    if (typeof p === 'number') {
      return p === 0 ? 'Free' : `₹${p.toLocaleString()}`;
    }
    return p || 'Free';
  };
  const getEventDate = (ev) => {
    if (!ev.date) return 'TBD';
    const d = new Date(ev.date);
    if (isNaN(d.getTime())) return ev.date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const getEventCity = (ev) => ev.venue?.city || 'TBD';

  return (
    <div style={{ background: '#0a0a0a', color: '#fff', minHeight: '100vh', fontFamily: "'Outfit', sans-serif" }}>
      
      {/* ═══════ HERO / PROMOTION CAROUSEL ═══════ */}
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
            height: '85vh',
            minHeight: '480px'
          }}
          className="hide-scrollbar"
        >
          <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>

          {/* Slide 1: Original Events Hero */}
          <div style={{ flex: '0 0 100%', scrollSnapAlign: 'start', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 20px 40px' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'url(https://images.unsplash.com/photo-1492684223f8-343a7beedee9?w=1600) center/cover', filter: 'brightness(0.2)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.6), rgba(10,10,10,0.95))' }} />
            <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '800px', width: '100%' }}>
              <span style={{ color: '#C9A84C', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.85rem', display: 'block', marginBottom: '16px' }}>Exclusive Showcases</span>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#fff', lineHeight: 1.1, marginBottom: '16px' }}>
                Upcoming <span style={{ background: 'linear-gradient(135deg, #C9A84C 30%, #FFD700 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Events</span>
              </h1>
              <p style={{ color: '#9999b3', fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', margin: '0 auto', maxWidth: '600px', lineHeight: 1.6 }}>
                Reserve your VIP passes for high-end celebrations, masterclasses, and music festivals curated by THE VIBE CO.
              </p>
            </motion.div>
          </div>

          {/* Promotional Slides */}
          {[
            {
              bg: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600',
              badge: 'Featured Event',
              title: 'Golden Gala Night',
              highlight: 'Gala Night',
              desc: 'An exclusive black-tie evening of luxury dining, live jazz performances, and networking with the city\'s elite.',
              btn: 'Book VIP Pass',
              action: () => {
                const target = events.find(e => e.title.includes('Golden Gala'));
                if (target) openBookingModal(target);
              }
            },
            {
              bg: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600',
              badge: 'Exclusive Festival',
              title: 'Midnight Music Festival',
              highlight: 'Music Festival',
              desc: 'A three-day music extravaganza featuring top international DJs and artists performing under the stars.',
              btn: 'Book Pass Now',
              action: () => {
                const target = events.find(e => e.title.includes('Midnight Music'));
                if (target) openBookingModal(target);
              }
            },
            {
              bg: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600',
              badge: 'Premium Wedding Exhibition',
              title: 'Royal Wedding Showcase',
              highlight: 'Wedding Showcase',
              desc: 'Discover the finest in luxury wedding planning. From couture bridal wear to exotic destinations.',
              btn: 'Reserve Space',
              action: () => {
                const target = events.find(e => e.title.includes('Royal Wedding'));
                if (target) openBookingModal(target);
              }
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
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.5) 100%), linear-gradient(to top, rgba(10,10,10,0.8) 0%, transparent 50%)', zIndex: 0 }} />

              <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start', padding: '0 20px' }}>
                <span style={{ background: '#C9A84C', color: '#0a0a0a', padding: '6px 14px', borderRadius: '4px', fontSize: 'clamp(0.6rem, 1.5vw, 0.8rem)', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>{ad.badge}</span>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.6rem, 5vw, 3.8rem)', color: '#fff', lineHeight: 1.1, margin: 0, maxWidth: '800px' }}>
                  {ad.title.replace(ad.highlight, '')} <span style={{ color: '#FFD700' }}>{ad.highlight}</span>
                </h3>
                <p style={{ color: '#e0e0eb', fontSize: 'clamp(0.85rem, 1.8vw, 1.1rem)', margin: '5px 0 15px', maxWidth: '600px', lineHeight: 1.5 }}>{ad.desc}</p>
                
                <button 
                  onClick={ad.action} 
                  style={{ 
                    background: 'linear-gradient(135deg, #C9A84C, #FFD700)', 
                    color: '#0a0a0a', 
                    padding: '14px 36px', 
                    borderRadius: '30px', 
                    fontWeight: 700, 
                    fontSize: '0.9rem', 
                    boxShadow: '0 4px 20px rgba(201,168,76,0.3)', 
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease', 
                    display: 'inline-flex', 
                    alignItems: 'center' 
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 25px rgba(201,168,76,0.5)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,168,76,0.3)'; }}
                >
                  {ad.btn} <HiArrowRight style={{ marginLeft: '8px' }} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Indicator Line */}
        <div style={{ position: 'absolute', bottom: '25px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '8px', zIndex: 10 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ width: '16px', height: '3px', borderRadius: '2px', background: 'rgba(201,168,76,0.4)', border: '1px solid rgba(201,168,76,0.6)' }} />
          ))}
        </div>
      </section>

      {/* ═══════ CURATED FILTER TABS ═══════ */}
      <section style={{ background: '#111111', borderBottom: '1px solid rgba(201,168,76,0.1)', padding: '28px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setFilter(cat)}
                style={{
                  padding: '10px 24px', 
                  borderRadius: '25px', 
                  fontSize: '0.78rem', 
                  fontWeight: 600, 
                  letterSpacing: '1.2px', 
                  textTransform: 'uppercase', 
                  border: '1px solid', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s ease',
                  background: filter === cat ? 'linear-gradient(135deg, #C9A84C, #FFD700)' : 'rgba(255,255,255,0.02)',
                  color: filter === cat ? '#0a0a0a' : '#C9A84C',
                  borderColor: filter === cat ? 'transparent' : 'rgba(201,168,76,0.2)'
                }}
                onMouseEnter={(e) => {
                  if (filter !== cat) {
                    e.currentTarget.style.borderColor = '#C9A84C';
                    e.currentTarget.style.background = 'rgba(201,168,76,0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filter !== cat) {
                    e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  }
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ EVENTS LISTING GRID ═══════ */}
      <section style={{ padding: '70px 20px', background: '#0a0a0a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', color: '#fff', marginBottom: '10px' }}>
              Upcoming Experiences
            </h2>
            <p style={{ color: '#7a7a99', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
              Select a luxurious showcase to orchestrate, reserve VIP seats, or register your custom event agenda.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(201,168,76,0.1)', borderTop: '3px solid #C9A84C', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
              <p style={{ color: '#7a7a99' }}>Sourcing elite showcases...</p>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(201,168,76,0.1)' }}>
              <HiInformationCircle style={{ fontSize: '3rem', color: '#C9A84C', marginBottom: '15px' }} />
              <p style={{ fontSize: '1.15rem', color: '#9999b3', marginBottom: '20px' }}>No upcoming events found in this category.</p>
              <button 
                onClick={() => setFilter('all')} 
                style={{ 
                  background: 'transparent', 
                  border: '1px solid #C9A84C', 
                  color: '#C9A84C', 
                  padding: '10px 24px', 
                  borderRadius: '20px',
                  fontWeight: 600,
                  cursor: 'pointer' 
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
              {events.map((ev, i) => (
                <motion.div
                  key={ev._id || ev.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{
                    hidden: { opacity: 0, y: 40 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }
                  }}
                  whileHover={{ y: -8 }}
                  style={{
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '1px solid rgba(201,168,76,0.15)',
                    background: 'linear-gradient(180deg, #161616 0%, #111111 100%)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                >
                  {/* Event Image */}
                  <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                    <img 
                      src={getEventImage(ev)} 
                      alt={ev.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }} 
                      onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    />
                    {/* Category Badge */}
                    <div style={{ 
                      position: 'absolute', 
                      top: '16px', 
                      left: '16px', 
                      background: 'rgba(201,168,76,0.95)', 
                      color: '#0a0a0a', 
                      padding: '6px 14px', 
                      borderRadius: '30px', 
                      fontSize: '0.7rem', 
                      fontWeight: 800, 
                      letterSpacing: '1px', 
                      textTransform: 'uppercase' 
                    }}>
                      {getEventCategory(ev)}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: '26px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.35rem', color: '#fff', marginBottom: '10px' }}>
                        {ev.title}
                      </h3>
                      <p style={{ color: '#8e8eab', fontSize: '0.9rem', marginBottom: '22px', lineHeight: 1.6 }}>
                        {ev.description?.substring(0, 110) || ev.desc?.substring(0, 110)}...
                      </p>
                    </div>

                    <div>
                      {/* Meta info row */}
                      <div style={{ display: 'flex', gap: '15px', color: '#7a7a99', fontSize: '0.82rem', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <HiCalendar style={{ color: '#C9A84C' }} /> {getEventDate(ev)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <HiLocationMarker style={{ color: '#C9A84C' }} /> {getEventCity(ev)}
                        </span>
                      </div>

                      {/* Pricing and booking button */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ color: '#555577', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Price</span>
                          <span style={{ color: '#C9A84C', fontSize: '1.25rem', fontWeight: 700 }}>
                            {getEventPrice(ev)}
                          </span>
                        </div>

                        <button 
                          onClick={() => openBookingModal(ev)}
                          style={{
                            background: 'transparent',
                            border: '1px solid #C9A84C',
                            color: '#C9A84C',
                            padding: '10px 20px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            letterSpacing: '0.5px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #C9A84C, #FFD700)';
                            e.currentTarget.style.color = '#0a0a0a';
                            e.currentTarget.style.borderColor = 'transparent';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#C9A84C';
                            e.currentTarget.style.borderColor = '#C9A84C';
                          }}
                        >
                          Book Tickets
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════ LUXURY BOOKING INTERACTIVE DIALOG / MODAL ═══════ */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', 
              inset: 0, 
              background: 'rgba(0,0,0,0.85)', 
              backdropFilter: 'blur(12px)', 
              zIndex: 9999, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '20px' 
            }}
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 30, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{
                background: '#0d0d0d',
                width: '100%',
                maxWidth: '640px',
                borderRadius: '28px',
                border: '1px solid rgba(201, 168, 76, 0.3)',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={e => e.stopPropagation()}
            >
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedEvent(null)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'rgba(0,0,0,0.6)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#C9A84C'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              >
                <HiX />
              </button>

              {!bookingSuccess ? (
                <>
                  {/* Event Image Header */}
                  <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                    <img 
                      src={getEventImage(selectedEvent)} 
                      alt={selectedEvent.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0d0d0d 100%, transparent)' }} />
                    <div style={{ position: 'absolute', bottom: '15px', left: '30px' }}>
                      <span style={{ 
                        background: '#C9A84C', 
                        color: '#000', 
                        padding: '4px 10px', 
                        borderRadius: '4px', 
                        fontSize: '0.65rem', 
                        fontWeight: 800, 
                        letterSpacing: '1px', 
                        textTransform: 'uppercase' 
                      }}>
                        {getEventCategory(selectedEvent)}
                      </span>
                    </div>
                  </div>

                  {/* Scrollable Booking details */}
                  <div style={{ padding: '30px', overflowY: 'auto', flex: 1 }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: '#fff', marginBottom: '10px' }}>
                      {selectedEvent.title}
                    </h3>
                    <p style={{ color: '#8e8eab', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px' }}>
                      {selectedEvent.description || selectedEvent.desc}
                    </p>

                    {/* Metadata Badges Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '25px' }}>
                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '14px', borderRadius: '16px' }}>
                        <span style={{ color: '#555577', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '5px' }}>Schedule</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '0.88rem' }}>
                          <HiCalendar style={{ color: '#C9A84C' }} /> 
                          <span>{getEventDate(selectedEvent)} {selectedEvent.time && `at ${selectedEvent.time}`}</span>
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '14px', borderRadius: '16px' }}>
                        <span style={{ color: '#555577', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '5px' }}>Venue Address</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '0.88rem' }}>
                          <HiLocationMarker style={{ color: '#C9A84C' }} /> 
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {selectedEvent.venue?.name || 'Grand Ballroom'}, {selectedEvent.venue?.city || selectedEvent.city}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Form */}
                    <div style={{ borderTop: '1px solid rgba(201,168,76,0.15)', paddingTop: '20px' }}>
                      
                      {/* Ticket Count Selector */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                          <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', display: 'block' }}>VIP Tickets Count</span>
                          <span style={{ color: '#7a7a99', fontSize: '0.8rem' }}>Limit: Max 5 passes per account</span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <button
                            onClick={() => setTickets(prev => Math.max(1, prev - 1))}
                            disabled={tickets <= 1}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: tickets <= 1 ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: tickets <= 1 ? '#444' : '#fff',
                              cursor: tickets <= 1 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <HiMinus />
                          </button>
                          <span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>
                            {tickets}
                          </span>
                          <button
                            onClick={() => setTickets(prev => Math.min(5, prev + 1))}
                            disabled={tickets >= 5}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: tickets >= 5 ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: tickets >= 5 ? '#444' : '#fff',
                              cursor: tickets >= 5 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <HiPlus />
                          </button>
                        </div>
                      </div>

                      {/* Special Requests */}
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', display: 'block', marginBottom: '8px' }}>
                          Special Concierge Requests (Optional)
                        </label>
                        <textarea
                          placeholder="Dietary requests, seating preferences, luxury VIP transfer services..."
                          value={specialRequests}
                          onChange={e => setSpecialRequests(e.target.value)}
                          style={{
                            width: '100%',
                            minHeight: '80px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            color: '#fff',
                            fontSize: '0.9rem',
                            resize: 'none',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                          }}
                          onFocus={e => e.target.style.borderColor = '#C9A84C'}
                          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                      </div>

                      {/* Dynamically computed price billing */}
                      <div style={{ 
                        background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(255,255,255,0.01) 100%)', 
                        border: '1px solid rgba(201,168,76,0.2)', 
                        padding: '18px 24px', 
                        borderRadius: '16px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '20px'
                      }}>
                        <div>
                          <span style={{ color: '#7a7a99', fontSize: '0.8rem', display: 'block' }}>Total VIP Investment</span>
                          <span style={{ color: '#C9A84C', fontSize: '0.82rem' }}>
                            ₹{(selectedEvent.price || 0).toLocaleString()} × {tickets} {tickets === 1 ? 'ticket' : 'tickets'}
                          </span>
                        </div>
                        <span style={{ color: '#C9A84C', fontSize: '1.5rem', fontWeight: 800 }}>
                          ₹{((selectedEvent.price || 0) * tickets).toLocaleString()}
                        </span>
                      </div>

                      {/* Error Banner */}
                      {bookingError && (
                        <div style={{ background: 'rgba(239, 83, 80, 0.1)', border: '1px solid #EF5350', padding: '12px 18px', borderRadius: '12px', color: '#EF5350', fontSize: '0.85rem', marginBottom: '20px' }}>
                          {bookingError}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div style={{ padding: '20px 30px 30px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                    {!user ? (
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ color: '#7a7a99', fontSize: '0.85rem', marginBottom: '15px' }}>
                          Authentication required to secure elite bookings.
                        </p>
                        <button
                          onClick={handleConfirmBooking}
                          style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #C9A84C, #FFD700)',
                            color: '#000',
                            border: 'none',
                            padding: '15px',
                            borderRadius: '30px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.95rem'
                          }}
                        >
                          Login to Book Experience
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleConfirmBooking}
                        disabled={isBooking}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #C9A84C, #FFD700)',
                          color: '#000',
                          border: 'none',
                          padding: '15px',
                          borderRadius: '30px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px'
                        }}
                      >
                        {isBooking ? (
                          <>
                            <div className="spinner" style={{ width: '18px', height: '18px', border: '2px solid #000', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                            <span>Orchestrating Booking...</span>
                          </>
                        ) : (
                          <span>Book VIP Experience Pass</span>
                        )}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                /* SUCCESS VIEWS */
                <div style={{ padding: '50px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.1 }}
                    style={{ color: '#81C784', fontSize: '5rem', marginBottom: '20px', display: 'flex' }}
                  >
                    <HiCheckCircle />
                  </motion.div>

                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#fff', marginBottom: '10px' }}>
                    VIP Booking Secured
                  </h3>
                  <p style={{ color: '#7a7a99', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto 30px', lineHeight: 1.6 }}>
                    Congratulations! Your luxury passes have been confirmed. A concierge dossier has been sent to your email.
                  </p>

                  {/* Summary of Booked Ticket */}
                  <div style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(201,168,76,0.2)', 
                    width: '100%', 
                    borderRadius: '20px', 
                    padding: '24px', 
                    textAlign: 'left',
                    marginBottom: '35px',
                    boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)'
                  }}>
                    <DetailRow label="Showcase Event" value={bookedDetails?.title} />
                    <DetailRow label="Date / Time" value={`${getEventDate(bookedDetails)} at ${bookedDetails?.time || 'TBD'}`} />
                    <DetailRow label="Premium Venue" value={bookedDetails?.venue?.name} />
                    <DetailRow label="Passes Count" value={`${bookedDetails?.tickets} VIP Pass(es)`} />
                    <DetailRow label="Outlay Settled" value={`₹${bookedDetails?.totalAmount?.toLocaleString()}`} highlight />
                  </div>

                  {/* Dual Action Buttons */}
                  <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
                    <button
                      onClick={() => {
                        setSelectedEvent(null);
                        navigate('/history');
                      }}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #C9A84C, #FFD700)',
                        color: '#000',
                        border: 'none',
                        padding: '14px',
                        borderRadius: '25px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      View Ticket History
                    </button>
                    
                    <button
                      onClick={() => setSelectedEvent(null)}
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '14px',
                        borderRadius: '25px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

const DetailRow = ({ label, value, highlight = false }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '12px', marginTop: '12px' }}>
    <span style={{ color: '#555577', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
    <span style={{ color: highlight ? '#C9A84C' : '#fff', fontWeight: highlight ? 800 : 500, fontSize: '0.9rem' }}>{value}</span>
  </div>
);

export default EventsPage;
