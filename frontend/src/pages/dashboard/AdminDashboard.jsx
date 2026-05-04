import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Admin Dashboard</h1>
                <p style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>
                    Welcome back, <strong style={{ color: '#111827' }}>{user?.name}</strong>
                </p>
                <div style={{ display: 'inline-block', background: 'rgba(75, 85, 99, 0.1)', color: 'var(--accent-primary)', padding: '0.5rem 1rem', borderRadius: '20px', marginTop: '1rem' }}>
                    Role: <span style={{ textTransform: 'uppercase' }}>{user?.role}</span>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
