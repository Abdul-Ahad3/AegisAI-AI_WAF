import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const SignupPage = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'user'
    });
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const result = signup(formData);
        if (result.success) {
            if (formData.role === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard');
            }
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '500px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#111827' }}>Create Account</h2>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#dc2626',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Name</label>
                        <input
                            type="text"
                            required
                            className="glass-panel"
                            style={{ width: '100%', padding: '0.8rem', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email</label>
                        <input
                            type="email"
                            required
                            className="glass-panel"
                            style={{ width: '100%', padding: '0.8rem', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Phone</label>
                        <input
                            type="tel"
                            required
                            className="glass-panel"
                            style={{ width: '100%', padding: '0.8rem', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Password</label>
                        <input
                            type="password"
                            required
                            className="glass-panel"
                            style={{ width: '100%', padding: '0.8rem', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>Sign Up</button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
