import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiMail, HiLockClosed, HiArrowRight } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(email, password);
    if (result.success) {
      if (result.user.role === 'provider') {
        window.location.href = '/dashboard';
      } else if (result.user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    const result = await googleLogin(credentialResponse.credential);
    if (result.success) {
      if (result.user.role === 'provider') {
        window.location.href = '/dashboard';
      } else if (result.user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 20px 60px' }}>
      <div className="particles-bg">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`
          }} />
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
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', color: '#fff', marginBottom: '10px' }}>Welcome <span className="text-gradient">Back</span></h2>
          <p style={{ color: '#7a7a99', fontSize: '0.9rem' }}>Enter your credentials to access your premium dashboard</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444', color: '#ff4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ... existing email/password inputs ... */}
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

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HiLockClosed style={{ color: '#C9A84C' }} /> Password
            </label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <Link to="/forgot-password" style={{ color: '#C9A84C', fontSize: '0.85rem', fontWeight: 500 }}>Forgot Password?</Link>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: '20px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'} <HiArrowRight style={{ marginLeft: '10px' }} />
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ color: '#555', fontSize: '0.8rem', textTransform: 'uppercase' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Login Failed')}
            theme="filled_black"
            shape="pill"
            text="signin_with"
            width="100%"
          />
        </div>

        <p style={{ textAlign: 'center', color: '#7a7a99', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: '#C9A84C', fontWeight: 600 }}>Create Account</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
