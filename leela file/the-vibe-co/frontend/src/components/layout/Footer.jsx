import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaInstagram, FaTwitter, FaFacebookF, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi';

import { useAuth } from '../../context/AuthContext';

const Footer = () => {
  const { user } = useAuth();
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  const isAdminDashboard = location.pathname === '/admin' || (location.pathname === '/' && user?.role === 'admin');
  if (isAdminDashboard) return null;

  const footerLinks = {
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'Our Services', path: '/services' },
      { label: 'Gallery', path: '/gallery' },
      { label: 'Contact', path: '/contact' },
    ],
    events: [
      { label: 'Weddings', path: '/events?category=wedding' },
      { label: 'Corporate', path: '/events?category=corporate' },
      { label: 'Concerts', path: '/events?category=concert' },
      { label: 'Private Parties', path: '/events?category=private' },
    ],
    support: [
      { label: 'FAQ', path: '/' },
      { label: 'Terms & Conditions', path: '/' },
      { label: 'Join as Service Member', path: '/join-as-provider' },
      { label: 'Privacy Policy', path: '/' },
    ],
  };

  const socials = [
    { icon: <FaInstagram />, url: '#', label: 'Instagram' },
    // { icon: <FaTwitter />, url: '#', label: 'Twitter' },
    // { icon: <FaFacebookF />, url: '#', label: 'Facebook' },
    { icon: <FaLinkedinIn />, url: '#', label: 'LinkedIn' },
    { icon: <FaYoutube />, url: '#', label: 'YouTube' },
  ];

  return (
    <footer style={{
      background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)',
      borderTop: '1px solid rgba(201, 168, 76, 0.15)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative top line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '200px',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)',
      }} />

      <div className="container" style={{ padding: '80px 2rem 40px' }}>
        {/* Top Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '48px',
          marginBottom: '60px',
        }}>
          {/* Brand Column */}
          <div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.8rem',
              fontWeight: 700,
              background: 'linear-gradient(90deg, #C9A84C, #FFD700, #C9A84C)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '20px',
            }}>
              THE VIBE CO.
            </div>
            <p style={{
              color: '#7a7a99',
              fontSize: '0.95rem',
              lineHeight: 1.8,
              marginBottom: '24px',
            }}>
              Crafting unforgettable experiences with elegance, precision, and a touch of gold. We turn your vision into reality.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {socials.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.url}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -3 }}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '1px solid rgba(201, 168, 76, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#C9A84C',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease',
                    background: 'rgba(201, 168, 76, 0.05)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#C9A84C';
                    e.currentTarget.style.color = '#0a0a0a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(201, 168, 76, 0.05)';
                    e.currentTarget.style.color = '#C9A84C';
                  }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#C9A84C',
                marginBottom: '24px',
              }}>
                {title}
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {links.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      to={link.path}
                      style={{
                        color: '#7a7a99',
                        fontSize: '0.9rem',
                        transition: 'all 0.3s ease',
                        fontFamily: "'Outfit', sans-serif",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#C9A84C';
                        e.target.style.paddingLeft = '8px';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#7a7a99';
                        e.target.style.paddingLeft = '0';
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          <div>
            <h4 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#C9A84C',
              marginBottom: '24px',
            }}>
              Get in Touch
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#7a7a99' }}>
                <HiMail style={{ color: '#C9A84C', fontSize: '1.1rem' }} />
                <span style={{ fontSize: '0.9rem' }}>thevibeco2026@gmail.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#7a7a99' }}>
                <HiPhone style={{ color: '#C9A84C', fontSize: '1.1rem' }} />
                <span style={{ fontSize: '0.9rem' }}>+91 8523086151</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: '#7a7a99' }}>
                <HiLocationMarker style={{ color: '#C9A84C', fontSize: '1.1rem', marginTop: '4px' }} />
                <span style={{ fontSize: '0.9rem' }}>Tirupati, Andhra pradesh 517501<br /></span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(201, 168, 76, 0.1)',
          paddingTop: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <p style={{
            color: '#555577',
            fontSize: '0.85rem',
            fontFamily: "'Outfit', sans-serif",
          }}>
            © {currentYear} THE VIBE CO. All rights reserved.
          </p>
          <p style={{
            color: '#555577',
            fontSize: '0.8rem',
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: '2px',
          }}>
            CRAFTED WITH <span style={{ color: '#C9A84C' }}>♦</span> EXCELLENCE
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
