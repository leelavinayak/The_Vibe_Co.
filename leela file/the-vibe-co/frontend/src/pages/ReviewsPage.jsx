import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiStar } from 'react-icons/hi';
import axios from 'axios';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } };
const stagger = { visible: { transition: { staggerChildren: 0.15 } } };

const ReviewsPage = () => {
  const [reviewsData, setReviewsData] = useState({ reviews: [], stats: { total: 0, average: 0, percentage: 0 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Fetch all reviews without limit (or handle pagination on backend)
        // Since we're currently fetching limit(10) in the controller for HomePage,
        // we might want to fetch all. For now, we'll hit the same endpoint 
        // assuming it returns enough or we'll update the backend later.
        const res = await axios.get('/api/reviews');
        setReviewsData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: '#0a0a0a' }}>
      <section className="section">
        <div className="container">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="section-header">
            <span className="section-subtitle">Real Experiences</span>
            <h2>Client <span className="text-gradient">Reviews</span></h2>
            <div className="gold-line" />
            <p>Discover what our clients have to say about their unforgettable experiences.</p>
          </motion.div>

          {loading ? (
            <div style={{ textAlign: 'center', color: '#C9A84C', padding: '60px' }}>Loading reviews...</div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={stagger}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '30px',
                marginTop: '50px'
              }}>
              {reviewsData.reviews.length > 0 ? reviewsData.reviews.map((t, i) => (
                <motion.div key={t._id} variants={fadeUp} whileHover={{ y: -8 }}
                  style={{ position: 'relative', padding: '40px', background: '#111111', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '20px', transition: 'all 0.4s ease', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                  
                  <div style={{ position: 'absolute', top: '20px', right: '30px', opacity: 0.05, fontSize: '6rem', fontFamily: 'serif', color: '#C9A84C', lineHeight: 1 }}>"</div>
                  
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', position: 'relative', zIndex: 2 }}>
                    {[...Array(5)].map((_, j) => <HiStar key={j} style={{ color: j < t.rating ? '#C9A84C' : '#333', fontSize: '1.2rem' }} />)}
                  </div>
                  <p style={{ color: '#d4d4e6', lineHeight: 1.8, marginBottom: '30px', fontSize: '1rem', position: 'relative', zIndex: 2 }}>"{t.comment}"</p>
                  
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
                <div style={{ color: '#7a7a99', textAlign: 'center', width: '100%', gridColumn: '1 / -1', padding: '40px', border: '1px dashed rgba(201,168,76,0.3)', borderRadius: '16px' }}>
                  No reviews yet. Be the first to share your experience!
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ReviewsPage;
