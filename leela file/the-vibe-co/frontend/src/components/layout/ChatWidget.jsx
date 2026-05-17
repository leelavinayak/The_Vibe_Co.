import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiChatAlt2, HiX, HiPaperAirplane, HiArrowLeft,
  HiUserCircle, HiClock, HiCheckCircle, HiPaperClip,
  HiDotsVertical, HiTrash, HiPencil, HiDownload
} from 'react-icons/hi';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showOptions, setShowOptions] = useState(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  if (!user || user.role === 'admin' || user.role === 'provider') return null;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClick = () => setShowOptions(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchUserInquiries();
      const interval = setInterval(fetchUserInquiries, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat._id);
      markAsRead(activeChat._id);
      const interval = setInterval(() => {
        fetchMessages(activeChat._id);
        markAsRead(activeChat._id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserInquiries = async () => {
    try {
      const { data } = await axios.get('/api/contact/my-inquiries', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setInquiries(data.filter(inq => inq.status !== 'rejected'));
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    }
  };

  const fetchMessages = async (bookingId) => {
    try {
      const { data } = await axios.get(`/api/chat/${bookingId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const markAsRead = async (bookingId) => {
    try {
      await axios.put(`/api/chat/read/${bookingId}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchUserInquiries();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const receiverId = activeChat.service?.providerId || 'admin';
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
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data: uploadData } = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      });

      const fileType = file.type.includes('image') ? 'image' : 'pdf';
      const receiverId = activeChat.service?.providerId || 'admin';

      const { data } = await axios.post('/api/chat', {
        bookingId: activeChat._id,
        receiverId,
        fileUrl: uploadData.url,
        fileType
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setMessages(prev => [...prev, data]);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await axios.delete(`/api/chat/${msgId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessages(prev => prev.filter(m => m._id !== msgId));
      setShowOptions(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleEditMessage = async (e) => {
    e.preventDefault();
    if (!editValue.trim() || !editingMessage) return;

    try {
      const { data } = await axios.put(`/api/chat/${editingMessage}`, {
        text: editValue
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessages(prev => prev.map(m => m._id === editingMessage ? { ...m, text: data.text, isEdited: true } : m));
      setEditingMessage(null);
      setEditValue('');
    } catch (err) {
      console.error('Edit failed:', err);
    }
  };

  // WhatsApp-style sorting: Recent activity first
  const sortedInquiries = [...inquiries].sort((a, b) => {
    const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : new Date(a.createdAt).getTime();
    const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : new Date(b.createdAt).getTime();
    return timeB - timeA;
  });

  return (
    <div style={{ position: 'fixed', bottom: isMobile ? '20px' : '30px', right: isMobile ? '20px' : '30px', zIndex: 1000 }}>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9, rotate: -5 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: isMobile ? '64px' : '68px',
          height: isMobile ? '64px' : '68px',
          borderRadius: '22px',
          background: 'linear-gradient(135deg, #C9A84C, #a68b3d)',
          color: '#000',
          border: 'none',
          boxShadow: '0 15px 35px rgba(201, 168, 76, 0.4), inset 0 2px 10px rgba(255,255,255,0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isMobile ? '1.8rem' : '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent)', transform: 'translateX(-100%)', animation: 'shimmer 3s infinite' }} />
        <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
        {isOpen ? <HiX /> : <HiChatAlt2 />}
        {inquiries.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0) > 0 && !isOpen && (
          <span style={{ position: 'absolute', top: '5px', right: '5px', background: '#ff3b30', color: '#fff', fontSize: '0.75rem', minWidth: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, border: '2px solid #000', boxShadow: '0 4px 10px rgba(255,59,48,0.4)' }}>
            {inquiries.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0)}
          </span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              bottom: isMobile ? '0' : '110px',
              right: isMobile ? '0' : '30px',
              width: isMobile ? '100vw' : '420px',
              height: isMobile ? '100vh' : '650px',
              background: 'rgba(10, 10, 10, 0.95)',
              borderRadius: isMobile ? '0' : '32px',
              border: isMobile ? 'none' : '1px solid rgba(201,168,76,0.3)',
              boxShadow: '0 50px 100px rgba(0,0,0,0.9)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backdropFilter: 'blur(40px)',
              zIndex: 1001,
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            {/* Glossy Header */}
            <div style={{
              padding: isMobile ? '60px 25px 25px' : '25px',
              background: 'linear-gradient(180deg, rgba(201,168,76,0.1) 0%, transparent 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                {activeChat ? (
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setActiveChat(null)}
                    style={{ background: 'rgba(201,168,76,0.1)', border: 'none', color: '#C9A84C', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <HiArrowLeft size={22} />
                  </motion.button>
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(201,168,76,0.2)' }}>
                    <HiChatAlt2 size={26} color="#C9A84C" />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff', letterSpacing: '-0.5px' }}>{activeChat ? activeChat.service?.name || 'Concierge' : 'Conversations'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#C9A84C', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C9A84C', boxShadow: '0 0 10px #C9A84C' }}></span>
                    {activeChat ? 'Verified Partner' : 'Premium Network'}
                  </div>
                </div>
                {isMobile && (
                  <button
                    onClick={() => setIsOpen(false)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '42px', height: '42px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <HiX size={24} />
                  </button>
                )}
              </div>
              {!activeChat && (
                <div style={{ position: 'relative' }}>
                  <input
                    type="text" placeholder="Search your premium bookings..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px 20px', borderRadius: '16px', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: '0.3s' }}
                    onFocus={(e) => e.target.style.borderColor = '#C9A84C'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              )}
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
              {!activeChat ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sortedInquiries
                    .filter(inq => (inq.service?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (inq.eventType || '').toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(inq => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        key={inq._id} onClick={() => setActiveChat(inq)}
                        style={{
                          padding: '18px',
                          background: 'rgba(255,255,255,0.02)',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          display: 'flex',
                          gap: '18px',
                          alignItems: 'center',
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}
                        whileHover={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(201,168,76,0.2)', x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', border: '1px solid rgba(201,168,76,0.1)', color: '#C9A84C' }}>
                          {inq.service?.type?.charAt(0).toUpperCase() || 'E'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inq.service?.name || inq.eventType}</span>
                            <span style={{ fontSize: '0.7rem', color: '#7a7a99', fontWeight: 500 }}>{inq.lastMessage ? new Date(inq.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: inq.unreadCount > 0 ? '#fff' : '#7a7a99', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: inq.unreadCount > 0 ? 700 : 400 }}>
                              {inq.lastMessage ? inq.lastMessage.text || '📷 Shared a file' : `Booking for ${inq.eventType}`}
                            </span>
                            {inq.unreadCount > 0 && (
                              <span style={{ background: 'linear-gradient(135deg, #C9A84C, #a68b3d)', color: '#000', fontSize: '0.7rem', minWidth: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, boxShadow: '0 4px 10px rgba(201, 168, 76, 0.3)' }}>
                                {inq.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  }
                </div>
              ) : (
                /* Chat Messages */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {messages.map((msg, i) => {
                    const isOwn = (msg.sender?._id || msg.sender) === user._id;
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        key={msg._id || i}
                        onContextMenu={(e) => { e.preventDefault(); setShowOptions(msg._id); }}
                        style={{
                          maxWidth: '85%',
                          padding: '15px 20px',
                          borderRadius: isOwn ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                          alignSelf: isOwn ? 'flex-end' : 'flex-start',
                          background: isOwn ? 'linear-gradient(135deg, #C9A84C, #a68b3d)' : 'rgba(255,255,255,0.06)',
                          color: isOwn ? '#000' : '#fff',
                          fontSize: '0.95rem',
                          position: 'relative',
                          boxShadow: isOwn ? '0 8px 25px rgba(201,168,76,0.25)' : '0 8px 25px rgba(0,0,0,0.2)',
                          backdropFilter: 'blur(10px)',
                          border: isOwn ? 'none' : '1px solid rgba(255,255,255,0.05)',
                          lineHeight: 1.5
                        }}
                      >
                        {msg.fileType === 'image' && <img src={msg.fileUrl} style={{ width: '100%', borderRadius: '16px', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.1)' }} />}
                        {msg.fileType === 'pdf' && (
                          <a href={msg.fileUrl} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'inherit', textDecoration: 'none', background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '14px', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HiDownload size={22} /></div>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Document.pdf</span>
                          </a>
                        )}
                        <div style={{ fontWeight: isOwn ? 600 : 400 }}>{msg.text}</div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px', marginTop: '8px', opacity: 0.5, fontSize: '0.65rem', fontWeight: 600 }}>
                          {msg.isEdited && <span>(edited)</span>}
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isOwn && <HiCheckCircle size={14} color={isOwn ? '#000' : '#C9A84C'} />}
                        </div>

                        {showOptions === msg._id && (msg.sender?._id === user._id || msg.sender === user._id) && (
                          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'absolute', top: '100%', right: 0, background: '#1a1a1a', borderRadius: '16px', zIndex: 10, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', marginTop: '5px' }}>
                            <button onClick={() => { setEditingMessage(msg._id); setEditValue(msg.text); setShowOptions(null); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 20px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}><HiPencil /> Edit Message</button>
                            <button onClick={() => handleDeleteMessage(msg._id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 20px', background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}><HiTrash /> Delete Message</button>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Premium Input Section */}
            {activeChat && (
              <div style={{ padding: '25px', background: 'rgba(10, 10, 10, 0.8)', borderTop: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
                {editingMessage ? (
                  <form onSubmit={handleEditMessage} style={{ display: 'flex', gap: '12px' }}>
                    <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px 22px', borderRadius: '18px', color: '#fff', outline: 'none' }} />
                    <button type="submit" style={{ background: '#C9A84C', border: 'none', color: '#000', padding: '0 25px', borderRadius: '18px', fontWeight: 800, fontSize: '0.9rem' }}>Save</button>
                    <button onClick={() => setEditingMessage(null)} style={{ background: 'none', border: 'none', color: '#7a7a99', fontWeight: 600 }}>Cancel</button>
                  </form>
                ) : (
                  <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      type="button" onClick={() => fileInputRef.current.click()}
                      style={{ background: 'rgba(201,168,76,0.1)', border: 'none', color: '#C9A84C', cursor: 'pointer', width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <HiPaperClip size={24} />
                    </motion.button>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input
                        type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..."
                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px 22px', borderRadius: '22px', color: '#fff', outline: 'none', fontSize: '0.95rem' }}
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, x: 3 }} whileTap={{ scale: 0.9 }}
                      type="submit"
                      style={{
                        width: '52px', height: '52px', borderRadius: '18px',
                        background: 'linear-gradient(135deg, #C9A84C, #a68b3d)',
                        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#000', cursor: 'pointer', boxShadow: '0 8px 20px rgba(201,168,76,0.3)'
                      }}
                    >
                      <HiPaperAirplane style={{ transform: 'rotate(90deg)', fontSize: '1.4rem' }} />
                    </motion.button>
                  </form>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWidget;
