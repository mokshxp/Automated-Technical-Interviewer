import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

interface User {
    id: number;
    email: string;
    full_name: string;
}

interface Subscription {
    plan_type: string;
    billing_interval: string;
    status: string;
    end_date: string;
}

interface AuthContextType {
    user: User | null;
    subscription: Subscription | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    refreshSubscription: () => Promise<void>;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const refreshSubscription = async () => {
        if (!token) return;
        try {
            const response = await axios.get('http://localhost:8000/auth/me/subscription');
            setSubscription(response.data);
        } catch (error) {
            console.error("Failed to fetch subscription", error);
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            if (token) {
                try {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const [userRes, subRes] = await Promise.all([
                        axios.get('http://localhost:8000/auth/me'),
                        axios.get('http://localhost:8000/auth/me/subscription')
                    ]);
                    setUser(userRes.data);
                    setSubscription(subRes.data);
                } catch (error) {
                    console.error("Auth initialization failed", error);
                    logout();
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, [token]);

    const login = (newToken: string) => {
        setLoading(true);
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{
            user,
            subscription,
            token,
            login,
            logout,
            refreshSubscription,
            isAuthenticated: !!user,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
