import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && user.role !== requiredRole) {
        // Redirect to their appropriate dashboard if they don't have permission
        return <Navigate to={user.role === 'admin' ? '/admin-dashboard' : '/dashboard'} />;
    }

    return children;
};

export default PrivateRoute;
