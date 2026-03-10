/**
 * ─────────────────────────────────────────────────────────────────
 * Deterministic Focus Constraint Engine — ShadowFitness
 * Produces structured, numeric muscle-group bias rules that are
 * injected into the Gemini prompt BEFORE LLM generation.
 * All rules are calculated deterministically here — the LLM never
 * decides the volume split; it only applies the given multipliers.
 * ─────────────────────────────────────────────────────────────────
 */

/**
 * Volume multipliers per bias level.
 * - focus: applied to target muscle weekly set volume
 * - others: applied to non-target muscles (maintenance floor)
 * - freqTag: human-readable frequency guidance
 */
const BIAS_TABLE = {
  Mild:       { focus: 1.25, others: 0.9,  freqTag: 'add 1 extra session or +20% sets per session' },
  Moderate:   { focus: 1.5,  others: 0.75, freqTag: 'increase to 2–3 sessions/week, sequenced early in split' },
  Aggressive: { focus: 2.0,  others: 0.5,  freqTag: 'maximum specialization — train 3+ times/week, all others drop to maintenance minimum' },
};

/**
 * Per-muscle antagonist balance rules.
 * Ensures structural health and joint integrity even under specialization.
 * Each entry defines which "opposing" muscles must retain minimum volume.
 *
 * Format: { muscle: [{ antagonist, reason, minSetsPerWeek }] }
 */
const ANTAGONIST_RULES = {
  Chest: [
    { antagonist: 'Back (rows/pulldowns)', reason: 'Scapular retraction balances anterior chain dominance; prevents rounded shoulders', minSetsPerWeek: 10 },
    { antagonist: 'Rear Delts',           reason: 'Posterior deltoid balance prevents impingement under heavy pressing volume',        minSetsPerWeek: 6  },
  ],
  Back: [
    { antagonist: 'Chest (pressing)',  reason: 'Anterior shoulder health and postural balance require moderate pressing volume',   minSetsPerWeek: 8  },
    { antagonist: 'Biceps (supinated pulls)', reason: 'Elbow flexor integrity under high row/pulldown volume',                    minSetsPerWeek: 6  },
  ],
  Shoulders: [
    { antagonist: 'Rear Delts & Rotator Cuff (external rotation drills)', reason: 'Prevents supraspinatus impingement under overhead pressing volume', minSetsPerWeek: 8 },
    { antagonist: 'Upper Traps & Neck', reason: 'Cervical load balance during overhead work',                                    minSetsPerWeek: 4  },
  ],
  Arms: [
    { antagonist: 'Triceps (when biasing Biceps)', reason: 'Elbow stability and balanced arm development',  minSetsPerWeek: 8  },
    { antagonist: 'Biceps (when biasing Triceps)', reason: 'Elbow joint integrity during heavy pressing',   minSetsPerWeek: 8  },
  ],
  Legs: [
    { antagonist: 'Hamstrings & Posterior Chain', reason: 'Quad-dominant bias must include hamstring balance to protect ACL/PCL', minSetsPerWeek: 8  },
    { antagonist: 'Calves',                       reason: 'Ankle and Achilles integrity under high leg volume',                   minSetsPerWeek: 6  },
    { antagonist: 'Hip Abductors/Adductors',      reason: 'Knee tracking integrity under squat-dominant programming',            minSetsPerWeek: 4  },
  ],
  Glutes: [
    { antagonist: 'Hip Flexors (mobility/stretch)',  reason: 'Anterior pelvic tilt prevention during glute specialization',       minSetsPerWeek: 4  },
    { antagonist: 'Hamstrings',                      reason: 'Posterior chain co-activation and knee health',                     minSetsPerWeek: 8  },
    { antagonist: 'Lower Back (erectors/extensions)',reason: 'Lumbar support during heavy hip hinge movements',                   minSetsPerWeek: 4  },
  ],
  Core: [
    { antagonist: 'Lower Back (erectors)',    reason: 'Spinal flexion-extension balance prevents disc stress',                    minSetsPerWeek: 6  },
    { antagonist: 'Hip Flexors (stretching)', reason: 'Anterior tilt management under high core volume',                         minSetsPerWeek: 4  },
  ],
  None: [],
};

/**
 * Priority compound lifts per muscle group.
 * These should appear at the BEGINNING of sessions for maximal CNS recruitment.
 */
const PRIORITY_EXERCISES = {
  Chest:     ['Barbell Bench Press', 'Incline Dumbbell Press', 'Weighted Dips'],
  Back:      ['Barbell Row', 'Weighted Pull-Ups', 'Deadlift (back-dominant)'],
  Shoulders: ['Overhead Press (Barbell/Dumbbell)', 'Arnold Press', 'Seated DB Press'],
  Arms:      ['Close-Grip Bench Press', 'Barbell Curl', 'Skull Crushers', 'Preacher Curl'],
  Legs:      ['Barbell Back Squat', 'Romanian Deadlift', 'Leg Press', 'Bulgarian Split Squat'],
  Glutes:    ['Hip Thrust (Barbell)', 'Romanian Deadlift', 'Cable Kickback', 'Sumo Deadlift'],
  Core:      ['Hanging Leg Raise', 'Ab Wheel Rollout', 'Cable Crunch', 'Dragon Flag'],
  None:      [],
};

/**
 * Frequency guidance per muscle given weekly training days.
 * Returns how many sessions per week should hit the target muscle.
 */
function getFrequencyGuidance(focusArea, daysPerWeek) {
  const days = parseInt(daysPerWeek) || 4;
  if (focusArea === 'None' || !focusArea) return null;
  // Arm-style isolation groups can be hit more frequently
  const isIsolation = ['Arms', 'Core', 'Shoulders'].includes(focusArea);
  if (days <= 3) return isIsolation ? '2x/week' : '1–2x/week';
  if (days <= 4) return isIsolation ? '2–3x/week' : '2x/week';
  return isIsolation ? '3x/week' : '2–3x/week';
}

/**
 * Main export — getFocusConstraints
 * Returns a structured constraint object or {active: false} for balanced plans.
 *
 * @param {string} focusArea  — e.g. 'Legs', 'Chest', 'None'
 * @param {string} biasLevel  — e.g. 'Mild', 'Moderate', 'Aggressive'
 * @param {number|string} daysPerWeek — from client questionnaire
 * @returns {object} FocusConstraint
 */
export const getFocusConstraints = (focusArea, biasLevel, daysPerWeek = 4) => {
  if (!focusArea || focusArea === 'None') {
    return {
      active: false,
      description: 'Balanced full-body distribution. Follow primary goal without muscle-group bias.',
    };
  }

  const bias = BIAS_TABLE[biasLevel] || BIAS_TABLE.Mild;
  const antagonists = ANTAGONIST_RULES[focusArea] || [];
  const priorityExercises = PRIORITY_EXERCISES[focusArea] || [];
  const frequencyGuidance = getFrequencyGuidance(focusArea, daysPerWeek);

  return {
    active: true,
    focusArea,
    biasLevel,

    // ── Core numeric multipliers ──────────────────────────────
    target_muscle_multiplier: bias.focus,
    maintenance_multiplier_others: bias.others,

    // ── Antagonist balance minimums (structural safety) ───────
    antagonist_balance_minimums: antagonists.map(a => ({
      muscle: a.antagonist,
      min_sets_per_week: a.minSetsPerWeek,
      reason: a.reason,
    })),

    // ── Frequency & exercise guidance ─────────────────────────
    frequency_guidance: `${focusArea} should be trained ${frequencyGuidance} — ${bias.freqTag}.`,
    priority_exercises: priorityExercises,

    // ── Flat constraint strings for prompt injection ──────────
    constraints: [
      `TARGET: ${focusArea} — all sessions must prioritize this muscle group.`,
      `VOLUME: Apply a ${bias.focus}x multiplier to ${focusArea} weekly set count vs. baseline.`,
      `MAINTENANCE: All non-target muscle groups MUST stay at ${bias.others}x baseline volume (no less — prevents atrophy and fatigue interference).`,
      `FREQUENCY: ${focusArea} should be trained ${frequencyGuidance}. ${bias.freqTag}.`,
      `ORDER: ${focusArea} compound lifts (${priorityExercises.slice(0, 2).join(', ')}) MUST appear at the START of sessions.`,
      `ANTAGONIST BALANCE (MANDATORY for structural safety):\n${antagonists.map(a =>
        `  - ${a.antagonist}: minimum ${a.minSetsPerWeek} sets/week — ${a.reason}`
      ).join('\n')}`,
      `REST: Ensure ≥48h between high-intensity ${focusArea} sessions to allow supercompensation.`,
    ],

    // ── Legacy rules object (backward compat) ─────────────────
    rules: {
      volumeMultiplier: bias.focus,
      othersVolumeModifier: bias.others,
      frequencyTarget: bias.freqTag,
      maintenanceLock: true,
      recoveryFocus: true,
    },
  };
};
