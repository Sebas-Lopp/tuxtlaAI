import { createContext, useContext, useState } from 'react';
import { setSession as persistSession, clearSession, getSession } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [session, setSessionState] = useState(() => getSession());

    const setSession = (s) => {
        persistSession(s);
        setSessionState(s);
    };

    const logout = () => {
        clearSession();
        setSessionState(null);
    };

    return (
        <AuthContext.Provider value={{ session, setSession, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
