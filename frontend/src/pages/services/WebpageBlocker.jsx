import { Globe, Shield, Clock } from 'lucide-react';

const WebpageBlocker = () => (
    <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="glass-panel" style={{ padding: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '12px', color: '#2563eb' }}>
                    <Globe size={40} />
                </div>
                <div>
                    <h1 style={{ fontSize: '2.5rem', margin: 0, color: '#111827' }}>Webpage Blocker</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Enhance productivity and security by controlling web access.
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px' }}>
                    <h3><Shield size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> URL Filtering</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Block access to specific URLs or entire domains to prevent users from accessing harmful or non-work-related content.</p>
                </div>
                <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px' }}>
                    <h3><Clock size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Scheduled Blocking</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Set up schedules to block websites during specific hours, ensuring focus during work times.</p>
                </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '2rem', border: '1px dashed var(--text-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Configuration Panel - Coming Soon</p>
            </div>
        </div>
    </div>
);
export default WebpageBlocker;
