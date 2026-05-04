import { Shield, Lock, Wifi } from 'lucide-react';

const VPN = () => (
    <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="glass-panel" style={{ padding: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '12px', color: '#16a34a' }}>
                    <Shield size={40} />
                </div>
                <div>
                    <h1 style={{ fontSize: '2.5rem', margin: 0, color: '#111827' }}>Virtual Private Network</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Secure your connection and protect your online identity.
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px' }}>
                    <h3><Lock size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> End-to-End Encryption</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Military-grade encryption ensures that your data remains private and secure from prying eyes.</p>
                </div>
                <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px' }}>
                    <h3><Wifi size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Secure Public Wi-Fi</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Protect your personal information when connecting to unsecured public Wi-Fi networks.</p>
                </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '2rem', border: '1px dashed var(--text-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Connection Controls - Coming Soon</p>
            </div>
        </div>
    </div>
);
export default VPN;
