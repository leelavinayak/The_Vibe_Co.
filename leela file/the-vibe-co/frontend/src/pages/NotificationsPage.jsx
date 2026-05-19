import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiBell, HiX, HiClock, HiArrowLeft, HiClipboardList, HiLogin, HiShieldCheck, HiStar, HiMail, HiDesktopComputer, HiDeviceMobile } from 'react-icons/hi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const typeConfig = {
  login:         { icon: HiLogin,       color: '#60A5FA', label: 'Login Activity' },
  welcome:       { icon: HiShieldCheck, color: '#34D399', label: 'Welcome' },
  inquiry:       { icon: HiMail,        color: '#C9A84C', label: 'Inquiry' },
  status_update: { icon: HiClipboardList, color: '#FBBF24', label: 'Status Update' },
  review:        { icon: HiStar,        color: '#F472B6', label: 'Review' },
  system:        { icon: HiBell,        color: '#A78BFA', label: 'System' },
};

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      fetchNotifications();
      window.dispatchEvent(new Event('notificationsCleared'));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearAll = () => {
    setShowConfirmClear(true);
  };

  const confirmClearAll = async () => {
    try {
      await axios.delete('/api/notifications/clear');
      setNotifications([]);
      window.dispatchEvent(new Event('notificationsCleared'));
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const filtered = filter === 'all'
    ? notifications
    : filter === 'unread'
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '40px', height: '40px', border: '3px solid rgba(201,168,76,0.1)', borderTopColor: '#C9A84C', borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '120px 20px 60px', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <header style={{ marginBottom: '35px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: '#C9A84C', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '15px', padding: 0, fontSize: '0.9rem' }}
          >
            <HiArrowLeft /> Back
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', margin: 0 }}>
                Notifications
                {unreadCount > 0 && (
                  <span style={{
                    fontSize: '1rem', fontFamily: "'Outfit', sans-serif",
                    background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))',
                    color: '#C9A84C', padding: '4px 14px', borderRadius: '20px', marginLeft: '15px',
                    border: '1px solid rgba(201,168,76,0.2)', fontWeight: 700, verticalAlign: 'middle'
                  }}>
                    {unreadCount} new
                  </span>
                )}
              </h1>
              <p style={{ color: '#7a7a99', marginTop: '8px', fontSize: '0.95rem' }}>Stay updated with your event activity and login history.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Link to="/history" style={{
                background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)',
                color: '#C9A84C', padding: '10px 18px', borderRadius: '12px', fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, transition: '0.3s'
              }}>
                <HiClipboardList /> History
              </Link>
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.15)', color: '#ff4444', padding: '10px 18px', borderRadius: '12px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '25px', overflowX: 'auto', paddingBottom: '5px' }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: `Unread (${unreadCount})` },
            { key: 'login', label: 'Login' },
            { key: 'inquiry', label: 'Inquiries' },
            { key: 'status_update', label: 'Updates' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '8px 18px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                border: filter === tab.key ? '1px solid rgba(201,168,76,0.4)' : '1px solid rgba(255,255,255,0.08)',
                background: filter === tab.key ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)',
                color: filter === tab.key ? '#C9A84C' : '#7a7a99',
                cursor: 'pointer', transition: '0.3s', whiteSpace: 'nowrap',
                letterSpacing: '0.5px', textTransform: 'uppercase'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <AnimatePresence>
            {filtered.length > 0 ? (
              filtered.map((notif, idx) => {
                const config = typeConfig[notif.type] || typeConfig.system;
                const IconComp = config.icon;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: idx * 0.04 }}
                    key={notif._id}
                    onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                    style={{
                      background: notif.read
                        ? 'rgba(255,255,255,0.02)'
                        : `linear-gradient(135deg, ${config.color}08, transparent 60%)`,
                      padding: '22px 24px',
                      borderRadius: '20px',
                      border: `1px solid ${notif.read ? 'rgba(255,255,255,0.04)' : config.color + '25'}`,
                      position: 'relative',
                      cursor: notif.read ? 'default' : 'pointer',
                      transition: 'all 0.3s ease',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Unread glow bar */}
                    {!notif.read && (
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
                        background: `linear-gradient(180deg, ${config.color}, transparent)`,
                        borderRadius: '0 3px 3px 0'
                      }} />
                    )}

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      {/* Type Icon */}
                      <div style={{
                        width: '44px', height: '44px', minWidth: '44px', borderRadius: '14px',
                        background: config.color + '12',
                        border: `1px solid ${config.color}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: config.color, fontSize: '1.25rem'
                      }}>
                        <IconComp />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px', flexWrap: 'wrap' }}>
                          <span style={{ color: '#fff', fontWeight: 600, fontSize: '1.05rem' }}>{notif.title}</span>
                          {!notif.read && <span style={{ width: '8px', height: '8px', background: config.color, borderRadius: '50%', flexShrink: 0 }} />}
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
                            color: config.color, background: config.color + '10', padding: '2px 8px', borderRadius: '6px'
                          }}>
                            {config.label}
                          </span>
                        </div>
                        <p style={{ color: '#7a7a99', fontSize: '0.9rem', margin: '0 0 10px 0', lineHeight: 1.6 }}>{notif.message}</p>
                        <div style={{ color: notif.read ? '#444466' : '#666688', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <HiClock style={{ fontSize: '0.85rem' }} />
                          {new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notif._id); }}
                        style={{
                          background: 'rgba(255,68,68,0.05)', border: 'none', color: '#ff4444',
                          width: '32px', height: '32px', minWidth: '32px', borderRadius: '10px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', opacity: 0.5, transition: '0.3s', fontSize: '1rem'
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                      >
                        <HiX />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '80px 40px', background: 'rgba(255,255,255,0.015)', borderRadius: '32px', border: '1px dashed rgba(255,255,255,0.06)' }}
              >
                <div style={{
                  width: '80px', height: '80px', borderRadius: '24px', margin: '0 auto 25px',
                  background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <HiBell style={{ fontSize: '2.5rem', color: '#333' }} />
                </div>
                <h4 style={{ fontSize: '1.4rem', color: '#444', margin: '0 0 10px 0', fontFamily: "'Playfair Display', serif" }}>
                  {filter !== 'all' ? 'No matching notifications' : 'No notifications yet'}
                </h4>
                <p style={{ color: '#333', fontSize: '0.9rem', maxWidth: '350px', margin: '0 auto' }}>
                  {filter !== 'all'
                    ? 'Try a different filter to find what you\'re looking for.'
                    : 'We\'ll alert you about login activity, event updates, and more.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Custom Notification Clear Confirmation Modal */}
      <AnimatePresence>
        {showConfirmClear && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 20000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '100px 20px' }}>
            <motion.div 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              style={{ background: '#111', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '24px', padding: '30px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
            >
              <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: '#fff', marginBottom: '15px' }}>Clear Notifications</h4>
              <p style={{ color: '#7a7a99', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '25px' }}>
                Are you sure you want to clear all your notifications? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button 
                  onClick={() => setShowConfirmClear(false)}
                  style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowConfirmClear(false);
                    confirmClearAll();
                  }}
                  style={{ padding: '12px 24px', background: '#C9A84C', border: 'none', color: '#000', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsPage;
