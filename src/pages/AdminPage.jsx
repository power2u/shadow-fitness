import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Database, Activity, Server, FileText, ChevronRight, Shield, Settings, Palette } from 'lucide-react';
import { tierGuard } from '../services/tierGuard';
import { adminService } from '../services/supabase';
import { usageTracker } from '../services/usageTracker';
import './AdminPage.css';

export default function AdminPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeSubscriptions: 0,
        totalPlansGenerated: 0,
        knowledgeBaseDocs: 0
    });
    const [recentSignups, setRecentSignups] = useState([]);
    const [systemLatency, setSystemLatency] = useState(0);
    const [geminiQuota, setGeminiQuota] = useState(0);

    const isAdmin = tierGuard.getTier() === 'admin';

    useEffect(() => {
        if (!isAdmin) return;
        const fetchData = async () => {
            try {
                const [dashStats, signups, latency] = await Promise.all([
                    adminService.getDashboardStats(),
                    adminService.getRecentSignups(),
                    adminService.ping()
                ]);
                setStats(dashStats);
                setRecentSignups(signups);
                setSystemLatency(latency);

                const usage = usageTracker.getStats();
                const quotas = usageTracker.getQuotas();
                const quotaPercent = Math.min(100, Math.round((usage.thisMonth.cost / quotas.monthlyCostLimit) * 100)) || 0;
                setGeminiQuota(quotaPercent);
            } catch (error) {
                console.error('Failed to load admin stats:', error);
            }
        };
        fetchData();
        // Refresh every 30s
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [isAdmin]);

    if (!isAdmin) {
        return (
            <div className="admin-page">
                <div className="admin-error glass-card">
                    <Shield size={48} className="error-icon" />
                    <h2>Access Denied</h2>
                    <p>You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <header className="page-header">
                <div>
                    <h1>System Administration</h1>
                    <p className="subtitle">Manage platform users, subscriptions, and system metrics</p>
                </div>
            </header>

            <div className="admin-stats-grid">
                <motion.div className="stat-card glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="stat-header">
                        <span className="stat-label">Total Users</span>
                        <div className="stat-icon users"><Users size={20} /></div>
                    </div>
                    <div className="stat-value">{stats.totalUsers}</div>
                    <div className="stat-trend neutral">Live from DB</div>
                </motion.div>

                <motion.div className="stat-card glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="stat-header">
                        <span className="stat-label">Active Subs</span>
                        <div className="stat-icon subs"><Activity size={20} /></div>
                    </div>
                    <div className="stat-value">{stats.activeSubscriptions}</div>
                    <div className="stat-trend neutral">Live from DB</div>
                </motion.div>

                <motion.div className="stat-card glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="stat-header">
                        <span className="stat-label">Plans Generated</span>
                        <div className="stat-icon plans"><FileText size={20} /></div>
                    </div>
                    <div className="stat-value">{stats.totalPlansGenerated}</div>
                    <div className="stat-trend neutral">Live from DB</div>
                </motion.div>

                <motion.div className="stat-card glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <div className="stat-header">
                        <span className="stat-label">Knowledge Base</span>
                        <div className="stat-icon kb"><Database size={20} /></div>
                    </div>
                    <div className="stat-value">{stats.knowledgeBaseDocs}</div>
                    <div className="stat-trend neutral">Stable</div>
                </motion.div>
            </div>

            <div className="admin-content-grid">
                <motion.div className="admin-table-card glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <div className="card-header">
                        <h3>Recent Signups</h3>
                        <Link to="/dashboard/admin/users" className="text-btn">Manage Users</Link>
                    </div>
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>User Email</th>
                                    <th>Tier</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentSignups.map((user, i) => (
                                    <tr key={i}>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`tier-badge tier-${user.tier}`}>{user.tier.toUpperCase()}</span>
                                        </td>
                                        <td>{user.date}</td>
                                        <td>
                                            <Link to="/dashboard/admin/users" className="icon-btn"><ChevronRight size={16} /></Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                <motion.div className="admin-system-card glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <div className="card-header">
                        <h3>System Status</h3>
                        <div className="status-indicator online"></div>
                    </div>
                    <div className="system-metrics">
                        <div className="metric">
                            <Server size={18} />
                            <div className="metric-info">
                                <span>API Latency</span>
                                <strong>{systemLatency}ms</strong>
                            </div>
                        </div>
                        <div className="metric">
                            <Database size={18} />
                            <div className="metric-info">
                                <span>Database Load</span>
                                <strong>System Normal</strong>
                            </div>
                        </div>
                        <div className="metric">
                            <Activity size={18} />
                            <div className="metric-info">
                                <span>Gemini API Quota</span>
                                <strong>{geminiQuota}% Used</strong>
                            </div>
                        </div>
                    </div>
                    <div className="system-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                        <Link to="/dashboard/admin/pricing" className="btn btn-secondary">
                            <Settings size={16} /> Pricing
                        </Link>
                        <Link to="/dashboard/admin/design" className="btn btn-secondary">
                            <Palette size={16} /> Design
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
