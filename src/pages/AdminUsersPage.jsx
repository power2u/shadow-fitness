import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronLeft, Search, Save, Trash2, X, Plus, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tierGuard } from '../services/tierGuard';
import { adminService } from '../services/supabase';
import './AdminUsersPage.css';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: 'success' });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUserData, setNewUserData] = useState({
        email: '',
        password: '',
        fullName: '',
        tier: 'free'
    });

    const isAdmin = tierGuard.getTier() === 'admin';

    useEffect(() => {
        if (!isAdmin) return;
        loadUsers();
    }, [isAdmin]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error('Failed to load users:', err);
        }
        setLoading(false);
    };

    const notify = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: 'success' }), 3000);
    };

    const handleTierChange = (id, newTier) => {
        setUsers(users.map(u => u.id === id ? { ...u, tier: newTier, isDirty: true } : u));
    };

    const saveChanges = async (id, newTier) => {
        setSaving(true);
        try {
            await adminService.updateUserTier(id, newTier);
            notify('User tier updated successfully.');
            setUsers(users.map(u => u.id === id ? { ...u, isDirty: false } : u));
        } catch (err) {
            console.error('Error updating user tier:', err);
            notify('Failed to update tier.', 'error');
        }
        setSaving(false);
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const newUser = await adminService.createUser(newUserData);
            setUsers([newUser, ...users]);
            notify('User created successfully.');
            setShowCreateModal(false);
            setNewUserData({ email: '', password: '', fullName: '', tier: 'free' });
        } catch (err) {
            console.error('Error creating user:', err);
            notify('Failed to create user: ' + err.message, 'error');
        }
        setSaving(false);
    };

    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`Are you sure you want to remove ${name} from the platform records? This will revoke their access.`)) {
            return;
        }

        setSaving(true);
        try {
            await adminService.deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
            notify('User removed successfully.');
        } catch (err) {
            console.error('Error deleting user:', err);
            notify('Failed to delete user.', 'error');
        }
        setSaving(false);
    };

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

    const filteredUsers = users.filter(u =>
        (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-users-page">
            <header className="page-header">
                <Link to="/dashboard/admin" className="back-link">
                    <ChevronLeft size={20} /> Back to Dashboard
                </Link>
                <div>
                    <h1>Manage Users</h1>
                    <p className="subtitle">View user accounts and manage their subscription tiers</p>
                </div>
            </header>

            {notification.message && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`admin-notification glass-card ${notification.type}`}>
                    {notification.message}
                </motion.div>
            )}

            <div className="users-controls">
                <div className="search-bar glass-input-wrap">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="create-btn" onClick={() => setShowCreateModal(true)}>
                    <UserPlus size={18} /> Create New User
                </button>
            </div>

            <div className="glass-card users-table-card">
                {loading ? (
                    <div className="loading-state">Loading users...</div>
                ) : (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>User Details</th>
                                    <th>Current Tier</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-info">
                                                <strong>{user.name}</strong>
                                                <span>{user.email || user.id}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <select
                                                className="tier-select"
                                                value={user.tier}
                                                onChange={(e) => handleTierChange(user.id, e.target.value)}
                                            >
                                                <option value="free">Free</option>
                                                <option value="pro">Pro</option>
                                                <option value="clinic">Clinic</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="actions-cell">
                                            <button
                                                className="btn btn-primary btn-sm"
                                                disabled={!user.isDirty || saving}
                                                onClick={() => saveChanges(user.id, user.tier)}
                                            >
                                                <Save size={14} style={{ marginRight: '6px' }} /> Save
                                            </button>
                                            <button
                                                className="btn-delete"
                                                title="Delete User"
                                                disabled={saving}
                                                onClick={() => handleDeleteUser(user.id, user.name)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>No users found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {/* Create User Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div className="modal-header">
                                <h2>Create New User</h2>
                                <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form className="modal-form" onSubmit={handleCreateUser}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Coach Name"
                                        required
                                        value={newUserData.fullName}
                                        onChange={e => setNewUserData({ ...newUserData, fullName: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="coach@example.com"
                                        required
                                        value={newUserData.email}
                                        onChange={e => setNewUserData({ ...newUserData, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        placeholder="Set initial password"
                                        required
                                        minLength={6}
                                        value={newUserData.password}
                                        onChange={e => setNewUserData({ ...newUserData, password: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Platform Tier</label>
                                    <select
                                        value={newUserData.tier}
                                        onChange={e => setNewUserData({ ...newUserData, tier: e.target.value })}
                                    >
                                        <option value="free">Free</option>
                                        <option value="pro">Pro</option>
                                        <option value="clinic">Clinic</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn-text"
                                        onClick={() => setShowCreateModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? 'Creating...' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
