import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiUser, HiMail, HiPhone, HiLogout,
  HiPencil, HiX, HiLocationMarker,
  HiBriefcase, HiIdentification, HiTag,
  HiBell, HiClipboardList
} from 'react-icons/hi';
import { FaInstagram } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProfilePage = () => {
  const { user, logout, updateProfile } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', phone: '', email: '', state: '', city: '',
    serviceName: '', serviceType: '', description: '', priceStartsFrom: '', instagram: '', images: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/auth/profile');
      if (data && data.user) {
        setProfileData(data);
        setEditForm({
          name: data.user.name || '',
          phone: data.user.phone || '',
          email: data.user.email || '',
          state: data.user.state || '',
          city: data.user.city || '',
          serviceName: data.user.serviceId?.name || '',
          serviceType: data.user.serviceId?.type || '',
          description: data.user.serviceId?.description || '',
          priceStartsFrom: data.user.serviceId?.priceStartsFrom || '',
          instagram: data.user.serviceId?.instagram || '',
          images: data.user.serviceId?.images?.join(', ') || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    const payload = {
      ...editForm,
      images: editForm.images ? editForm.images.split(',').map(url => url.trim()).filter(url => url) : []
    };
    const result = await updateProfile(payload);
    if (result.success) {
      setIsEditing(false);
      fetchProfile();
    }
    setUpdateLoading(false);
  };

  const handlePortfolioUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    try {
      setIsUploading(true);
      const uploadPromises = files.map(file => {
        const formData = new FormData();
        formData.append('image', file);
        return axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` }
        });
      });
      const responses = await Promise.all(uploadPromises);
      const newUrls = responses.map(res => res.data.url);
      const currentUrls = editForm.images ? editForm.images.split(',').map(u => u.trim()).filter(u => u) : [];
      const updatedUrls = [...currentUrls, ...newUrls].join(', ');
      setEditForm(prev => ({ ...prev, images: updatedUrls }));
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Profile..." />;

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', padding: '120px 20px 80px', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', margin: 0 }}>Profile <span style={{ color: '#C9A84C' }}>Details</span></h1>
            <p style={{ color: '#555', margin: '10px 0 0', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', fontWeight: 800 }}>Account & Service Overview</p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => setIsEditing(!isEditing)} style={{ background: isEditing ? 'rgba(255,255,255,0.05)' : 'rgba(201,168,76,0.1)', border: `1px solid ${isEditing ? 'rgba(255,255,255,0.1)' : '#C9A84C'}`, color: isEditing ? '#fff' : '#C9A84C', padding: '12px 25px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
            <button onClick={logout} style={{ background: 'none', border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444', padding: '12px 25px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Logout</button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div className="form-group"><label>Full Name</label><input className="form-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
                <div className="form-group"><label>Email Address</label><input className="form-input" value={editForm.email} disabled style={{ opacity: 0.5 }} /></div>
                <div className="form-group"><label>Phone Number</label><input className="form-input" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} /></div>
                <div className="form-group"><label>State/Region</label><input className="form-input" value={editForm.state} onChange={e => setEditForm({...editForm, state: e.target.value})} /></div>
                <div className="form-group"><label>City</label><input className="form-input" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} /></div>
                
                {profileData?.user.role === 'provider' && (
                  <div style={{ gridColumn: '1 / -1', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '40px' }}>
                    <h3 style={{ color: '#C9A84C', marginBottom: '30px' }}>Service Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                      <div className="form-group"><label>Business Name</label><input className="form-input" value={editForm.serviceName} onChange={e => setEditForm({...editForm, serviceName: e.target.value})} /></div>
                      <div className="form-group"><label>Service Type</label>
                        <select className="form-input" value={editForm.serviceType} onChange={e => setEditForm({...editForm, serviceType: e.target.value})}>
                          <option value="photography">Photography</option>
                          <option value="videography">Videography</option>
                          <option value="catering">Catering</option>
                          <option value="decoration">Decoration</option>
                          <option value="music">Music / DJ</option>
                          <option value="security">Security</option>
                          <option value="total_event_organisation">Total Event Organisation</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>About Service</label><textarea className="form-input" style={{ minHeight: '120px' }} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} /></div>
                      
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Demo Images Gallery</label>
                        <div style={{ background: 'rgba(0,0,0,0.2)', border: '2px dashed rgba(255,255,255,0.1)', padding: '40px', borderRadius: '20px', textAlign: 'center', marginBottom: '20px' }}>
                          <input type="file" multiple hidden id="up-img" onChange={handlePortfolioUpload} accept="image/*" />
                          <label htmlFor="up-img" style={{ cursor: 'pointer', color: '#C9A84C', fontWeight: 700 }}>{isUploading ? 'Uploading...' : 'Add Demo Images'}</label>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                          {editForm.images && editForm.images.split(',').map((url, i) => (
                            <div key={i} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden' }}>
                              <img src={url.trim()} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                              <button type="button" onClick={() => {
                                const updated = editForm.images.split(',').filter((_, idx) => idx !== i).join(', ');
                                setEditForm({ ...editForm, images: updated });
                              }} style={{ position: 'absolute', top: '2px', right: '2px', background: '#ff4444', border: 'none', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer' }}>✕</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ gridColumn: '1 / -1', marginTop: '30px' }}>
                  <button type="submit" disabled={updateLoading} style={{ width: '100%', background: '#C9A84C', color: '#000', border: 'none', padding: '18px', borderRadius: '14px', fontWeight: 900, cursor: 'pointer' }}>
                    {updateLoading ? 'Saving...' : 'Save All Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              
              {/* Quick Navigation Cards - For Laptop/Desktop */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <motion.div 
                  whileHover={{ scale: 1.02, borderColor: '#C9A84C' }}
                  onClick={() => navigate('/notifications')}
                  style={{ 
                    background: 'rgba(201,168,76,0.05)', 
                    padding: '30px', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(201,168,76,0.2)', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    transition: '0.3s'
                  }}
                >
                  <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(201,168,76,0.1)', color: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                    <HiBell />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Notifications</h4>
                    <p style={{ margin: '5px 0 0', color: '#7a7a99', fontSize: '0.85rem' }}>View your latest alerts and activity.</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02, borderColor: '#C9A84C' }}
                  onClick={() => navigate('/history')}
                  style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    padding: '30px', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(255,255,255,0.08)', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    transition: '0.3s'
                  }}
                >
                  <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(255,255,255,0.05)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                    <HiClipboardList />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Event History</h4>
                    <p style={{ margin: '5px 0 0', color: '#7a7a99', fontSize: '0.85rem' }}>Track your premium event inquiries.</p>
                  </div>
                </motion.div>
              </div>

              {/* User Details Card */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ color: '#C9A84C', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}><HiUser /> User Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
                  <InfoItem label="Full Name" value={profileData?.user.name} />
                  <InfoItem label="Email Address" value={profileData?.user.email} />
                  <InfoItem label="Phone" value={profileData?.user.phone || 'Not provided'} />
                  <InfoItem label="Location" value={`${profileData?.user.city ? profileData.user.city + ', ' : ''}${profileData?.user.state || 'Global'}`} />
                  <InfoItem label="Account Type" value={profileData?.user.role.toUpperCase()} />
                </div>
              </div>

              {/* Service Details Card (For Providers) */}
              {profileData?.user.role === 'provider' && (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 style={{ color: '#C9A84C', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}><HiBriefcase /> Service Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
                      <InfoItem label="Business Name" value={profileData?.user.serviceId?.name || profileData?.user.name} />
                      <InfoItem label="Category" value={profileData?.user.serviceId?.type?.replace('_', ' ').toUpperCase()} />
                      <InfoItem label="Starting From" value={profileData?.user.serviceId?.priceStartsFrom || 'On Request'} />
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px' }}>
                      <InfoItem label="About Service" value={profileData?.user.serviceId?.description || 'No description provided.'} vertical />
                    </div>
                    
                    {/* Demo Images */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px' }}>
                      <p style={{ color: '#555', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', fontWeight: 800 }}>Demo Work Gallery</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                        {profileData?.user.serviceId?.images?.map((img, i) => (
                          <div key={i} style={{ height: '180px', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Demo" />
                          </div>
                        )) || <p style={{ color: '#333' }}>No images uploaded.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .form-input { width: 100%; padding: 15px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; font-size: 1rem; }
        .form-group label { display: block; color: #555; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; fontWeight: 800; }
        @media (max-width: 768px) { form { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};

const InfoItem = ({ label, value, vertical }) => (
  <div style={{ display: vertical ? 'block' : 'flex', flexDirection: 'column' }}>
    <span style={{ color: '#555', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px', fontWeight: 800 }}>{label}</span>
    <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.6 }}>{value}</span>
  </div>
);

export default ProfilePage;
