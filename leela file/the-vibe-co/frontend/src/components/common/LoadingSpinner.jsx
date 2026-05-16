import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = "Preparing your premium experience..." }) => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: "'Outfit', sans-serif"
    }}>
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Pulsating Logo Container */}
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ 
            fontFamily: "'Playfair Display', serif", 
            fontSize: '2.2rem', 
            color: '#fff', 
            letterSpacing: '8px', 
            marginBottom: '40px',
            textShadow: '0 0 20px rgba(201,168,76,0.3)'
          }}
        >
          THE VIBE <span style={{ color: '#C9A84C' }}>CO.</span>
        </motion.div>

        {/* Premium Spinner */}
        <div style={{ position: 'relative', width: '60px', height: '60px' }}>
          {/* Outer ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid rgba(201,168,76,0.1)',
              borderTopColor: '#C9A84C'
            }}
          />
          {/* Inner ring (slower, opposite direction) */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            style={{
              position: 'absolute',
              inset: '8px',
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.05)',
              borderBottomColor: '#C9A84C'
            }}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ 
            color: '#7a7a99', 
            fontSize: '0.85rem', 
            marginTop: '30px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontWeight: 600
          }}
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
