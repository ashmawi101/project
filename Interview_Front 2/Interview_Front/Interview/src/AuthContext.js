import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({ isAuthenticated: false, token: null, username: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const refresh_token = localStorage.getItem('refresh_token')
        const username = localStorage.getItem('username');
        if (token && username && refresh_token) {
            console.log('Tokens and username found in local storage:', token, username);
            setAuth({ isAuthenticated: true, token, username });
        } else {
            console.log('No token or username in local storage');
        }
        setLoading(false);
    }, []);

    const login = (token , refresh_token , username) => {
        console.log('Logging in with token and username:', token, username);
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('refresh_token', refresh_token);
        setAuth({ isAuthenticated: true, token, username });
        console.log('Authentication state after login:', { isAuthenticated: true, token, username });
    };

    const register = (token , refresh_token , username) => {
        console.log('Logging in with token and username:', token, username);
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('refresh_token', refresh_token);
        setAuth({ isAuthenticated: true, token, username });
        console.log('Authentication state after register:', { isAuthenticated: true, token, username });
    };

    const logout = () => {
        console.log('Logging out');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('refresh_token');
        setAuth({ isAuthenticated: false, token: null, username: null });
        console.log('Authentication state after logout:', { isAuthenticated: false, token: null, username: null });
    };

    return (
        <AuthContext.Provider value={{ auth, register, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
