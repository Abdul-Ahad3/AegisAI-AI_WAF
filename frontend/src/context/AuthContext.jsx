import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // Initial seed data for testing
    const [users, setUsers] = useState([
        {
            name: 'Admin User',
            email: 'admin@aegis.ai',
            phone: '1234567890',
            password: 'admin',
            role: 'admin'
        }
    ]);

    const login = (email, password) => {
        const foundUser = users.find(u => u.email === email && u.password === password);
        if (foundUser) {
            setUser(foundUser);
            return { success: true };
        }
        return { success: false, message: 'Invalid credentials' };
    };

    const signup = (userData) => {
        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: 'User already exists' };
        }
        const newUser = { ...userData };
        setUsers([...users, newUser]);
        setUser(newUser); // Auto login after signup
        return { success: true };
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
