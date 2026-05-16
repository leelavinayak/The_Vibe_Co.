import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiMail, HiLockClosed, HiKey, HiArrowRight, HiShieldCheck } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await forgotPassword(email);
    if (result.success) {
      setStep(2);
      setMessage({ text: 'OTP sent to your email. Please check your inbox.', type: 'success' });
    } else {
      setMessage({ text: result.message, type: 'error' });
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await resetPassword(email, otp, newPassword);
    if (result.success) {
      setMessage({ text: 'Password reset successful! Redirecting to login...', type: 'success' });
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setMessage({ text: result.message, type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 20px 60px' }}>
      <div className="particles-bg">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="particle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s` }} />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: '450px',
          background: 'rgba(20, 20, 20, 0.8)',
          backdropFilter: 'blur(10px)',
          padding: '40px',
          borderRadius: '20px',
          border: '1px solid rgba(201, 168, 76, 0.2)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', color: '#fff', marginBottom: '10px' }}>Reset <span className="text-gradient">Password</span></h2>
          <p style={{ color: '#7a7a99', fontSize: '0.9rem' }}>
            {step === 1 ? 'Enter your registered email to receive an OTP' : 'Enter the OTP sent to your email and your new password'}
          </p>
        </div>

        {message.text && (
          <div style={{ 
            background: message.type === 'error' ? 'rgba(255, 68, 68, 0.1)' : 'rgba(76, 175, 80, 0.1)', 
            border: `1px solid ${message.type === 'error' ? '#ff4444' : '#4caf50'}`, 
            color: message.type === 'error' ? '#ff4444' : '#4caf50', 
            padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center' 
          }}>
            {message.text}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOTP}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiMail style={{ color: '#C9A84C' }} /> Email Address
              </label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '20px' }} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'} <HiArrowRight style={{ marginLeft: '10px' }} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiShieldCheck style={{ color: '#C9A84C' }} /> Enter OTP
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiLockClosed style={{ color: '#C9A84C' }} /> New Password
              </label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '20px' }} disabled={loading}>
              {loading ? 'Resetting...' : 'Change Password'} <HiShieldCheck style={{ marginLeft: '10px' }} />
            </button>
            
            <div style={{ textAlign: 'center' }}>
              <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#C9A84C', fontSize: '0.85rem', cursor: 'pointer' }}>Resend OTP</button>
            </div>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login" style={{ color: '#7a7a99', fontSize: '0.9rem' }}>Back to Login</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
