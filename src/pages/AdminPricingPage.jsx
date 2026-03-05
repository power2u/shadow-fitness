import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tierGuard } from '../services/tierGuard';
import { adminService } from '../services/supabase';
import './AdminPricingPage.css';

export default function AdminPricingPage() {
    const [tiers, setTiers] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState({ type: '', msg: '' });

    const isAdmin = tierGuard.getTier() === 'admin';

    useEffect(() => {
        if (!isAdmin) return;
        loadTiers();
    }, [isAdmin]);

    const loadTiers = async () => {
        setLoading(true);
        try {
            const data = await adminService.getPricingTiers();
            if (data) {
                // Keep track of original state to detect dirtiness if needed
                setTiers(data);
            } else {
                // Fallback to local definitions if DB is empty
                setTiers(tierGuard.getLimits() ? { [tierGuard.getTier()]: tierGuard.getLimits() } : {});
                setNotification({ type: 'warning', msg: 'No tier definitions found in DB. Showing local fallback.' });
            }
        } catch (err) {
            console.error('Failed to load pricing tiers:', err);
            setNotification({ type: 'error', msg: 'Failed to connect to database.' });
        }
        setLoading(false);
    };

    const handleChange = (tierId, field, value) => {
        setTiers(prev => ({
            ...prev,
            [tierId]: {
                ...prev[tierId],
                [field]: value,
                isDirty: true
            }
        }));
    };

    const handleSave = async (tierId) => {
        setSaving(true);
        try {
            await adminService.updatePricingTier(tierId, tiers[tierId]);
            await tierGuard.refreshTiers(); // Refresh global cache
            setNotification({ type: 'success', msg: `${tiers[tierId].label} tier updated successfully.` });
            setTiers(prev => ({
                ...prev,
                [tierId]: { ...prev[tierId], isDirty: false }
            }));
            setTimeout(() => setNotification({ type: '', msg: '' }), 3000);
        } catch (err) {
            console.error('Error saving tier:', err);
            setNotification({ type: 'error', msg: 'Failed to save changes.' });
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

    return (
        <div className="admin-pricing-page">
            <header className="page-header">
                <Link to="/dashboard/admin" className="back-link">
                    <ChevronLeft size={20} /> Back to Dashboard
                </Link>
                <div>
                    <h1>Tier & Pricing Management</h1>
                    <p className="subtitle">Configure limits, permissions, and features for each subscription tier</p>
                </div>
            </header>

            {notification.msg && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`admin-notification glass-card ${notification.type}`}
                >
                    {notification.msg}
                </motion.div>
            )}

            {loading ? (
                <div className="loading-state">Loading tier configurations...</div>
            ) : (
                <div className="tiers-grid">
                    {Object.entries(tiers).map(([id, tier]) => (
                        <div key={id} className={`tier-edit-card glass-card ${tier.isDirty ? 'dirty' : ''}`}>
                            <div className="tier-header" style={{ borderTopColor: tier.color }}>
                                <h3>{tier.label}</h3>
                                <span className="tier-id-badge">{id}</span>
                            </div>

                            <div className="tier-form">
                                <div className="form-group">
                                    <label>Tier Label</label>
                                    <input
                                        type="text"
                                        value={tier.label}
                                        onChange={(e) => handleChange(id, 'label', e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Theme Color (Hex)</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="color"
                                            value={tier.color || '#ffffff'}
                                            onChange={(e) => handleChange(id, 'color', e.target.value)}
                                            style={{ width: '40px', padding: '0', border: 'none', background: 'none' }}
                                        />
                                        <input
                                            type="text"
                                            value={tier.color || ''}
                                            onChange={(e) => handleChange(id, 'color', e.target.value)}
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Max Clients</label>
                                        <input
                                            type="number"
                                            value={tier.maxClients}
                                            onChange={(e) => handleChange(id, 'maxClients', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Team Seats</label>
                                        <input
                                            type="number"
                                            value={tier.teamSeats}
                                            onChange={(e) => handleChange(id, 'teamSeats', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Workouts / Month</label>
                                        <input
                                            type="number"
                                            value={tier.workoutPlansPerMonth}
                                            onChange={(e) => handleChange(id, 'workoutPlansPerMonth', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Meals / Month</label>
                                        <input
                                            type="number"
                                            value={tier.mealPlansPerMonth}
                                            onChange={(e) => handleChange(id, 'mealPlansPerMonth', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Max PDF Books</label>
                                    <input
                                        type="number"
                                        value={tier.maxPdfBooks}
                                        onChange={(e) => handleChange(id, 'maxPdfBooks', parseInt(e.target.value))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Drug-Nutrient Level</label>
                                    <select
                                        value={tier.drugNutrientLevel}
                                        onChange={(e) => handleChange(id, 'drugNutrientLevel', e.target.value)}
                                    >
                                        <option value="basic">Basic (Standard alerts)</option>
                                        <option value="full">Full (Comprehensive checks)</option>
                                    </select>
                                </div>

                                <div className="form-toggles">
                                    <label className="toggle-label">
                                        <input
                                            type="checkbox"
                                            checked={tier.ingredientSelector}
                                            onChange={(e) => handleChange(id, 'ingredientSelector', e.target.checked)}
                                        />
                                        <span>Enable Ingredient Selector</span>
                                    </label>
                                    <label className="toggle-label">
                                        <input
                                            type="checkbox"
                                            checked={tier.pdfUpload}
                                            onChange={(e) => handleChange(id, 'pdfUpload', e.target.checked)}
                                        />
                                        <span>Enable PDF Upload Base</span>
                                    </label>
                                    <label className="toggle-label">
                                        <input
                                            type="checkbox"
                                            checked={tier.exportEnabled}
                                            onChange={(e) => handleChange(id, 'exportEnabled', e.target.checked)}
                                        />
                                        <span>Enable DOCX/PDF Exports</span>
                                    </label>
                                </div>
                            </div>

                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: 'var(--space-4)' }}
                                disabled={!tier.isDirty || saving}
                                onClick={() => handleSave(id)}
                            >
                                <Save size={16} style={{ marginRight: '6px' }} />
                                {saving ? 'Saving...' : 'Save Tier Config'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
