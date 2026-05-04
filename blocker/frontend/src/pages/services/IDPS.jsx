import { Activity, Bell, Search } from 'lucide-react';

const IDPS = () => (
    <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="glass-panel" style={{ padding: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '12px', color: '#dc2626' }}>
                    <Activity size={40} />
                </div>
                <div>
                    <h1 style={{ fontSize: '2.5rem', margin: 0, color: '#111827' }}>Intrusion Detection System</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Monitor, detect, and prevent network threats in real-time.
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px' }}>
                    <h3><Search size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Traffic Analysis</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Deep packet inspection to identify malicious patterns and potential vulnerabilities in network traffic.</p>
                </div>
                <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px' }}>
                    <h3><Bell size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Real-time Alerts</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Instant notifications when suspicious activity is detected, allowing for immediate response.</p>
                </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '2rem', border: '1px dashed var(--text-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Live Traffic Monitor - Coming Soon</p>
            </div>
        </div>
    </div>
);
export default IDPS;
