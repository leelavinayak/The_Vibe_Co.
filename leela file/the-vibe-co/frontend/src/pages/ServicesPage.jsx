import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  HiCamera, HiCake, HiColorSwatch, HiCube,
  HiSearch, HiLocationMarker, HiStar, HiArrowRight,
  HiX, HiInformationCircle, HiCalendar, HiCurrencyDollar
} from 'react-icons/hi';
import { FaInstagram } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const categories = [
  { id: 'all', name: 'All Services', icon: <HiSearch />, color: '#C9A84C' },
  { id: 'photography', name: 'Photography', icon: <HiCamera />, color: '#C9A84C' },
  { id: 'videography', name: 'Videography', icon: <HiCamera />, color: '#C9A84C' },
  { id: 'catering', name: 'Catering', icon: <HiCake />, color: '#C9A84C' },
  { id: 'decoration', name: 'Decoration', icon: <HiColorSwatch />, color: '#C9A84C' },
  // { id: 'music', name: 'Music', icon: <HiCube />, color: '#C9A84C' },
  // { id: 'security', name: 'Security', icon: <HiCube />, color: '#C9A84C' },
  { id: 'total_event_organisation', name: 'Total Event Organisation', icon: <HiCube />, color: '#C9A84C' },
];

const getImageUrl = (images, fallback = 'https://via.placeholder.com/600x400?text=The+Vibe+Co') => {
  if (!images) return fallback;
  if (Array.isArray(images)) {
    if (images.length === 0) return fallback;
    const first = images[0];
    if (Array.isArray(first)) return getImageUrl(first, fallback);
    return first || fallback;
  }
  return images || fallback;
};

const ServicesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const servicesRef = useRef(null);

  // States and Cities for filtering (could be fetched from an API)
  const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Goa', 'Rajasthan'];
  const cities = {
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'],
    'Delhi': ['New Delhi', 'North Delhi'],
    'Karnataka': ['Bangalore', 'Mysore'],
    'Tamil Nadu': ['Chennai', 'Coimbatore'],
    'Goa': ['Panaji', 'Vasco'],
    'Rajasthan': ['Jaipur', 'Udaipur']
  };

  useEffect(() => {
    fetchServices();
  }, [activeCategory, search, state, city]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/services', {
        params: {
          type: activeCategory === 'all' ? undefined : activeCategory,
          search: search || undefined,
          state: state || undefined,
          city: city || undefined
        }
      });
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceReviews = async (serviceId) => {
    try {
      const { data } = await axios.get(`/api/reviews?serviceId=${serviceId}`);
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  useEffect(() => {
    if (selectedService) {
      fetchServiceReviews(selectedService._id);
    }
  }, [selectedService]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setSubmittingReview(true);
    try {
      await axios.post('/api/reviews', {
        ...reviewForm,
        service: selectedService._id,
        name: user.name,
        email: user.email
      });
      setReviewForm({ rating: 5, comment: '' });
      fetchServiceReviews(selectedService._id);
      alert('Review submitted successfully!');
    } catch (err) {
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
    if (window.innerWidth <= 768 && servicesRef.current) {
      setTimeout(() => {
        servicesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleEnquiry = (service) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'provider') {
      alert("Service member cannot book the service. They need to book with their personal accounts like as a user.");
      return;
    }
    navigate(`/contact?service=${service.type}&provider=${service.name}&serviceId=${service._id}&mode=enquiry`);
  };

  const handleBooking = (service) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'provider') {
      alert("Service member cannot book the service. They need to book with their personal accounts like as a user.");
      return;
    }
    navigate(`/contact?service=${service.type}&provider=${service.name}&serviceId=${service._id}&mode=booking`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      {/* Hero Section */}
      <section style={{ padding: '120px 20px 60px', textAlign: 'center', background: 'radial-gradient(circle at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 70%)', minHeight: '400px', display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', marginBottom: '15px' }}
          >
            Elite <span className="text-gradient">Services</span>
          </motion.h1>
          <p style={{ color: '#7a7a99', maxWidth: '600px', margin: '0 auto 50px', fontSize: '1.1rem', letterSpacing: '1px' }}>
            Curated professionals dedicated to extraordinary event excellence.
          </p>

          {/* Categories Grid */}
          <div className="categories-grid" style={{ marginBottom: '60px' }}>
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                whileHover={{ y: -5, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryClick(cat.id)}
                className={`category-chip ${activeCategory === cat.id ? 'active' : ''}`}
                style={{
                  background: activeCategory === cat.id ? '#C9A84C' : 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '15px 25px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: '0.3s'
                }}
              >
                <div style={{ fontSize: '1.2rem', color: activeCategory === cat.id ? '#000' : '#C9A84C' }}>{cat.icon}</div>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: activeCategory === cat.id ? '#000' : '#fff' }}>{cat.name}</span>
              </motion.div>
            ))}
          </div>

          {/* Search and Filters - Premium Arrangement */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '25px',
            borderRadius: '32px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '15px',
            alignItems: 'center',
            maxWidth: '1100px',
            margin: '0 auto 60px'
          }}>
            <div style={{ flex: '2 1 350px', position: 'relative' }}>
              <HiSearch style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#C9A84C', fontSize: '1.2rem' }} />
              <input
                type="text"
                placeholder="Find specialized services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '18px 20px 18px 55px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '18px',
                  color: '#fff',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <select
                value={state}
                onChange={(e) => { setState(e.target.value); setCity(''); }}
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '18px',
                  color: '#fff',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                <option value="">All States</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 200px', position: 'relative' }}>
              <HiLocationMarker style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#C9A84C', fontSize: '1.2rem' }} />
              <input
                type="text"
                placeholder="City..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '18px 20px 18px 55px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '18px',
                  color: '#fff',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Listing */}
      <section ref={servicesRef} style={{ padding: '0 20px 80px' }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
                style={{ width: '40px', height: '40px', border: '3px solid rgba(201, 168, 76, 0.1)', borderTopColor: '#C9A84C', borderRadius: '50%', margin: '0 auto' }}
              />
            </div>
          ) : services.length > 0 ? (
            <div className="services-list-grid">
              {services.map((svc) => (
                <motion.div
                  key={svc._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -10 }}
                  style={{
                    background: 'rgba(20, 20, 20, 0.6)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedService(svc)}
                >
                  <div className="service-card-img" style={{ position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={getImageUrl(svc.images, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800')}
                      alt={svc.name}
                      onClick={(e) => { e.stopPropagation(); setFullscreenImage(getImageUrl(svc.images)); }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800' }}
                    />
                      <div className="category-badge-mobile" style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(201,168,76,0.95)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {svc.type?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </div>
                    {/* Premium Rating Overlay at Bottom of Image */}
                    <div style={{ 
                      position: 'absolute', 
                      bottom: '8px', 
                      right: '8px', 
                      background: 'rgba(0,0,0,0.6)', 
                      backdropFilter: 'blur(8px)', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <HiStar style={{ color: '#FFD700', fontSize: '0.85rem' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{svc.rating || 5.0}</span>
                    </div>
                  </div>
                  <div className="service-card-content" style={{ padding: '16px' }}>
                    <h3 className="service-card-title" style={{ marginBottom: '6px', fontSize: '1.1rem' }}>{svc.name}</h3>
                    <div className="service-card-location" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7a7a99', marginBottom: '8px', fontSize: '0.85rem' }}>
                      <HiLocationMarker style={{ color: '#C9A84C' }} /> <span className="truncate-text">{svc.city}, {svc.state}</span>
                    </div>
                    <p className="service-card-desc" style={{ color: '#b3b3cc', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '12px', fontSize: '0.85rem' }}>
                      {svc.description}
                    </p>
                    <div className="service-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <div style={{ color: '#C9A84C', fontWeight: 700 }}>
                        <span style={{ fontSize: '0.6rem', color: '#555', display: 'block', textTransform: 'uppercase' }}>From</span>
                        <span className="service-card-price" style={{ fontSize: '1rem' }}>{svc.priceStartsFrom}</span>
                      </div>
                      <button
                        className="btn btn-primary btn-book-now"
                        onClick={(e) => { e.stopPropagation(); handleBooking(svc); }}
                        style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '8px' }}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '100px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <h3 style={{ color: '#7a7a99' }}>No services found in this category or location.</h3>
              <p style={{ color: '#555' }}>Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </section>

      {/* Service Details Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.9)',
              backdropFilter: 'blur(10px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              style={{
                background: '#111',
                width: '100%',
                maxWidth: '900px',
                borderRadius: '32px',
                border: '1px solid rgba(201, 168, 76, 0.2)',
                overflow: 'hidden',
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedService(null)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}
              >
                <HiX />
              </button>

              <div className="modal-layout">
                <div className="modal-image">
                  <img
                    src={getImageUrl(selectedService.images, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800')}
                    alt={selectedService.name}
                    onClick={() => setFullscreenImage(getImageUrl(selectedService.images))}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800' }}
                  />
                </div>
                <div className="modal-details">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#C9A84C', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, marginBottom: '10px' }}>
                    <HiInformationCircle /> Professional Details
                  </div>
                  <h2 className="modal-title">{selectedService.name}</h2>
                  <div className="modal-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><HiLocationMarker style={{ color: '#C9A84C' }} /> {selectedService.city}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><HiStar style={{ color: '#FFD700' }} /> {selectedService.rating} Rating</div>
                    {selectedService.instagram && (
                      <a href={selectedService.instagram} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E1306C', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                        <FaInstagram size={20} /> View Demo
                      </a>
                    )}
                  </div>

                  <p style={{ color: '#b3b3cc', lineHeight: 1.8, marginBottom: '20px' }}>
                    {selectedService.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                    <div>
                      <div style={{ color: '#555', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '5px' }}>Price starts from</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 700, color: '#C9A84C' }}>
                        <HiCurrencyDollar /> {selectedService.priceStartsFrom}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#555', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '5px' }}>Available In</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 600 }}>
                        <HiLocationMarker /> {selectedService.state}
                      </div>
                    </div>
                  </div>

                  <div className="modal-buttons">
                    <button
                      onClick={() => handleEnquiry(selectedService)}
                      className="modal-btn-enquire"
                    >
                      Enquire for Prices
                    </button>
                    <button
                      onClick={() => handleBooking(selectedService)}
                      className="modal-btn-book"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div style={{ padding: '40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                  <h4 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>Client Testimonials</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#FFD700' }}>
                    <HiStar /> {selectedService.rating} Avg Rating
                  </div>
                </div>

                {/* Review Form */}
                {user && user.role === 'user' && (
                  <form onSubmit={handleReviewSubmit} style={{ marginBottom: '40px', background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(201,168,76,0.1)' }}>
                    <h5 style={{ color: '#C9A84C', marginBottom: '15px' }}>Leave a Review</h5>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                      {[1, 2, 3, 4, 5].map(num => (
                        <HiStar
                          key={num}
                          onClick={() => setReviewForm({ ...reviewForm, rating: num })}
                          style={{ cursor: 'pointer', fontSize: '1.5rem', color: num <= reviewForm.rating ? '#FFD700' : '#333' }}
                        />
                      ))}
                    </div>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="Share your experience with this professional..."
                      style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '15px', borderRadius: '12px', color: '#fff', minHeight: '80px', outline: 'none', marginBottom: '15px' }}
                      required
                    />
                    <button
                      type="submit"
                      disabled={submittingReview}
                      style={{ background: '#C9A84C', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {submittingReview ? 'Submitting...' : 'Post Review'}
                    </button>
                  </form>
                )}

                {/* Reviews List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {reviews.length > 0 ? reviews.map(rev => (
                    <div key={rev._id} style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#fff' }}>{rev.name}</span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[...Array(5)].map((_, i) => (
                            <HiStar key={i} style={{ fontSize: '0.8rem', color: i < rev.rating ? '#FFD700' : '#333' }} />
                          ))}
                        </div>
                      </div>
                      <p style={{ color: '#7a7a99', fontSize: '0.9rem', lineHeight: 1.6 }}>{rev.comment}</p>
                      <div style={{ fontSize: '0.7rem', color: '#555', marginTop: '8px' }}>{new Date(rev.createdAt).toLocaleDateString()}</div>
                    </div>
                  )) : (
                    <p style={{ color: '#555', textAlign: 'center', padding: '20px' }}>No reviews yet. Be the first to review!</p>
                  )}
                </div>
              </div>

              {/* Portfolio Gallery Section */}
              {Array.isArray(selectedService.images) && selectedService.images.length > 1 && (
                <div style={{ padding: '40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.2rem' }}>Portfolio Gallery</h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '15px'
                  }}>
                    {selectedService.images.map((img, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        style={{ height: '120px', borderRadius: '15px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        <img
                          src={getImageUrl([img])}
                          alt={`Portfolio ${idx}`}
                          onClick={() => setFullscreenImage(getImageUrl([img]))}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional content bottom area if needed */}
              <div style={{ padding: '40px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ marginBottom: '20px' }}>Features & Specialties</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {selectedService.features?.map((f, i) => (
                    <span key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem' }}>{f}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Lightbox */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 10001,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}
            onClick={() => setFullscreenImage(null)}
          >
            <button
              onClick={() => setFullscreenImage(null)}
              style={{ position: 'absolute', top: '30px', right: '30px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', zIndex: 10, fontSize: '1.5rem' }}
            >
              <HiX />
            </button>
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={fullscreenImage}
              alt="Full view"
              style={{ maxWidth: '95%', maxHeight: '95%', borderRadius: '12px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Content area - User mentioned another content should be display at bottom */}
      <section style={{ padding: '100px 20px', background: '#050505', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', marginBottom: '20px' }}>Why Choose Our <span className="text-gradient">Partners</span>?</h2>
            <p style={{ color: '#7a7a99', maxWidth: '800px', margin: '0 auto 60px' }}>
              We vet every professional on our platform to ensure they meet the highest standards of luxury and excellence.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
              <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>
                <div style={{ fontSize: '2rem', color: '#C9A84C', marginBottom: '15px' }}><HiStar /></div>
                <h3>Elite Quality</h3>
                <p style={{ color: '#555', fontSize: '0.9rem' }}>Only the top 5% of professionals are accepted into our network.</p>
              </div>
              <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>
                <div style={{ fontSize: '2rem', color: '#C9A84C', marginBottom: '15px' }}><HiCalendar /></div>
                <h3>Reliable Booking</h3>
                <p style={{ color: '#555', fontSize: '0.9rem' }}>Secure your dates with our guaranteed booking system.</p>
              </div>
              <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>
                <div style={{ fontSize: '2rem', color: '#C9A84C', marginBottom: '15px' }}><HiInformationCircle /></div>
                <h3>Full Support</h3>
                <p style={{ color: '#555', fontSize: '0.9rem' }}>Our team is here to assist you through every step of the process.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        /* Categories */
        .categories-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
          margin-bottom: 50px;
        }
        .category-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        .category-chip:hover {
          border-color: rgba(201,168,76,0.4);
          background: rgba(201,168,76,0.06);
        }
        .category-chip.active {
          background: rgba(201,168,76,0.15);
          border-color: #C9A84C;
          box-shadow: 0 0 20px rgba(201,168,76,0.15);
        }
        .category-icon { font-size: 1.3rem; color: #C9A84C; display: flex; }
        .category-label { font-size: 0.9rem; font-weight: 600; color: #ccc; }
        .category-chip.active .category-label { color: #C9A84C; }

        /* Service Cards Grid */
        .services-list-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }
        .service-card-img { height: 240px; }
        .service-card-title { font-size: 1.3rem; font-weight: 700; }
        .service-card-location { font-size: 0.85rem; }
        .service-card-desc { font-size: 0.88rem; }
        .service-card-price { font-size: 1rem; }
        .btn-view-details { padding: 10px 20px; font-size: 0.8rem; border-radius: 50px; }

        @media (max-width: 1024px) {
          .services-list-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
        }
        /* Modal */
        .modal-layout { display: grid; grid-template-columns: 1fr 1fr; }
        .modal-image { height: 400px; }
        .modal-title { font-family: 'Playfair Display', serif; font-size: 2.2rem; margin-bottom: 10px; }
        .modal-meta { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; color: #7a7a99; flex-wrap: wrap; }
        .modal-details { padding: 35px; }
        .modal-buttons { display: flex; gap: 12px; }
        .modal-btn-enquire { flex: 1; background: rgba(201,168,76,0.1); border: 1px solid #C9A84C; color: #C9A84C; padding: 14px; border-radius: 14px; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
        .modal-btn-enquire:hover { background: rgba(201,168,76,0.2); }
        .modal-btn-book { flex: 1; background: linear-gradient(135deg, #C9A84C, #FFD700, #C9A84C); color: #000; padding: 14px; border-radius: 14px; font-weight: 700; cursor: pointer; border: none; font-size: 0.9rem; }
        .modal-btn-book:hover { box-shadow: 0 4px 20px rgba(201,168,76,0.4); }

        @media (max-width: 768px) {
          .categories-grid { flex-wrap: nowrap; overflow-x: auto; justify-content: flex-start; padding-bottom: 12px; -webkit-overflow-scrolling: touch; }
          .categories-grid::-webkit-scrollbar { height: 4px; }
          .categories-grid::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.4); border-radius: 10px; }
          .category-chip { padding: 10px 18px; }
          .category-label { font-size: 0.8rem; }

          /* 2 columns x N rows (Premium Grid) */
          .services-list-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }

          .service-card {
            border-radius: 16px !important;
            border: 1px solid rgba(255,255,255,0.05) !important;
          }

          .service-card-img { height: 150px; }
          .service-card-content { padding: 12px !important; }
          .service-card-title { font-size: 0.95rem !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px !important; }
          .service-card-location { font-size: 0.7rem !important; margin-bottom: 8px !important; }
          .service-card-desc { display: none !important; }
          .service-card-footer { flex-direction: column; align-items: stretch !important; gap: 8px; }
          .service-card-price { font-size: 0.9rem !important; }
          
          .btn-book-now { 
            width: 100% !important; 
            padding: 10px 0 !important; 
            font-size: 0.75rem !important; 
            background: #C9A84C !important;
            color: #000 !important;
            border: none !important;
            font-weight: 700 !important;
            border-radius: 6px !important;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .truncate-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70px; }

          /* Modal mobile */
          .modal-layout { grid-template-columns: 1fr !important; }
          .modal-image { height: 220px !important; }
          .modal-details { padding: 20px !important; }
          .modal-title { font-size: 1.5rem !important; }
          .modal-meta { gap: 10px !important; font-size: 0.8rem; }
          .modal-buttons { flex-direction: column !important; gap: 10px; }
          .modal-btn-enquire, .modal-btn-book { padding: 14px !important; font-size: 0.95rem !important; border-radius: 12px !important; text-align: center; }
        }
      `}</style>
    </div>
  );
};

export default ServicesPage;
