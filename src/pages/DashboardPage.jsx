import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { clientService } from '../services/supabase';
import { tierGuard, TIER_LIMITS } from '../services/tierGuard';
import { Users, Dumbbell, Utensils, BookOpen, Plus, ArrowRight, TrendingUp, Crown, Shield, Zap } from 'lucide-react';
import UpgradeModal from '../components/ui/UpgradeModal';
import './DashboardPage.css';

const TIER_ICONS = { free: Zap, pro: Crown, clinic: Shield };

export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpgrade, setShowUpgrade] = useState(false);

    const tierInfo = tierGuard.getTierInfo();
    const TierIcon = TIER_ICONS[tierInfo.tier] || Zap;

    useEffect(() => {
        if (user) loadClients();
    }, [user]);

    const loadClients = async () => {
        try {
            const data = await clientService.getAll(user.id);
            setClients(data || []);
        } catch (err) {
            console.error('Error loading clients:', err);
        } finally {
            setLoading(false);
        }
    };

    const usageData = tierGuard.getDashboardUsage(clients.length);

    const stats = [
        { label: 'Total Clients', value: clients.length, icon: <Users size={22} />, color: 'var(--accent-cyan)' },
        { label: 'Workout Plans', value: usageData.workoutPlans.current + '/' + (usageData.workoutPlans.limit >= 999999 ? '∞' : usageData.workoutPlans.limit), icon: <Dumbbell size={22} />, color: 'var(--accent-blue)' },
        { label: 'Meal Plans', value: usageData.mealPlans.current + '/' + (usageData.mealPlans.limit >= 999999 ? '∞' : usageData.mealPlans.limit), icon: <Utensils size={22} />, color: 'var(--accent-violet)' },
        { label: 'Knowledge Entries', value: '10+', icon: <BookOpen size={22} />, color: 'var(--accent-pink)' },
    ];

    const quickActions = [
        { label: 'Add Client', icon: <Users size={20} />, to: '/dashboard/clients', gradient: 'var(--gradient-primary)' },
        { label: 'Build Workout', icon: <Dumbbell size={20} />, to: '/dashboard/workouts', gradient: 'var(--gradient-secondary)' },
        { label: 'Build Meal Plan', icon: <Utensils size={20} />, to: '/dashboard/meals', gradient: 'var(--gradient-warm)' },
    ];

    const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Coach';

    return (
        <div className="page-enter">
            <div className="page-header">
                <div>
                    <h1>Welcome back, <span className="text-gradient">{firstName}</span></h1>
                    <p>Your coaching dashboard overview</p>
                </div>
                <div className="tier-badge-wrap">
                    <button className="tier-badge" style={{ borderColor: tierInfo.color + '40', color: tierInfo.color }}
                        onClick={() => setShowUpgrade(true)}>
                        <TierIcon size={14} />
                        <span>{tierInfo.label} Plan</span>
                        {tierInfo.tier === 'free' && <span className="tier-upgrade-hint">Upgrade</span>}
                    </button>
                </div>
            </div>

            {/* Usage Meters */}
            <div className="usage-meters glass-card">
                <h3 className="meters-title">Monthly Usage</h3>
                <div className="meters-grid">
                    {Object.values(usageData).map((meter, i) => {
                        const pct = meter.limit >= 999999 ? 5 : Math.min((meter.current / meter.limit) * 100, 100);
                        const isNearLimit = pct >= 80 && meter.limit < 999999;
                        return (
                            <div key={i} className="meter-item">
                                <div className="meter-label-row">
                                    <span className="meter-label">{meter.label}</span>
                                    <span className={`meter-count ${isNearLimit ? 'near-limit' : ''}`}>
                                        {meter.current}/{meter.limit >= 999999 ? '∞' : meter.limit}
                                    </span>
                                </div>
                                <motion.div className="meter-bar-bg">
                                    <motion.div
                                        className={`meter-bar-fill ${isNearLimit ? 'meter-warning' : ''}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.15, ease: [0.25, 0.8, 0.25, 1] }}
                                    />
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        className="stat-card glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                    >
                        <div className="stat-icon" style={{ color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-value">{loading ? '—' : stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <section className="dashboard-section">
                <h2 className="section-heading">Quick Actions</h2>
                <div className="quick-actions">
                    {quickActions.map((action, i) => (
                        <motion.button
                            key={action.label}
                            className="quick-action glass-card"
                            onClick={() => navigate(action.to)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                            whileHover={{ y: -3 }}
                        >
                            <div className="quick-action-icon" style={{ background: action.gradient }}>
                                {action.icon}
                            </div>
                            <span>{action.label}</span>
                            <ArrowRight size={16} className="quick-action-arrow" />
                        </motion.button>
                    ))}
                </div>
            </section>

            {/* Recent Clients */}
            <section className="dashboard-section">
                <div className="section-heading-row">
                    <h2 className="section-heading">Recent Clients</h2>
                    {clients.length > 0 && (
                        <button className="btn btn-ghost" onClick={() => navigate('/dashboard/clients')}>
                            View All <ArrowRight size={14} />
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="clients-loading">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="skeleton" style={{ height: 72, borderRadius: 'var(--radius-md)' }} />
                        ))}
                    </div>
                ) : clients.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon"><Users size={28} /></div>
                        <h3>No clients yet</h3>
                        <p>Add your first client to start building personalized plans</p>
                        <button className="btn btn-primary" onClick={() => navigate('/dashboard/clients')}>
                            <Plus size={18} /> Add Client
                        </button>
                    </div>
                ) : (
                    <div className="recent-clients-list">
                        {clients.slice(0, 5).map((client, i) => (
                            <motion.div
                                key={client.id}
                                className="client-row glass-card"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.05 }}
                            >
                                <div className="client-row-avatar">
                                    {client.full_name[0].toUpperCase()}
                                </div>
                                <div className="client-row-info">
                                    <span className="client-row-name">{client.full_name}</span>
                                    <span className="client-row-date">Added {new Date(client.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="client-row-tags">
                                    {client.questionnaire?.primaryGoal && (
                                        <span className="badge badge-accent">{client.questionnaire.primaryGoal}</span>
                                    )}
                                </div>
                                <button className="btn btn-ghost btn-icon" onClick={() => navigate(`/dashboard/clients`)}>
                                    <ArrowRight size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} currentTier={tierInfo.tier}
                reason={tierInfo.tier === 'free' ? 'Unlock more clients, plans, exports & advanced features' : null} />
        </div>
    );
}
