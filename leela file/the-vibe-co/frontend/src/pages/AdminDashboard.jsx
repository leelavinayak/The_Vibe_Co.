import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiChartBar, HiClipboardList, HiUsers, HiStar,
  HiSearch, HiCheckCircle, HiTrash, HiBell,
  HiTrendingUp, HiUserGroup, HiOutlineShieldCheck,
  HiShieldCheck,
  HiX, HiPencil, HiMail, HiPhone, HiLocationMarker,
  HiUserCircle, HiIdentification, HiArrowLeft,
  HiBadgeCheck, HiSparkles, HiClock, HiLogout, HiMenu,
  HiCamera, HiCake, HiColorSwatch, HiCube
} from 'react-icons/hi';
import { FaInstagram } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ProfilePage from './ProfilePage';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -20, x: '-50%' }}
      style={{
        position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
        background: type === 'error' ? 'rgba(255, 68, 68, 0.9)' : 'rgba(40, 167, 69, 0.9)',
        color: '#fff', padding: '12px 24px', borderRadius: '8px', zIndex: 9999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px'
      }}
    >
      {type === 'error' ? <HiOutlineShieldCheck /> : <HiCheckCircle />}
      {message}
    </motion.div>
  );
};

// Add responsive CSS via a styled component or global style
const styles = `
  @media (max-width: 1024px) {
    .admin-sidebar {
      width: 320px !important;
      left: 0;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
    }
    .admin-sidebar.open {
      transform: translateX(0);
    }
    .admin-main {
      margin-left: 0 !important;
      padding: 100px 16px 40px !important;
    }
    .admin-hamburger {
      display: flex !important;
    }
  }
  @media (max-width: 768px) {
    .stat-grid {
      grid-template-columns: 1fr !important;
      gap: 16px !important;
    }
    .admin-sidebar {
      width: 100% !important;
    }
  }
  @media (min-width: 1025px) {
    .admin-sidebar {
      transform: none !important;
    }
  }
`;

const categories = [
  { id: 'photography', name: 'Photography', icon: <HiCamera />, color: '#C9A84C', desc: 'Capture the essence of every moment with elite vision.' },
  { id: 'videography', name: 'Videography', icon: <HiCamera />, color: '#C9A84C', desc: 'Cinematic storytelling through high-end production.' },
  { id: 'catering', name: 'Catering', icon: <HiCake />, color: '#C9A84C', desc: 'Exquisite culinary experiences for sophisticated palates.' },
  { id: 'decoration', name: 'Decoration', icon: <HiColorSwatch />, color: '#C9A84C', desc: 'Transform spaces into breathtaking visual masterpieces.' },
  { id: 'music', name: 'Music', icon: <HiCube />, color: '#C9A84C', desc: 'Symphonies that set the perfect mood for your event.' },
  { id: 'security', name: 'Security', icon: <HiCube />, color: '#C9A84C', desc: 'Professional safety and crowd management services.' },
  { id: 'total_event_organisation', name: 'Total Event Organisation', icon: <HiCube />, color: '#C9A84C', desc: 'Seamless orchestration of high-performance events.' },
];

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

const SidebarItem = ({ icon, label, active, onClick, count }) => (
  <motion.button
    whileHover={{ x: 8, background: 'rgba(201, 168, 76, 0.08)' }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '18px', padding: '16px 24px', borderRadius: '20px',
      background: active ? 'linear-gradient(135deg, rgba(201, 168, 76, 0.15), rgba(201, 168, 76, 0.05))' : 'transparent',
      color: active ? '#C9A84C' : '#7a7a99',
      border: '1px solid',
      borderColor: active ? 'rgba(201, 168, 76, 0.3)' : 'transparent',
      cursor: 'pointer', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)', textAlign: 'left', width: '100%',
      fontFamily: "'Outfit', sans-serif", fontSize: '0.9rem', fontWeight: active ? 700 : 500,
      boxShadow: active ? '0 10px 20px rgba(0,0,0,0.2)' : 'none'
    }}
  >
    <span style={{ fontSize: '24px', filter: active ? 'drop-shadow(0 0 8px rgba(201,168,76,0.3))' : 'none' }}>{icon}</span>
    <span style={{ letterSpacing: '0.8px', textTransform: 'uppercase', fontSize: '0.75rem' }}>{label}</span>
    {count > 0 && (
      <span style={{
        marginLeft: 'auto', background: '#C9A84C', color: '#0a0a0a',
        fontSize: '0.65rem', padding: '3px 10px', borderRadius: '10px', fontWeight: 900,
        boxShadow: '0 4px 10px rgba(201, 168, 76, 0.3)'
      }}>{count}</span>
    )}
  </motion.button>
);

const getImageUrl = (images, fallback = 'https://via.placeholder.com/600x400?text=The+Vibe+Co') => {
  if (!images) return fallback;
  if (Array.isArray(images)) {
    if (images.length === 0) return fallback;
    const first = images[0];
    if (Array.isArray(first)) return getImageUrl(first, fallback);
    return first || fallback;
  }
  return images || fallback;
};

const StatCard = ({ label, value, icon, color, trend }) => (
  <motion.div
    whileHover={{ y: -8, boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
    style={{
      background: 'linear-gradient(145deg, rgba(20, 20, 20, 0.8), rgba(10, 10, 10, 0.95))', 
      padding: '35px', borderRadius: '32px',
      border: '1px solid rgba(255,255,255,0.03)', backdropFilter: 'blur(30px)',
      display: 'flex', alignItems: 'center', gap: '30px', position: 'relative', overflow: 'hidden'
    }}
  >
    <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', background: `${color}08`, borderRadius: '50%', filter: 'blur(50px)' }} />
    <div style={{ width: '72px', height: '72px', borderRadius: '22px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: color, border: `1px solid ${color}20` }}>{icon}</div>
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-1px' }}>{value}</div>
        {trend && (
          <div style={{ background: 'rgba(76, 175, 80, 0.1)', padding: '4px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <HiTrendingUp style={{ color: '#4caf50', fontSize: '12px' }} />
            <span style={{ color: '#4caf50', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>{trend}</span>
          </div>
        )}
      </div>
      <div style={{ color: '#555577', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '3px', marginTop: '12px', fontWeight: 800 }}>{label}</div>
    </div>
  </motion.div>
);

const DetailItem = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A84C' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '0.75rem', color: '#555577', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
      <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 500 }}>{value}</div>
    </div>
  </div>
);

const InquiryTable = ({ inquiries, onUpdate, onInquiryClick }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
      <thead>
        <tr style={{ textAlign: 'left', color: '#555577' }}>
          <th style={{ padding: '15px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Client Info</th>
          <th style={{ padding: '15px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Selected Provider</th>
          <th style={{ padding: '15px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Event & Date</th>
          <th style={{ padding: '15px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Status</th>
          <th style={{ padding: '15px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'right' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(inquiries) && inquiries.map(inq => (
          <motion.tr
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            key={inq._id}
            style={{ background: 'rgba(255,255,255,0.02)', transition: '0.3s', cursor: 'pointer' }}
            onClick={() => onInquiryClick ? onInquiryClick(inq) : null}
            whileHover={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <td style={{ padding: '20px 24px', borderRadius: '16px 0 0 16px' }}>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>{inq.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#C9A84C', marginTop: '2px' }}>{inq.email}</div>
              {inq.phone && <div style={{ fontSize: '0.75rem', color: '#555577', marginTop: '4px' }}>{inq.phone}</div>}
              {inq.user?.state && <div style={{ fontSize: '0.7rem', color: '#444', marginTop: '2px' }}>{inq.user.state}, {inq.user.country}</div>}
            </td>
            <td style={{ padding: '20px 24px' }}>
              {inq.service ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img 
                    src={getImageUrl(inq.service.images, 'https://via.placeholder.com/40')} 
                    alt="" 
                    style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} 
                  />
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{inq.service.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#7a7a99', textTransform: 'capitalize' }}>{inq.service.type.replace(/_/g, ' ')}</div>
                  </div>
                </div>
              ) : (
                <span style={{ color: '#444', fontSize: '0.85rem' }}>Direct Inquiry</span>
              )}
            </td>
            <td style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'capitalize', color: '#C9A84C', fontWeight: 500 }}>
                {inq.eventType === 'photography' && <HiCamera />}
                {inq.eventType === 'catering' && <HiCake />}
                {inq.eventType}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#555577', marginTop: '4px' }}>{new Date(inq.createdAt).toLocaleDateString()}</div>
            </td>
            <td style={{ padding: '20px 24px' }}>
              <div style={{ 
                padding: '6px 14px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: inq.status === 'new' ? 'rgba(76, 175, 80, 0.08)' : inq.status === 'accepted' ? 'rgba(79, 195, 247, 0.08)' : 'rgba(255,255,255,0.03)',
                color: inq.status === 'new' ? '#4caf50' : inq.status === 'accepted' ? '#4FC3F7' : '#7a7a99',
                border: `1px solid ${inq.status === 'new' ? 'rgba(76, 175, 80, 0.1)' : inq.status === 'accepted' ? 'rgba(79, 195, 247, 0.1)' : 'rgba(255,255,255,0.05)'}`
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
                {inq.status}
              </div>
            </td>
            <td style={{ padding: '20px 24px', borderRadius: '0 16px 16px 0', textAlign: 'right' }}>
              <select
                value={inq.status}
                onChange={(e) => onUpdate(inq._id, e.target.value)}
                style={{ background: '#111', border: '1px solid #222', color: '#fff', padding: '10px 16px', borderRadius: '12px', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
              >
                <option value="new">New</option>
                <option value="accepted">Accept</option>
                <option value="rejected">Reject</option>
                <option value="completed">Complete</option>
              </select>
            </td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  </div>
);

const UserTable = ({ users, onUserClick }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
      <thead>
        <tr style={{ textAlign: 'left', color: '#555577' }}>
          <th style={{ padding: '15px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>User Details</th>
          <th style={{ padding: '15px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Contact Info</th>
          <th style={{ padding: '15px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Permissions</th>
          <th style={{ padding: '15px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'right' }}>Created</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(users) && users.map(u => (
          <tr key={u._id} style={{ background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }} onClick={() => onUserClick(u)}>
            <td style={{ padding: '20px 24px', borderRadius: '16px 0 0 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(201,168,76,0.1)', color: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{u.name?.charAt(0) || '?'}</div>
                <div style={{ fontWeight: 600, color: '#fff', textDecoration: 'none', borderBottom: 'none' }}>{u.name}</div>
              </div>
            </td>
            <td style={{ padding: '20px 24px' }}>
              <div style={{ color: '#d4d4e6', fontSize: '0.9rem' }}>{u.email}</div>
              <div style={{ color: '#555577', fontSize: '0.8rem', marginTop: '4px' }}>{u.phone || 'No phone'}</div>
            </td>
            <td style={{ padding: '20px 24px' }}>
              <span style={{ color: u.role === 'admin' ? '#C9A84C' : '#fff', background: u.role === 'admin' ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>{u.role.toUpperCase()}</span>
            </td>
            <td style={{ padding: '20px 24px', borderRadius: '0 16px 16px 0', textAlign: 'right', color: '#555577', fontSize: '0.85rem' }}>
              {new Date(u.createdAt).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const AdminDashboard = () => {
  console.log('AdminDashboard loading...');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isMobileRestriction, setIsMobileRestriction] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobileRestriction(window.innerWidth < 1024);
    };
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ users: [], inquiries: [], reviews: [], services: [], providerApplications: [] });
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInquiries: 0,
    pendingInquiries: 0,
    totalReviews: 0,
    acceptedInquiries: 0,
    pendingProviderApplications: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(50);
  const [userLimit, setUserLimit] = useState(50);
  const [inquiriesLimit, setInquiriesLimit] = useState(50);
  const [hubInquiriesLimit, setHubInquiriesLimit] = useState(50);
  const [providerAppsLimit, setProviderAppsLimit] = useState(50);
  const [reviewsLimit, setReviewsLimit] = useState(50);
  const [notificationsLimit, setNotificationsLimit] = useState(50);
  const [filterState, setFilterState] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', phone: '', role: 'user', state: '', gender: '', country: 'India', language: 'English', password: '' });

  // Sidebar items definition
  const sidebarItems = [
    { icon: <HiChartBar />, label: 'Control Center', active: activeTab === 'overview', onClick: () => { setActiveTab('overview'); setIsSidebarOpen(false); } },
    { icon: <HiClipboardList />, label: 'Event Queue', active: activeTab === 'inquiries', onClick: () => { setActiveTab('inquiries'); setIsSidebarOpen(false); }, count: stats.pendingInquiries },
    { icon: <HiBell />, label: 'System Alerts', active: activeTab === 'notifications', onClick: () => { setActiveTab('notifications'); setIsSidebarOpen(false); }, count: notifications.filter(n => !n.read).length },
    { icon: <HiCake />, label: 'Service Hub', active: activeTab === 'services', onClick: () => { setActiveTab('services'); setIsSidebarOpen(false); } },
    { icon: <HiBadgeCheck />, label: 'Partner Applications', active: activeTab === 'provider_applications', onClick: () => { setActiveTab('provider_applications'); setIsSidebarOpen(false); }, count: stats.pendingProviderApplications },
    { icon: <HiUsers />, label: 'User Details', active: activeTab === 'users', onClick: () => { setActiveTab('users'); setIsSidebarOpen(false); } },
    { icon: <HiStar />, label: 'Review Moderation', active: activeTab === 'reviews', onClick: () => { setActiveTab('reviews'); setIsSidebarOpen(false); } },
  ];

  // User Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [userEditForm, setUserEditForm] = useState({ name: '', email: '', phone: '', role: '', state: '', gender: '', country: '', language: '' });
  const [userInquiries, setUserInquiries] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [selectedServiceHub, setSelectedServiceHub] = useState(null);
  const [serviceHubSubTab, setServiceHubSubTab] = useState('inquiries');
  const [memberSearch, setMemberSearch] = useState('');
  const [inquirySearch, setInquirySearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [passwordModal, setPasswordModal] = useState({ show: false, appId: null, contactPerson: '', status: '' });
  const [newPassword, setNewPassword] = useState('vibe-co-partner');
  const [userSubTab, setUserSubTab] = useState('users');

  const handlePasswordSubmit = async () => {
    try {
      await axios.put(`/api/providers/applications/${passwordModal.appId}`, 
        { status: passwordModal.status, password: newPassword }, 
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchAdminData();
      showToast('Application status updated');
      setPasswordModal({ show: false, appId: null, contactPerson: '', status: '' });
      setNewPassword('vibe-co-partner');
    } catch (err) {
      showToast('Update failed', 'error');
    }
  };
  const [placeSearch, setPlaceSearch] = useState('');
  const [memberLimit, setMemberLimit] = useState(50);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAdminData();
    fetchNotifications();
  }, [user, navigate]);

  // Mobile access check removed to allow responsiveness

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get('/api/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete('/api/notifications');
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
        const [usersRes, inquiriesRes, reviewsRes, servicesRes, providerAppsRes] = await Promise.all([
          axios.get('/api/admin/users', { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get('/api/admin/inquiries', { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get('/api/admin/reviews', { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get('/api/services'),
          axios.get('/api/providers/applications', { headers: { Authorization: `Bearer ${user.token}` } })
        ]);
      const users = usersRes.data || [];
      const inquiries = inquiriesRes.data || [];
      const reviews = reviewsRes.data || [];
      const services = servicesRes.data || [];
      const providerApps = providerAppsRes.data || [];

      setData({
        users,
        inquiries,
        reviews,
        services,
        providerApplications: providerApps
      });

      setStats({
        totalUsers: users.length,
        totalInquiries: inquiries.length,
        pendingInquiries: inquiries.filter(i => i?.status === 'new').length,
        acceptedInquiries: inquiries.filter(i => i?.status === 'accepted').length,
        totalReviews: reviews.length,
        pendingProviderApplications: providerApps.filter(a => a?.status === 'pending').length
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (user) => {
    try {
      setModalLoading(true);
      setSelectedUser(user);
      setIsUserModalOpen(true);
      const { data } = await axios.get(`/api/admin/users/${user._id}`);
      setUserInquiries(data.inquiries);
      setUserEditForm({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || '',
        role: data.user.role,
        state: data.user.state || '',
        gender: data.user.gender || '',
        country: data.user.country || '',
        language: data.user.language || ''
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleInquiryClick = async (inq) => {
    try {
      setModalLoading(true);
      setSelectedInquiry(inq);
      setIsInquiryModalOpen(true);

      // Also fetch user details if user exists
      if (inq.user) {
        const userId = typeof inq.user === 'object' ? inq.user._id : inq.user;
        const { data } = await axios.get(`/api/admin/users/${userId}`);
        setSelectedUser(data.user);
        setUserInquiries(data.inquiries);
      } else {
        setSelectedUser(null);
        setUserInquiries([]);
      }
    } catch (error) {
      console.error('Error fetching inquiry/user details:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const { data: updatedUser } = await axios.put(`/api/admin/users/${selectedUser._id}`, userEditForm, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSelectedUser(updatedUser);
      setIsEditingUser(false);
      fetchAdminData();
      showToast('User details updated successfully', 'success');
    } catch (error) {
      console.error('Update User Error:', error);
      showToast(`Update failed: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/users', newUserForm, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setIsAddUserModalOpen(false);
      setNewUserForm({ name: '', email: '', phone: '', role: 'user', state: '', gender: '', country: 'India', language: 'English', password: '' });
      fetchAdminData();
      showToast('User created successfully', 'success');
    } catch (error) {
      console.error('Add User Error:', error);
      showToast(`Failed to add user: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const handleUpdateInquiry = async (id, updates) => {
    try {
      const payload = typeof updates === 'string' ? { status: updates } : updates;
      await axios.put(`/api/admin/inquiries/${id}`, payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchAdminData();
      // Update local modal inquiries if open
      setUserInquiries(prev => prev.map(i => i._id === id ? { ...i, ...payload } : i));
      
      if (typeof updates !== 'string') {
         setSelectedInquiry(prev => ({ ...prev, ...payload }));
         showToast('Inquiry details updated successfully', 'success');
      }
    } catch (error) {
      console.error('Update Inquiry Error:', error);
      showToast(`Update failed: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm('Delete this review?')) {
      try {
        await axios.delete(`/api/admin/reviews/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        fetchAdminData();
        showToast('Review deleted successfully', 'success');
      } catch (error) {
        showToast('Delete failed', 'error');
      }
    }
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsUploading(true);
      const { data } = await axios.post('/api/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      });
      setServiceForm(prev => ({ 
        ...prev, 
        images: Array.isArray(prev.images) ? [...prev.images, data.url] : [data.url] 
      }));
      setIsUploading(false);
    } catch (error) {
      console.error('Image Upload Error:', error);
      const msg = error.response?.data?.message || error.message;
      if (msg.includes('Not authorized as admin')) {
        showToast('Your session has expired. Please logout and login again.', 'error');
      } else {
        showToast(`Upload failed: ${msg}`, 'error');
      }
      setIsUploading(false);
    }
  };
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '', type: 'photography', description: '', priceStartsFrom: '',
    state: '', city: '', instagram: '', email: '', phone: '', features: '', images: []
  });

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      const { _id, __v, createdAt, updatedAt, ...rest } = serviceForm;
      const payload = {
        ...rest,
        features: typeof serviceForm.features === 'string' 
          ? serviceForm.features.split(',').map(f => f.trim()).filter(f => f !== '') 
          : (Array.isArray(serviceForm.features) ? serviceForm.features.filter(f => f !== '') : []),
        images: (Array.isArray(serviceForm.images) ? serviceForm.images : [serviceForm.images]).filter(img => img && typeof img === 'string')
      };
      
      console.log('Submitting Service Payload:', payload);

      if (editingService) {
        await axios.put(`/api/services/${editingService._id}`, payload, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      } else {
        await axios.post('/api/services', payload, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }
      setIsServiceModalOpen(false);
      fetchAdminData();
      showToast('Service saved successfully', 'success');
    } catch (error) {
      console.error('Service Submission Error:', error);
      const msg = error.response?.data?.message || error.message;
      if (msg.includes('Not authorized as admin')) {
        showToast('Your session has expired. Please logout and login again.', 'error');
      } else {
        showToast(`Operation failed: ${msg}`, 'error');
      }
    }
  };

  const handleDeleteService = async (id) => {
    if (window.confirm('Delete this service?')) {
      try {
        await axios.delete(`/api/services/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        fetchAdminData();
        showToast('Service deleted successfully', 'success');
      } catch (error) {
        showToast('Delete failed', 'error');
      }
    }
  };

  const openServiceModal = (svc = null) => {
    if (svc) {
      setEditingService(svc);
      setServiceForm({
        ...svc,
        features: Array.isArray(svc.features) ? svc.features.join(', ') : (svc.features || ''),
        images: Array.isArray(svc.images) ? svc.images : (svc.images ? [svc.images] : [])
      });
    } else {
      setEditingService(null);
      setServiceForm({
        name: '', type: 'photography', description: '', priceStartsFrom: '',
        state: '', city: '', instagram: '', email: '', phone: '', features: '', images: []
      });
    }
    setIsServiceModalOpen(true);
  };
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '80px' }}>
              <StatCard label="Total Clients" value={stats.totalUsers} icon={<HiUserGroup />} color="#C9A84C" trend="+8% New" />
              <StatCard label="Active Inquiries" value={stats.totalInquiries} icon={<HiClipboardList />} color="#4FC3F7" trend="High Demand" />
              <StatCard label="Accepted Events" value={stats.acceptedInquiries} icon={<HiCheckCircle />} color="#81C784" trend="Confirmed" />
              <StatCard label="Verified Reviews" value={stats.totalReviews} icon={<HiStar />} color="#FFD54F" trend="98% Positive" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
              <div style={{ background: 'rgba(15,15,15,0.4)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.03)', backdropFilter: 'blur(30px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', margin: 0, color: '#C9A84C' }}>Recent Applications</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#555577', textTransform: 'uppercase', letterSpacing: '1px' }}>Show:</span>
                    <select
                      value={limit}
                      onChange={(e) => setLimit(e.target.value === 'all' ? 10000 : parseInt(e.target.value))}
                      style={{ background: '#111', border: '1px solid #222', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="30">30</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                </div>
                <InquiryTable inquiries={data.inquiries.slice(0, limit)} onUpdate={handleUpdateInquiry} onInquiryClick={handleInquiryClick} />
              </div>
            </div>
          </motion.div>
        );
      case 'inquiries':
        return (
          <motion.div key="inquiries" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ background: 'rgba(15,15,15,0.4)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', margin: 0, color: '#C9A84C' }}>Global Inquiries</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#555577', textTransform: 'uppercase', letterSpacing: '1px' }}>Show:</span>
                    <select
                      value={inquiriesLimit}
                      onChange={(e) => setInquiriesLimit(e.target.value === 'all' ? 10000 : parseInt(e.target.value))}
                      style={{ background: '#111', border: '1px solid #222', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="30">30</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => {
                      const csvContent = "data:text/csv;charset=utf-8," 
                        + ["Name,Email,Type,Status,Date"].join(",") + "\n"
                        + data.inquiries.map(i => `${i.name},${i.email},${i.eventType},${i.status},${new Date(i.createdAt).toLocaleDateString()}`).join("\n");
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", "global_inquiries.csv");
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                    }}
                    className="btn btn-outline" style={{ padding: '12px 25px', borderRadius: '14px' }}
                  >
                    Download All Inquiries
                  </button>
                </div>
              </div>
              <InquiryTable inquiries={filteredInquiries.slice(0, inquiriesLimit)} onUpdate={handleUpdateInquiry} onInquiryClick={handleInquiryClick} />
            </div>
          </motion.div>
        );
      case 'services':
        if (selectedServiceHub) {
          const filteredMembers = data.services
            .filter(s => s.type === selectedServiceHub)
            .filter(s => 
              (s.name || '').toLowerCase().includes(memberSearch.toLowerCase()) ||
              (s.email || '').toLowerCase().includes(memberSearch.toLowerCase()) ||
              (s.city || '').toLowerCase().includes(memberSearch.toLowerCase())
            );

          const filteredHubInquiries = data.inquiries
            .filter(i => i.eventType === selectedServiceHub)
            .filter(i => {
              const nameMatch = (i.name || '').toLowerCase().includes(inquirySearch.toLowerCase());
              const dateMatch = !dateFilter || new Date(i.createdAt).toLocaleDateString().includes(dateFilter);
              const locationMatch = !placeSearch || (
                (i.user?.state && i.user.state.toLowerCase().includes(placeSearch.toLowerCase())) ||
                (i.user?.country && i.user.country.toLowerCase().includes(placeSearch.toLowerCase())) ||
                (i.message && i.message.toLowerCase().includes(placeSearch.toLowerCase()))
              );
              return nameMatch && dateMatch && locationMatch;
            });

          return (
            <motion.div key="service-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                <button 
                  onClick={() => setSelectedServiceHub(null)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '12px', borderRadius: '12px', cursor: 'pointer' }}
                >
                  <HiArrowLeft />
                </button>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', margin: 0, textTransform: 'capitalize', color: '#C9A84C' }}>
                  {selectedServiceHub.replace(/_/g, ' ')} <span className="text-gradient">Management</span>
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '16px', width: 'fit-content' }}>
                <button 
                  onClick={() => setServiceHubSubTab('inquiries')}
                  style={{ 
                    padding: '12px 25px', borderRadius: '12px', border: 'none', 
                    background: serviceHubSubTab === 'inquiries' ? '#C9A84C' : 'transparent',
                    color: serviceHubSubTab === 'inquiries' ? '#000' : '#7a7a99',
                    fontWeight: 700, cursor: 'pointer', transition: '0.3s'
                  }}
                >
                  Recent Enquiries & Books
                </button>
                <button 
                  onClick={() => setServiceHubSubTab('members')}
                  style={{ 
                    padding: '12px 25px', borderRadius: '12px', border: 'none', 
                    background: serviceHubSubTab === 'members' ? '#C9A84C' : 'transparent',
                    color: serviceHubSubTab === 'members' ? '#000' : '#7a7a99',
                    fontWeight: 700, cursor: 'pointer', transition: '0.3s'
                  }}
                >
                  Service Members History
                </button>
              </div>

              {serviceHubSubTab === 'inquiries' ? (
                <div style={{ background: 'rgba(15,15,15,0.4)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ position: 'relative' }}>
                      <HiSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#C9A84C' }} />
                      <input 
                        type="text" 
                        placeholder="Search User (Name/Email)..." 
                        value={inquirySearch}
                        onChange={(e) => setInquirySearch(e.target.value)}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 12px 12px 45px', borderRadius: '12px', color: '#fff', outline: 'none' }}
                      />
                    </div>
                    <div style={{ position: 'relative' }}>
                      <HiClock style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#C9A84C' }} />
                      <input 
                        type="date" 
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 12px 12px 45px', borderRadius: '12px', color: '#fff', outline: 'none' }}
                      />
                    </div>
                    <div style={{ position: 'relative' }}>
                      <HiLocationMarker style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#C9A84C' }} />
                      <input 
                        type="text" 
                        placeholder="Search Place (State/City)..." 
                        value={placeSearch}
                        onChange={(e) => setPlaceSearch(e.target.value)}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 12px 12px 45px', borderRadius: '12px', color: '#fff', outline: 'none' }}
                      />
                    </div>
                    <button 
                      onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8," 
                          + ["Name,Email,Type,Status,Date,Place"].join(",") + "\n"
                          + filteredHubInquiries.map(i => `${i.name},${i.email},${i.eventType},${i.status},${new Date(i.createdAt).toLocaleDateString()},${i.user?.state || ''}`).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", `${selectedServiceHub}_inquiries.csv`);
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                      }}
                      className="btn btn-outline"
                      style={{ padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      Download Inquiries
                    </button>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#555577', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Show:</span>
                      <select 
                        value={hubInquiriesLimit}
                        onChange={(e) => setHubInquiriesLimit(e.target.value === 'all' ? 10000 : parseInt(e.target.value))}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px', color: '#fff', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="30">30</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="all">All</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <InquiryTable inquiries={filteredHubInquiries.slice(0, hubInquiriesLimit)} onUpdate={handleUpdateInquiry} onInquiryClick={handleInquiryClick} />
                  </div>
                </div>
              ) : (
                <div style={{ background: 'rgba(15,15,15,0.4)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                      <HiSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#C9A84C' }} />
                      <input 
                        type="text" 
                        placeholder="Search Service Members..." 
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 12px 12px 45px', borderRadius: '12px', color: '#fff', outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#555577', textTransform: 'uppercase' }}>Limit:</span>
                      <select 
                        value={memberLimit}
                        onChange={(e) => setMemberLimit(e.target.value === 'all' ? 10000 : parseInt(e.target.value))}
                        style={{ background: '#111', border: '1px solid #222', color: '#fff', padding: '8px 15px', borderRadius: '10px', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="30">30</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="all">All</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '35px' }}>
                    {filteredMembers.slice(0, memberLimit).map(svc => (
                      <motion.div 
                        key={svc._id} 
                        whileHover={{ y: -10 }}
                        style={{ 
                          background: 'rgba(255,255,255,0.02)', 
                          borderRadius: '32px', 
                          border: '1px solid rgba(255,255,255,0.05)',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                          transition: '0.4s'
                        }}
                      >
                        <div style={{ position: 'relative', height: '220px', width: '100%' }}>
                          <img 
                            src={getImageUrl(svc.images, 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80')} 
                            alt={svc.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x220' }}
                          />
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.8))' }} />
                          <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
                            <div style={{ color: '#C9A84C', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>{svc.type.replace(/_/g, ' ')}</div>
                            <h4 style={{ margin: 0, fontSize: '1.4rem', color: '#fff', fontFamily: "'Playfair Display', serif" }}>{svc.name}</h4>
                          </div>
                          <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.8rem', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                            {svc.city}
                          </div>
                        </div>

                        <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <p style={{ color: '#7a7a99', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 20px 0', height: '3.8em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                            {svc.description}
                          </p>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', textAlign: 'center' }}>
                              <div style={{ fontSize: '0.65rem', color: '#555577', textTransform: 'uppercase', marginBottom: '4px' }}>Starting Price</div>
                              <div style={{ fontSize: '0.95rem', color: '#C9A84C', fontWeight: 700 }}>{svc.priceStartsFrom}</div>
                            </div>
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', textAlign: 'center' }}>
                              <div style={{ fontSize: '0.65rem', color: '#555577', textTransform: 'uppercase', marginBottom: '4px' }}>Expertise</div>
                              <div style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 700 }}>{svc.rating ? `${svc.rating}/5` : 'Elite'}</div>
                            </div>
                          </div>

                          <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                            <button 
                              onClick={() => { setSelectedMember(svc); setIsMemberModalOpen(true); }}
                              style={{ flex: 2, padding: '12px', borderRadius: '14px', background: '#C9A84C', color: '#000', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                              <HiUserCircle size={18} /> View Profile
                            </button>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => openServiceModal(svc)} style={{ padding: '12px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}><HiPencil /></button>
                              <button onClick={() => handleDeleteService(svc._id)} style={{ padding: '12px', borderRadius: '14px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444', cursor: 'pointer' }}><HiTrash /></button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        }

        return (
          <motion.div key="services" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              marginBottom: '60px',
              flexDirection: window.innerWidth < 768 ? 'column' : 'row',
              gap: '20px'
            }}>
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', margin: 0, color: '#C9A84C' }}>Service <span className="text-gradient">Hub</span></h3>
                <p style={{ color: '#7a7a99', marginTop: '10px', fontSize: '1.1rem' }}>Manage your premium service ecosystem and provider partnerships.</p>
              </div>
              <button 
                onClick={() => openServiceModal()}
                className="btn btn-primary" 
                style={{ 
                  padding: '18px 35px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  boxShadow: '0 10px 30px rgba(201, 168, 76, 0.2)',
                  borderRadius: '16px'
                }}
              >
                <HiSparkles /> Add Service Provider
              </button>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
              gap: '30px', 
              marginBottom: '80px' 
            }}>
              {categories.map(({ id: type, icon, color, desc, name }) => (
                <motion.div 
                  key={type} 
                  whileHover={{ y: -12, scale: 1.02 }}
                  onClick={() => setSelectedServiceHub(type)}
                  style={{ 
                    background: 'linear-gradient(145deg, rgba(20,20,20,0.8), rgba(10,10,10,0.9))', 
                    padding: '40px', 
                    borderRadius: '32px', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: `${color}05`, borderRadius: '50%', filter: 'blur(60px)' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: `${color}10`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', border: `1px solid ${color}20` }}>
                      {icon}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#555577', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800 }}>Capacity</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{(data?.services || []).filter(s => s?.type === type).length}</div>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '1.4rem', margin: '0 0 12px 0', color: '#fff', fontWeight: 700, fontFamily: "'Playfair Display', serif", lineHeight: 1.3 }}>
                    {type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </h4>
                  <p style={{ color: '#7a7a99', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '35px', maxWidth: '90%' }}>{desc}</p>
                  
                  <div style={{ marginTop: '20px' }}>
                    <button 
                      onClick={() => setSelectedServiceHub(type)}
                      style={{ 
                        width: '100%', 
                        background: 'rgba(201, 168, 76, 0.1)', 
                        border: '1px solid rgba(201, 168, 76, 0.3)', 
                        color: '#C9A84C', 
                        padding: '12px', 
                        borderRadius: '12px', 
                        fontSize: '0.85rem', 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        transition: '0.3s'
                      }}
                      onMouseOver={(e) => e.target.style.background = 'rgba(201, 168, 76, 0.2)'}
                      onMouseOut={(e) => e.target.style.background = 'rgba(201, 168, 76, 0.1)'}
                    >
                      Manage {type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </button>
                  </div>
                  
                  <div style={{ marginTop: '40px', paddingTop: '25px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555577', fontSize: '0.85rem' }}>
                      <HiClock /> Recent Volume
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '8px' }}>
                      {(data?.inquiries || []).filter(i => i?.eventType === type).length} Inquiries
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      case 'provider_applications':
        return (
          <motion.div key="provider_applications" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ background: 'rgba(15,15,15,0.4)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', margin: 0, color: '#C9A84C' }}>Partner Applications</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#555577', textTransform: 'uppercase', letterSpacing: '1px' }}>Show:</span>
                    <select
                      value={providerAppsLimit}
                      onChange={(e) => setProviderAppsLimit(e.target.value === 'all' ? 10000 : parseInt(e.target.value))}
                      style={{ background: '#111', border: '1px solid #222', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="30">30</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#7a7a99' }}>{(data?.providerApplications || []).length} total requests</span>
                </div>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#555577' }}>
                      <th style={{ padding: '15px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Business & Contact</th>
                      <th style={{ padding: '15px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Service & Location</th>
                      <th style={{ padding: '15px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Status</th>
                      <th style={{ padding: '15px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'right' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.providerApplications.slice(0, providerAppsLimit).map(app => (
                      <tr key={app._id} style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '20px 24px', borderRadius: '16px 0 0 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {app.logo && <img src={app.logo} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain', background: 'rgba(255,255,255,0.05)' }} />}
                            <div>
                              <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.1rem' }}>{app.businessName}</div>
                              <div style={{ fontSize: '0.85rem', color: '#C9A84C', marginTop: '2px' }}>{app.contactPerson}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#7a7a99', marginTop: '8px' }}>{app.email} | {app.phone}</div>
                        </td>
                        <td style={{ padding: '20px 24px' }}>
                          <div style={{ color: '#fff', textTransform: 'capitalize', fontWeight: 500 }}>{app.serviceType.replace(/_/g, ' ')}</div>
                          <div style={{ fontSize: '0.85rem', color: '#7a7a99', marginTop: '4px' }}>{app.city}, {app.state}</div>
                          {app.images && app.images.length > 0 && (
                            <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                              {app.images.slice(0, 3).map((img, i) => (
                                <img key={i} src={img} alt="" style={{ width: '30px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} />
                              ))}
                              {app.images.length > 3 && <span style={{ fontSize: '0.7rem', color: '#C9A84C' }}>+{app.images.length - 3}</span>}
                            </div>
                          )}
                          {app.instagram && <a href={app.instagram} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#C9A84C', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', textDecoration: 'none' }}><FaInstagram /> View Portfolio</a>}
                        </td>
                        <td style={{ padding: '20px 24px' }}>
                          <select
                            value={app.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              if (newStatus === 'accepted') {
                                setPasswordModal({ show: true, appId: app._id, contactPerson: app.contactPerson, status: newStatus });
                              } else {
                                try {
                                  await axios.put(`/api/providers/applications/${app._id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${user.token}` } });
                                  fetchAdminData();
                                  showToast('Application status updated');
                                } catch (err) {
                                  showToast('Update failed', 'error');
                                }
                              }
                            }}
                            style={{ 
                              background: app.status === 'pending' ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.05)', 
                              border: `1px solid ${app.status === 'pending' ? '#C9A84C' : 'rgba(255,255,255,0.1)'}`,
                              color: app.status === 'pending' ? '#C9A84C' : '#fff', 
                              padding: '8px 12px', 
                              borderRadius: '10px', 
                              fontSize: '0.8rem', 
                              outline: 'none', 
                              cursor: 'pointer' 
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td style={{ padding: '20px 24px', borderRadius: '0 16px 16px 0', textAlign: 'right', color: '#555577', fontSize: '0.85rem' }}>
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        );
      case 'users':
        const categorizedUsers = {
          users: filteredUsers.filter(u => u.role === 'user'),
          service_members: filteredUsers.filter(u => u.role === 'organizer' || u.role === 'provider'),
          admins: filteredUsers.filter(u => u.role === 'admin')
        };

        const currentUsers = categorizedUsers[userSubTab] || [];

        return (
          <motion.div key="users" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ background: 'rgba(15,15,15,0.4)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', margin: 0, color: '#C9A84C' }}>Membership <span className="text-gradient">Registry</span></h3>
                  <p style={{ color: '#7a7a99', marginTop: '5px' }}>Manage and monitor all platform participants.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#555577', textTransform: 'uppercase', letterSpacing: '1px' }}>Show:</span>
                    <select
                      value={userLimit}
                      onChange={(e) => setUserLimit(e.target.value === 'all' ? 10000 : parseInt(e.target.value))}
                      style={{ background: '#111', border: '1px solid #222', color: '#fff', padding: '12px 18px', borderRadius: '12px', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="30">30</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="btn btn-primary" 
                    style={{ padding: '15px 30px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}
                  >
                    <HiUsers /> Add New Member
                  </button>
                </div>
              </div>

              {/* Three Books Navigation */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '20px', width: 'fit-content' }}>
                {[
                  { id: 'users', label: 'Users', icon: <HiUserGroup /> },
                  { id: 'service_members', label: 'Service Members', icon: <HiIdentification /> },
                  { id: 'admins', label: 'Administrators', icon: <HiShieldCheck /> }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setUserSubTab(tab.id)}
                    style={{ 
                      padding: '14px 28px', borderRadius: '14px', border: 'none', 
                      background: userSubTab === tab.id ? '#C9A84C' : 'transparent',
                      color: userSubTab === tab.id ? '#000' : '#7a7a99',
                      fontWeight: 700, cursor: 'pointer', transition: '0.3s',
                      display: 'flex', alignItems: 'center', gap: '10px',
                      boxShadow: userSubTab === tab.id ? '0 10px 20px rgba(201, 168, 76, 0.2)' : 'none'
                    }}
                  >
                    {tab.icon} {tab.label}
                    <span style={{ fontSize: '0.7rem', opacity: 0.6, background: userSubTab === tab.id ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px' }}>
                      {categorizedUsers[tab.id].length}
                    </span>
                  </button>
                ))}
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#555577' }}>
                      <th style={{ padding: '15px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Member Profile</th>
                      <th style={{ padding: '15px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Contact Info</th>
                      <th style={{ padding: '15px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Professional Service</th>
                      <th style={{ padding: '15px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Role</th>
                      <th style={{ padding: '15px 24px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.slice(0, userLimit).map(u => (
                      <motion.tr 
                        whileHover={{ scale: 1.005, background: 'rgba(255,255,255,0.03)' }}
                        key={u._id} 
                        style={{ background: 'rgba(255,255,255,0.015)', cursor: 'pointer', transition: '0.2s' }}
                        onClick={() => handleUserClick(u)}
                      >
                        <td style={{ padding: '20px 24px', borderRadius: '20px 0 0 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: 'linear-gradient(45deg, #C9A84C, #a68b3d)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{u.name?.charAt(0)}</div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{u.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#555577', marginTop: '2px' }}>ID: {u._id.slice(-8).toUpperCase()}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '20px 24px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ color: '#d4d4e6', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><HiMail size={14} style={{ color: '#C9A84C' }} /> {u.email}</div>
                            <div style={{ color: '#7a7a99', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}><HiPhone size={14} /> {u.phone || 'No phone'}</div>
                          </div>
                        </td>
                        <td style={{ padding: '20px 24px' }}>
                          {u.serviceId ? (
                            <div>
                              <div style={{ color: '#C9A84C', fontSize: '0.9rem', fontWeight: 700, textTransform: 'capitalize' }}>{u.serviceId.type?.replace(/_/g, ' ')}</div>
                              <div style={{ color: '#d4d4e6', fontSize: '0.8rem' }}>{u.serviceId.name}</div>
                            </div>
                          ) : (
                            <div style={{ color: '#555577', fontSize: '0.85rem' }}>{u.state || 'N/A'}, {u.country || 'India'}</div>
                          )}
                        </td>
                        <td style={{ padding: '20px 24px' }}>
                          <span style={{ 
                            padding: '6px 12px', 
                            borderRadius: '8px', 
                            fontSize: '0.75rem', 
                            fontWeight: 800, 
                            textTransform: 'uppercase',
                            background: u.role === 'admin' ? 'rgba(255, 68, 68, 0.1)' : u.role === 'organizer' ? 'rgba(79, 195, 247, 0.1)' : 'rgba(201, 168, 76, 0.1)',
                            color: u.role === 'admin' ? '#ff4444' : u.role === 'organizer' ? '#4FC3F7' : '#C9A84C',
                            border: `1px solid ${u.role === 'admin' ? 'rgba(255, 68, 68, 0.2)' : u.role === 'organizer' ? 'rgba(79, 195, 247, 0.2)' : 'rgba(201, 168, 76, 0.2)'}`
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '20px 24px', borderRadius: '0 20px 20px 0', textAlign: 'right' }}>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem' }}
                            onClick={(e) => { e.stopPropagation(); handleUserClick(u); }}
                          >
                            Manage
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {currentUsers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '100px', background: 'rgba(255,255,255,0.01)', borderRadius: '32px', border: '1px dashed rgba(255,255,255,0.05)', marginTop: '20px' }}>
                  <HiUsers style={{ fontSize: '50px', color: '#222', marginBottom: '20px' }} />
                  <h4 style={{ color: '#555' }}>No {userSubTab.replace('_', ' ')} found matching criteria</h4>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'reviews':
        return (
          <motion.div key="reviews" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', margin: 0, color: '#C9A84C' }}>Review Moderation</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '0.8rem', color: '#555577', textTransform: 'uppercase', letterSpacing: '1px' }}>Show:</span>
                <select
                  value={reviewsLimit}
                  onChange={(e) => setReviewsLimit(e.target.value === 'all' ? 10000 : parseInt(e.target.value))}
                  style={{ background: '#111', border: '1px solid #222', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', outline: 'none' }}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="all">All</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '24px' }}>
              {data.reviews.slice(0, reviewsLimit).map(review => (
                <motion.div whileHover={{ y: -8 }} key={review._id} style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(45deg, #C9A84C, #a68b3d)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800 }}>{review.name?.charAt(0) || '?'}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.1rem' }}>{review.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#555577' }}>{review.email}</div>
                      </div>
                    </div>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteReview(review._id)} style={{ background: 'rgba(255, 68, 68, 0.1)', border: 'none', color: '#ff4444', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HiTrash /></motion.button>
                  </div>
                  <div style={{ display: 'flex', color: '#FFD700', gap: '4px', marginBottom: '15px' }}>
                    {[...Array(review.rating)].map((_, i) => <HiStar key={i} size={16} />)}
                  </div>
                  <p style={{ color: '#aaa', margin: 0, fontSize: '1rem', lineHeight: 1.7, fontStyle: 'italic' }}>"{review.comment}"</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      case 'notifications':
        return (
          <motion.div key="notifications" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ background: 'rgba(15,15,15,0.4)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', margin: 0, color: '#C9A84C' }}>System Alerts & Notifications</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#555577', textTransform: 'uppercase', letterSpacing: '1px' }}>Show:</span>
                    <select
                      value={notificationsLimit}
                      onChange={(e) => setNotificationsLimit(e.target.value === 'all' ? 10000 : parseInt(e.target.value))}
                      style={{ background: '#111', border: '1px solid #222', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="30">30</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                  {notifications.length > 0 && (
                    <button onClick={handleClearAll} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '0.85rem' }}>Clear All History</button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {notifications.length > 0 ? (
                  notifications.slice(0, notificationsLimit).map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                      style={{
                        background: notif.read ? 'rgba(255,255,255,0.02)' : 'rgba(201,168,76,0.05)',
                        padding: '25px',
                        borderRadius: '24px',
                        border: `1px solid ${notif.read ? 'rgba(255,255,255,0.05)' : 'rgba(201,168,76,0.2)'}`,
                        cursor: 'pointer',
                        transition: '0.3s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600, marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {notif.title}
                            {!notif.read && <span style={{ width: '8px', height: '8px', background: '#C9A84C', borderRadius: '50%' }}></span>}
                          </div>
                          <p style={{ color: '#7a7a99', fontSize: '0.95rem', margin: '0 0 10px 0' }}>{notif.message}</p>
                          <div style={{ color: notif.read ? '#555577' : '#C9A84C', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                            {notif.type} • {new Date(notif.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notif._id); }}
                          style={{ background: 'rgba(255,68,68,0.1)', border: 'none', color: '#ff4444', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer' }}
                        >
                          <HiX />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '100px', background: 'rgba(255,255,255,0.01)', borderRadius: '32px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                    <HiBell style={{ fontSize: '60px', color: '#222', marginBottom: '20px' }} />
                    <h4 style={{ color: '#555' }}>No active alerts</h4>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      case 'profile':
        return (
          <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div style={{ background: '#0a0a0a', borderRadius: '24px', overflow: 'hidden' }}>
              <ProfilePage />
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Orchestrating system data..." />;
  }

  const filteredInquiries = data.inquiries.filter(i =>
    i.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.eventType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = data.users.filter(u => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm);
    
    const matchesState = filterState === '' || u.state === filterState;
    
    return matchesSearch && matchesState;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050505', color: '#fff', position: 'relative', overflowX: 'hidden' }}>
      <AnimatePresence>
        {isMobileRestriction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'fixed', inset: 0, background: '#050505', zIndex: 10000,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '40px', textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '4rem', color: '#C9A84C', marginBottom: '30px' }}>
              <HiOutlineShieldCheck />
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '20px' }}>Access Restricted</h1>
            <p style={{ color: '#7a7a99', fontSize: '1.1rem', maxWidth: '400px', lineHeight: 1.6, marginBottom: '40px' }}>
              You cannot login in mobile. <br/>
              <strong>You should be login in laptop</strong> for secure administration.
            </p>
            <button onClick={handleLogout} className="btn btn-primary" style={{ padding: '16px 40px' }}>
              Back to Website
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast.show && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
        )}
      </AnimatePresence>
      <style>{`
        @media (max-width: 1024px) {
          .admin-sidebar {
            width: 320px !important;
            padding-top: 100px !important;
          }
          .admin-main {
            margin-left: 0 !important;
            padding: 80px 15px 40px !important;
          }
          .admin-hamburger {
            display: flex !important;
          }
          h1 {
            font-size: clamp(2.5rem, 6vw, 4rem) !important;
          }
        }
        
        @media (max-width: 480px) {
          .admin-main {
            padding: 100px 10px 40px !important;
          }
          .admin-sidebar {
            width: 100% !important;
          }
        }
        
        /* Premium Custom Scrollbar */
        .admin-sidebar::-webkit-scrollbar {
          width: 4px;
        }
        .admin-sidebar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
        }
        .admin-sidebar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #C9A84C, #a68b3d);
          border-radius: 10px;
        }
        .admin-sidebar {
          scrollbar-width: thin;
          scrollbar-color: #C9A84C rgba(0,0,0,0.2);
        }
      `}</style>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{
          position: 'fixed',
          top: '30px',
          left: '30px',
          zIndex: 1100,
          width: '68px',
          height: '54px',
          borderRadius: '18px',
          background: 'rgba(201, 168, 76, 0.15)',
          border: '1px solid rgba(201, 168, 76, 0.3)',
          color: '#C9A84C',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          cursor: 'pointer',
          backdropFilter: 'blur(15px)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = 'rgba(201, 168, 76, 0.25)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(201, 168, 76, 0.15)'; }}
        className="admin-hamburger"
      >
        {isSidebarOpen ? <HiX /> : <HiMenu />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(5px)',
              zIndex: 999
            }}
          />
        )}
      </AnimatePresence>

      {/* Interactive Background Particles */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            style={{
              position: 'absolute',
              width: '2px',
              height: '2px',
              background: '#C9A84C',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: typeof window !== 'undefined' && window.innerWidth <= 1024 ? (isSidebarOpen ? 0 : -320) : 0
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{
          width: '320px',
          background: '#0a0a0a',
          borderRight: '1px solid rgba(201,168,76,0.1)',
          padding: '120px 24px 40px',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          height: '100vh',
          zIndex: 1000,
          boxShadow: '20px 0 60px rgba(0,0,0,0.5)',
          overflowY: 'auto'
        }}
        className="admin-sidebar"
      >
        <div style={{ marginBottom: '60px', padding: '0 15px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-40px', left: '-20px', width: '100px', height: '100px', background: 'rgba(201,168,76,0.05)', borderRadius: '50%', filter: 'blur(30px)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '5px', textTransform: 'uppercase', fontWeight: 900, marginBottom: '20px' }}>
            <HiBadgeCheck size={16} /> <span>Security Verified</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.8rem', lineHeight: 1.1, margin: 0, fontWeight: 700, letterSpacing: '-1px' }}>
            THE VIBE <br />
            <span style={{ color: '#C9A84C', background: 'linear-gradient(45deg, #C9A84C, #967a2d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CONSOLE</span>
          </h2>
          <div style={{ height: '3px', width: '40px', background: '#C9A84C', marginTop: '20px', borderRadius: '2px' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sidebarItems.map((item, index) => (
            <SidebarItem
              key={index}
              icon={item.icon}
              label={item.label}
              active={item.active}
              onClick={item.onClick}
              count={item.count}
            />
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
          <div style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(201,168,76,0.15), transparent)', borderRadius: '24px', border: '1px solid rgba(201,168,76,0.1)' }}>
            <div 
              onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '12px',
                borderRadius: '16px',
                transition: '0.3s',
                background: activeTab === 'profile' ? 'rgba(201, 168, 76, 0.12)' : 'rgba(255,255,255,0)',
                cursor: 'pointer',
                border: activeTab === 'profile' ? '1px solid rgba(201, 168, 76, 0.2)' : '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'profile') e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'profile') e.currentTarget.style.background = 'rgba(255,255,255,0)';
              }}
            >
              <div style={{ 
                width: '45px', height: '45px', borderRadius: '50%', 
                background: user?.avatar ? `url(${user.avatar}) center/cover` : '#C9A84C', 
                color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontWeight: 900, fontSize: '1.1rem',
                overflow: 'hidden',
                border: user?.avatar ? '2px solid rgba(201, 168, 76, 0.3)' : 'none'
              }}>
                {!user?.avatar && user?.name && (
                  <span style={{ letterSpacing: '1px' }}>
                    {user.name.charAt(0).toUpperCase()}
                    {user.name.slice(-1).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>{user?.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#C9A84C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Administrator</div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              style={{
                marginTop: '25px',
                width: '100%',
                padding: '14px',
                background: 'rgba(255, 68, 68, 0.1)',
                border: '1px solid rgba(255, 68, 68, 0.2)',
                borderRadius: '16px',
                color: '#ff4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: '0.3s'
              }}
            >
              <HiLogout /> Sign Out
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <main style={{ flex: 1, padding: isDesktop ? '120px 60px 60px' : '100px 16px 40px', marginLeft: isDesktop ? '320px' : '0', position: 'relative', zIndex: 1 }} className="admin-main">
        <div style={{ position: 'absolute', top: 0, right: 0, width: '600px', height: '600px', background: 'radial-gradient(circle at 100% 0%, rgba(201, 168, 76, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1750px', margin: '0 auto' }}>
          <header style={{ marginBottom: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '40px' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ flex: 1 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#C9A84C', marginBottom: '20px' }}>
                  <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, transparent, #C9A84C)' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '5px', opacity: 0.8 }}>Management Infrastructure</span>
                </div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '5rem', marginBottom: '20px', lineHeight: 0.9, letterSpacing: '-1px' }}>
                  THE VIBE CO. <br />
                  <span className="text-gradient" style={{ fontSize: '4rem' }}>Console Suite</span>
                </h1>
                <p style={{ color: '#7a7a99', fontSize: '1.25rem', maxWidth: '650px', fontWeight: 300, lineHeight: 1.6 }}>
                  Welcome to the high-performance orchestration center. Manage your premium event ecosystem with precision.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{ width: '450px', marginBottom: '10px' }}
              >
                <div style={{ position: 'relative', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', padding: '2px', border: '1px solid rgba(201,168,76,0.1)' }}>
                  <HiSearch style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', color: '#C9A84C', fontSize: '1.4rem' }} />
                  <input
                    type="text"
                    placeholder="Search global records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ background: 'transparent', border: 'none', padding: '22px 24px 22px 64px', color: '#fff', width: '100%', fontSize: '1rem', outline: 'none' }}
                  />
                </div>
              </motion.div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </main>

      {/* Inquiry Detail Modal */}
      <AnimatePresence>
        {isInquiryModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 40 }}
              style={{ width: '100%', maxWidth: '950px', maxHeight: '92vh', background: '#0a0a0a', borderRadius: '40px', border: '1px solid rgba(201,168,76,0.25)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 50px 100px rgba(0,0,0,0.8)' }}
            >
              {/* Modal Header */}
              <div style={{ padding: '35px 50px', borderBottom: '1px solid rgba(201,168,76,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to right, rgba(201,168,76,0.05), transparent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '24px', background: 'linear-gradient(135deg, #C9A84C, #967a2d)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 900, boxShadow: '0 10px 20px rgba(201,168,76,0.2)' }}>
                    {selectedInquiry?.eventType?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '2rem', margin: 0, fontFamily: "'Playfair Display', serif", textTransform: 'capitalize', letterSpacing: '1px', color: '#C9A84C' }}>{selectedInquiry?.eventType} Inquiry</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                      <span style={{ color: '#C9A84C', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>Dossier ID: {selectedInquiry?._id?.slice(-8).toUpperCase()}</span>
                      <span style={{ color: '#555577', fontSize: '0.8rem' }}>•</span>
                      <span style={{ color: '#7a7a99', fontSize: '0.8rem' }}>Received {new Date(selectedInquiry?.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsInquiryModalOpen(false)} 
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '45px', height: '45px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', transition: '0.3s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 68, 68, 0.1)'; e.currentTarget.style.borderColor = 'rgba(255, 68, 68, 0.2)'; e.currentTarget.style.color = '#ff4444'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                >
                  <HiX />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
                  {/* Left: Inquiry Message & Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <h4 style={{ fontSize: '0.9rem', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', fontWeight: 800 }}>Inquiry Message</h4>
                      <textarea 
                        value={selectedInquiry?.message}
                        onChange={(e) => setSelectedInquiry(prev => ({ ...prev, message: e.target.value }))}
                        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', color: '#d4d4e6', width: '100%', padding: '15px', borderRadius: '12px', outline: 'none', minHeight: '120px', fontSize: '1rem', lineHeight: 1.6, resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ fontSize: '0.75rem', color: '#555577', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Estimated Budget</span>
                          <span style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 700 }}>{selectedInquiry?.budget || 'Not specified'}</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ fontSize: '0.75rem', color: '#555577', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Event Date</span>
                          <input 
                            type="date"
                            value={selectedInquiry?.eventDate ? new Date(selectedInquiry.eventDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => setSelectedInquiry(prev => ({ ...prev, eventDate: e.target.value }))}
                            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '100%', padding: '8px', borderRadius: '8px', outline: 'none' }}
                          />
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ fontSize: '0.75rem', color: '#555577', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Current Status</span>
                          <select
                            value={selectedInquiry?.status}
                            onChange={(e) => handleUpdateInquiry(selectedInquiry?._id, { status: e.target.value })}
                            style={{ background: '#111', border: '1px solid #C9A84C', color: '#fff', width: '100%', padding: '8px', borderRadius: '8px', outline: 'none' }}
                          >
                            <option value="new">New</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <h4 style={{ fontSize: '0.9rem', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', fontWeight: 800 }}>Admin Pricing & Notes</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#555577', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>Final Price (Admin Use)</label>
                          <input 
                            type="number" 
                            value={selectedInquiry?.finalPrice || ''}
                            onChange={(e) => setSelectedInquiry(prev => ({ ...prev, finalPrice: e.target.value }))}
                            placeholder="Enter negotiated price"
                            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '100%', padding: '10px 15px', borderRadius: '8px', outline: 'none' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#555577', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>Admin Notes / Extra Details</label>
                          <textarea 
                            value={selectedInquiry?.adminNotes || ''}
                            onChange={(e) => setSelectedInquiry(prev => ({ ...prev, adminNotes: e.target.value }))}
                            placeholder="Add notes, requirements, or accepted details..."
                            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '100%', padding: '10px 15px', borderRadius: '8px', outline: 'none', minHeight: '80px', resize: 'vertical' }}
                          />
                        </div>
                        <button 
                          onClick={() => handleUpdateInquiry(selectedInquiry._id, { 
                            finalPrice: selectedInquiry.finalPrice, 
                            adminNotes: selectedInquiry.adminNotes,
                            message: selectedInquiry.message,
                            eventDate: selectedInquiry.eventDate,
                            status: selectedInquiry.status
                          })}
                          style={{ background: '#C9A84C', color: '#000', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '10px' }}
                        >
                          Save Details
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: User/Contact Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div style={{ background: 'rgba(201,168,76,0.03)', padding: '25px', borderRadius: '24px', border: '1px solid rgba(201,168,76,0.1)' }}>
                      <h4 style={{ fontSize: '0.9rem', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', fontWeight: 800 }}>Sender Details</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <DetailItem icon={<HiUserCircle />} label="Full Name" value={selectedInquiry?.name} />
                        <DetailItem icon={<HiMail />} label="Email Address" value={selectedInquiry?.email} />
                        <DetailItem icon={<HiPhone />} label="Phone Number" value={selectedInquiry?.phone || 'Not provided'} />
                        {selectedUser && (
                          <>
                            <DetailItem icon={<HiLocationMarker />} label="Location" value={`${selectedUser.state}${selectedUser.country ? `, ${selectedUser.country}` : ''}`} />
                            <DetailItem icon={<HiClipboardList />} label="Preferred Language" value={selectedUser.language || 'Not specified'} />
                          </>
                        )}
                      </div>

                      {selectedUser && (
                        <button
                          onClick={() => { setIsInquiryModalOpen(false); handleUserClick(selectedUser); }}
                          style={{ marginTop: '30px', width: '100', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}
                        >
                          View Full History
                        </button>
                      )}
                    </div>

                    {selectedInquiry?.service && (
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 style={{ fontSize: '0.9rem', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', fontWeight: 800 }}>Selected Service Member</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <img 
                            src={getImageUrl(selectedInquiry.service.images, 'https://via.placeholder.com/60')} 
                            alt="" 
                            style={{ width: '60px', height: '60px', borderRadius: '14px', objectFit: 'cover', border: '1px solid rgba(201,168,76,0.2)' }} 
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>{selectedInquiry.service.name}</div>
                            <div style={{ fontSize: '0.85rem', color: '#7a7a99', textTransform: 'capitalize' }}>{selectedInquiry.service.type.replace(/_/g, ' ')} • {selectedInquiry.service.city}</div>
                          </div>
                          <button 
                            onClick={() => { setIsInquiryModalOpen(false); handleMemberClick(selectedInquiry.service); }}
                            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}
                          >
                            Profile
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Detail Modal */}
      <AnimatePresence>
        {isUserModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              style={{ width: '100%', maxWidth: '1000px', maxHeight: '90vh', background: '#111', borderRadius: '32px', border: '1px solid rgba(201,168,76,0.2)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              {/* Modal Header */}
              <div style={{ padding: '30px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: 'linear-gradient(45deg, #C9A84C, #a68b3d)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>{selectedUser?.name?.charAt(0) || '?'}</div>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', margin: 0, fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>{selectedUser?.name}</h2>
                    <span style={{ color: '#C9A84C', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Member Details</span>
                  </div>
                </div>
                <button onClick={() => { setIsUserModalOpen(false); setIsEditingUser(false); }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }}><HiX /></button>
              </div>

              {/* Modal Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
                {modalLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '30px', height: '30px', border: '2px solid #C9A84C', borderTopColor: 'transparent', borderRadius: '50%' }} />
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px' }}>
                    {/* Left: Info/Form */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Profile Information</h4>
                        <button onClick={() => setIsEditingUser(!isEditingUser)} style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                          {isEditingUser ? <><HiArrowLeft /> Cancel</> : <><HiPencil /> Edit Details</>}
                        </button>
                      </div>

                      {isEditingUser ? (
                        <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          <div className="form-group">
                            <label style={{ color: '#555577', fontSize: '0.8rem', marginBottom: '8px', display: 'block' }}>Full Name</label>
                            <input type="text" className="form-input" value={userEditForm.name} onChange={(e) => setUserEditForm({ ...userEditForm, name: e.target.value })} required />
                          </div>
                          <div className="form-group">
                            <label style={{ color: '#555577', fontSize: '0.8rem', marginBottom: '8px', display: 'block' }}>Email Address</label>
                            <input type="email" className="form-input" value={userEditForm.email} onChange={(e) => setUserEditForm({ ...userEditForm, email: e.target.value })} required />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="form-group">
                              <label style={{ color: '#555577', fontSize: '0.8rem', marginBottom: '8px', display: 'block' }}>Phone</label>
                              <input type="tel" className="form-input" value={userEditForm.phone} onChange={(e) => setUserEditForm({ ...userEditForm, phone: e.target.value })} />
                            </div>
                            <div className="form-group">
                              <label style={{ color: '#555577', fontSize: '0.8rem', marginBottom: '8px', display: 'block' }}>Role</label>
                              <select className="form-input" value={userEditForm.role} onChange={(e) => setUserEditForm({ ...userEditForm, role: e.target.value })}>
                                <option value="user">User</option>
                                <option value="provider">Provider</option>
                                <option value="organizer">Organizer</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="form-group">
                              <label style={{ color: '#555577', fontSize: '0.8rem', marginBottom: '8px', display: 'block' }}>Gender</label>
                              <select className="form-input" value={userEditForm.gender} onChange={(e) => setUserEditForm({ ...userEditForm, gender: e.target.value })}>
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label style={{ color: '#555577', fontSize: '0.8rem', marginBottom: '8px', display: 'block' }}>State</label>
                              <input type="text" className="form-input" value={userEditForm.state} onChange={(e) => setUserEditForm({ ...userEditForm, state: e.target.value })} />
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="form-group">
                              <label style={{ color: '#555577', fontSize: '0.8rem', marginBottom: '8px', display: 'block' }}>Country</label>
                              <input type="text" className="form-input" value={userEditForm.country} onChange={(e) => setUserEditForm({ ...userEditForm, country: e.target.value })} />
                            </div>
                            <div className="form-group">
                              <label style={{ color: '#555577', fontSize: '0.8rem', marginBottom: '8px', display: 'block' }}>Language</label>
                              <input type="text" className="form-input" value={userEditForm.language} onChange={(e) => setUserEditForm({ ...userEditForm, language: e.target.value })} />
                            </div>
                          </div>
                          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Save Global Update</button>
                        </form>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                          <DetailItem icon={<HiMail />} label="Email Address" value={selectedUser?.email} />
                          <DetailItem icon={<HiPhone />} label="Phone Number" value={selectedUser?.phone || 'Not available'} />
                          {selectedUser?.serviceId && (
                            <DetailItem 
                              icon={<HiBadgeCheck style={{ color: '#C9A84C' }} />} 
                              label="Professional Service" 
                              value={`${selectedUser.serviceId.type?.replace(/_/g, ' ')} (${selectedUser.serviceId.name})`} 
                            />
                          )}
                          <DetailItem icon={<HiLocationMarker />} label="Location" value={`${selectedUser?.state}${selectedUser?.country ? `, ${selectedUser?.country}` : ''}` || 'Not specified'} />
                          <DetailItem icon={<HiClipboardList />} label="Language" value={selectedUser?.language || 'Not specified'} />
                          <DetailItem icon={<HiIdentification />} label="User Permissions" value={selectedUser?.role.toUpperCase()} />
                          <DetailItem icon={<HiClock />} label="Member Since" value={new Date(selectedUser?.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
                        </div>
                      )}
                    </div>

                    {/* Right: History */}
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', marginBottom: '25px' }}>Engagement History</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {userInquiries.length > 0 ? (
                          userInquiries.map(inq => (
                            <div key={inq._id} style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <input
                                    style={{ background: 'none', border: 'none', borderBottom: '1px solid transparent', color: '#C9A84C', fontWeight: 600, fontSize: '0.95rem', padding: '2px 0', outline: 'none', width: '150px' }}
                                    value={inq.eventType}
                                    onChange={(e) => {
                                      const newVal = e.target.value;
                                      setUserInquiries(prev => prev.map(item => item._id === inq._id ? { ...item, eventType: newVal } : item));
                                    }}
                                    onBlur={async () => {
                                      await axios.put(`/api/admin/inquiries/${inq._id}`, { eventType: inq.eventType });
                                    }}
                                  />
                                  <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', background: inq.status === 'accepted' ? 'rgba(129, 199, 132, 0.1)' : 'rgba(255,255,255,0.05)', color: inq.status === 'accepted' ? '#81C784' : '#7a7a99', fontWeight: 800 }}>{inq.status}</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', opacity: 0.4 }}>{new Date(inq.createdAt).toLocaleDateString()}</span>
                              </div>
                              <textarea
                                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#aaa', fontSize: '0.9rem', width: '100%', padding: '10px', outline: 'none', resize: 'none', height: '80px', marginBottom: '15px' }}
                                value={inq.message || ''}
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  setUserInquiries(prev => prev.map(item => item._id === inq._id ? { ...item, message: newVal } : item));
                                }}
                                onBlur={async () => {
                                  await axios.put(`/api/admin/inquiries/${inq._id}`, { message: inq.message });
                                }}
                              />
                              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <select
                                  value={inq.status}
                                  onChange={(e) => handleUpdateInquiry(inq._id, e.target.value)}
                                  style={{ background: '#111', border: '1px solid #222', color: '#fff', fontSize: '0.8rem', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer' }}
                                >
                                  <option value="new">New</option>
                                  <option value="accepted">Accepted</option>
                                  <option value="rejected">Rejected</option>
                                  <option value="completed">Completed</option>
                                </select>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ textAlign: 'center', padding: '40px', color: '#555577', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            <HiClipboardList size={30} style={{ opacity: 0.3, marginBottom: '10px' }} />
                            <p style={{ margin: 0, fontSize: '0.85rem' }}>No history found for this user.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Service Management Modal */}
      <AnimatePresence>
        {isServiceModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => setIsServiceModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              style={{ background: '#111', width: '100%', maxWidth: '800px', borderRadius: '32px', border: '1px solid rgba(201,168,76,0.2)', overflow: 'hidden' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ padding: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', margin: 0, color: '#C9A84C' }}>
                  {editingService ? 'Edit Service Provider' : 'Add New Service Provider'}
                </h3>
                <button onClick={() => setIsServiceModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}><HiX /></button>
              </div>

              <form onSubmit={handleServiceSubmit} style={{ padding: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label className="form-label">Provider Name</label>
                  <input className="form-input" value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} placeholder="e.g. Elite Lens" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Service Category</label>
                   <select className="form-input" value={serviceForm.type} onChange={e => setServiceForm({ ...serviceForm, type: e.target.value })}>
                    <option value="photography">Photography</option>
                    <option value="videography">Videography</option>
                    <option value="catering">Catering</option>
                    <option value="decoration">Decoration</option>
                    <option value="music">Music</option>
                    <option value="security">Security</option>
                    <option value="total_event_organisation">Total Event Organisation</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-input" value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} placeholder="Detailed profile description..." required style={{ minHeight: '100px' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Price starts from</label>
                  <input className="form-input" value={serviceForm.priceStartsFrom} onChange={e => setServiceForm({ ...serviceForm, priceStartsFrom: e.target.value })} placeholder="e.g. ₹50,000" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Instagram Profile URL</label>
                  <input className="form-input" value={serviceForm.instagram} onChange={e => setServiceForm({ ...serviceForm, instagram: e.target.value })} placeholder="https://instagram.com/..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Provider Email</label>
                  <input type="email" className="form-input" value={serviceForm.email} onChange={e => setServiceForm({ ...serviceForm, email: e.target.value })} placeholder="partner@example.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Provider Mobile</label>
                  <input type="tel" className="form-input" value={serviceForm.phone} onChange={e => setServiceForm({ ...serviceForm, phone: e.target.value })} placeholder="+91 9876543210" required />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-input" value={serviceForm.state} onChange={e => setServiceForm({ ...serviceForm, state: e.target.value })} placeholder="e.g. Maharashtra" required />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" value={serviceForm.city} onChange={e => setServiceForm({ ...serviceForm, city: e.target.value })} placeholder="e.g. Mumbai" required />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Team Image (Upload)</label>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="image-upload"
                      accept="image/*"
                    />
                    <label
                      htmlFor="image-upload"
                      className="btn"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px dashed rgba(201,168,76,0.5)',
                        color: '#C9A84C',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      {isUploading ? 'Uploading...' : <><HiSparkles /> Select Team Image</>}
                    </label>
                    {Array.isArray(serviceForm.images) && serviceForm.images.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                        {serviceForm.images.map((img, idx) => (
                          <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                            <img 
                              src={getImageUrl([img], 'https://via.placeholder.com/80')} 
                              alt={`Preview ${idx}`} 
                              style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(201,168,76,0.3)' }} 
                            />
                            <button 
                              type="button"
                              onClick={() => setServiceForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                              style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <HiX />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Key Features (comma separated)</label>
                  <input className="form-input" value={serviceForm.features} onChange={e => setServiceForm({ ...serviceForm, features: e.target.value })} placeholder="Drone coverage, Live streaming, Premium albums" required />
                </div>

                <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px' }}>
                    {editingService ? 'Update Provider Profile' : 'Launch New Service Provider'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Service Member Detail Modal */}
      <AnimatePresence>
        {isMemberModalOpen && selectedMember && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}
            onClick={() => setIsMemberModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }}
              style={{ width: '100%', maxWidth: '1000px', maxHeight: '90vh', background: '#0a0a0a', borderRadius: '40px', border: '1px solid rgba(201,168,76,0.3)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ padding: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(201,168,76,0.1)', overflow: 'hidden', border: '1px solid rgba(201,168,76,0.2)' }}>
                    <img 
                      src={getImageUrl(selectedMember.images, 'https://via.placeholder.com/80')} 
                      alt={selectedMember.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/80' }}
                    />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '2.2rem', margin: 0, fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}>{selectedMember.name}</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#C9A84C', fontWeight: 600 }}>{selectedMember.type.replace(/_/g, ' ')} Specialist</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button 
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedMember, null, 2));
                      const downloadAnchorNode = document.createElement('a');
                      downloadAnchorNode.setAttribute("href", dataStr);
                      downloadAnchorNode.setAttribute("download", `${selectedMember.name}_profile.json`);
                      document.body.appendChild(downloadAnchorNode);
                      downloadAnchorNode.click();
                      downloadAnchorNode.remove();
                    }}
                    className="btn btn-outline" style={{ padding: '10px 20px', borderRadius: '12px' }}
                  >
                    Download Profile
                  </button>
                  <button onClick={() => { setIsMemberModalOpen(false); openServiceModal(selectedMember); }} className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '12px' }}>Edit Profile</button>
                  <button onClick={() => setIsMemberModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}><HiX /></button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '50px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '50px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    <section>
                      <h4 style={{ fontSize: '0.9rem', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', fontWeight: 800 }}>About the Provider</h4>
                      <p style={{ color: '#d4d4e6', fontSize: '1.1rem', lineHeight: 1.8, margin: 0 }}>
                        {selectedMember.description}
                      </p>
                    </section>

                    <section>
                      <h4 style={{ fontSize: '0.9rem', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', fontWeight: 800 }}>Portfolio Showcase</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                        {selectedMember.images && selectedMember.images.length > 0 ? (
                          selectedMember.images.map((img, idx) => (
                            <motion.div 
                              key={idx} 
                              whileHover={{ scale: 1.05 }}
                              style={{ height: '150px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                              onClick={() => window.open(img, '_blank')}
                            >
                              <img src={img} alt={`Work ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </motion.div>
                          ))
                        ) : (
                          <div style={{ gridColumn: 'span 2', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', textAlign: 'center', color: '#555577' }}>
                            No portfolio images uploaded yet.
                          </div>
                        )}
                      </div>
                    </section>

                    <section>
                      <h4 style={{ fontSize: '0.9rem', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px', fontWeight: 800 }}>Key Capabilities</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {selectedMember.features && selectedMember.features.map((feat, idx) => (
                          <span key={idx} style={{ padding: '8px 16px', background: 'rgba(201,168,76,0.1)', color: '#C9A84C', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600 }}>
                            {feat}
                          </span>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* Right: Technical Details & Meta */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <h4 style={{ fontSize: '0.8rem', color: '#555577', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '25px', fontWeight: 800 }}>Business Metrics</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <DetailItem icon={<HiLocationMarker />} label="Operating Location" value={`${selectedMember.city}, ${selectedMember.state}`} />
                        <DetailItem icon={<HiMail />} label="Business Email" value={selectedMember.email} />
                        <DetailItem icon={<HiPhone />} label="Primary Contact" value={selectedMember.phone} />
                        <DetailItem icon={<HiStar />} label="Premium Status" value={selectedMember.rating ? `Level ${selectedMember.rating} Partner` : 'Verified Partner'} />
                        <DetailItem icon={<HiChartBar />} label="Starting Price" value={selectedMember.priceStartsFrom} />
                      </div>

                      <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '15px' }}>
                        {selectedMember.instagram && (
                          <a href={selectedMember.instagram} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '12px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', color: '#fff', textAlign: 'center', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <FaInstagram /> Instagram
                          </a>
                        )}
                        <a href={`tel:${selectedMember.phone}`} style={{ flex: 1, padding: '12px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', color: '#fff', textAlign: 'center', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <HiPhone /> Call Partner
                        </a>
                      </div>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.1), transparent)', padding: '30px', borderRadius: '32px', border: '1px solid rgba(201,168,76,0.1)' }}>
                      <h4 style={{ fontSize: '0.8rem', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px', fontWeight: 800 }}>Administrative Metadata</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#555577' }}>Internal ID:</span>
                          <span style={{ color: '#fff', opacity: 0.6, fontFamily: 'monospace' }}>{selectedMember._id}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#555577' }}>Date Added:</span>
                          <span style={{ color: '#fff' }}>{new Date(selectedMember.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#555577' }}>Last Updated:</span>
                          <span style={{ color: '#fff' }}>{new Date(selectedMember.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add New User Modal */}
      <AnimatePresence>
        {isAddUserModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => setIsAddUserModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              style={{ background: '#111', width: '100%', maxWidth: '600px', borderRadius: '32px', border: '1px solid rgba(201,168,76,0.2)', overflow: 'hidden' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ padding: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', margin: 0, color: '#C9A84C' }}>Add New User</h3>
                <button onClick={() => setIsAddUserModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}><HiX /></button>
              </div>

              <form onSubmit={handleAddUser} style={{ padding: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={newUserForm.name} onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })} placeholder="Enter full name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" value={newUserForm.email} onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })} placeholder="email@example.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" className="form-input" value={newUserForm.phone} onChange={e => setNewUserForm({ ...newUserForm, phone: e.target.value })} placeholder="+91 9876543210" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-input" value={newUserForm.role} onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value })}>
                    <option value="user">User</option>
                    <option value="provider">Provider</option>
                    <option value="organizer">Organizer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input" value={newUserForm.gender} onChange={e => setNewUserForm({ ...newUserForm, gender: e.target.value })}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-input" value={newUserForm.state} onChange={e => setNewUserForm({ ...newUserForm, state: e.target.value })} placeholder="e.g. Maharashtra" />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input className="form-input" value={newUserForm.country} onChange={e => setNewUserForm({ ...newUserForm, country: e.target.value })} placeholder="e.g. India" />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Temporary Password</label>
                  <input type="password" className="form-input" value={newUserForm.password} onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })} placeholder="Min 6 characters" minLength={6} required />
                </div>

                <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px' }}>
                    Create User Account
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Entry Modal */}
      <AnimatePresence>
        {passwordModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', 
              zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' 
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ 
                background: '#111', width: '100%', maxWidth: '450px', padding: '40px', borderRadius: '32px', 
                border: '1px solid rgba(201,168,76,0.3)', position: 'relative' 
              }}
            >
              <button 
                onClick={() => setPasswordModal({ show: false, appId: null, contactPerson: '', status: '' })}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#7a7a99', cursor: 'pointer' }}
              >
                <HiX size={24} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A84C', fontSize: '30px', margin: '0 auto 20px' }}>
                  <HiOutlineShieldCheck />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: '#C9A84C', marginBottom: '10px' }}>Set Partner Password</h3>
                <p style={{ color: '#7a7a99', fontSize: '0.9rem' }}>Assign a temporary login password for <strong>{passwordModal.contactPerson}</strong>.</p>
              </div>

              <div className="form-group" style={{ marginBottom: '30px' }}>
                <label className="form-label" style={{ color: '#C9A84C', letterSpacing: '2px', fontSize: '0.7rem' }}>CHOOSE PASSWORD</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <button 
                  onClick={() => setPasswordModal({ show: false, appId: null, contactPerson: '', status: '' })}
                  className="btn btn-outline"
                  style={{ padding: '14px', borderRadius: '16px' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePasswordSubmit}
                  className="btn btn-primary"
                  style={{ padding: '14px', borderRadius: '16px' }}
                >
                  Accept Partner
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default AdminDashboard;
