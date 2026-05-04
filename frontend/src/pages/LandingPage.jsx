import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Activity, Globe, Zap } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    const services = [
        {
            icon: <Globe size={32} className="text-accent-primary" />,
            title: 'Webpage Blocker',
            description: 'Enhance productivity by restricting access to distracting or malicious sites.',
            link: '/services/blocker'
        },
        {
            icon: <Activity size={32} className="text-accent-primary" />,
            title: 'IDPS',
            description: 'Advanced Intrusion Detection and Prevention to monitor traffic.',
            link: '/services/idps'
        },
        {
            icon: <Shield size={32} className="text-accent-primary" />,
            title: 'VPN',
            description: 'Secure, encrypted Virtual Private Network for anonymous browsing.',
            link: '/services/vpn'
        },
        {
            icon: <Zap size={32} className="text-accent-primary" />,
            title: 'Anti-Malware',
            description: 'Real-time protection against viruses, ransomware, and threats.',
            link: '/services/malware'
        }
    ];

    return (
        <div className="container">
            {/* Hero Section */}
            <section style={{
                textAlign: 'center',
                padding: '8rem 0 4rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem'
            }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#f3f4f6',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    color: '#4b5563',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                }}>
                    <Lock size={16} /> Enterprise Grade Security
                </div>

                <h1 style={{
                    fontSize: '4.5rem',
                    margin: 0,
                    lineHeight: 1.1,
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: '#111827'
                }}>
                    Secure Your Digital <br />
                    <span className="gradient-text">Frontier with AegisAI</span>
                </h1>

                <p style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-secondary)',
                    maxWidth: '600px',
                    margin: 0,
                    lineHeight: 1.6
                }}>
                    Everything you need to protect your network, data, and privacy in one unified platform.
                </p>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                    <button className="btn-primary" style={{ fontSize: '1.1rem', padding: '0.8rem 2.5rem', borderRadius: '8px' }} onClick={() => navigate('/signup')}>
                        Get Started
                    </button>
                    <button style={{
                        fontSize: '1.1rem',
                        padding: '0.8rem 2.5rem',
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        color: '#374151',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }} onClick={() => navigate('/login')}>
                        Login
                    </button>
                </div>
            </section>

            {/* Services Grid */}
            <section style={{ padding: '4rem 0 6rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.25rem', fontWeight: 700, color: '#1f2937' }}>
                    Our Core Services
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)', /* Explicit 2x2 grid */
                    gap: '2rem',
                    maxWidth: '1000px',
                    margin: '0 auto'
                }}>
                    {services.map((service, index) => (
                        <div key={index} className="glass-panel" style={{
                            padding: '2.5rem',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}
                            onClick={() => navigate(service.link)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                            }}
                        >
                            <div style={{
                                background: '#f3f4f6',
                                width: '56px',
                                height: '56px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '0.5rem',
                                color: '#4b5563'
                            }}>
                                {service.icon}
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#111827' }}>{service.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{service.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
