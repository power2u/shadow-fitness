import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Users, Dumbbell, Utensils, BookOpen,
    LogOut, Activity, ChevronLeft, ChevronRight, Menu, X, Gauge, Shield
} from 'lucide-react';
import UsageOverlay from './UsageOverlay';
import { tierGuard } from '../../services/tierGuard';
import './DashboardLayout.css';

const NAV_ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/dashboard/clients', icon: Users, label: 'Clients' },
    { to: '/dashboard/workouts', icon: Dumbbell, label: 'Workouts' },
    { to: '/dashboard/meals', icon: Utensils, label: 'Meals' },
    { to: '/dashboard/knowledge', icon: BookOpen, label: 'Knowledge' },
    { to: '/dashboard/usage', icon: Gauge, label: 'API Usage' },
];

export default function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    // Add Admin conditionally
    const isAdmin = tierGuard.getTier() === 'admin';
    const activeNavItems = isAdmin
        ? [...NAV_ITEMS, { to: '/dashboard/admin', icon: Shield, label: 'Admin Panel' }]
        : NAV_ITEMS;

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className={`dashboard-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        className="sidebar-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`sidebar glass-card ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <div className="logo-icon"><Activity size={20} /></div>
                        {!collapsed && <span className="logo-text">Shadow<span className="text-gradient">Fitness</span></span>}
                    </div>
                    <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {activeNavItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                            onClick={() => setMobileOpen(false)}
                        >
                            <item.icon size={20} />
                            {!collapsed && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="sidebar-link" onClick={handleSignOut}>
                        <LogOut size={20} />
                        {!collapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="dashboard-main">
                <header className="dashboard-header">
                    <button className="mobile-sidebar-btn" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <div className="header-spacer" />
                    <div className="header-user">
                        <div className="user-avatar">
                            {(user?.user_metadata?.full_name || user?.email || 'C')[0].toUpperCase()}
                        </div>
                        {!collapsed && (
                            <span className="user-name">{user?.user_metadata?.full_name || user?.email || 'Coach'}</span>
                        )}
                    </div>
                </header>

                <main className="dashboard-content">
                    <Outlet />
                </main>

                <UsageOverlay />
            </div>
        </div>
    );
}
