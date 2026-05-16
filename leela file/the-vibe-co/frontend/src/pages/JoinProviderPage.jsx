import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineUserGroup, HiOutlineIdentification, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineClipboardList, HiCheckCircle, HiCamera, HiTrash, HiPlus } from 'react-icons/hi';
import axios from 'axios';

const JoinProviderPage = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    serviceType: 'catering',
    city: '',
    state: '',
    description: '',
    instagram: '',
    logo: '',
    images: []
  });

  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const serviceTypes = [
    { value: 'catering', label: 'Catering' },
    { value: 'photography', label: 'Photography' },
    { value: 'videography', label: 'Videography' },
    { value: 'decoration', label: 'Decoration' },
    { value: 'music', label: 'Music' },
    { value: 'security', label: 'Security' },
    { value: 'total_event_organisation', label: 'Total Event Organisation' }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    try {
      if (type === 'logo') setUploadingLogo(true);
      else setUploadingImages(true);

      const res = await axios.post('/api/upload/public', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (type === 'logo') {
        setFormData(prev => ({ ...prev, logo: res.data.url }));
      } else {
        setFormData(prev => ({ ...prev, images: [...prev.images, res.data.url] }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Image upload failed. Please try again.');
    } finally {
      setUploadingLogo(false);
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data } = await axios.post('/api/providers/apply', formData);
      if (data.success) {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: '120px 20px' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ maxWidth: '600px', textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.03)', borderRadius: '32px', border: '1px solid #C9A84C' }}
        >
          <HiCheckCircle style={{ fontSize: '5rem', color: '#C9A84C', marginBottom: '24px' }} />
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', marginBottom: '20px' }}>Application Submitted!</h1>
          <p style={{ color: '#7a7a99', lineHeight: 1.8, fontSize: '1.1rem' }}>
            Thank you for your interest in joining <strong>THE VIBE CO.</strong> elite partner network. 
            Our team will review your portfolio and contact you shortly.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn btn-primary"
            style={{ marginTop: '40px', padding: '16px 40px' }}
          >
            Return to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', paddingTop: '120px', paddingBottom: '100px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.9rem', fontWeight: 700, display: 'block', marginBottom: '16px' }}
          >
            Partner Network
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '24px' }}
          >
            Join the <span className="text-gradient">Elite</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ color: '#7a7a99', maxWidth: '700px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.8 }}
          >
            Showcase your excellence. Upload your portfolio and business details to become a verified VIBE CO. partner.
          </motion.p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '60px', alignItems: 'start' }}>
          {/* Instructions Column */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 style={{ fontSize: '1.8rem', marginBottom: '32px', fontFamily: "'Playfair Display', serif" }}>Application Checklist</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {[
                { title: 'Business Identity', desc: 'Provide your official business name and a high-resolution logo.', icon: <HiOutlineIdentification /> },
                { title: 'Visual Portfolio', desc: 'Upload up to 5 demo images showcasing your best work.', icon: <HiOutlineUserGroup /> },
                { title: 'Contact Precision', desc: 'Ensure your phone and email are correct for orchestrator outreach.', icon: <HiOutlinePhone /> }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ 
                    width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(201, 168, 76, 0.1)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: '#C9A84C', flexShrink: 0
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 style={{ color: '#C9A84C', fontSize: '1.1rem', marginBottom: '8px' }}>{item.title}</h4>
                    <p style={{ color: '#7a7a99', lineHeight: 1.6, fontSize: '0.95rem' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Logo Preview */}
            {formData.logo && (
              <div style={{ marginTop: '48px', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(201,168,76,0.2)', textAlign: 'center' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '16px' }}>Business Logo</h4>
                <img src={formData.logo} alt="Logo Preview" style={{ maxWidth: '120px', height: '120px', objectFit: 'contain', margin: '0 auto', borderRadius: '12px' }} />
                <button onClick={() => setFormData(p => ({...p, logo: ''}))} style={{ marginTop: '12px', background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.8rem' }}>Remove Logo</button>
              </div>
            )}
          </motion.div>

          {/* Form Column */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{ background: 'rgba(255,255,255,0.02)', padding: '48px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="form-group">
                <label className="form-label">Business Name</label>
                <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} className="form-input" placeholder="Elite Catering Services" required />
              </div>

              {/* Logo Upload */}
              <div className="form-group">
                <label className="form-label">Business Logo</label>
                <div style={{ 
                  border: '1px dashed rgba(201, 168, 76, 0.3)', padding: '20px', borderRadius: '16px', textAlign: 'center', cursor: 'pointer',
                  background: 'rgba(201, 168, 76, 0.02)', transition: '0.3s'
                }} onClick={() => document.getElementById('logo-upload').click()}>
                  <HiPlus style={{ fontSize: '2rem', color: '#C9A84C', marginBottom: '10px' }} />
                  <p style={{ fontSize: '0.85rem', color: '#7a7a99' }}>{uploadingLogo ? 'Uploading...' : 'Click to upload business logo'}</p>
                  <input type="file" id="logo-upload" hidden onChange={(e) => handleFileUpload(e, 'logo')} accept="image/*" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Contact Person</label>
                  <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="form-input" placeholder="John Doe" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Service Type</label>
                  <select name="serviceType" value={formData.serviceType} onChange={handleChange} className="form-input">
                    {serviceTypes.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email & Phone</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="john@example.com" required />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input" placeholder="+91 98765 43210" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location (City & State)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} className="form-input" placeholder="Mumbai" required />
                  <input type="text" name="state" value={formData.state} onChange={handleChange} className="form-input" placeholder="Maharashtra" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Business Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="form-input" style={{ minHeight: '100px' }} placeholder="Describe your expertise..." required></textarea>
              </div>

              {/* Demo Images Upload */}
              <div className="form-group">
                <label className="form-label">Portfolio Demo Images (Up to 5)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                  {formData.images.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button onClick={() => removeImage(idx)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}><HiTrash size={14} /></button>
                    </div>
                  ))}
                  {formData.images.length < 5 && (
                    <div 
                      onClick={() => document.getElementById('images-upload').click()}
                      style={{ height: '80px', border: '1px dashed #C9A84C', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(201,168,76,0.05)' }}
                    >
                      <HiPlus style={{ color: '#C9A84C' }} />
                      <input type="file" id="images-upload" hidden onChange={(e) => handleFileUpload(e, 'images')} accept="image/*" />
                    </div>
                  )}
                </div>
                {uploadingImages && <p style={{ fontSize: '0.75rem', color: '#C9A84C' }}>Uploading image...</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Instagram Portfolio (Optional)</label>
                <input type="url" name="instagram" value={formData.instagram} onChange={handleChange} className="form-input" placeholder="https://instagram.com/yourbrand" />
              </div>

              {error && <p style={{ color: '#ff4d4d', fontSize: '0.9rem' }}>{error}</p>}

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading || uploadingLogo || uploadingImages}
                style={{ width: '100%', padding: '18px', marginTop: '12px' }}
              >
                {loading ? 'Submitting Application...' : 'Apply to Join Network'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JoinProviderPage;
