import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiClipboardList, HiCheckCircle, HiXCircle, HiMail, HiPhone,
  HiCalendar, HiBadgeCheck, HiStar, HiEye, HiUserCircle,
  HiChatAlt2, HiPaperAirplane, HiPencil, HiClock, HiDotsVertical,
  HiChevronRight, HiArrowLeft, HiLocationMarker, HiPaperClip, HiTrash
} from 'react-icons/hi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DetailBlock = ({ label, value, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{ color: '#C9A84C', fontSize: '1.2rem', display: 'flex' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '0.65rem', color: '#555577', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
      <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{String(value || 'N/A')}</div>
    </div>
  </div>
);

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent'); // recent, previous, history, chat
  const [selectedInq, setSelectedInq] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Chat state
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

  // Mobile specific state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [showChatList, setShowChatList] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (activeChat && isMobile) {
      setShowChatList(false);
    }
  }, [activeChat, isMobile]);

  // Edit form state
  const [editForm, setEditForm] = useState({
    eventDate: '',
    message: '',
    status: '',
    billing: {
      items: [],
      totalAmount: 0,
      amountPaid: 0
    }
  });

  // Service Profile State
  const [profileForm, setProfileForm] = useState({
    personalName: '',
    personalEmail: '',
    personalPhone: '',
    serviceName: '',
    serviceType: '',
    description: '',
    priceStartsFrom: '',
    instagram: '',
    demoImageUrls: ''
  });
  const [profileUpdating, setProfileUpdating] = useState(false);

  useEffect(() => {
    if (user || service) {
      setProfileForm({
        personalName: user?.name || '',
        personalEmail: user?.email || '',
        personalPhone: user?.phone || '',
        serviceName: service?.name || '',
        serviceType: service?.type || '',
        description: service?.description || '',
        priceStartsFrom: service?.priceStartsFrom || '',
        instagram: service?.instagram || '',
        demoImageUrls: service?.images ? service?.images.join(', ') : ''
      });
    }
  }, [user?.name, user?.email, user?.phone, service?.name, service?.type, service?.description, service?.priceStartsFrom, service?.instagram, service?.images]);

  useEffect(() => {
    fetchProviderData();
  }, []);

  useEffect(() => {
    let interval;
    if (activeTab === 'chat' && activeChat?._id) {
      fetchMessages(activeChat._id);
      markAsRead(activeChat._id);
      interval = setInterval(() => {
        fetchMessages(activeChat._id);
        markAsRead(activeChat._id);
      }, 5000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [activeTab, activeChat?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchProviderData = async () => {
    try {
      if (!user?.token) return;
      setLoading(true);

      if (user.serviceId) {
        try {
          const { data: serviceData } = await axios.get(`/api/services/${user.serviceId}`);
          setService(serviceData);
        } catch (svcErr) {
          console.error('Service fetch error:', svcErr);
        }
      }

      const { data: inqData } = await axios.get('/api/provider-mgmt/inquiries', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setInquiries(Array.isArray(inqData) ? inqData : []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (bookingId) => {
    try {
      if (!bookingId || !user?.token) return;
      const { data } = await axios.get(`/api/chat/${bookingId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat?._id) return;

    try {
      const receiverId = activeChat.user?._id || activeChat.user || 'admin';
      const { data } = await axios.post('/api/chat', {
        bookingId: activeChat._id,
        receiverId,
        text: newMessage
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessages(prev => [...prev, data]);
      setNewMessage('');
      setTimeout(scrollToBottom, 100);
      fetchProviderData();
    } catch (error) {
      showToast('Failed to send message', 'error');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat?._id) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data: uploadData } = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` }
      });

      const fileType = file.type.includes('image') ? 'image' : 'pdf';
      const receiverId = activeChat.user?._id || activeChat.user || 'admin';

      const { data } = await axios.post('/api/chat', {
        bookingId: activeChat._id,
        receiverId,
        fileUrl: uploadData.url,
        fileType
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setMessages(prev => [...prev, data]);
      fetchProviderData();
    } catch (err) {
      showToast('Upload failed', 'error');
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await axios.delete(`/api/chat/${msgId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessages(prev => prev.filter(m => m._id !== msgId));
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

  const markAsRead = async (bookingId) => {
    try {
      if (!bookingId || !user?.token) return;
      await axios.put(`/api/chat/read/${bookingId}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      // Refresh inquiries to update unread counts
      const { data: inqData } = await axios.get('/api/provider-mgmt/inquiries', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setInquiries(Array.isArray(inqData) ? inqData : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id, status, reason = '') => {
    try {
      await axios.put(`/api/provider-mgmt/inquiries/${id}`, { status, rejectionReason: reason }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (status === 'completed') {
        const inq = inquiries.find(i => i._id === id);
        const billingInfo = inq?.billing || { items: [], totalAmount: 0, amountPaid: 0 };
        const itemsList = billingInfo.items.map(item => `• ${item.description}: ₹${item.amount}`).join('\n');

        const message = `*THE VIBE CO. - RECEIPT*\n\n` +
          `Hello ${inq?.name},\n` +
          `Your event booking has been successfully completed.\n\n` +
          `*Service Breakdown:*\n${itemsList}\n\n` +
          `*Total Cost:* ₹${billingInfo.totalAmount}\n` +
          `*Amount Paid:* ₹${billingInfo.amountPaid}\n` +
          `*Balance:* ₹${billingInfo.totalAmount - billingInfo.amountPaid}\n\n` +
          `Provided by: ${service?.name || user?.name}\n\n` +
          `Thank you for choosing THE VIBE CO.!`;

        // Open WhatsApp
        const whatsappUrl = `https://wa.me/${inq?.phone?.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        showToast('Booking completed! WhatsApp receipt opened.', 'success');
      } else {
        showToast(`Booking ${status} successfully!`, 'success');
      }

      fetchProviderData();
      if (activeChat?._id === id) {
        setActiveChat(prev => ({ ...prev, status }));
      }
    } catch (err) {
      showToast('Update failed', 'error');
    }
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/provider-mgmt/inquiries/${selectedInq._id}`, editForm, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      showToast('Inquiry updated successfully!', 'success');
      setShowEditModal(false);
      fetchProviderData();
    } catch (err) {
      showToast('Update failed', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const filteredInquiries = (() => {
    let filtered = inquiries || [];
    if (activeTab === 'recent') {
      filtered = filtered.filter(inq => inq.status === 'new' || inq.status === 'contacted' || inq.status === 'in-progress' || inq.status === 'accepted');
    } else if (activeTab === 'previous') {
      filtered = filtered.filter(inq => inq.status === 'completed' || inq.status === 'rejected');
    }

    if (searchTerm) {
      filtered = filtered.filter(inq =>
        (inq.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inq.eventType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inq.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  })();

  const totalUnreadCount = (inquiries || []).reduce((acc, curr) => {
    if (curr.status !== 'rejected') {
      return acc + (curr.unreadCount || 0);
    }
    return acc;
  }, 0);

  if (loading && inquiries.length === 0) {
    return <LoadingSpinner message="Synchronizing your partner dashboard..." />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', paddingTop: '100px', paddingBottom: '60px' }}>
      <div className="container">
        {/* Header Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'center' : 'flex-end',
          marginBottom: isMobile ? '30px' : '40px',
          flexDirection: isMobile ? 'column' : 'row',
          textAlign: isMobile ? 'center' : 'left',
          gap: isMobile ? '20px' : '0'
        }}>
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: isMobile ? '2rem' : '2.5rem',
                marginBottom: '5px'
              }}
            >
              Welcome, <span className="text-gradient">{user?.name || 'Partner'}</span>
            </motion.h1>
            <p style={{ color: '#7a7a99', fontSize: isMobile ? '0.85rem' : '1rem' }}>Managing <strong>{service?.name || 'Service'}</strong> Ecosystem</p>
          </div>

          <div style={{ textAlign: isMobile ? 'center' : 'right' }}>
            <div style={{ fontSize: '0.65rem', color: '#C9A84C', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Expertise</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))',
              padding: '8px 20px',
              borderRadius: '12px',
              border: '1px solid rgba(201,168,76,0.3)',
              boxShadow: '0 4px 15px rgba(201,168,76,0.1)'
            }}>
              <HiBadgeCheck color="#C9A84C" size={isMobile ? 20 : 24} />
              <span style={{ fontWeight: 700, color: '#C9A84C', fontSize: '0.85rem' }}>Verified Partner</span>
            </div>
          </div>
        </div>

        {/* Tabs and Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ position: 'relative', width: isMobile ? '100%' : '350px' }}>
            <input
              type="text"
              placeholder="Search by client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '14px 20px',
                borderRadius: '16px',
                color: '#fff',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div className="tabs-wrapper" style={{
            width: isMobile ? '100vw' : 'auto',
            margin: isMobile ? '0 -20px' : '0',
            overflowX: isMobile ? 'auto' : 'visible',
            padding: isMobile ? '0 20px' : '0',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            <div className="tabs-container" style={{
              display: 'flex',
              gap: '10px',
              background: 'rgba(255,255,255,0.03)',
              padding: '6px',
              borderRadius: '20px',
              width: isMobile ? 'max-content' : 'fit-content',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              {[
                { id: 'recent', label: 'Recent', icon: <HiClock /> },
                { id: 'previous', label: 'Previous', icon: <HiCheckCircle /> },
                { id: 'history', label: 'History', icon: <HiClipboardList /> },
                { id: 'chat', label: 'Chatbox', icon: <HiChatAlt2 />, badge: totalUnreadCount > 0 ? totalUnreadCount : null }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '14px', border: 'none',
                    background: activeTab === tab.id ? '#C9A84C' : 'transparent',
                    color: activeTab === tab.id ? '#000' : '#7a7a99',
                    fontWeight: 700, cursor: 'pointer', transition: '0.3s', whiteSpace: 'nowrap', fontSize: '0.85rem',
                    position: 'relative'
                  }}
                >
                  {tab.icon} {tab.label}
                  {tab.badge && (
                    <span style={{
                      background: activeTab === tab.id ? '#000' : '#C9A84C',
                      color: activeTab === tab.id ? '#C9A84C' : '#000',
                      fontSize: '0.65rem',
                      fontWeight: 900,
                      padding: '2px 6px',
                      borderRadius: '10px',
                      marginLeft: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '18px',
                      height: '18px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'chat' ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="chat-grid"
              style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : (activeChat ? '350px 1fr 320px' : '350px 1fr'), 
                gap: '24px', 
                height: isMobile ? 'calc(100vh - 250px)' : 'calc(100vh - 340px)',
                minHeight: isMobile ? '500px' : '500px'
              }}
            >
              {(!isMobile || showChatList) && (
                <div className="chat-sidebar" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '0', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '25px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(201,168,76,0.05)' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <HiChatAlt2 color="#C9A84C" /> Conversations
                    </h3>
                  </div>
                  <div style={{ padding: '15px', flex: 1, overflowY: 'auto' }}>
                    {inquiries.filter(i => i.status !== 'rejected').length === 0 ? (
                      <p style={{ color: '#555577', textAlign: 'center', marginTop: '40px' }}>No active conversations.</p>
                    ) : (
                      inquiries
                        .filter(i => i.status !== 'rejected')
                        .sort((a, b) => {
                          const timeA = (a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(a.createdAt)).getTime() || 0;
                          const timeB = (b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(b.createdAt)).getTime() || 0;
                          return timeB - timeA;
                        })
                        .map(inq => (
                          <div
                            key={inq._id}
                            onClick={() => { setActiveChat(inq); markAsRead(inq._id); if (isMobile) setShowChatList(false); }}
                            style={{
                              padding: '18px 15px',
                              borderRadius: '20px',
                              cursor: 'pointer',
                              transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              marginBottom: '10px',
                              background: activeChat?._id === inq._id ? 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))' : 'transparent',
                              border: activeChat?._id === inq._id ? '1px solid rgba(201,168,76,0.2)' : '1px solid rgba(255,255,255,0.03)',
                              display: 'flex',
                              gap: '12px',
                              alignItems: 'center',
                              boxShadow: activeChat?._id === inq._id ? '0 8px 32px rgba(0,0,0,0.2)' : 'none'
                            }}
                          >
                            <div style={{ position: 'relative' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#C9A84C' }}>
                                {(inq.name || 'C').charAt(0)}
                              </div>
                              {inq.unreadCount > 0 && (
                                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#C9A84C', color: '#000', fontSize: '0.6rem', minWidth: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, border: '1.5px solid #111' }}>
                                  {inq.unreadCount}
                                </span>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inq.name || 'Client'}</div>
                                <span style={{ fontSize: '0.55rem', color: '#555577' }}>
                                  {inq.lastMessage ? new Date(inq.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: inq.unreadCount > 0 ? '#fff' : '#7a7a99', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {inq.lastMessage ? inq.lastMessage.text || '📎 Shared a file' : inq.eventType}
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {(!isMobile || !showChatList) && (
                <div className="chat-window" style={{ background: 'rgba(255,255,255,0.01)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
                  {activeChat ? (
                    <>
                      <div style={{ padding: '15px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          {isMobile && <HiArrowLeft onClick={() => setShowChatList(true)} style={{ cursor: 'pointer' }} />}
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(45deg, #C9A84C, #a68b3d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800 }}>{(activeChat.name || 'C').charAt(0)}</div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{activeChat.name || 'Client'}</div>
                            <div style={{ fontSize: '0.65rem', color: '#81C784' }}>Active</div>
                          </div>
                        </div>
                      </div>

                      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {messages.map((msg, i) => {
                          const isOwn = (msg.sender?._id || msg.sender) === user?._id;
                          return (
                            <div key={msg._id || i} style={{
                              maxWidth: '85%',
                              padding: '14px 18px',
                              borderRadius: isOwn ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                              alignSelf: isOwn ? 'flex-end' : 'flex-start',
                              background: isOwn ? 'linear-gradient(135deg, #C9A84C, #a68b3d)' : 'rgba(255,255,255,0.06)',
                              color: isOwn ? '#000' : '#fff',
                              position: 'relative',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                              border: isOwn ? 'none' : '1px solid rgba(255,255,255,0.05)'
                            }}>
                              {msg.fileUrl && (
                                msg.fileType === 'image' ? <img src={msg.fileUrl} style={{ width: '100%', borderRadius: '10px', marginBottom: '8px' }} alt="" /> :
                                  <a href={msg.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none', background: 'rgba(0,0,0,0.1)', padding: '8px', borderRadius: '8px', marginBottom: '8px' }}><HiClipboardList /> Document.pdf</a>
                              )}
                              <div>{msg.text}</div>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', marginTop: '4px', opacity: 0.6, fontSize: '0.55rem' }}>
                                {msg.isEdited && <span>edited</span>}
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {isOwn && <HiTrash style={{ cursor: 'pointer', marginLeft: '5px' }} onClick={() => handleDeleteMessage(msg._id)} />}
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef} />
                      </div>

                      <form onSubmit={handleSendMessage} style={{ padding: '15px', display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(15,15,15,0.8)' }}>
                        <input type="file" id="p-file" style={{ display: 'none' }} onChange={handleFileUpload} />
                        <label htmlFor="p-file" style={{ cursor: 'pointer', color: '#C9A84C' }}><HiPaperClip size={24} /></label>
                        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type message..." style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '25px', color: '#fff', outline: 'none' }} />
                        <button type="submit" style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#C9A84C', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', cursor: 'pointer' }}><HiPaperAirplane style={{ transform: 'rotate(90deg)' }} /></button>
                      </form>
                    </>
                  ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#555577', padding: '40px' }}>
                      <HiChatAlt2 size={40} style={{ color: '#C9A84C', opacity: 0.5, marginBottom: '20px' }} />
                      <h3 style={{ color: '#fff' }}>Messaging Portal</h3>
                      <p>Select a conversation to start chatting.</p>
                    </div>
                  )}
                </div>
              )}

              {!isMobile && activeChat && (
                <div className="chat-detail-panel" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', height: '100%' }}>
                  <h4 style={{ color: '#C9A84C', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Client Dossier</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <DetailBlock label="Event Type" value={activeChat.eventType} icon={<HiStar />} />
                    <DetailBlock label="Email" value={activeChat.email} icon={<HiMail />} />
                    <DetailBlock label="Phone" value={activeChat.phone || activeChat.user?.phone || 'N/A'} icon={<HiPhone />} />
                    <DetailBlock label="Date" value={activeChat.eventDate ? new Date(activeChat.eventDate).toLocaleDateString() : 'TBD'} icon={<HiCalendar />} />
                    <DetailBlock label="Total Cost" value={activeChat.billing?.totalAmount ? `₹${activeChat.billing.totalAmount}` : activeChat.budget} icon={<HiBadgeCheck />} />

                    {activeChat.user && (
                      <div style={{
                        marginTop: '15px',
                        padding: '15px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}>
                        <div style={{
                          color: '#C9A84C',
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          fontWeight: 700,
                          marginBottom: '10px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          paddingBottom: '5px'
                        }}>
                          Registered Profile
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <DetailBlock label="Registered Name" value={activeChat.user.name} icon={<HiUserCircle />} />
                          <DetailBlock label="Registered Email" value={activeChat.user.email} icon={<HiMail />} />
                          {activeChat.user.phone && <DetailBlock label="Registered Phone" value={activeChat.user.phone} icon={<HiPhone />} />}
                          {activeChat.user.gender && <DetailBlock label="Gender" value={activeChat.user.gender?.toUpperCase()} icon={<HiUserCircle />} />}
                          {(activeChat.user.state || activeChat.user.country) && (
                            <DetailBlock
                              label="Location"
                              value={`${activeChat.user.state || ''}${activeChat.user.state && activeChat.user.country ? ', ' : ''}${activeChat.user.country || ''}`}
                              icon={<HiLocationMarker />}
                            />
                          )}
                          {activeChat.user.language && <DetailBlock label="Language" value={activeChat.user.language} icon={<HiBadgeCheck />} />}
                        </div>
                      </div>
                    )}

                    {activeChat.userHistory && activeChat.userHistory.length > 0 && (
                      <div style={{
                        marginTop: '15px',
                        padding: '15px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}>
                        <div style={{
                          color: '#C9A84C',
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          fontWeight: 700,
                          marginBottom: '10px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          paddingBottom: '5px'
                        }}>
                          Booking History
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                          {activeChat.userHistory.map((hist, idx) => (
                            <div key={idx} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: 'rgba(255, 255, 255, 0.01)',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid rgba(255, 255, 255, 0.02)',
                              fontSize: '0.8rem'
                            }}>
                              <div>
                                <div style={{ fontWeight: 600, color: '#fff', textTransform: 'capitalize' }}>
                                  {hist.eventType?.split('_').join(' ')}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: '#555577' }}>
                                  {hist.eventDate ? new Date(hist.eventDate).toLocaleDateString() : new Date(hist.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '0.55rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                background: hist.status === 'accepted' ? 'rgba(129, 199, 132, 0.1)' : hist.status === 'rejected' ? 'rgba(239, 83, 80, 0.1)' : hist.status === 'completed' ? 'rgba(79, 195, 247, 0.1)' : 'rgba(255,255,255,0.05)',
                                color: hist.status === 'accepted' ? '#81C784' : hist.status === 'rejected' ? '#EF5350' : hist.status === 'completed' ? '#4FC3F7' : '#7a7a99'
                              }}>
                                {hist.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {activeChat.status === 'new' && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => handleUpdateStatus(activeChat._id, 'accepted')}
                            style={{ flex: 1, background: '#81C784', color: '#000', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => { setSelectedInq(activeChat); setShowRejectModal(true); }}
                            style={{ background: 'rgba(239, 83, 80, 0.1)', color: '#EF5350', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {activeChat.status === 'accepted' && (
                        <button
                          onClick={() => handleUpdateStatus(activeChat._id, 'completed')}
                          style={{ width: '100%', background: '#4FC3F7', color: '#000', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                          <HiCheckCircle size={20} /> Complete & Send Receipt
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedInq(activeChat);
                          setEditForm({
                            budget: activeChat.budget || '',
                            eventDate: activeChat.eventDate ? activeChat.eventDate.split('T')[0] : '',
                            message: activeChat.message || '',
                            billing: activeChat.billing || { items: [], totalAmount: 0, amountPaid: 0 }
                          });
                          setShowEditModal(true);
                        }}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Update Billing / Details
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{
                background: isMobile ? 'transparent' : 'rgba(255,255,255,0.02)',
                borderRadius: isMobile ? '0' : '32px',
                border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.05)',
                padding: isMobile ? '10px 0 40px' : '40px'
              }}>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: isMobile ? '1.5rem' : '1.8rem',
                  marginBottom: isMobile ? '20px' : '30px',
                  padding: isMobile ? '0 10px' : '0'
                }}>
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Inquiries
                </h3>
                <div className={isMobile ? "mobile-cards" : "table-responsive"}>
                  {isMobile ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {inquiries
                        .filter(inq => {
                          if (activeTab === 'recent') return inq.status === 'new' || inq.status === 'contacted' || inq.status === 'in-progress' || inq.status === 'accepted';
                          if (activeTab === 'previous') return inq.status === 'completed' || inq.status === 'rejected';
                          return true;
                        })
                        .filter(inq => {
                          if (!searchTerm) return true;
                          return (inq.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (inq.eventType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (inq.email || '').toLowerCase().includes(searchTerm.toLowerCase());
                        })
                        .map(inq => (
                          <motion.div
                            key={inq._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => { setSelectedInq(inq); setShowViewModal(true); }}
                            style={{
                              background: isMobile ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                              borderRadius: isMobile ? '24px' : '28px',
                              padding: isMobile ? '30px 24px' : '24px',
                              border: '1px solid rgba(255,255,255,0.08)',
                              position: 'relative',
                              overflow: 'hidden',
                              backdropFilter: 'blur(10px)',
                              boxShadow: isMobile ? '0 4px 20px rgba(0,0,0,0.15)' : '0 10px 30px rgba(0,0,0,0.2)',
                              cursor: 'pointer',
                              transition: '0.3s'
                            }}
                            whileHover={{ scale: 1.01, borderColor: 'rgba(201,168,76,0.3)' }}
                          >
                            {/* Card Background Decoration */}
                            <div style={{
                              position: 'absolute',
                              top: '-20px',
                              right: '-20px',
                              width: '100px',
                              height: '100px',
                              background: inq.status === 'completed' ? 'radial-gradient(circle, rgba(79, 195, 247, 0.05) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(201, 168, 76, 0.05) 0%, transparent 70%)',
                              zIndex: 0
                            }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
                              <div>
                                <div
                                  style={{
                                    fontWeight: 800,
                                    fontSize: '1.25rem',
                                    color: '#fff',
                                    marginBottom: '4px',
                                    fontFamily: "'Playfair Display', serif",
                                    transition: 'color 0.2s',
                                  }}
                                >
                                  {inq.name || 'Guest'}
                                </div>
                                <div style={{ color: '#C9A84C', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{inq.eventType}</div>
                              </div>
                              <span style={{
                                padding: '6px 14px', borderRadius: '10px', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px',
                                background: inq.status === 'accepted' ? 'rgba(129, 199, 132, 0.1)' : inq.status === 'rejected' ? 'rgba(239, 83, 80, 0.1)' : inq.status === 'completed' ? 'rgba(79, 195, 247, 0.1)' : 'rgba(255,255,255,0.05)',
                                color: inq.status === 'accepted' ? '#81C784' : inq.status === 'rejected' ? '#EF5350' : inq.status === 'completed' ? '#4FC3F7' : '#7a7a99',
                                border: `1px solid ${inq.status === 'accepted' ? '#81C78430' : inq.status === 'rejected' ? '#EF535030' : inq.status === 'completed' ? '#4FC3F730' : '#ffffff10'}`
                              }}>
                                {inq.status}
                              </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px', position: 'relative', zIndex: 1 }}>
                              <div style={{ fontSize: '0.85rem' }}>
                                <div style={{ color: '#555577', textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '1.5px', marginBottom: '6px', fontWeight: 700 }}>Event Date</div>
                                <div style={{ color: '#eee', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <HiCalendar size={14} color="#C9A84C" />
                                  {inq.eventDate ? new Date(inq.eventDate).toLocaleDateString() : 'TBD'}
                                </div>
                              </div>
                              <div style={{ fontSize: '0.85rem' }}>
                                <div style={{ color: '#555577', textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '1.5px', marginBottom: '6px', fontWeight: 700 }}>Service Fee</div>
                                <div style={{ color: '#eee', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <HiBadgeCheck size={14} color="#C9A84C" />
                                  {inq.billing?.totalAmount ? `₹${inq.billing.totalAmount}` : (inq.budget || 'N/A')}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                              {inq.status === 'new' && (
                                <>
                                  <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(inq._id, 'accepted'); }} style={{ flex: 1, background: '#81C784', color: '#000', border: 'none', padding: '12px', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(129, 199, 132, 0.2)' }}>Accept</button>
                                  <button onClick={(e) => { e.stopPropagation(); setSelectedInq(inq); setShowRejectModal(true); }} style={{ flex: 1, background: 'rgba(239, 83, 80, 0.1)', color: '#EF5350', border: '1px solid #EF535030', padding: '12px', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}>Reject</button>
                                </>
                              )}
                              {inq.status === 'accepted' && (
                                <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(inq._id, 'completed'); }} style={{ flex: 2, background: 'linear-gradient(45deg, #4FC3F7, #29B6F6)', color: '#000', border: 'none', padding: '12px', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(79, 195, 247, 0.3)' }}><HiCheckCircle size={18} /> Complete Job</button>
                              )}
                              {(inq.status === 'accepted' || inq.status === 'new') && (
                                <button onClick={(e) => { e.stopPropagation(); setActiveChat(inq); setActiveTab('chat'); }} style={{ flex: 1, background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', padding: '12px', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><HiChatAlt2 size={18} /> Chat</button>
                              )}
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={(e) => { e.stopPropagation(); setSelectedInq(inq); setShowViewModal(true); }} style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><HiEye size={20} /></button>
                                <button onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedInq(inq);
                                  setEditForm({
                                    budget: inq.budget || '',
                                    eventDate: inq.eventDate ? inq.eventDate.split('T')[0] : '',
                                    message: inq.message || '',
                                    billing: inq.billing || { items: [], totalAmount: 0, amountPaid: 0 }
                                  });
                                  setShowEditModal(true);
                                }} style={{ width: '48px', height: '48px', background: 'rgba(201,168,76,0.05)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><HiPencil size={20} /></button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', color: '#555577', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                          <th style={{ padding: '15px 24px' }}>Client</th>
                          <th style={{ padding: '15px 24px' }}>Event Details</th>
                          <th style={{ padding: '15px 24px' }}>Status</th>
                          <th style={{ padding: '15px 24px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInquiries.length === 0 ? (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '60px', color: '#555577' }}>No inquiries found in this category.</td>
                          </tr>
                        ) : (
                          filteredInquiries.map(inq => (
                            <motion.tr
                              key={inq._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              onClick={() => { setSelectedInq(inq); setShowViewModal(true); }}
                              style={{ background: 'rgba(255,255,255,0.01)', transition: '0.3s', cursor: 'pointer' }}
                              whileHover={{ background: 'rgba(255, 255, 255, 0.03)' }}
                            >
                              <td style={{ padding: '20px 24px', borderRadius: '16px 0 0 16px' }}>
                                <div
                                  style={{
                                    fontWeight: 600,
                                    color: '#fff',
                                    transition: 'color 0.2s',
                                    display: 'inline-block'
                                  }}
                                >
                                  {inq.name || 'Guest'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#C9A84C' }}>{inq.email}</div>
                                {inq.phone && <div style={{ fontSize: '0.75rem', color: '#7a7a99', marginTop: '4px' }}>{inq.phone}</div>}
                              </td>
                              <td style={{ padding: '20px 24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7a7a99', fontSize: '0.9rem' }}>
                                  <HiCalendar size={14} /> {inq.eventDate ? new Date(inq.eventDate).toLocaleDateString() : 'TBD'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#C9A84C', marginTop: '4px' }}>{inq.eventType}</div>
                                {inq.billing?.totalAmount ? (
                                  <div style={{ fontSize: '0.75rem', color: '#81C784', marginTop: '4px', fontWeight: 600 }}>Total Cost: ₹{inq.billing.totalAmount}</div>
                                ) : (
                                  inq.budget && <div style={{ fontSize: '0.75rem', color: '#C9A84C', marginTop: '4px', fontWeight: 600 }}>Estimated Budget: {inq.budget}</div>
                                )}
                              </td>
                              <td style={{ padding: '20px 24px' }}>
                                <span style={{
                                  padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                                  background: inq.status === 'accepted' ? 'rgba(129, 199, 132, 0.1)' : inq.status === 'rejected' ? 'rgba(239, 83, 80, 0.1)' : inq.status === 'completed' ? 'rgba(79, 195, 247, 0.1)' : 'rgba(255,255,255,0.05)',
                                  color: inq.status === 'accepted' ? '#81C784' : inq.status === 'rejected' ? '#EF5350' : inq.status === 'completed' ? '#4FC3F7' : '#7a7a99',
                                  border: `1px solid ${inq.status === 'accepted' ? '#81C78430' : inq.status === 'rejected' ? '#EF535030' : inq.status === 'completed' ? '#4FC3F730' : '#ffffff10'}`
                                }}>
                                  {inq.status}
                                </span>
                              </td>
                              <td style={{ padding: '20px 24px', borderRadius: '0 16px 16px 0', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                  {inq.status === 'new' && (
                                    <>
                                      <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(inq._id, 'accepted'); }} style={{ background: '#81C784', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Accept</button>
                                      <button onClick={(e) => { e.stopPropagation(); setSelectedInq(inq); setShowRejectModal(true); }} style={{ background: 'rgba(239, 83, 80, 0.1)', color: '#EF5350', border: '1px solid #EF535030', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Reject</button>
                                    </>
                                  )}
                                  {inq.status === 'accepted' && (
                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(inq._id, 'completed'); }} style={{ background: '#4FC3F7', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><HiCheckCircle /> Complete</button>
                                  )}
                                  {(inq.status === 'accepted' || inq.status === 'new') && (
                                    <button onClick={(e) => { e.stopPropagation(); setActiveChat(inq); setActiveTab('chat'); }} style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><HiChatAlt2 /> Chat</button>
                                  )}
                                  <button onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedInq(inq);
                                    setEditForm({
                                      budget: inq.budget || '',
                                      eventDate: inq.eventDate ? inq.eventDate.split('T')[0] : '',
                                      message: inq.message || '',
                                      billing: inq.billing || { items: [], totalAmount: 0, amountPaid: 0 }
                                    });
                                    setShowEditModal(true);
                                  }} style={{ width: '40px', height: '40px', background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><HiPencil /></button>
                                  <button onClick={(e) => { e.stopPropagation(); setSelectedInq(inq); setShowViewModal(true); }} style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><HiEye /></button>
                                </div>
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      {showRejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#111', border: '1px solid #ff444430', borderRadius: '24px', padding: '40px', maxWidth: '500px', width: '100%' }}>
            <h3 style={{ color: '#ff4444', marginBottom: '20px' }}>Reject Inquiry</h3>
            <textarea
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              style={{ width: '100%', height: '120px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', color: '#fff', padding: '15px', outline: 'none', marginBottom: '20px' }}
            />
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => { handleUpdateStatus(selectedInq._id, 'rejected', rejectionReason); setShowRejectModal(false); setRejectionReason(''); }} style={{ flex: 1, background: '#ff4444', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Confirm Reject</button>
              <button onClick={() => setShowRejectModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedInq && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#111', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '32px', padding: '40px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
              <div>
                <h3 style={{ fontSize: '2rem', margin: 0 }}>Inquiry <span className="text-gradient">Details</span></h3>
                <p style={{ color: '#7a7a99' }}>Received on {new Date(selectedInq.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setShowViewModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer' }}>X</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '30px' }}>
              <DetailBlock label="Client Name" value={selectedInq.name} icon={<HiUserCircle />} />
              <DetailBlock label="Event Type" value={selectedInq.eventType} icon={<HiStar />} />
              <DetailBlock label="Email" value={selectedInq.email} icon={<HiMail />} />
              <DetailBlock label="Phone" value={selectedInq.phone || (selectedInq.user && selectedInq.user.phone)} icon={<HiPhone />} />
              <DetailBlock label="Event Date" value={selectedInq.eventDate ? new Date(selectedInq.eventDate).toLocaleDateString() : 'TBD'} icon={<HiCalendar />} />
              <DetailBlock label="Current Status" value={selectedInq.status} icon={<HiBadgeCheck />} />
            </div>

            {selectedInq.user && (
              <div style={{
                marginTop: '30px',
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
                  <HiUserCircle /> Registered Account Profile
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
                  <DetailBlock label="Registered Name" value={selectedInq.user.name} icon={<HiUserCircle />} />
                  <DetailBlock label="Registered Email" value={selectedInq.user.email} icon={<HiMail />} />
                  {selectedInq.user.phone && <DetailBlock label="Registered Phone" value={selectedInq.user.phone} icon={<HiPhone />} />}
                  {selectedInq.user.gender && <DetailBlock label="Gender" value={selectedInq.user.gender?.toUpperCase()} icon={<HiUserCircle />} />}
                  {(selectedInq.user.state || selectedInq.user.country) && (
                    <DetailBlock
                      label="Location"
                      value={`${selectedInq.user.state || ''}${selectedInq.user.state && selectedInq.user.country ? ', ' : ''}${selectedInq.user.country || ''}`}
                      icon={<HiLocationMarker />}
                    />
                  )}
                  {selectedInq.user.language && <DetailBlock label="Language" value={selectedInq.user.language} icon={<HiBadgeCheck />} />}
                </div>
              </div>
            )}

            <div style={{ marginTop: '30px', background: 'rgba(0,0,0,0.2)', padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <span style={{ fontSize: '0.7rem', color: '#555577', textTransform: 'uppercase', display: 'block', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>Billing Summary</span>
              {(selectedInq.billing?.items || []).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedInq.billing.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span style={{ color: '#7a7a99' }}>{item.description}</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>₹{item.amount}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#C9A84C', fontWeight: 800 }}>Total Cost</span>
                    <span style={{ color: '#C9A84C', fontWeight: 800 }}>₹{selectedInq.billing.totalAmount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#81C784' }}>Amount Paid</span>
                    <span style={{ color: '#81C784' }}>₹{selectedInq.billing.amountPaid}</span>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#555577', fontSize: '0.85rem', margin: 0 }}>No billing items added yet.</p>
              )}
            </div>

            <div style={{ marginTop: '20px', background: 'rgba(0,0,0,0.1)', padding: '20px', borderRadius: '20px' }}>
              <span style={{ fontSize: '0.7rem', color: '#555577', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Initial Message</span>
              <p style={{ color: '#7a7a99', lineHeight: 1.6, margin: 0, fontSize: '0.85rem' }}>{selectedInq.message}</p>
            </div>

            {selectedInq.userHistory && selectedInq.userHistory.length > 0 && (
              <div style={{ marginTop: '30px', background: 'rgba(0,0,0,0.2)', padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ fontSize: '0.7rem', color: '#555577', textTransform: 'uppercase', display: 'block', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>Client Event History</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedInq.userHistory.map((hist, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '12px 18px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.03)'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                          {hist.eventType?.split('_').join(' ')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#7a7a99', marginTop: '2px' }}>
                          {hist.service ? `Provider: ${hist.service.name}` : 'Platform Inquiry'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: hist.status === 'accepted' ? 'rgba(129, 199, 132, 0.1)' : hist.status === 'rejected' ? 'rgba(239, 83, 80, 0.1)' : hist.status === 'completed' ? 'rgba(79, 195, 247, 0.1)' : 'rgba(255,255,255,0.05)',
                          color: hist.status === 'accepted' ? '#81C784' : hist.status === 'rejected' ? '#EF5350' : hist.status === 'completed' ? '#4FC3F7' : '#7a7a99'
                        }}>
                          {hist.status}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#555577', marginTop: '6px' }}>
                          {hist.eventDate ? new Date(hist.eventDate).toLocaleDateString() : new Date(hist.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showEditModal && selectedInq && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <form onSubmit={handleUpdateDetails} style={{ background: '#111', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '32px', padding: '40px', maxWidth: '500px', width: '100%' }}>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '30px' }}>Edit <span className="text-gradient">Inquiry</span></h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#555577', textTransform: 'uppercase', marginBottom: '8px' }}>Event Date</label>
                <input
                  type="date"
                  value={editForm.eventDate}
                  onChange={(e) => setEditForm({ ...editForm, eventDate: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#555577', textTransform: 'uppercase', marginBottom: '8px' }}>Budget</label>
                <input
                  type="text"
                  placeholder="e.g. ₹50,000"
                  value={editForm.budget}
                  onChange={(e) => {
                    const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                    const numVal = cleanVal ? Number(cleanVal) : 0;
                    setEditForm({
                      ...editForm,
                      budget: e.target.value,
                      billing: {
                        ...(editForm.billing || { items: [], totalAmount: 0, amountPaid: 0 }),
                        totalAmount: numVal
                      }
                    });
                  }}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#555577', textTransform: 'uppercase', marginBottom: '8px' }}>Client Message</label>
                <textarea
                  value={editForm.message}
                  onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                  style={{ width: '100%', height: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', color: '#fff', outline: 'none', resize: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: '#555577', textTransform: 'uppercase', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>Billing & Services</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                {(editForm.billing?.items || []).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Service name..."
                      value={item.description}
                      onChange={(e) => {
                        const newItems = editForm.billing.items.map((it, i) =>
                          i === idx ? { ...it, description: e.target.value } : it
                        );
                        setEditForm({ ...editForm, billing: { ...editForm.billing, items: newItems } });
                      }}
                      style={{ flex: 2, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.85rem' }}
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={item.amount || ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                        const newItems = editForm.billing.items.map((it, i) =>
                          i === idx ? { ...it, amount: val } : it
                        );
                        const total = newItems.reduce((acc, curr) => acc + (curr.amount || 0), 0);
                        setEditForm({
                          ...editForm,
                          budget: `₹${total}`,
                          billing: { ...editForm.billing, items: newItems, totalAmount: total }
                        });
                      }}
                      style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.85rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newItems = editForm.billing.items.filter((_, i) => i !== idx);
                        const total = newItems.reduce((acc, curr) => acc + (curr.amount || 0), 0);
                        setEditForm({
                          ...editForm,
                          budget: `₹${total}`,
                          billing: { ...editForm.billing, items: newItems, totalAmount: total }
                        });
                      }}
                      style={{ background: 'rgba(239, 83, 80, 0.1)', color: '#EF5350', border: 'none', borderRadius: '8px', width: '35px', cursor: 'pointer' }}
                    >x</button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newItems = [...(editForm.billing?.items || []), { description: '', amount: 0 }];
                    setEditForm({ ...editForm, billing: { ...editForm.billing, items: newItems } });
                  }}
                  style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px dashed rgba(201,168,76,0.3)', padding: '10px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                >+ Add Service Item</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', color: '#555577', marginBottom: '5px' }}>Total Amount</label>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', color: '#fff', fontWeight: 800 }}>₹{editForm.billing?.totalAmount || 0}</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', color: '#555577', marginBottom: '5px' }}>Amount Paid</label>
                  <input
                    type="number"
                    value={editForm.billing?.amountPaid || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : Number(e.target.value);
                      setEditForm({ ...editForm, billing: { ...editForm.billing, amountPaid: val } });
                    }}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: '#fff', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
              <button type="submit" style={{ flex: 1, background: '#C9A84C', color: '#000', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Save Changes</button>
              <button type="button" onClick={() => setShowEditModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {toast.show && (
        <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: toast.type === 'error' ? '#ff4444' : '#C9A84C', color: '#000', padding: '12px 30px', borderRadius: '12px', fontWeight: 700, zIndex: 10000 }}>
          {toast.message}
        </div>
      )}
      {/* Style for hiding scrollbar in tabs wrapper */}
      <style>{`
        .tabs-wrapper::-webkit-scrollbar {
          display: none;
        }
        .tabs-wrapper {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ProviderDashboard;
