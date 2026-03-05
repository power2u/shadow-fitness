import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { clientService } from '../services/supabase';
import { tierGuard } from '../services/tierGuard';
import {
    Plus, Search, Users, Trash2, ArrowRight, X,
    Dumbbell, Calendar, Heart, FileText, ClipboardList
} from 'lucide-react';
import QuestionnaireForm from '../components/questionnaire/QuestionnaireForm';
import UpgradeModal from '../components/ui/UpgradeModal';
import './ClientsPage.css';

import Modal from '../components/ui/Modal';
import { workoutService } from '../services/supabase';

export default function ClientsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState('');
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'history'

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

    const loadHistory = async (clientId) => {
        setLoadingHistory(true);
        try {
            const data = await workoutService.getByClientId(clientId);
            setHistory(data || []);
        } catch (err) {
            console.error('Error loading history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (selectedClient) {
            loadHistory(selectedClient.id);
            setActiveTab('profile');
        }
    }, [selectedClient]);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this client?')) return;
        try {
            await clientService.delete(id);
            setClients(clients.filter(c => c.id !== id));
        } catch (err) {
            console.error('Error deleting client:', err);
        }
    };

    const handleFormComplete = async (clientData) => {
        try {
            await clientService.create(user.id, clientData);
            await loadClients();
            setShowForm(false);
        } catch (err) {
            console.error('Error creating client:', err);
        }
    };

    const handleAddClient = () => {
        const check = tierGuard.checkLimit('clients', clients.length);
        if (!check.allowed) {
            setUpgradeReason(check.reason);
            setShowUpgrade(true);
            return;
        }
        setShowForm(true);
    };

    const filtered = clients.filter(c =>
        c.full_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-enter">
            <div className="page-header">
                <div>
                    <h1>Clients</h1>
                    <p>Manage your clients and their profiles</p>
                </div>
                <button className="btn btn-primary" onClick={handleAddClient}>
                    <Plus size={18} /> Add Client
                </button>
            </div>

            {/* Search */}
            {clients.length > 0 && (
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        className="input-field search-input"
                        placeholder="Search clients..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            )}

            {/* Client List */}
            {loading ? (
                <div className="clients-loading">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-md)' }} />
                    ))}
                </div>
            ) : filtered.length === 0 && !search ? (
                <div className="empty-state">
                    <div className="empty-icon"><Users size={28} /></div>
                    <h3>No clients yet</h3>
                    <p>Add your first client by filling out the onboarding questionnaire</p>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <Plus size={18} /> Add Your First Client
                    </button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <h3>No results found</h3>
                    <p>Try a different search term</p>
                </div>
            ) : (
                <div className="clients-grid">
                    {filtered.map((client, i) => (
                        <motion.div
                            key={client.id}
                            className="client-card glass-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                            whileHover={{ y: -3 }}
                        >
                            <div className="client-card-header">
                                <div className="client-avatar-lg">
                                    {client.full_name[0].toUpperCase()}
                                </div>
                                <button className="btn btn-ghost btn-icon client-delete" onClick={() => handleDelete(client.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <h3 className="client-name">{client.full_name}</h3>
                            <div className="client-meta">
                                {client.questionnaire?.age && <span>{client.questionnaire.age} yrs</span>}
                                {client.questionnaire?.sex && <span>{client.questionnaire.sex}</span>}
                                {client.questionnaire?.weight && <span>{client.questionnaire.weight}</span>}
                            </div>
                            {client.questionnaire?.primaryGoal && (
                                <div className="client-goal">
                                    <span className="badge badge-accent">{client.questionnaire.primaryGoal}</span>
                                </div>
                            )}
                            {client.questionnaire?.conditions?.length > 0 && (
                                <div className="client-conditions">
                                    {client.questionnaire.conditions.slice(0, 2).map(c => (
                                        <span key={c} className="badge badge-pink">{c}</span>
                                    ))}
                                </div>
                            )}
                            <div className="client-card-actions">
                                <button className="btn btn-secondary" onClick={() => { setSelectedClient(client); }}>
                                    View Profile
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Questionnaire Modal (PORTAL) */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title="New Client Onboarding"
                padding="0" // Reset padding as form has its own padding/header
            >
                <QuestionnaireForm onComplete={handleFormComplete} onCancel={() => setShowForm(false)} />
            </Modal>

            {/* Client Profile Modal (PORTAL) */}
            <Modal
                isOpen={!!selectedClient}
                onClose={() => setSelectedClient(null)}
                title={selectedClient?.full_name}
                maxWidth="800px"
            >
                {selectedClient && (
                    <div className="client-profile-container">
                        <div className="profile-tabs">
                            <button
                                className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <ClipboardList size={16} /> Profile Info
                            </button>
                            <button
                                className={`profile-tab ${activeTab === 'history' ? 'active' : ''}`}
                                onClick={() => setActiveTab('history')}
                            >
                                <Dumbbell size={16} /> Workout History
                            </button>
                        </div>

                        <div className="profile-tab-content">
                            {activeTab === 'profile' ? (
                                <div className="profile-content">
                                    {selectedClient.questionnaire ? (
                                        <div className="profile-sections">
                                            {Object.entries(selectedClient.questionnaire).map(([key, value]) => (
                                                <div key={key} className="profile-field">
                                                    <span className="profile-field-label">
                                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                                                    </span>
                                                    <span className="profile-field-value">
                                                        {Array.isArray(value) ? value.join(', ') : String(value || '—')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: 'var(--text-secondary)' }}>No questionnaire data available.</p>
                                    )}
                                </div>
                            ) : (
                                <div className="history-content">
                                    {loadingHistory ? (
                                        <div className="history-loading">
                                            <div className="spinner" /> Loading history...
                                        </div>
                                    ) : history.length === 0 ? (
                                        <div className="empty-history">
                                            <p>No saved workouts found for this client.</p>
                                        </div>
                                    ) : (
                                        <div className="history-list">
                                            {history.map((plan, i) => (
                                                <div key={plan.id || i} className="history-item glass-card">
                                                    <div className="history-item-header">
                                                        <div>
                                                            <h4>{plan.plan_name}</h4>
                                                            <span className="history-date">
                                                                <Calendar size={12} /> {new Date(plan.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        {plan.focus_muscle && (
                                                            <span className="badge badge-violet">
                                                                Focus: {plan.focus_muscle} ({plan.focus_bias_level})
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="history-item-actions">
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={() => {
                                                                // In a real app we'd navigate to builder with this plan loaded
                                                                // For now, just a placeholder or shortcut
                                                                localStorage.setItem('shadow_fitness_active_plan', JSON.stringify(plan.plan_json));
                                                                navigate('/dashboard/workouts');
                                                            }}
                                                        >
                                                            Load Plan
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)}
                reason={upgradeReason} currentTier={tierGuard.getTier()} />
        </div>
    );
}

