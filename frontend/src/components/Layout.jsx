import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="page-wrapper">
            <Navbar />
            <main className="main-content">
                {children}
            </main>
            <footer style={{
                textAlign: 'center',
                padding: '2rem',
                color: 'var(--text-secondary)',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                marginTop: 'auto'
            }}>
                <p>&copy; {new Date().getFullYear()} AegisAI. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;
