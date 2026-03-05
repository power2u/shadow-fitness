import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, User, Target, Heart, Moon, Apple, Dumbbell, Activity } from 'lucide-react';
import './QuestionnaireForm.css';

const ALL_STEPS = [
    { id: 'basics', label: 'Basics', icon: User },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'medical', label: 'Medical', icon: Heart },
    { id: 'cycle_tracking', label: 'Cycle', icon: Activity, femaleOnly: true },
    { id: 'lifestyle', label: 'Lifestyle', icon: Moon },
    { id: 'nutrition', label: 'Nutrition', icon: Apple },
    { id: 'training', label: 'Training', icon: Dumbbell },
];

const CONDITION_OPTIONS = [
    'Type 2 Diabetes', 'Type 1 Diabetes', 'Hypothyroidism', 'Hyperthyroidism',
    'PCOS', 'Hypertension', 'High Cholesterol', 'Anemia', 'IBS', 'GERD',
    'Asthma', 'Arthritis', 'Depression', 'Anxiety', 'Insomnia', 'Back Pain'
];

const GOAL_OPTIONS = ['Fat Loss', 'Muscle Gain', 'Strength', 'Endurance', 'General Health', 'Sports Performance', 'Flexibility', 'Stress Relief'];
const DIET_OPTIONS = ['Non-Vegetarian', 'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'Mediterranean', 'No Preference'];
const EQUIPMENT_OPTIONS = ['Full Gym', 'Home Gym', 'Dumbbells Only', 'Bodyweight Only', 'Resistance Bands', 'Kettlebells', 'Barbell & Rack'];
const TRAINING_STYLES = ['Strength Training', 'Bodybuilding', 'CrossFit', 'Calisthenics', 'HIIT', 'Yoga', 'Cardio', 'Powerlifting', 'Olympic Lifting'];
const ALLERGY_OPTIONS = ['Dairy', 'Gluten', 'Nuts', 'Soy', 'Eggs', 'Shellfish', 'Fish', 'Wheat'];
const COUNTRY_OPTIONS = [
    'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
    'UAE / Middle East', 'Saudi Arabia', 'Pakistan', 'Bangladesh', 'Sri Lanka',
    'Philippines', 'Indonesia', 'Malaysia', 'Thailand', 'Singapore',
    'South Korea', 'Japan', 'China', 'Germany', 'France', 'Italy', 'Spain',
    'Brazil', 'Mexico', 'Nigeria', 'South Africa', 'Kenya', 'Other'
];

function MultiSelect({ options, selected, onChange, columns = 2 }) {
    const toggle = (opt) => {
        onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);
    };

    return (
        <div className="multi-select" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {options.map(opt => (
                <button
                    key={opt}
                    type="button"
                    className={`multi-select-option ${selected.includes(opt) ? 'selected' : ''}`}
                    onClick={() => toggle(opt)}
                >
                    <div className="multi-check">
                        {selected.includes(opt) && <Check size={12} />}
                    </div>
                    <span>{opt}</span>
                </button>
            ))}
        </div>
    );
}

export default function QuestionnaireForm({ onComplete, onCancel }) {
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const [form, setForm] = useState({
        full_name: '', age: '', sex: '', height: '', weight: '', bodyFat: '',
        country: '', cuisinePreference: '',
        primaryGoal: '', secondaryGoals: [], targetWeight: '', timeline: '',
        conditions: [], medications: '', injuries: '', surgeries: '',
        // Cycle tracking fields (female only)
        cycle_tracking_enabled: false,
        last_period_date: '',
        period_duration: '5',
        cycle_length: '28',
        cycle_symptoms: { cramps: 0, fatigue: 0, bloating: 0, headache: 0, mood_changes: 0, sleep_disruption: 0 },
        cycle_contra_flags: { heavy_bleeding: false, severe_pelvic_pain: false, dizziness: false },
        // Lifestyle
        sleepHours: '', stressLevel: '5', occupation: '', activityLevel: '',
        dietType: '', allergies: [], intolerances: [], eatingSchedule: '', digestionIssues: '',
        experienceLevel: '', equipment: [], daysPerWeek: '', timePerSession: '', preferredStyles: [],
    });

    // Dynamic steps: filter out cycle_tracking for non-female clients
    const activeSteps = ALL_STEPS.filter(s => !s.femaleOnly || form.sex === 'Female');

    const update = (field, value) => setForm({ ...form, [field]: value });

    const goNext = () => { setDirection(1); setStep(s => Math.min(s + 1, activeSteps.length - 1)); };
    const goPrev = () => { setDirection(-1); setStep(s => Math.max(s - 1, 0)); };

    const handleSubmit = () => {
        const { full_name, ...questionnaire } = form;
        onComplete({ full_name, questionnaire });
    };

    const isFirstStepValid = form.full_name && form.age && form.sex;

    const slideVariants = {
        enter: (d) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
    };

    const renderStep = () => {
        switch (activeSteps[step].id) {
            case 'basics':
                return (
                    <div className="form-grid">
                        <div className="input-group form-col-full">
                            <label className="input-label">Full Name *</label>
                            <input className="input-field" placeholder="Client's full name" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Age *</label>
                            <input type="number" className="input-field" placeholder="28" value={form.age} onChange={(e) => update('age', e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Sex *</label>
                            <select className="input-field select-field" value={form.sex} onChange={(e) => update('sex', e.target.value)}>
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Height</label>
                            <input className="input-field" placeholder="5'10 or 178cm" value={form.height} onChange={(e) => update('height', e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Weight</label>
                            <input className="input-field" placeholder="75kg or 165lbs" value={form.weight} onChange={(e) => update('weight', e.target.value)} />
                        </div>
                        <div className="input-group form-col-full">
                            <label className="input-label">Body Fat % (if known)</label>
                            <input className="input-field" placeholder="e.g., 18%" value={form.bodyFat} onChange={(e) => update('bodyFat', e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Country / Region *</label>
                            <select className="input-field select-field" value={form.country} onChange={(e) => update('country', e.target.value)}>
                                <option value="">Select country</option>
                                {COUNTRY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Cuisine Preference</label>
                            <input className="input-field" placeholder="e.g., South Indian, Punjabi, Mediterranean..." value={form.cuisinePreference} onChange={(e) => update('cuisinePreference', e.target.value)} />
                        </div>
                    </div>
                );

            case 'goals':
                return (
                    <div className="form-section">
                        <div className="input-group">
                            <label className="input-label">Primary Goal *</label>
                            <div className="multi-select" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                {GOAL_OPTIONS.map(g => (
                                    <button key={g} type="button"
                                        className={`multi-select-option ${form.primaryGoal === g ? 'selected' : ''}`}
                                        onClick={() => update('primaryGoal', g)}>
                                        <div className="multi-check">{form.primaryGoal === g && <Check size={12} />}</div>
                                        <span>{g}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Secondary Goals</label>
                            <MultiSelect options={GOAL_OPTIONS.filter(g => g !== form.primaryGoal)} selected={form.secondaryGoals} onChange={(v) => update('secondaryGoals', v)} />
                        </div>
                        <div className="form-grid">
                            <div className="input-group">
                                <label className="input-label">Target Weight</label>
                                <input className="input-field" placeholder="70kg" value={form.targetWeight} onChange={(e) => update('targetWeight', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Timeline</label>
                                <select className="input-field select-field" value={form.timeline} onChange={(e) => update('timeline', e.target.value)}>
                                    <option value="">Select</option>
                                    <option value="4 weeks">4 weeks</option>
                                    <option value="8 weeks">8 weeks</option>
                                    <option value="12 weeks">12 weeks</option>
                                    <option value="16 weeks">16 weeks</option>
                                    <option value="6 months">6 months</option>
                                    <option value="1 year">1 year</option>
                                    <option value="Ongoing">Ongoing</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );

            case 'medical':
                return (
                    <div className="form-section">
                        <div className="input-group">
                            <label className="input-label">Health Conditions</label>
                            <MultiSelect options={CONDITION_OPTIONS} selected={form.conditions} onChange={(v) => update('conditions', v)} columns={2} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Current Medications</label>
                            <textarea className="input-field textarea-field" placeholder="List any medications, supplements, or drugs..." value={form.medications} onChange={(e) => update('medications', e.target.value)} />
                        </div>
                        <div className="form-grid">
                            <div className="input-group">
                                <label className="input-label">Injuries</label>
                                <input className="input-field" placeholder="e.g., torn ACL, lower back" value={form.injuries} onChange={(e) => update('injuries', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Past Surgeries</label>
                                <input className="input-field" placeholder="e.g., knee surgery 2020" value={form.surgeries} onChange={(e) => update('surgeries', e.target.value)} />
                            </div>
                        </div>
                    </div>
                );

            case 'cycle_tracking':
                return (
                    <div className="form-section">
                        <div className="input-group">
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Activity size={16} style={{ color: '#ec4899' }} />
                                Does this client track their menstrual cycle?
                            </label>
                            <div className="multi-select" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                {[true, false].map(val => (
                                    <button key={String(val)} type="button"
                                        className={`multi-select-option ${form.cycle_tracking_enabled === val ? 'selected' : ''}`}
                                        onClick={() => update('cycle_tracking_enabled', val)}>
                                        <div className="multi-check">{form.cycle_tracking_enabled === val && <Check size={12} />}</div>
                                        <span>{val ? 'Yes, track cycle' : 'No / Not applicable'}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {form.cycle_tracking_enabled && (
                            <>
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label className="input-label">First Day of Last Period *</label>
                                        <input type="date" className="input-field" value={form.last_period_date}
                                            onChange={(e) => update('last_period_date', e.target.value)}
                                            max={new Date().toISOString().split('T')[0]} />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Period Duration (days)</label>
                                        <select className="input-field select-field" value={form.period_duration}
                                            onChange={(e) => update('period_duration', e.target.value)}>
                                            {[3, 4, 5, 6, 7].map(d => <option key={d} value={d}>{d} days</option>)}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Typical Cycle Length (days)</label>
                                        <select className="input-field select-field" value={form.cycle_length}
                                            onChange={(e) => update('cycle_length', e.target.value)}>
                                            {Array.from({ length: 15 }, (_, i) => i + 21).map(d =>
                                                <option key={d} value={d}>{d} days{d === 28 ? ' (avg)' : ''}</option>
                                            )}
                                        </select>
                                    </div>
                                </div>

                                <div className="input-group" style={{ marginTop: 'var(--space-4)' }}>
                                    <label className="input-label">Current Symptoms (0 = None, 3 = Severe)</label>
                                    <div className="form-grid">
                                        {Object.entries(form.cycle_symptoms).map(([key, val]) => (
                                            <div key={key} className="input-group">
                                                <label className="input-label" style={{ fontSize: 'var(--fs-xs)', textTransform: 'capitalize' }}>
                                                    {key.replace('_', ' ')}
                                                </label>
                                                <div className="range-wrapper">
                                                    <input type="range" min="0" max="3" value={val}
                                                        onChange={(e) => update('cycle_symptoms', { ...form.cycle_symptoms, [key]: parseInt(e.target.value) })}
                                                        className="range-input" />
                                                    <span className="range-value">{val}/3</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="input-group" style={{ marginTop: 'var(--space-4)' }}>
                                    <label className="input-label" style={{ color: '#ef4444' }}>⚠️ Safety Flags (Check if applicable)</label>
                                    <div className="multi-select" style={{ gridTemplateColumns: 'repeat(1, 1fr)' }}>
                                        {[['heavy_bleeding', 'Heavy Bleeding'], ['severe_pelvic_pain', 'Severe Pelvic Pain'], ['dizziness', 'Dizziness / Lightheadedness']].map(([key, label]) => (
                                            <button key={key} type="button"
                                                className={`multi-select-option ${form.cycle_contra_flags[key] ? 'selected' : ''}`}
                                                onClick={() => update('cycle_contra_flags', { ...form.cycle_contra_flags, [key]: !form.cycle_contra_flags[key] })}
                                                style={form.cycle_contra_flags[key] ? { borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' } : {}}>
                                                <div className="multi-check">{form.cycle_contra_flags[key] && <Check size={12} />}</div>
                                                <span>{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                );

            case 'lifestyle':
                return (
                    <div className="form-section">
                        <div className="form-grid">
                            <div className="input-group">
                                <label className="input-label">Sleep Hours / Night</label>
                                <select className="input-field select-field" value={form.sleepHours} onChange={(e) => update('sleepHours', e.target.value)}>
                                    <option value="">Select</option>
                                    {['<5', '5-6', '6-7', '7-8', '8-9', '9+'].map(o => <option key={o} value={o}>{o} hours</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Stress Level (1-10)</label>
                                <div className="range-wrapper">
                                    <input type="range" min="1" max="10" value={form.stressLevel} onChange={(e) => update('stressLevel', e.target.value)} className="range-input" />
                                    <span className="range-value">{form.stressLevel}/10</span>
                                </div>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Occupation Type</label>
                                <select className="input-field select-field" value={form.occupation} onChange={(e) => update('occupation', e.target.value)}>
                                    <option value="">Select</option>
                                    <option value="Sedentary (desk)">Sedentary (desk job)</option>
                                    <option value="Lightly Active">Lightly Active</option>
                                    <option value="Moderately Active">Moderately Active</option>
                                    <option value="Very Active (physical labor)">Very Active (physical labor)</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Daily Activity Level</label>
                                <select className="input-field select-field" value={form.activityLevel} onChange={(e) => update('activityLevel', e.target.value)}>
                                    <option value="">Select</option>
                                    <option value="Sedentary">Sedentary (little/no exercise)</option>
                                    <option value="Light">Light (1-2 days/week)</option>
                                    <option value="Moderate">Moderate (3-5 days/week)</option>
                                    <option value="Active">Active (6-7 days/week)</option>
                                    <option value="Very Active">Very Active (2x/day)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );

            case 'nutrition':
                return (
                    <div className="form-section">
                        <div className="input-group">
                            <label className="input-label">Diet Type</label>
                            <div className="multi-select" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                {DIET_OPTIONS.map(d => (
                                    <button key={d} type="button"
                                        className={`multi-select-option ${form.dietType === d ? 'selected' : ''}`}
                                        onClick={() => update('dietType', d)}>
                                        <div className="multi-check">{form.dietType === d && <Check size={12} />}</div>
                                        <span>{d}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Allergies</label>
                            <MultiSelect options={ALLERGY_OPTIONS} selected={form.allergies} onChange={(v) => update('allergies', v)} columns={4} />
                        </div>
                        <div className="form-grid">
                            <div className="input-group">
                                <label className="input-label">Eating Schedule</label>
                                <select className="input-field select-field" value={form.eatingSchedule} onChange={(e) => update('eatingSchedule', e.target.value)}>
                                    <option value="">Select</option>
                                    <option value="3 meals">3 meals/day</option>
                                    <option value="3 meals + snacks">3 meals + snacks</option>
                                    <option value="5-6 small meals">5-6 small meals</option>
                                    <option value="Intermittent Fasting">Intermittent Fasting</option>
                                    <option value="2 meals">2 meals/day</option>
                                    <option value="Flexible">Flexible</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Digestion Issues</label>
                                <input className="input-field" placeholder="Bloating, gas, acid reflux..." value={form.digestionIssues} onChange={(e) => update('digestionIssues', e.target.value)} />
                            </div>
                        </div>
                    </div>
                );

            case 'training':
                return (
                    <div className="form-section">
                        <div className="input-group">
                            <label className="input-label">Experience Level</label>
                            <div className="multi-select" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                                {['Beginner (0-1 yr)', 'Intermediate (1-3 yrs)', 'Advanced (3+ yrs)'].map(l => (
                                    <button key={l} type="button"
                                        className={`multi-select-option ${form.experienceLevel === l ? 'selected' : ''}`}
                                        onClick={() => update('experienceLevel', l)}>
                                        <div className="multi-check">{form.experienceLevel === l && <Check size={12} />}</div>
                                        <span>{l}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Available Equipment</label>
                            <MultiSelect options={EQUIPMENT_OPTIONS} selected={form.equipment} onChange={(v) => update('equipment', v)} columns={2} />
                        </div>
                        <div className="form-grid">
                            <div className="input-group">
                                <label className="input-label">Training Days / Week</label>
                                <select className="input-field select-field" value={form.daysPerWeek} onChange={(e) => update('daysPerWeek', e.target.value)}>
                                    <option value="">Select</option>
                                    {[2, 3, 4, 5, 6, 7].map(d => <option key={d} value={d}>{d} days</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Time / Session</label>
                                <select className="input-field select-field" value={form.timePerSession} onChange={(e) => update('timePerSession', e.target.value)}>
                                    <option value="">Select</option>
                                    <option value="30 min">30 min</option>
                                    <option value="45 min">45 min</option>
                                    <option value="60 min">60 min</option>
                                    <option value="75 min">75 min</option>
                                    <option value="90 min">90 min</option>
                                    <option value="120 min">120 min</option>
                                </select>
                            </div>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Preferred Training Styles</label>
                            <MultiSelect options={TRAINING_STYLES} selected={form.preferredStyles} onChange={(v) => update('preferredStyles', v)} columns={3} />
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="questionnaire">
            {/* Progress */}
            <div className="q-progress">
                {activeSteps.map((s, i) => (
                    <div key={s.id} className={`q-step ${i === step ? 'q-step-active' : i < step ? 'q-step-done' : ''}`}>
                        <div className="q-step-icon">
                            {i < step ? <Check size={14} /> : <s.icon size={14} />}
                        </div>
                        <span className="q-step-label">{s.label}</span>
                    </div>
                ))}
                <div className="q-progress-bar">
                    <div className="q-progress-fill" style={{ width: `${((step) / (activeSteps.length - 1)) * 100}%` }} />
                </div>
            </div>

            {/* Form Content */}
            <div className="q-content">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="q-actions">
                {step > 0 ? (
                    <button className="btn btn-secondary" onClick={goPrev}>
                        <ChevronLeft size={16} /> Back
                    </button>
                ) : (
                    <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                )}

                {step < activeSteps.length - 1 ? (
                    <button className="btn btn-primary" onClick={goNext} disabled={step === 0 && !isFirstStepValid}>
                        Next <ChevronRight size={16} />
                    </button>
                ) : (
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        <Check size={16} /> Save Client
                    </button>
                )}
            </div>
        </div>
    );
}
