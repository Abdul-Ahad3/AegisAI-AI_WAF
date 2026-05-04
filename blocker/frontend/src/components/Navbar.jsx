import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="glass-panel" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            padding: '0.5rem 2rem',
            margin: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #e5e7eb'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: 0 }}>
                {/* Logo */}
                <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img src={logo} alt="AegisAI Logo" style={{ height: '100px' }} />
                </Link>

                {/* Desktop Navigation */}
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', fontSize: '0.95rem', fontWeight: 500 }} className="desktop-nav">
                    <Link to="/">Home</Link>
                    <Link to="/services/blocker">Blocker</Link>
                    <Link to="/services/idps">IDPS</Link>
                    <Link to="/services/vpn">VPN</Link>
                    <Link to="/services/malware">Anti-Malware</Link>

                    {user ? (
                        <>
                            <span style={{ color: 'var(--text-secondary)' }}>|</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{user.name}</span>
                            <Link to={user.role === 'admin' ? '/admin-dashboard' : '/dashboard'} title="Dashboard">
                                <LayoutDashboard size={18} />
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="btn-primary"
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}
                            >
                                <LogOut size={14} /> Logout
                            </button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>|</span>
                            <Link to="/login">Login</Link>
                            <Link to="/signup" className="btn-primary" style={{ padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.9rem' }}>
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
