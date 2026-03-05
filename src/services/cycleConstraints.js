// ═══════════════════════════════════════════════════════
// ShadowFitness — Cycle Constraint Engine
// Deterministic workout constraints based on menstrual cycle phase
// Inserted between TierGuard and KnowledgeStore in the pipeline
// ═══════════════════════════════════════════════════════

/**
 * Compute the current cycle phase from date-based inputs.
 * @param {string} lastPeriodDate - ISO date string (YYYY-MM-DD)
 * @param {number} periodDuration - Days the period typically lasts (3–7)
 * @param {number} cycleLength - Total cycle length in days (21–35, default 28)
 * @returns {{ phase: string, cycleDay: number }}
 */
export function detectCyclePhase(lastPeriodDate, periodDuration = 5, cycleLength = 28) {
    if (!lastPeriodDate) return { phase: 'unknown', cycleDay: 0 };

    const start = new Date(lastPeriodDate);
    const today = new Date();
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffMs = today - start;
    if (diffMs < 0) return { phase: 'unknown', cycleDay: 0 };

    const daysSinceStart = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const cycleDay = (daysSinceStart % cycleLength) + 1;

    // Phase mapping based on standard physiology
    const pd = Math.max(3, Math.min(7, periodDuration));
    const ovulationStart = Math.round(cycleLength * 0.5) - 1; // ~Day 13 for 28-day cycle
    const ovulationEnd = ovulationStart + 2;                    // ~Day 15

    if (cycleDay <= pd) {
        return { phase: 'menstrual', cycleDay };
    } else if (cycleDay <= ovulationStart) {
        return { phase: 'follicular', cycleDay };
    } else if (cycleDay <= ovulationEnd) {
        return { phase: 'ovulatory', cycleDay };
    } else {
        return { phase: 'luteal', cycleDay };
    }
}

/**
 * Phase-specific constraint templates
 */
const PHASE_CONSTRAINTS = {
    menstrual: {
        intensity_cap: 'low-moderate',
        volume_modifier: 0.65,
        allowed_training_styles: ['Yoga', 'Walking', 'Light Resistance', 'Mobility', 'Stretching'],
        exercise_exclusions: ['Box Jumps', 'Burpees', 'Heavy Deadlifts', 'Plyometrics', 'Sprint Intervals'],
        recovery_bias: true,
        swap_recommendations: true,
    },
    follicular: {
        intensity_cap: 'high',
        volume_modifier: 1.0,
        allowed_training_styles: ['Strength Training', 'HIIT', 'Bodybuilding', 'CrossFit', 'Powerlifting', 'Calisthenics', 'Yoga', 'Cardio'],
        exercise_exclusions: [],
        recovery_bias: false,
        swap_recommendations: false,
    },
    ovulatory: {
        intensity_cap: 'peak',
        volume_modifier: 1.05,
        allowed_training_styles: ['Strength Training', 'Powerlifting', 'HIIT', 'Olympic Lifting', 'Bodybuilding', 'CrossFit', 'Calisthenics', 'Cardio'],
        exercise_exclusions: [],
        recovery_bias: false,
        swap_recommendations: false,
    },
    luteal: {
        intensity_cap: 'moderate',
        volume_modifier: 0.8,
        allowed_training_styles: ['Strength Training', 'Yoga', 'Moderate Cardio', 'Bodybuilding', 'Calisthenics', 'Walking'],
        exercise_exclusions: [],
        recovery_bias: false,
        swap_recommendations: true,
    },
    unknown: {
        intensity_cap: 'moderate',
        volume_modifier: 0.9,
        allowed_training_styles: ['Strength Training', 'Yoga', 'Moderate Cardio', 'Bodybuilding', 'Calisthenics', 'Walking', 'HIIT'],
        exercise_exclusions: [],
        recovery_bias: false,
        swap_recommendations: false,
    },
};

const PHASE_REASONING = {
    menstrual: 'Menstrual phase — estrogen and progesterone are at their lowest. Iron loss via menstruation increases fatigue risk. Focus on mobility, gentle movement, and recovery. Avoid high-impact and heavy loading to reduce discomfort.',
    follicular: 'Follicular phase — rising estrogen improves strength, coordination, and pain tolerance. This is the optimal window for progressive overload, introducing new exercises, and higher training volumes.',
    ovulatory: 'Ovulatory phase — peak estrogen and a testosterone spike create a performance window. Strength, power output, and neuromuscular efficiency are highest. Ideal for PR attempts and high-intensity work.',
    luteal: 'Luteal phase — progesterone dominance increases body temperature, reduces heat tolerance, and shifts fuel utilization toward fat. Glycolytic capacity is impaired. Moderate intensity with steady-state work is preferred.',
    unknown: 'Cycle phase unknown — applying conservative, moderate-intensity defaults to accommodate potential hormonal fluctuations.',
};

/**
 * Compute full cycle constraints for a client.
 * Returns null for non-female clients (pass-through).
 *
 * @param {Object} questionnaire - Client questionnaire data
 * @param {string} tierLevel - 'free' | 'pro' | 'clinic' | 'admin'
 * @returns {Object|null} Cycle constraints object or null
 */
export function computeCycleConstraints(questionnaire, tierLevel = 'free') {
    const q = questionnaire || {};

    // Gate: only activates for female clients with tracking enabled
    if (!q.sex || q.sex.toLowerCase() !== 'female') return null;
    if (!q.cycle_tracking_enabled) return null;

    // Detect phase from date-based inputs
    const { phase, cycleDay } = detectCyclePhase(
        q.last_period_date,
        parseInt(q.period_duration || 5) || 5,
        parseInt(q.cycle_length || 28) || 28
    );

    // Start with phase template
    const template = PHASE_CONSTRAINTS[phase] || PHASE_CONSTRAINTS.unknown;
    const constraints = {
        active: true,
        phase,
        cycle_day: cycleDay,
        intensity_cap: template.intensity_cap,
        volume_modifier: template.volume_modifier,
        allowed_training_styles: [...template.allowed_training_styles],
        exercise_exclusions: [...template.exercise_exclusions],
        recovery_bias: template.recovery_bias,
        swap_recommendations: template.swap_recommendations,
        symptom_flags: [],
        adjustments_applied: [],
        reasoning: PHASE_REASONING[phase] || PHASE_REASONING.unknown,
    };

    // ── Symptom overrides ──
    const symptoms = q.cycle_symptoms || {};
    const isFull = tierLevel !== 'free'; // Pro/Clinic/Admin get full analysis

    // Check high-severity symptoms
    if (symptoms.cramps >= 2) {
        constraints.symptom_flags.push('cramps');
        constraints.adjustments_applied.push('cramp_reduction');
        constraints.volume_modifier = Math.min(constraints.volume_modifier, 0.7);
        constraints.intensity_cap = 'moderate';
        if (isFull) {
            constraints.exercise_exclusions.push('Heavy Squats', 'Leg Press', 'Ab Crunches');
        }
    }

    if (symptoms.fatigue >= 2) {
        constraints.symptom_flags.push('fatigue');
        constraints.adjustments_applied.push('reduced_volume');
        constraints.volume_modifier *= 0.85;
        if (constraints.intensity_cap === 'peak' || constraints.intensity_cap === 'high') {
            constraints.intensity_cap = 'moderate';
            constraints.adjustments_applied.push('intensity_capped');
        }
        if (isFull && phase === 'luteal') {
            // Remove glycolytic HIIT in luteal with fatigue
            constraints.exercise_exclusions.push('Sprint Intervals', 'Tabata', 'EMOM Circuits');
            constraints.allowed_training_styles = constraints.allowed_training_styles.filter(
                s => !['HIIT', 'CrossFit'].includes(s)
            );
        }
    }

    if (symptoms.bloating >= 2) {
        constraints.symptom_flags.push('bloating');
        if (isFull) {
            constraints.adjustments_applied.push('bloating_comfort');
            constraints.exercise_exclusions.push('Heavy Overhead Press');
        }
    }

    if (symptoms.headache >= 2) {
        constraints.symptom_flags.push('headache');
        if (isFull) {
            constraints.adjustments_applied.push('headache_precaution');
            constraints.intensity_cap = 'moderate';
            constraints.exercise_exclusions.push('Valsalva-heavy lifts');
        }
    }

    if (symptoms.mood_changes >= 2) {
        constraints.symptom_flags.push('mood_changes');
        if (isFull) {
            constraints.adjustments_applied.push('mood_support');
            // Encourage endorphin-boosting activities
            if (!constraints.allowed_training_styles.includes('Yoga')) {
                constraints.allowed_training_styles.push('Yoga');
            }
        }
    }

    if (symptoms.sleep_disruption >= 2) {
        constraints.symptom_flags.push('sleep_disruption');
        if (isFull) {
            constraints.adjustments_applied.push('sleep_recovery');
            constraints.volume_modifier *= 0.9;
        }
    }

    // ── Contra-flag override (highest priority) ──
    const flags = q.cycle_contra_flags || {};
    if (flags.heavy_bleeding || flags.severe_pelvic_pain || flags.dizziness) {
        constraints.intensity_cap = 'recovery-only';
        constraints.volume_modifier = 0.4;
        constraints.recovery_bias = true;
        constraints.allowed_training_styles = ['Yoga', 'Walking', 'Stretching', 'Breathing Exercises', 'Mobility'];
        constraints.exercise_exclusions = ['ALL resistance training', 'ALL high-impact', 'ALL HIIT'];
        constraints.adjustments_applied = ['recovery_only_session'];
        constraints.reasoning = 'SAFETY OVERRIDE: Contra-indications detected (heavy bleeding / severe pelvic pain / dizziness). Session restricted to recovery-only protocols. Advise medical consultation.';

        if (flags.heavy_bleeding) constraints.symptom_flags.push('heavy_bleeding');
        if (flags.severe_pelvic_pain) constraints.symptom_flags.push('severe_pelvic_pain');
        if (flags.dizziness) constraints.symptom_flags.push('dizziness');
    }

    // ── Free tier: strip advanced fields ──
    if (!isFull) {
        constraints.exercise_exclusions = [];
        constraints.swap_recommendations = false;
        constraints.reasoning = `${phase.charAt(0).toUpperCase() + phase.slice(1)} phase (Day ${cycleDay}). Intensity and volume adjusted.`;
    }

    // Ensure volume modifier stays reasonable
    constraints.volume_modifier = Math.max(0.3, Math.min(1.15, Math.round(constraints.volume_modifier * 100) / 100));

    return constraints;
}

/**
 * Phase color mapping for UI
 */
export const PHASE_COLORS = {
    menstrual: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#ef4444', label: 'Menstrual Phase', icon: '🔴' },
    follicular: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.4)', text: '#22c55e', label: 'Follicular Phase', icon: '🟢' },
    ovulatory: { bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.4)', text: '#eab308', label: 'Ovulatory Phase', icon: '🟡' },
    luteal: { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.4)', text: '#f97316', label: 'Luteal Phase', icon: '🟠' },
    unknown: { bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.4)', text: '#94a3b8', label: 'Unknown Phase', icon: '⚪' },
};
