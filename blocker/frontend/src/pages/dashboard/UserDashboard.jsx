import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

const UserDashboard = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [firewallEnabled, setFirewallEnabled] = useState(false);

    useEffect(() => {
        fetch('http://localhost:5000/api/logs?limit=50')
            .then(res => res.json())
            .then(data => {
                if (data.ok) {
                    setLogs(data.items);
                }
            })
            .catch(err => console.error('Failed to fetch logs:', err));
    }, []);

    const toggleFirewall = async () => {
        const newState = !firewallEnabled;
        try {
            const response = await fetch(`http://localhost:3000/security/${newState ? 'enable' : 'disable'}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                setFirewallEnabled(newState);
            } else {
                console.error('Failed to toggle firewall');
            }
        } catch (error) {
            console.error('Error toggling firewall:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'safe': return '#22c55e'; // green
            case 'phishing': return '#ef4444'; // red
            case 'blocked': return '#f97316'; // orange
            case 'warn': return '#eab308'; // yellow
            default: return '#6b7280'; // gray
        }
    };

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '1rem' }}>User Dashboard</h1>
                <p style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>
                    Welcome back, <strong style={{ color: '#111827' }}>{user?.name}</strong>
                </p>
                <div style={{ display: 'inline-block', background: 'rgba(34, 197, 94, 0.1)', color: '#15803d', padding: '0.5rem 1rem', borderRadius: '20px', marginTop: '1rem' }}>
                    Role: <span style={{ textTransform: 'uppercase' }}>{user?.role}</span>
                </div>
            </div>

            <button
                type="button"
                onClick={toggleFirewall}
                style={{
                    marginTop: '1.5rem',
                    padding: '1.25rem 2rem',
                    borderRadius: '9px',
                    border: 'none',
                    background: firewallEnabled ? '#dc2626' : '#2563eb',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '3.25rem',
                    letterSpacing: '0.03em'
                }}
            >
                {firewallEnabled ? 'Disable Firewall' : 'Enable Firewall'}
            </button>

            <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Site Access Analytics</h2>
                {logs.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No analytics data available yet.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                            <thead>
                                <tr style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)' }}>Domain</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)' }}>Status</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)' }}>Reason</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-primary)' }}>Confidence</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                                        <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>{log.domain}</td>
                                        <td style={{ padding: '1rem', color: getStatusColor(log.status), fontWeight: 'bold' }}>{log.status}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{log.reason}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>{log.confidence ? log.confidence.toFixed(3) : 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
