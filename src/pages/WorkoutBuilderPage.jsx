import { useState, useEffect, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { clientService } from '../services/supabase';
import { geminiService } from '../services/gemini';
import { getRelevantKnowledge } from '../services/knowledgeStore';
import { exportWorkoutPDF, exportWorkoutDOCX } from '../services/exportPlan';
import { tierGuard } from '../services/tierGuard';
import {
    Dumbbell, Sparkles, ChevronDown, Clock, RotateCcw, AlertTriangle,
    Brain, Zap, RefreshCw, Download, FileText, Heart, Lock, Activity,
    Calendar, TrendingUp, Target, Flame, User, Droplets, Info
} from 'lucide-react';
import { computeCycleConstraints, PHASE_COLORS } from '../services/cycleConstraints';
import { getFocusConstraints } from '../services/focusConstraintEngine';
import { workoutService } from '../services/supabase';
import UpgradeModal from '../components/ui/UpgradeModal';
import './BuilderPage.css';

// ─── Error Boundary ────────────────────────────────────────────
class PlanErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorMsg: '' };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, errorMsg: error?.message || 'Render error' };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="builder-error" style={{ marginTop: '1rem' }}>
                    <AlertTriangle size={18} />
                    <span>Plan display error: {this.state.errorMsg}. Try regenerating.</span>
                    <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}
                        onClick={() => { this.setState({ hasError: false }); this.props.onReset?.(); }}>
                        Reset
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// ─── Warning Renderer ──────────────────────────────────────────
function renderWarning(w) {
    if (!w) return null;
    if (typeof w === 'string') return w;

    // Handle structured interaction object
    if (typeof w === 'object') {
        return (
            <div className="warning-structured">
                {w.severity && (
                    <span className={`warning-severity-tag ${w.severity.toLowerCase()}`}>
                        {w.severity}
                    </span >
                )}
                <div className="warning-details">
                    <div className="warning-interaction">{w.interaction}</div>
                    {w.mechanism && <div className="warning-mechanism">{w.mechanism}</div>}
                    {w.action && <div className="warning-action"><strong>Action:</strong> {w.action}</div>}
                </div>
            </div>
        );
    }
    return JSON.stringify(w);
}

// ─── Helpers ───────────────────────────────────────────────────
function isFemaleWithCycle(client) {
    const q = client?.questionnaire || {};
    return q.sex?.toLowerCase() === 'female' && q.cycle_tracking_enabled;
}

// ─── Phase Banner (female cycle only) ──────────────────────────
function CyclePhaseBanner({ cycleContext }) {
    if (!cycleContext?.phase) return null;
    const colors = PHASE_COLORS[cycleContext.phase] || PHASE_COLORS.unknown;
    return (
        <motion.div
            className="cycle-phase-banner"
            style={{
                background: `linear-gradient(135deg, ${colors.bg}, rgba(15,23,42,0))`,
                border: `1px solid ${colors.border}`,
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="cycle-phase-banner-left">
                <span className="cycle-phase-icon">{colors.icon}</span>
                <div>
                    <span className="cycle-phase-label" style={{ color: colors.text }}>{colors.label}</span>
                    {cycleContext.cycle_day > 0 && (
                        <span className="cycle-phase-day">Day {cycleContext.cycle_day} of cycle</span>
                    )}
                </div>
            </div>
            {(cycleContext.symptom_flags?.length > 0 || cycleContext.adjustments_applied?.length > 0) && (
                <div className="cycle-phase-pills">
                    {(cycleContext.symptom_flags || []).map(f => (
                        <span key={f} className="symptom-pill">⚠ {f.replace(/_/g, ' ')}</span>
                    ))}
                    {(cycleContext.adjustments_applied || []).map(a => (
                        <span key={a} className="adjustment-pill">✓ {a.replace(/_/g, ' ')}</span>
                    ))}
                </div>
            )}
            {cycleContext.coach_note && (
                <p className="cycle-coach-note">{cycleContext.coach_note}</p>
            )}
        </motion.div>
    );
}

// ─── Workout Day Card ──────────────────────────────────────────
function WorkoutDayCard({ day, index, onRegenerate, regenerating, isCycleClient }) {
    const isRest = day.focus?.toLowerCase().includes('rest') || day.exercises?.length === 0;

    return (
        <motion.div
            className={`workout-day-card glass-card ${isCycleClient ? 'cycle-themed' : ''} ${isRest ? 'rest-day' : ''}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.4 }}
        >
            {/* Day Header */}
            <div className="wday-header">
                <div className="wday-number">
                    <span>{index + 1}</span>
                </div>
                <div className="wday-title-group">
                    <h3 className="wday-name">{day.day}</h3>
                    <span className={`wday-focus-badge ${isRest ? 'badge-rest' : 'badge-focus'}`}>
                        {isRest ? '😴 Rest / Recovery' : day.focus}
                    </span>
                </div>
                <div className="wday-meta">
                    {day.duration && (
                        <span className="wday-duration">
                            <Clock size={13} /> {day.duration}
                        </span>
                    )}
                    <button
                        className="btn btn-ghost btn-sm wday-swap-btn"
                        onClick={() => onRegenerate(index)}
                        disabled={regenerating !== null}
                        title="Swap exercises"
                    >
                        {regenerating === index ? <div className="spinner-sm" /> : <RefreshCw size={13} />}
                        {regenerating === index ? 'Swapping...' : 'Swap'}
                    </button>
                </div>
            </div>

            {/* Rest Day */}
            {isRest ? (
                <div className="wday-rest-content">
                    <p>{day.activities || 'Active recovery. Light walk, foam rolling, or complete rest.'}</p>
                </div>
            ) : (
                <>
                    {/* Warm-up */}
                    {day.warmup && (
                        <div className="wday-section wday-warmup">
                            <span className="wday-section-label"><Flame size={12} /> Warm-up</span>
                            <p>{day.warmup}</p>
                        </div>
                    )}

                    {/* Exercise Table */}
                    <div className="exercise-grid">
                        <div className="exercise-grid-header">
                            <span>Exercise</span>
                            <span>Sets</span>
                            <span>Reps</span>
                            <span>Rest</span>
                            <span>Notes</span>
                        </div>
                        {(day.exercises || []).filter(Boolean).map((ex, j) => (
                            <motion.div
                                className="exercise-grid-row"
                                key={j}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: j * 0.04 }}
                            >
                                <span className="ex-name">
                                    <span className="ex-num">{j + 1}</span>
                                    {ex.name}
                                </span>
                                <span className="ex-val">{ex.sets ?? '—'}</span>
                                <span className="ex-val">{ex.reps ?? '—'}</span>
                                <span className="ex-val ex-rest">{ex.rest ?? '—'}</span>
                                <span className="ex-note">{ex.notes || ex.tempo || '—'}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Cool-down */}
                    {day.cooldown && (
                        <div className="wday-section wday-cooldown">
                            <span className="wday-section-label"><Heart size={12} /> Cool-down</span>
                            <p>{day.cooldown}</p>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
}

// ─── Cardio Section ────────────────────────────────────────────
function CardioSection({ cardio }) {
    if (!cardio) return null;
    return (
        <div className="cardio-section-new glass-card">
            <div className="cardio-new-header">
                <Heart size={18} />
                <h3>Cardio Protocol</h3>
                {cardio.protocol && <span className="cardio-protocol-badge">{cardio.protocol}</span>}
            </div>
            {cardio.weeklyTarget && (
                <p className="cardio-weekly-target">
                    <Target size={14} /> Weekly Target: <strong>{cardio.weeklyTarget}</strong>
                </p>
            )}
            {cardio.sessions?.length > 0 && (
                <div className="cardio-sessions-grid">
                    {cardio.sessions.filter(Boolean).map((s, i) => (
                        <div key={i} className="cardio-session-new glass-card">
                            <h4>{s.type}</h4>
                            <div className="cardio-session-details">
                                {s.duration && <span><Clock size={12} /> {s.duration}</span>}
                                {s.intensity && <span><Flame size={12} /> {s.intensity}</span>}
                                {s.frequency && <span><Calendar size={12} /> {s.frequency}</span>}
                                {s.timing && <span>⏰ {s.timing}</span>}
                                {s.caloriesBurned && <span className="badge badge-accent">{s.caloriesBurned}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {cardio.fatLossRationale && (
                <p className="cardio-rationale-text">
                    <TrendingUp size={14} /> {cardio.fatLossRationale}
                </p>
            )}
            {cardio.warnings?.filter(Boolean).map((w, i) => (
                <div key={i} className="plan-warning-sm">
                    <AlertTriangle size={14} />
                    <div style={{ flex: 1 }}>{renderWarning(w)}</div>
                </div>
            ))}
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function WorkoutBuilderPage() {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [regeneratingDay, setRegeneratingDay] = useState(null);
    const [error, setError] = useState('');
    const [showReasoning, setShowReasoning] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);

    // New state for Focus and Save
    const [focusArea, setFocusArea] = useState('None');
    const [focusBias, setFocusBias] = useState('Mild');
    const [isSaved, setIsSaved] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (user) loadClients();
    }, [user]);

    const loadClients = async () => {
        try {
            const data = await clientService.getAll(user.id);
            setClients(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const generatePlan = async (existingPlan = null) => {
        if (!selectedClient) return;
        const check = tierGuard.checkLimit('workoutPlans');
        if (!check.allowed) {
            setError(check.reason);
            setShowUpgrade(true);
            return;
        }
        setLoading(true);
        setError('');
        setSuccessMsg('');
        setIsSaved(false);
        if (!existingPlan) setPlan(null);

        try {
            const relevant = getRelevantKnowledge(selectedClient, []);
            const cycleConstraints = computeCycleConstraints(selectedClient.questionnaire, tierGuard.getTier());
            const focusConstraints = getFocusConstraints(focusArea, focusBias, selectedClient.questionnaire?.daysPerWeek);

            const result = await geminiService.generateWorkoutPlan(
                selectedClient,
                relevant,
                existingPlan,
                user.id,
                cycleConstraints,
                focusConstraints
            );

            setPlan(result);
            tierGuard.incrementUsage('workoutPlans');
        } catch (err) {
            setError(err.message || 'Failed to generate plan. Check your Gemini API key.');
        } finally {
            setLoading(false);
        }
    };

    const regenerateDay = async (dayIndex) => {
        if (!selectedClient || !plan) return;
        setRegeneratingDay(dayIndex);
        try {
            const relevant = getRelevantKnowledge(selectedClient, []);
            const cycleConstraints = computeCycleConstraints(selectedClient.questionnaire, tierGuard.getTier());
            const focusConstraints = getFocusConstraints(focusArea, focusBias, selectedClient.questionnaire?.daysPerWeek);
            const newDay = await geminiService.regenerateWorkoutDay(selectedClient, plan, dayIndex, relevant, cycleConstraints, focusConstraints);
            if (newDay) {
                const updated = { ...plan, weeklySchedule: [...plan.weeklySchedule] };
                updated.weeklySchedule[dayIndex] = newDay;
                setPlan(updated);
                setIsSaved(false); // Reset saved state if day is changed
            }
        } catch (err) {
            console.error('Failed to regenerate day:', err);
        } finally {
            setRegeneratingDay(null);
        }
    };

    const handleSaveWorkout = async () => {
        if (!selectedClient || !plan || isSaved) return;
        setSaveLoading(true);
        setError('');
        try {
            const planToSave = {
                coach_id: user.id,
                client_id: selectedClient.id,
                plan_name: `Workout for ${selectedClient.full_name} — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
                plan_json: plan,
                focus_muscle: focusArea !== 'None' ? focusArea : null,
                focus_bias_level: focusArea !== 'None' ? focusBias : null,
                status: 'active',
                created_at: new Date().toISOString()
            };
            await workoutService.save(planToSave);
            setIsSaved(true);
            setSuccessMsg('Workout plan saved successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError('Failed to save workout: ' + err.message);
        } finally {
            setSaveLoading(false);
        }
    };

    const cycleClient = selectedClient && isFemaleWithCycle(selectedClient);

    return (
        <div className={`page-enter ${cycleClient ? 'cycle-mode-page' : ''}`}>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>
                        <Dumbbell size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
                        Workout Builder
                    </h1>
                    <p>Generate science-backed, personalized workout plans with AI</p>
                </div>
                {cycleClient && (
                    <div className="cycle-mode-badge">
                        <Droplets size={14} /> Cycle-Aware Mode
                    </div>
                )}
            </div>

            {/* Client Selector */}
            <div className={`builder-controls glass-card ${cycleClient ? 'cycle-controls' : ''}`}>
                <div className="builder-select-group">
                    <label className="input-label">Select Client</label>
                    <select
                        className="input-field select-field"
                        value={selectedClient?.id || ''}
                        onChange={(e) => {
                            setSelectedClient(clients.find(c => c.id === e.target.value) || null);
                            setPlan(null);
                        }}
                    >
                        <option value="">Choose a client...</option>
                        {clients.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.full_name}
                                {isFemaleWithCycle(c) ? ' 🌸' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedClient && (
                    <motion.div className="client-summary" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <div className="client-summary-tags">
                            <span className="badge badge-blue">
                                <User size={11} /> {selectedClient.questionnaire?.sex || 'N/A'}
                            </span>
                            {selectedClient.questionnaire?.primaryGoal && (
                                <span className="badge badge-accent">{selectedClient.questionnaire.primaryGoal}</span>
                            )}
                            {selectedClient.questionnaire?.experienceLevel && (
                                <span className="badge badge-violet">{selectedClient.questionnaire.experienceLevel}</span>
                            )}
                            {selectedClient.questionnaire?.daysPerWeek && (
                                <span className="badge badge-blue">{selectedClient.questionnaire.daysPerWeek} days/week</span>
                            )}
                            {selectedClient.questionnaire?.conditions?.map(c => (
                                <span key={c} className="badge badge-pink">{c}</span>
                            ))}
                            {cycleClient && (
                                <span className="badge badge-rose">🌸 Cycle Tracking On</span>
                            )}
                        </div>

                        {/* Focus Controls */}
                        <div className="focus-controls-row">
                            <div className="focus-group">
                                <label className="input-label-sm">Target Muscle</label>
                                <select
                                    className="input-field-sm focus-select"
                                    value={focusArea}
                                    onChange={(e) => setFocusArea(e.target.value)}
                                >
                                    <option value="None">Balanced (Full Body)</option>
                                    <option value="Legs">Legs Focus</option>
                                    <option value="Chest">Chest Focus</option>
                                    <option value="Back">Back Focus</option>
                                    <option value="Glutes">Glutes Focus</option>
                                    <option value="Shoulders">Shoulders Focus</option>
                                    <option value="Arms">Arms Focus</option>
                                    <option value="Core">Core Focus</option>
                                </select>
                            </div>
                            <div className="focus-group">
                                <label className="input-label-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    Training Focus
                                    <div className="info-tooltip-container">
                                        <Info size={12} className="info-icon-sm" />
                                        <div className="info-tooltip-content">
                                            <strong>Focus Intensity:</strong>
                                            <ul>
                                                <li><strong>Mild:</strong> Slight volume bump (+20%)</li>
                                                <li><strong>Moderate:</strong> High priority (+50%), sequenced early</li>
                                                <li><strong>Aggressive:</strong> Maximum specialization. Other muscles move to maintenance to prioritize recovery.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </label>
                                <select
                                    className="input-field-sm focus-select"
                                    value={focusBias}
                                    onChange={(e) => setFocusBias(e.target.value)}
                                    disabled={focusArea === 'None'}
                                >
                                    <option value="Mild">Mainstream (Mild)</option>
                                    <option value="Moderate">Priority (Moderate)</option>
                                    <option value="Aggressive">Specialization (Maximum)</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>
                )}

                <button
                    className={`btn btn-lg generate-btn ${cycleClient ? 'btn-cycle' : 'btn-primary'}`}
                    onClick={() => generatePlan()}
                    disabled={!selectedClient || loading}
                >
                    {loading ? (
                        <><div className="spinner" /> Generating with AI...</>
                    ) : (
                        <><Sparkles size={18} /> {cycleClient ? 'Generate Cycle-Aware Plan' : 'Generate Workout Plan'}</>
                    )}
                </button>
            </div>

            {/* Error & Success */}
            <AnimatePresence>
                {error && (
                    <motion.div className="builder-error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <AlertTriangle size={18} /> {error}
                    </motion.div>
                )}
                {successMsg && (
                    <motion.div className="builder-success" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <Activity size={18} /> {successMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading */}
            <AnimatePresence>
                {loading && (
                    <motion.div className={`generation-loading ${cycleClient ? 'cycle-loading' : ''}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className={`loading-pulse ${cycleClient ? 'loading-pulse-cycle' : ''}`}>
                            {cycleClient ? <Droplets size={40} /> : <Brain size={40} />}
                        </div>
                        <h3>{cycleClient ? 'Analyzing cycle phase & training windows...' : 'Analyzing client profile & researching protocols...'}</h3>
                        <p>{cycleClient ? 'Applying hormone-phase constraints, symptom adjustments & evidence-based programming' : 'Cross-referencing knowledge store, checking drug interactions'}</p>
                        <div className="loading-steps">
                            <div className="loading-step active"><Zap size={14} /> Analyzing profile</div>
                            {cycleClient && <div className="loading-step"><Droplets size={14} /> Cycle phase constraints</div>}
                            <div className="loading-step"><Brain size={14} /> Drug-exercise interactions</div>
                            <div className="loading-step"><Dumbbell size={14} /> Building workout split</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Generated Plan */}
            <PlanErrorBoundary onReset={() => setPlan(null)}>
                <AnimatePresence>
                    {plan && !plan.parseError && (
                        <motion.div
                            className={`generated-plan ${cycleClient ? 'generated-plan-cycle' : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Plan Header */}
                            <div className="plan-header-bar glass-card">
                                <div className="plan-header-info">
                                    <div className="plan-header-avatar">
                                        {cycleClient ? '🌸' : '💪'}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <h2>Workout Plan — {selectedClient?.full_name || 'Client'}</h2>
                                            {!isSaved && <span className="draft-badge">DRAFT</span>}
                                            {isSaved && <span className="saved-badge">SAVED</span>}
                                        </div>
                                        <p className="plan-summary-text">{plan.summary}</p>
                                    </div>
                                </div>
                                <div className="plan-header-actions">
                                    <button
                                        className={`btn ${isSaved ? 'btn-ghost' : 'btn-primary'} btn-sm`}
                                        onClick={handleSaveWorkout}
                                        disabled={saveLoading || isSaved}
                                    >
                                        {saveLoading ? <div className="spinner-sm" /> : isSaved ? <Activity size={14} /> : <Download size={14} />}
                                        {saveLoading ? 'Saving...' : isSaved ? 'Saved to History' : 'Save Workout'}
                                    </button>
                                    <button className="btn btn-secondary btn-sm" onClick={() => generatePlan(plan)} disabled={loading}>
                                        <RefreshCw size={14} /> Regenerate
                                    </button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setPlan(null)}>
                                        Discard
                                    </button>
                                    <div className="action-divider" />
                                    {tierGuard.isFeatureEnabled('export') ? (
                                        <>
                                            <button className="btn btn-secondary btn-sm" onClick={() => exportWorkoutPDF(plan, selectedClient?.full_name)}>
                                                <Download size={14} /> PDF
                                            </button>
                                            <button className="btn btn-secondary btn-sm" onClick={() => exportWorkoutDOCX(plan, selectedClient?.full_name)}>
                                                <FileText size={14} /> DOC
                                            </button>
                                        </>
                                    ) : (
                                        <button className="btn btn-secondary btn-sm" onClick={() => { setError('Export is a Pro feature.'); setShowUpgrade(true); }}>
                                            <Lock size={14} /> Export (Pro)
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Periodization */}
                            {plan.periodization && (
                                <div className="plan-meta-bar">
                                    <RotateCcw size={14} />
                                    <span><strong>Periodization:</strong> {plan.periodization}</span>
                                </div>
                            )}

                            {/* ── Focus Metadata Banner ── */}
                            {plan.focusMetadata && (
                                <motion.div
                                    className="focus-meta-banner glass-card"
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="focus-meta-left">
                                        <Target size={16} className="focus-meta-icon" />
                                        <div>
                                            <span className="focus-meta-label">Focus Applied</span>
                                            <div className="focus-meta-row">
                                                <span className="badge badge-violet">{plan.focusMetadata.focus_area}</span>
                                                <span className="badge badge-blue">{plan.focusMetadata.bias_level}</span>
                                                <span className="focus-meta-mul">{plan.focusMetadata.volume_multiplier_applied}× target volume</span>
                                            </div>
                                        </div>
                                    </div>
                                    {plan.focusMetadata.antagonist_compliance && (
                                        <p className="focus-meta-compliance">
                                            ✓ {plan.focusMetadata.antagonist_compliance}
                                        </p>
                                    )}
                                </motion.div>
                            )}

                            {/* ── Female Cycle Banner ── */}
                            {cycleClient && plan.cycleContext && (
                                <CyclePhaseBanner cycleContext={plan.cycleContext} />
                            )}


                            {/* Warnings */}
                            {plan.warnings?.filter(Boolean).length > 0 && (
                                <div className="plan-warnings">
                                    {plan.warnings.filter(Boolean).map((w, i) => (
                                        <div key={i} className="plan-warning">
                                            <AlertTriangle size={15} />
                                            <div style={{ flex: 1 }}>{renderWarning(w)}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Weekly Schedule Grid */}
                            <div className="workout-schedule-grid">
                                {(plan.weeklySchedule || []).filter(Boolean).map((day, i) => (
                                    <WorkoutDayCard
                                        key={i}
                                        day={day}
                                        index={i}
                                        onRegenerate={regenerateDay}
                                        regenerating={regeneratingDay}
                                        isCycleClient={cycleClient}
                                    />
                                ))}
                            </div>

                            {/* Cardio */}
                            <CardioSection cardio={plan.cardioRecommendations} />

                            {/* Progression */}
                            {plan.progressionPlan && (
                                <div className="plan-progression glass-card">
                                    <h3><TrendingUp size={18} /> Progression Plan</h3>
                                    <p>{plan.progressionPlan}</p>
                                </div>
                            )}

                            {/* AI Reasoning */}
                            {Array.isArray(plan.reasoning) && plan.reasoning.length > 0 && (
                                <div className="plan-reasoning glass-card">
                                    <button className="reasoning-toggle" onClick={() => setShowReasoning(!showReasoning)}>
                                        <Brain size={18} />
                                        <span>AI Reasoning ({plan.reasoning.length} points)</span>
                                        <ChevronDown size={16} style={{ transform: showReasoning ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
                                    </button>
                                    <AnimatePresence>
                                        {showReasoning && (
                                            <motion.div className="reasoning-content" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                                {plan.reasoning.map((r, i) => (
                                                    <div key={i} className="reasoning-item">
                                                        <span className="reasoning-num">{i + 1}</span>
                                                        <p>{r}</p>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {plan?.parseError && (
                        <motion.div className="plan-raw glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <h3>⚠ Plan could not be parsed automatically</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                The AI returned a response but it could not be extracted as structured JSON. Raw output below:
                            </p>
                            <pre style={{ maxHeight: '400px', overflow: 'auto' }}>{plan.raw}</pre>
                            <button className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }} onClick={() => generatePlan()}>
                                <RefreshCw size={14} /> Try Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </PlanErrorBoundary>

            <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)}
                reason={error} currentTier={tierGuard.getTier()} />
        </div>
    );
}
