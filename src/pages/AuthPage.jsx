import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import './AuthPage.css';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const { signIn, signUp } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (isLogin) {
                await signIn(email, password);
                navigate('/dashboard');
            } else {
                const data = await signUp(email, password, fullName);
                // Check if email confirmation is needed
                if (data?.user && !data?.session) {
                    setSuccess('Account created! Check your email to confirm, then sign in.');
                    setIsLogin(true);
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg">
                <div className="auth-orb auth-orb-1" />
                <div className="auth-orb auth-orb-2" />
            </div>

            <motion.div
                className="auth-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="auth-card glass-card">
                    <div className="auth-header">
                        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                            <div className="logo-icon"><Activity size={24} /></div>
                            <span className="logo-text">Shadow<span className="text-gradient">Fitness</span></span>
                        </div>
                        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                        <p>{isLogin ? 'Sign in to your coaching dashboard' : 'Start building science-backed plans'}</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                className="auth-error"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div
                                className="auth-success"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                {success}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    className="input-group"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <label className="input-label">Full Name</label>
                                    <div className="input-wrapper">
                                        <User size={18} className="input-icon" />
                                        <input
                                            type="text"
                                            className="input-field input-with-icon"
                                            placeholder="Your full name"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required={!isLogin}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="input-group">
                            <label className="input-label">Email</label>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
                                <input
                                    type="email"
                                    className="input-field input-with-icon"
                                    placeholder="you@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-field input-with-icon"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg auth-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="spinner" />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <span>{isLogin ? "Don't have an account?" : 'Already have an account?'}</span>
                        <button
                            className="auth-toggle"
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </div>

                    {/* Quick Demo Logins */}
                    {isLogin && (
                        <div className="demo-logins">
                            <button className="demo-btn" onClick={() => { setEmail('admin@example.com'); setPassword('demo123'); }}>Admin</button>
                            <button className="demo-btn" onClick={() => { setEmail('clinic@example.com'); setPassword('demo123'); }}>Clinic</button>
                            <button className="demo-btn" onClick={() => { setEmail('pro@example.com'); setPassword('demo123'); }}>Pro</button>
                            <button className="demo-btn" onClick={() => { setEmail('demo@example.com'); setPassword('demo123'); }}>Free</button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
