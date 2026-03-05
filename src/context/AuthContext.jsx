import { createContext, useContext, useState, useEffect } from 'react';
import { authService, getIsDemoMode } from '../services/supabase';
import { tierGuard } from '../services/tierGuard';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [demoModeActive, setDemoModeActive] = useState(getIsDemoMode());

    useEffect(() => {
        // Check initial session
        authService.getSession().then(session => {
            setUser(session?.user ?? null);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const assignTier = (email) => {
        if (!email) return;
        const e = email.toLowerCase();
        if (e.includes('admin')) tierGuard.setTier('admin');
        else if (e.includes('clinic')) tierGuard.setTier('clinic');
        else if (e.includes('pro')) tierGuard.setTier('pro');
        else tierGuard.setTier('free');
    };

    const signUp = async (email, password, fullName) => {
        // Hardcode bypass for demo accounts even if Supabase is connected
        if (email.endsWith('@example.com')) {
            localStorage.setItem('shadow_fitness_demo_mode', 'true');
            setDemoModeActive(true);
            const mockUser = { id: `demo-${email}`, email, user_metadata: { full_name: fullName || 'Demo User' } };
            setUser(mockUser);
            assignTier(email);
            return { user: mockUser, session: { user: mockUser } };
        }

        const data = await authService.signUp(email, password, fullName);
        if (getIsDemoMode()) {
            setUser(data.user);
            assignTier(email);
        }
        return data;
    };

    const signIn = async (email, password) => {
        // Hardcode bypass for demo accounts even if Supabase is connected
        if (email.endsWith('@example.com')) {
            localStorage.setItem('shadow_fitness_demo_mode', 'true');
            setDemoModeActive(true);
            const mockUser = { id: `demo-${email}`, email, user_metadata: { full_name: 'Demo User' } };
            setUser(mockUser);
            assignTier(email);
            return { user: mockUser, session: { user: mockUser } };
        }

        const data = await authService.signIn(email, password);
        if (getIsDemoMode()) {
            setUser(data.user);
            assignTier(email);
        }
        return data;
    };

    const signOut = async () => {
        localStorage.removeItem('shadow_fitness_demo_mode');
        setDemoModeActive(getIsDemoMode());
        await authService.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, isDemoMode: demoModeActive }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
