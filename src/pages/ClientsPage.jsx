import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { clientService } from '../services/supabase';
import { tierGuard } from '../services/tierGuard';
import {
    Plus, Search, Users, Trash2, ArrowRight, X,
    Dumbbell, Calendar, Heart, FileText, ClipboardList, Info,
    Eye, Copy, ScrollText, ChevronLeft, Utensils
} from 'lucide-react';
import QuestionnaireForm from '../components/questionnaire/QuestionnaireForm';
import UpgradeModal from '../components/ui/UpgradeModal';
import './ClientsPage.css';

import Modal from '../components/ui/Modal';
import { workoutService, mealService } from '../services/supabase';
import WorkoutViewer from '../components/workouts/WorkoutViewer';
import MealViewer from '../components/meals/MealViewer';

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
    const [mealHistory, setMealHistory] = useState([]);
    const [loadingMealHistory, setLoadingMealHistory] = useState(false);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'history', 'meals'
    const [archivingId, setArchivingId] = useState(null);
    const [viewingPlan, setViewingPlan] = useState(null);
    const [viewingMeal, setViewingMeal] = useState(null);

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
            // Only show active plans (not archived)
            setHistory((data || []).filter(p => p.status !== 'archived'));
        } catch (err) {
            console.error('Error loading history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const loadMealHistory = async (clientId) => {
        setLoadingMealHistory(true);
        try {
            const data = await mealService.getByClientId(clientId);
            setMealHistory((data || []).filter(p => p.status !== 'archived'));
        } catch (err) {
            console.error('Error loading meal history:', err);
        } finally {
            setLoadingMealHistory(false);
        }
    };

    const handleArchivePlan = async (planId) => {
        setArchivingId(planId);
        try {
            await workoutService.archive(planId);
            setHistory(prev => prev.filter(p => p.id !== planId));
        } catch (err) {
            console.error('Error archiving plan:', err);
        } finally {
            setArchivingId(null);
        }
    };

    const handleDuplicatePlan = (plan) => {
        const draftPlan = workoutService.duplicate(plan);
        localStorage.setItem('shadow_fitness_active_plan', JSON.stringify(draftPlan));
        setSelectedClient(null);
        navigate('/dashboard/workouts');
    };

    const handleDuplicateMeal = (plan) => {
        const draftPlan = mealService.duplicate(plan);
        localStorage.setItem('shadow_fitness_active_meal_plan', JSON.stringify(draftPlan));
        setSelectedClient(null);
        navigate('/dashboard/meals');
    };

    useEffect(() => {
        if (selectedClient) {
            loadHistory(selectedClient.id);
            loadMealHistory(selectedClient.id);
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
                            <button
                                className={`profile-tab ${activeTab === 'meals' ? 'active' : ''}`}
                                onClick={() => setActiveTab('meals')}
                            >
                                <Utensils size={16} /> Meal History
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
                            ) : activeTab === 'history' ? (
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
                                            <div className="history-info-tip glass-card">
                                                <Info size={14} />
                                                <span><strong>Archive</strong> removes plans from this active list but retains the data for duplication or future reference. Click a workout to view details.</span>
                                            </div>
                                            {history.map((plan, i) => (
                                                <div
                                                    key={plan.id || i}
                                                    className="history-item glass-card interactive-item"
                                                    onClick={() => setViewingPlan(plan)}
                                                >
                                                    <div className="history-item-header">
                                                        <div className="history-item-ident">
                                                            <div className="history-icon-circle">
                                                                <ScrollText size={16} />
                                                            </div>
                                                            <div>
                                                                <h4>{plan.plan_name}</h4>
                                                                <span className="history-date">
                                                                    <Calendar size={12} /> {new Date(plan.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {plan.focus_muscle && (
                                                            <span className="badge badge-violet">
                                                                Focus: {plan.focus_muscle}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="history-item-actions" onClick={e => e.stopPropagation()}>
                                                        <button
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => setViewingPlan(plan)}
                                                        >
                                                            <Eye size={14} /> View
                                                        </button>
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={() => handleDuplicatePlan(plan)}
                                                            title="Load as a new Draft in Workout Builder"
                                                        >
                                                            <Copy size={14} /> Duplicate
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="history-content">
                                    {loadingMealHistory ? (
                                        <div className="history-loading">
                                            <div className="spinner" /> Loading meal history...
                                        </div>
                                    ) : mealHistory.length === 0 ? (
                                        <div className="empty-history">
                                            <p>No saved meal plans found for this client.</p>
                                        </div>
                                    ) : (
                                        <div className="history-list">
                                            {mealHistory.map((plan, i) => (
                                                <div
                                                    key={plan.id || i}
                                                    className="history-item glass-card interactive-item"
                                                    onClick={() => setViewingMeal(plan)}
                                                >
                                                    <div className="history-item-header">
                                                        <div className="history-item-ident">
                                                            <div className="history-icon-circle">
                                                                <Utensils size={16} />
                                                            </div>
                                                            <div>
                                                                <h4>{plan.plan_name}</h4>
                                                                <span className="history-date">
                                                                    <Calendar size={12} /> {new Date(plan.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="history-item-actions" onClick={e => e.stopPropagation()}>
                                                        <button
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => setViewingMeal(plan)}
                                                        >
                                                            <Eye size={14} /> View
                                                        </button>
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={() => handleDuplicateMeal(plan)}
                                                            title="Load as a new Draft in Meal Builder"
                                                        >
                                                            <Copy size={14} /> Duplicate
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Overlays */}
                        <AnimatePresence>
                            {viewingPlan && (
                                <motion.div
                                    className="plan-view-overlay"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <div className="overlay-header">
                                        <button className="btn btn-ghost btn-sm" onClick={() => setViewingPlan(null)}>
                                            <ChevronLeft size={16} /> Back to History
                                        </button>
                                        <div className="header-actions">
                                            <button className="btn btn-primary btn-sm" onClick={() => handleDuplicatePlan(viewingPlan)}>
                                                <Copy size={14} /> Duplicate & Edit
                                            </button>
                                        </div>
                                    </div>
                                    <div className="overlay-content">
                                        <WorkoutViewer plan={viewingPlan.plan_json} />
                                    </div>
                                </motion.div>
                            )}

                            {viewingMeal && (
                                <motion.div
                                    className="plan-view-overlay"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <div className="overlay-header">
                                        <button className="btn btn-ghost btn-sm" onClick={() => setViewingMeal(null)}>
                                            <ChevronLeft size={16} /> Back to History
                                        </button>
                                        <div className="header-actions">
                                            <button className="btn btn-primary btn-sm" onClick={() => handleDuplicateMeal(viewingMeal)}>
                                                <Copy size={14} /> Duplicate & Edit
                                            </button>
                                        </div>
                                    </div>
                                    <div className="overlay-content">
                                        <MealViewer plan={viewingMeal.plan_json} showActions={false} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </Modal>

            <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)}
                reason={upgradeReason} currentTier={tierGuard.getTier()} />
        </div>
    );
}

