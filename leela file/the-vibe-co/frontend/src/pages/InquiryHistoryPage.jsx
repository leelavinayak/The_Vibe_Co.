import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiClipboardList, HiClock, HiCurrencyDollar, HiX, HiArrowLeft, HiStar, HiCheckCircle, HiChatAlt2, HiPaperAirplane } from 'react-icons/hi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const InquiryHistoryPage = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    webRating: 5,
    webComment: '',
    memberRating: 5,
    memberComment: ''
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = React.useRef(null);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchHistory();
  }, [user]);
  useEffect(() => {
    if (showChat && selectedInquiry) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [showChat, selectedInquiry]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`/api/chat/${selectedInquiry._id}`);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedInquiry) return;

    try {
      // Find receiver ID (the provider)
      // selectedInquiry.service could be an object with an owner or we might need to get it from service
      const { data: serviceData } = await axios.get(`/api/services/${selectedInquiry.service._id || selectedInquiry.service}`);

      const { data } = await axios.post('/api/chat', {
        bookingId: selectedInquiry._id,
        receiverId: serviceData.owner || serviceData.providerId, // Adjust based on schema
        text: newMessage
      });
      setMessages([...messages, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/auth/profile');
      // Sort history to show completed events first or recently updated
      const sortedHistory = (data.inquiryHistory || []).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setHistory(sortedHistory);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      // 1. Submit Website Review
      await axios.post('/api/reviews', {
        name: user.name,
        email: user.email,
        rating: reviewForm.webRating,
        comment: reviewForm.webComment
      });

      // 2. Submit Service Member Review (if serviceId exists)
      if (selectedInquiry.service) {
        await axios.post('/api/reviews', {
          name: user.name,
          email: user.email,
          rating: reviewForm.memberRating,
          comment: reviewForm.memberComment,
          service: typeof selectedInquiry.service === 'object' ? selectedInquiry.service._id : selectedInquiry.service
        });
      }

      alert('Thank you for your reviews! Your feedback has been sent to our team and the service member.');
      setIsReviewModalOpen(false);
      setReviewForm({ webRating: 5, webComment: '', memberRating: 5, memberComment: '' });
    } catch (error) {
      console.error('Review submission failed:', error);
      alert('Review submission partially failed. Please try again later.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving your event history..." />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '120px 20px 60px', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <header style={{ marginBottom: '40px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: '#C9A84C', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '15px', padding: 0 }}
          >
            <HiArrowLeft /> Back
          </button>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', margin: 0 }}>History</h1>
          <p style={{ color: '#7a7a99', marginTop: '10px' }}>Track the progress of your premium event requests.</p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {history.length > 0 ? (
            history.map((item) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={item._id}
                onClick={() => setSelectedInquiry(item)}
                style={{
                  background: isMobile ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                  padding: isMobile ? '30px 24px' : '24px',
                  borderRadius: isMobile ? '24px' : '28px',
                  border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  backdropFilter: 'blur(10px)',
                  boxShadow: isMobile ? '0 4px 20px rgba(0,0,0,0.15)' : '0 10px 30px rgba(0,0,0,0.2)'
                }}
                whileHover={{ scale: 1.02, borderColor: 'rgba(201, 168, 76, 0.4)', background: 'rgba(255,255,255,0.05)' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <h4 style={{ color: '#fff', fontSize: '1.25rem', margin: 0 }}>
                      {['catering', 'photography', 'decoration', 'total_event_organisation'].includes(item.eventType)
                        ? `${item.eventType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Booking`
                        : `${item.eventType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Showcase`}
                    </h4>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      background: item.status === 'accepted' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(201, 168, 76, 0.1)',
                      color: item.status === 'accepted' ? '#81C784' : '#C9A84C',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      {item.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '25px', color: '#555577', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HiClock /> {new Date(item.createdAt).toLocaleDateString()}</span>
                    {item.billing?.totalAmount ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#81C784', fontWeight: 600 }}>
                        <HiCurrencyDollar /> Total Amount: ₹{item.billing.totalAmount}
                      </span>
                    ) : (
                      item.budget && <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HiCurrencyDollar /> Budget: {item.budget}</span>
                    )}
                  </div>
                </div>
                <div style={{ width: '50px', height: '50px', minWidth: '50px', borderRadius: '15px', background: 'rgba(201,168,76,0.05)', color: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  <HiClipboardList />
                </div>
              </motion.div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '100px 40px', background: 'rgba(255,255,255,0.01)', borderRadius: '32px', border: '1px dashed rgba(255,255,255,0.05)' }}>
              <HiClipboardList style={{ fontSize: '60px', color: '#222', marginBottom: '20px' }} />
              <h4 style={{ fontSize: '1.5rem', color: '#555', marginBottom: '10px' }}>No Event History</h4>
              <p style={{ color: '#333', marginBottom: '30px' }}>Your journey to an extraordinary event begins here.</p>
              <button onClick={() => navigate('/contact')} className="btn btn-primary" style={{ padding: '15px 40px' }}>Create Your First Inquiry</button>
            </div>
          )}
        </div>

        {/* Inquiry Detail Modal */}
        <AnimatePresence>
          {selectedInquiry && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 9999 }}
              onClick={() => setSelectedInquiry(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                style={{ 
                  background: '#111', 
                  width: isMobile ? '100%' : '100%', 
                  maxWidth: isMobile ? '100%' : '600px', 
                  height: isMobile ? '100%' : 'auto',
                  maxHeight: isMobile ? '100%' : '90vh',
                  borderRadius: isMobile ? '0' : '32px', 
                  border: isMobile ? 'none' : '1px solid rgba(201,168,76,0.2)', 
                  overflow: 'auto', 
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ padding: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', margin: 0, textTransform: 'capitalize' }}>{selectedInquiry.eventType} Details</h3>
                  <button onClick={() => setSelectedInquiry(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}><HiX /></button>
                </div>
                <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <DetailRow label="Client Name" value={selectedInquiry.name} />
                  <DetailRow label="Email Address" value={selectedInquiry.email} />
                  <DetailRow label="Event Type" value={selectedInquiry.eventType} />
                  {selectedInquiry.phone && <DetailRow label="Contact Number" value={selectedInquiry.phone} />}
                  {selectedInquiry.budget && <DetailRow label="Estimated Budget" value={selectedInquiry.budget} />}
                  {selectedInquiry.eventDate && <DetailRow label="Event Date" value={new Date(selectedInquiry.eventDate).toLocaleDateString()} />}

                  {selectedInquiry.service && (
                    <div style={{ 
                      marginTop: '25px', 
                      padding: '24px', 
                      background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.08), rgba(255, 255, 255, 0.01))', 
                      borderRadius: '24px', 
                      border: '1px solid rgba(201, 168, 76, 0.2)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                    }}>
                      <div style={{ 
                        color: '#C9A84C', 
                        fontSize: '0.75rem', 
                        textTransform: 'uppercase', 
                        letterSpacing: '2px', 
                        fontWeight: 700, 
                        marginBottom: '15px', 
                        borderBottom: '1px solid rgba(201, 168, 76, 0.15)', 
                        paddingBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <HiStar /> Service Member Details
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <DetailRow label="Business Name" value={selectedInquiry.service.name} />
                        <DetailRow label="Service Type" value={selectedInquiry.service.type?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} />
                        {(selectedInquiry.service.city || selectedInquiry.service.state) && (
                          <DetailRow 
                            label="Location" 
                            value={`${selectedInquiry.service.city || ''}${selectedInquiry.service.city && selectedInquiry.service.state ? ', ' : ''}${selectedInquiry.service.state || ''}`} 
                          />
                        )}
                        {selectedInquiry.service.email && (
                          <DetailRow label="Provider Email" value={selectedInquiry.service.email} />
                        )}
                        {selectedInquiry.service.phone && (
                          <DetailRow label="Provider Phone" value={selectedInquiry.service.phone} />
                        )}
                        {selectedInquiry.service.instagram && (
                          <DetailRow label="Instagram" value={`@${selectedInquiry.service.instagram.replace('@', '')}`} />
                        )}
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ color: '#555577', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Project Description / Message</div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', color: '#d4d4e6', lineHeight: 1.6, fontSize: '0.95rem' }}>
                      {selectedInquiry.message || "No additional message provided."}
                    </div>
                  </div>

                  {selectedInquiry.billing?.totalAmount > 0 && (
                    <div style={{ 
                      marginTop: '25px', 
                      padding: '24px', 
                      background: 'linear-gradient(135deg, rgba(129, 199, 132, 0.08), rgba(255, 255, 255, 0.01))', 
                      borderRadius: '24px', 
                      border: '1px solid rgba(129, 199, 132, 0.2)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                    }}>
                      <div style={{ 
                        color: '#81C784', 
                        fontSize: '0.75rem', 
                        textTransform: 'uppercase', 
                        letterSpacing: '2px', 
                        fontWeight: 700, 
                        marginBottom: '15px', 
                        borderBottom: '1px solid rgba(129, 199, 132, 0.15)', 
                        paddingBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <HiCurrencyDollar /> Billing Details & Invoice
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(selectedInquiry.billing.items || []).map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                            <span style={{ color: '#7a7a99' }}>{item.description}</span>
                            <span style={{ color: '#fff', fontWeight: 500 }}>₹{item.amount}</span>
                          </div>
                        ))}
                        <div style={{ marginTop: '5px', display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                          <span style={{ color: '#C9A84C', fontWeight: 700 }}>Total Cost</span>
                          <span style={{ color: '#C9A84C', fontWeight: 700 }}>₹{selectedInquiry.billing.totalAmount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                          <span style={{ color: '#81C784', fontWeight: 600 }}>Amount Paid</span>
                          <span style={{ color: '#81C784', fontWeight: 600 }}>₹{selectedInquiry.billing.amountPaid}</span>
                        </div>
                        {selectedInquiry.billing.totalAmount - selectedInquiry.billing.amountPaid > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: '#EF5350' }}>Balance Due</span>
                            <span style={{ color: '#EF5350', fontWeight: 600 }}>₹{selectedInquiry.billing.totalAmount - selectedInquiry.billing.amountPaid}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '20px', padding: '20px', background: selectedInquiry.status === 'completed' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(201,168,76,0.05)', borderRadius: '16px', border: `1px solid ${selectedInquiry.status === 'completed' ? '#81C784' : 'rgba(201,168,76,0.1)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#7a7a99', fontSize: '0.85rem' }}>Inquiry Status</span>
                    <span style={{ color: selectedInquiry.status === 'completed' ? '#81C784' : '#C9A84C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.85rem' }}>{selectedInquiry.status}</span>
                  </div>

                  {selectedInquiry.status === 'accepted' && (
                    <div style={{ marginTop: '20px', padding: '25px', background: 'rgba(201,168,76,0.05)', borderRadius: '20px', border: '1px dashed #C9A84C', textAlign: 'center' }}>
                      <HiChatAlt2 style={{ fontSize: '2.5rem', color: '#C9A84C', marginBottom: '10px' }} />
                      <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>Communicate with Service Member</h4>
                      <p style={{ fontSize: '0.9rem', color: '#7a7a99', marginBottom: '20px' }}>Your inquiry has been accepted! You can now chat directly with the provider.</p>
                      <button
                        onClick={() => { setShowChat(true); }}
                        className="btn btn-primary" style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                      >
                        <HiChatAlt2 /> Open Chatbox
                      </button>
                    </div>
                  )}

                  {selectedInquiry.status === 'completed' && (
                    <div style={{ marginTop: '20px', padding: '25px', background: 'rgba(76, 175, 80, 0.05)', borderRadius: '20px', border: '1px dashed #81C784', textAlign: 'center' }}>
                      <HiCheckCircle style={{ fontSize: '2.5rem', color: '#81C784', marginBottom: '10px' }} />
                      <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>Event Completed Successfully!</h4>
                      <p style={{ fontSize: '0.9rem', color: '#7a7a99', marginBottom: '20px' }}>Your journey with THE VIBE CO. has reached a milestone. We'd love to hear about your experience.</p>
                      <button
                        onClick={() => { setIsReviewModalOpen(true); }}
                        className="btn btn-primary" style={{ width: '100%', padding: '14px' }}
                      >
                        Give Review & Feedback
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dual Review Modal */}
        <AnimatePresence>
          {isReviewModalOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 10000 }}
              onClick={() => setIsReviewModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                style={{ background: '#0a0a0a', width: '100%', maxWidth: '700px', borderRadius: '40px', border: '1px solid rgba(201,168,76,0.3)', overflow: 'hidden', position: 'relative' }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ padding: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', margin: 0 }}>Share Your Experience</h3>
                    <p style={{ color: '#C9A84C', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Review Website & Service Provider</p>
                  </div>
                  <button onClick={() => setIsReviewModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }}><HiX /></button>
                </div>

                <form onSubmit={handleReviewSubmit} style={{ padding: '40px', maxHeight: '70vh', overflowY: 'auto' }}>
                  {/* Website Review */}
                  <div style={{ marginBottom: '40px' }}>
                    <h4 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(201,168,76,0.1)', color: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
                      Rate Our Website
                    </h4>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <HiStar
                          key={star}
                          style={{ fontSize: '2rem', cursor: 'pointer', color: star <= reviewForm.webRating ? '#C9A84C' : '#222', transition: '0.2s' }}
                          onClick={() => setReviewForm({ ...reviewForm, webRating: star })}
                        />
                      ))}
                    </div>
                    <textarea
                      className="form-input"
                      placeholder="How was your experience using our platform? (UI/UX, features...)"
                      value={reviewForm.webComment}
                      onChange={(e) => setReviewForm({ ...reviewForm, webComment: e.target.value })}
                      required
                      style={{ minHeight: '100px' }}
                    />
                  </div>

                  {/* Service Member Review */}
                  <div style={{ marginBottom: '30px' }}>
                    <h4 style={{ color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(201,168,76,0.1)', color: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
                      Rate the Service Member
                    </h4>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <HiStar
                          key={star}
                          style={{ fontSize: '2rem', cursor: 'pointer', color: star <= reviewForm.memberRating ? '#C9A84C' : '#222', transition: '0.2s' }}
                          onClick={() => setReviewForm({ ...reviewForm, memberRating: star })}
                        />
                      ))}
                    </div>
                    <textarea
                      className="form-input"
                      placeholder={`How was the service provided for your ${selectedInquiry.eventType}?`}
                      value={reviewForm.memberComment}
                      onChange={(e) => setReviewForm({ ...reviewForm, memberComment: e.target.value })}
                      required
                      style={{ minHeight: '100px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmittingReview}
                    style={{ width: '100%', padding: '16px', fontSize: '1rem', marginTop: '20px' }}
                  >
                    {isSubmittingReview ? 'Submitting Your Voice...' : 'Submit Final Reviews'}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Modal */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 10001 }}
              onClick={() => setShowChat(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                style={{ 
                  background: '#0a0a0a', 
                  width: isMobile ? '100%' : '100%', 
                  maxWidth: isMobile ? '100%' : '500px', 
                  height: isMobile ? '100%' : '600px', 
                  borderRadius: isMobile ? '0' : '40px', 
                  border: isMobile ? 'none' : '1px solid rgba(201,168,76,0.3)', 
                  overflow: 'hidden', 
                  position: 'relative', 
                  display: 'flex', 
                  flexDirection: 'column' 
                }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ padding: '25px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(201,168,76,0.05)' }}>
                  <div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', margin: 0 }}>Chat with Provider</h3>
                    <p style={{ color: '#C9A84C', margin: '2px 0 0 0', fontSize: '0.8rem', textTransform: 'capitalize' }}>{selectedInquiry.eventType}</p>
                  </div>
                  <button onClick={() => setShowChat(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}><HiX /></button>
                </div>

                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      style={{
                        maxWidth: '80%',
                        padding: '10px 16px',
                        borderRadius: '18px',
                        alignSelf: msg.sender._id === user._id ? 'flex-end' : 'flex-start',
                        background: msg.sender._id === user._id ? '#C9A84C' : 'rgba(255,255,255,0.05)',
                        color: msg.sender._id === user._id ? '#000' : '#fff',
                        fontSize: '0.9rem'
                      }}
                    >
                      {msg.text}
                      <div style={{ fontSize: '0.6rem', textAlign: 'right', marginTop: '4px', opacity: 0.7 }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 18px', borderRadius: '25px', color: '#fff', outline: 'none' }}
                  />
                  <button type="submit" style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#C9A84C', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', cursor: 'pointer' }}>
                    <HiPaperAirplane style={{ transform: 'rotate(90deg)' }} />
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '12px' }}>
    <span style={{ color: '#555577', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
    <span style={{ color: '#fff', fontWeight: 500 }}>{value}</span>
  </div>
);

export default InquiryHistoryPage;
