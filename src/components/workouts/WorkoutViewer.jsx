import React from 'react';
import { motion } from 'framer-motion';
import {
    Clock, Heart, Flame, Calendar, Target, TrendingUp,
    Brain, Zap, Activity, Droplets, Info
} from 'lucide-react';
import './WorkoutViewer.css';

const PHASE_COLORS = {
    follicular: { bg: 'rgba(6, 214, 160, 0.15)', border: 'rgba(6, 214, 160, 0.3)', text: '#06d6a0', label: 'Follicular Phase', icon: '🌱' },
    ovulation: { bg: 'rgba(247, 37, 133, 0.15)', border: 'rgba(247, 37, 133, 0.3)', text: '#f72585', label: 'Ovulation', icon: '✨' },
    luteal: { bg: 'rgba(67, 97, 238, 0.15)', border: 'rgba(67, 97, 238, 0.3)', text: '#4361ee', label: 'Luteal Phase', icon: '🌙' },
    menstrual: { bg: 'rgba(123, 47, 247, 0.15)', border: 'rgba(123, 47, 247, 0.3)', text: '#7b2ff7', label: 'Menstrual Phase', icon: '🩸' },
    unknown: { bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)', text: '#8b95a8', label: 'Phase Unknown', icon: '❔' }
};

export default function WorkoutViewer({ plan, onClose }) {
    if (!plan) return null;

    const cycleContext = plan.cycleContext;
    const colors = (cycleContext && cycleContext.phase)
        ? (PHASE_COLORS[cycleContext.phase] || PHASE_COLORS.unknown)
        : PHASE_COLORS.unknown;

    return (
        <div className="workout-viewer">
            <div className="viewer-header-bar">
                <div className="viewer-title-group">
                    <h2>{plan.plan_name || 'Workout Plan'}</h2>
                    <p className="viewer-summary">{plan.summary}</p>
                </div>
            </div>

            {plan.periodization && (
                <div className="viewer-meta-bar">
                    <Activity size={14} />
                    <span><strong>Periodization:</strong> {plan.periodization}</span>
                </div>
            )}

            {/* Cycle Banner */}
            {cycleContext && (
                <div
                    className="viewer-cycle-banner"
                    style={{
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        color: colors.text
                    }}
                >
                    <div className="cycle-banner-content">
                        <span className="cycle-banner-icon">{colors.icon}</span>
                        <div className="cycle-banner-text">
                            <span className="cycle-banner-label">{colors.label}</span>
                            {cycleContext.cycle_day > 0 && <span> • Day {cycleContext.cycle_day}</span>}
                            {cycleContext.is_menstruating_today && <span> • Currently Menstruating</span>}
                        </div>
                    </div>
                    {cycleContext.coach_note && (
                        <p className="cycle-banner-note">"{cycleContext.coach_note}"</p>
                    )}
                </div>
            )}

            <div className="viewer-schedule-grid">
                {plan.weeklySchedule?.map((day, idx) => {
                    const isRest = day.focus?.toLowerCase().includes('rest') || day.exercises?.length === 0;
                    return (
                        <div key={idx} className={`viewer-day-card glass-card ${isRest ? 'viewer-rest-day' : ''}`}>
                            <div className="vday-header">
                                <div className="vday-info">
                                    <span className="vday-label">Day {idx + 1}</span>
                                    <h4 className="vday-name">{day.day}</h4>
                                </div>
                                <span className={`vday-focus ${isRest ? 'focus-rest' : ''}`}>
                                    {day.focus}
                                </span>
                            </div>

                            {!isRest && (
                                <div className="vday-exercises">
                                    {day.exercises?.map((ex, exIdx) => (
                                        <div key={exIdx} className="vday-exercise-row">
                                            <span className="v-ex-name">{ex.name}</span>
                                            <div className="v-ex-params">
                                                <span>{ex.sets} sets</span>
                                                <span>{ex.reps} reps</span>
                                                {ex.rest && <span>{ex.rest} rest</span>}
                                            </div>
                                            {ex.notes && <p className="v-ex-notes">{ex.notes}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {isRest && (
                                <p className="vday-rest-text">{day.activities || 'Rest & Recovery'}</p>
                            )}
                        </div>
                    );
                })}
            </div>

            {plan.cardioRecommendations && (
                <div className="viewer-cardio glass-card">
                    <div className="vsection-header"><Heart size={16} /> Cardio Protocol</div>
                    <p><strong>Target:</strong> {plan.cardioRecommendations.weeklyTarget}</p>
                    <div className="vcardio-sessions">
                        {plan.cardioRecommendations.sessions?.map((s, i) => (
                            <div key={i} className="vcardio-session">
                                <span>{s.type}</span>
                                <span>{s.duration}</span>
                                <span>{s.intensity}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {plan.reasoning && (
                <div className="viewer-reasoning glass-card">
                    <div className="vsection-header"><Brain size={16} /> AI Programming Logic</div>
                    <ul className="vreasoning-list">
                        {(Array.isArray(plan.reasoning) ? plan.reasoning : []).map((r, i) => (
                            <li key={i}>{r}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
