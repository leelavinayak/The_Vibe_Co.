import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiMail, HiPhone, HiLocationMarker, HiClock, HiCheck } from 'react-icons/hi';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

const contactInfo = [
  { icon: <HiMail size={22} />, title: 'Email', detail: 'hello@thevibeco.com', sub: 'We reply within 24 hours' },
  { icon: <HiPhone size={22} />, title: 'Phone', detail: '+91 98765 43210', sub: 'Mon-Sat, 10am - 7pm' },
  { icon: <HiLocationMarker size={22} />, title: 'Office', detail: '42 Luxury Lane, Mumbai', sub: 'India 400001' },
  { icon: <HiClock size={22} />, title: 'Hours', detail: 'Mon - Sat: 10AM - 7PM', sub: 'Sunday by appointment' },
];

const eventTypes = ['wedding', 'corporate', 'birthday', 'concert', 'festival', 'conference', 'private', 'catering', 'photography', 'decoration', 'total_event_organisation', 'other'];

const ContactPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const serviceParam = searchParams.get('service');
  const modeParam = searchParams.get('mode');
  const providerParam = searchParams.get('provider');
  const serviceIdParam = searchParams.get('serviceId');

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    eventType: serviceParam && eventTypes.includes(serviceParam) ? serviceParam : 'wedding',
    budget: '',
    eventDate: '',
    service: serviceIdParam || '',
    message: providerParam ? `I am interested in ${modeParam === 'booking' ? 'booking' : 'enquiring about'} ${providerParam} for my event.` : ''
  });

  React.useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || user.name,
        email: prev.email || user.email,
        phone: prev.phone || user.phone
      }));
    }
  }, [user]);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const config = {};
      if (user && user.token) {
        config.headers = { Authorization: `Bearer ${user.token}` };
      }
      await axios.post('/api/contact', form, config);
      setSubmitted(true);
    } catch (err) {
      console.error('❌ Server Error:', err.message);
      setError(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div>
        <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '60px 40px', maxWidth: '500px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #FFD700)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 8px 32px rgba(201,168,76,0.3)' }}>
              <HiCheck size={36} color="#0a0a0a" />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#fff', marginBottom: '16px' }}>Message Sent!</h2>
            <p style={{ color: '#9999b3', lineHeight: 1.8, marginBottom: '32px' }}>Thank you for reaching out. Our team will get back to you within 24 hours to discuss your event.</p>
            <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', eventType: 'wedding', budget: '', eventDate: '', message: '' }); }}
              className="btn btn-outline">Send Another Message</button>
          </motion.div>
        </section>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section style={{ position: 'relative', height: '50vh', minHeight: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'url(https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600) center/cover', filter: 'brightness(0.15)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.7), rgba(10,10,10,0.95))' }} />
        <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <span className="section-subtitle">Let's Talk</span>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#fff' }}>Get in <span className="text-gradient">Touch</span></h1>
          <p style={{ color: '#9999b3', fontFamily: "'Outfit', sans-serif", marginTop: '8px' }}>Begin your journey to an extraordinary event</p>
        </motion.div>
      </section>

      {/* Contact Info */}
      <section style={{ background: '#111111', borderBottom: '1px solid rgba(201,168,76,0.1)', padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {contactInfo.map((c, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { delay: i * 0.1, duration: 0.5 } } }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '24px', borderRadius: '12px', background: 'rgba(26,26,26,0.5)', border: '1px solid rgba(201,168,76,0.08)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(201,168,76,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A84C', flexShrink: 0, border: '1px solid rgba(201,168,76,0.15)' }}>{c.icon}</div>
                <div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '6px' }}>{c.title}</div>
                  <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 500, marginBottom: '4px' }}>{c.detail}</div>
                  <div style={{ color: '#7a7a99', fontSize: '0.8rem' }}>{c.sub}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="section" style={{ background: '#0a0a0a' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="section-header">
            <span className="section-subtitle">Inquiry Form</span>
            <h2>Plan Your <span className="text-gradient">Event</span></h2>
            <div className="gold-line" />
            <p>Fill in the details below and our team will craft a personalized proposal for you.</p>
          </motion.div>

          <motion.form initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            onSubmit={handleSubmit}
            style={{ background: 'linear-gradient(145deg, rgba(26,26,26,0.9), rgba(17,17,17,0.95))', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '20px', padding: 'clamp(28px, 5vw, 48px)' }}>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div className="form-group">
                <label className="form-label">Event Type *</label>
                <select className="form-input" name="eventType" value={form.eventType} onChange={handleChange} required>
                  {eventTypes.map(t => (
                    <option key={t} value={t}>
                      {t.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Budget Range</label>
                <input className="form-input" name="budget" value={form.budget} onChange={handleChange} placeholder="e.g. ₹5L - ₹10L" />
              </div>
              <div className="form-group">
                <label className="form-label">Event Date</label>
                <input className="form-input" type="date" name="eventDate" value={form.eventDate} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Tell Us About Your Vision *</label>
              <textarea className="form-input" name="message" value={form.message} onChange={handleChange} placeholder="Describe your dream event — theme, guest count, special requirements..." required style={{ minHeight: '140px' }} />
            </div>

            {error && (
              <div style={{ padding: '15px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff6b6b', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
                {error}
              </div>
            )}
            {form.eventType !== 'total_event_organisation' && !form.service ? (
              <div style={{ 
                background: 'rgba(239, 83, 80, 0.06)', 
                border: '1px dashed rgba(239, 83, 80, 0.3)', 
                borderRadius: '16px', 
                padding: '24px', 
                textAlign: 'center', 
                marginBottom: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
              }}>
                <div style={{ color: '#EF5350', fontWeight: 800, fontSize: '1rem', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  ⚠️ Service Member Required
                </div>
                <p style={{ color: '#9999b3', fontSize: '0.88rem', margin: '0 0 20px 0', lineHeight: 1.6 }}>
                  To book individual service categories (Weddings, Catering, Photography, etc.), you must first select a specific professional service member from our verified roster.
                </p>
                <Link to="/services" className="btn btn-outline" style={{ display: 'inline-flex', padding: '12px 28px', fontSize: '0.85rem', fontWeight: 700 }}>
                  Go and select your service member in the service page
                </Link>
              </div>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={loading}
                style={{ width: '100%', padding: '16px', fontSize: '1rem', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Sending...' : 'Submit Inquiry'}
              </button>
            )}
          </motion.form>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
