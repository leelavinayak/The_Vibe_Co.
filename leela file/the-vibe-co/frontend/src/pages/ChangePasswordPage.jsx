import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiLockClosed, HiShieldCheck, HiX, HiKey, HiArrowLeft, HiCheck } from 'react-icons/hi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ChangePasswordPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [passwordStep, setPasswordStep] = useState('idle'); // idle, otp-sent, verified
  const [otpValue, setOtpValue] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const handleRequestOTP = async () => {
    setPasswordLoading(true);
    setPasswordMsg({ type: '', text: '' });
    try {
      const { data } = await axios.post('/api/auth/change-password-otp');
      setPasswordStep('otp-sent');
      setPasswordMsg({ type: 'success', text: data.message });
    } catch (error) {
      setPasswordMsg({ type: 'error', text: error.response?.data?.message || 'Failed to send OTP' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg({ type: '', text: '' });
    try {
      const { data } = await axios.post('/api/auth/change-password', { otp: otpValue, newPassword });
      setPasswordMsg({ type: 'success', text: data.message });
      setPasswordStep('verified');
      setTimeout(() => navigate('/profile'), 2000);
    } catch (error) {
      setPasswordMsg({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '140px 20px 80px', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 50% 0%, rgba(201, 168, 76, 0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        <button 
          onClick={() => navigate('/profile')} 
          style={{ background: 'none', border: 'none', color: '#C9A84C', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '30px', padding: 0, fontSize: '1rem', fontWeight: 600 }}
        >
          <HiArrowLeft /> Back to Profile
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(15,15,15,0.6)', padding: '50px', borderRadius: '32px', border: '1px solid rgba(201,168,76,0.15)', backdropFilter: 'blur(30px)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A84C', fontSize: '1.8rem' }}>
              <HiLockClosed />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '2rem', fontFamily: "'Playfair Display', serif" }}>Change Password</h2>
              <p style={{ margin: '8px 0 0', color: '#7a7a99', fontSize: '0.95rem' }}>Secure your account with a new password.</p>
            </div>
          </div>

          {/* Step indicator */}
          {passwordStep !== 'verified' && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
              {['Request OTP', 'Verify & Set Password'].map((step, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    height: '4px', borderRadius: '2px', marginBottom: '10px',
                    background: (passwordStep === 'idle' && i === 0) || (passwordStep === 'otp-sent' && i <= 1)
                      ? '#C9A84C' : 'rgba(255,255,255,0.05)'
                  }} />
                  <span style={{ fontSize: '0.75rem', color: '#555577', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{step}</span>
                </div>
              ))}
            </div>
          )}

          {/* Status message */}
          <AnimatePresence>
            {passwordMsg.text && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden', marginBottom: '30px' }}
              >
                <div style={{
                  padding: '16px 20px', borderRadius: '16px',
                  background: passwordMsg.type === 'success' ? 'rgba(76,175,80,0.1)' : 'rgba(255,68,68,0.1)',
                  border: `1px solid ${passwordMsg.type === 'success' ? 'rgba(76,175,80,0.2)' : 'rgba(255,68,68,0.2)'}`,
                  color: passwordMsg.type === 'success' ? '#81C784' : '#ff6b6b',
                  fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500
                }}>
                  {passwordMsg.type === 'success' ? <HiShieldCheck style={{ fontSize: '1.2rem' }}/> : <HiX style={{ fontSize: '1.2rem' }}/>}
                  {passwordMsg.text}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {passwordStep === 'idle' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '24px', background: 'rgba(201,168,76,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px', fontSize: '2.5rem', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.1)' }}>
                <HiKey />
              </div>
              <p style={{ color: '#d4d4e6', marginBottom: '35px', lineHeight: 1.7, fontSize: '1.05rem' }}>
                We will send a secure 6-digit OTP to your registered email.<br />
                <strong style={{ color: '#C9A84C', display: 'block', marginTop: '10px' }}>{user?.email}</strong>
              </p>
              <button
                onClick={handleRequestOTP}
                disabled={passwordLoading}
                className="btn btn-primary"
                style={{ padding: '18px 40px', fontSize: '1.05rem', borderRadius: '16px', width: '100%' }}
              >
                {passwordLoading ? 'Sending Verification Code...' : 'Send OTP to Email'}
              </button>
            </div>
          )}

          {passwordStep === 'otp-sent' && (
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div>
                <label style={{ color: '#555577', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'block', fontWeight: 600 }}>Enter Verification Code (OTP)</label>
                <input
                  type="text"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="------"
                  className="form-input"
                  style={{ textAlign: 'center', fontSize: '2rem', letterSpacing: '15px', fontWeight: 700, padding: '20px' }}
                  required
                  maxLength={6}
                />
              </div>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ color: '#555577', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'block', fontWeight: 600 }}>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="form-input"
                    style={{ padding: '16px' }}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label style={{ color: '#555577', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'block', fontWeight: 600 }}>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="form-input"
                    style={{ padding: '16px' }}
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleRequestOTP}
                  disabled={passwordLoading}
                  style={{ flex: '1 1 150px', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#d4d4e6', cursor: 'pointer', fontWeight: 600, transition: '0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  Resend OTP
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading || otpValue.length !== 6}
                  className="btn btn-primary"
                  style={{ flex: '2 1 200px', padding: '16px', borderRadius: '16px', fontSize: '1.05rem' }}
                >
                  {passwordLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}

          {passwordStep === 'verified' && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(76,175,80,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px', color: '#81C784', border: '2px solid rgba(76,175,80,0.3)' }}>
                <HiCheck style={{ fontSize: '3.5rem' }} />
              </div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '15px' }}>Password Changed!</h3>
              <p style={{ color: '#7a7a99', marginBottom: '30px', fontSize: '1.1rem' }}>Redirecting to your profile...</p>
              <button onClick={() => navigate('/profile')} className="btn btn-primary" style={{ padding: '16px 40px', borderRadius: '16px' }}>
                Return to Profile Now
              </button>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
