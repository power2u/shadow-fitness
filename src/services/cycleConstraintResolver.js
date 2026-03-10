/**
 * ═══════════════════════════════════════════════════════
 * ShadowFitness — Cycle Precedence Resolver v1
 * ═══════════════════════════════════════════════════════
 * This service merges Female Cycle Constraints and Training Focus Constraints
 * using a deterministic precedence hierarchy:
 * 
 * Hierarchy:
 * 1. Clinical Safety Override (dizziness, heavy bleeding, etc.)
 * 2. Cycle Phase Caps (Menstrual/Luteal physiological limits)
 * 3. Focus Bias (Hypertrophy targets)
 * 4. Base Training Logic
 * 
 * This ensures that even if a coach requests "Aggressive" focus, it is 
 * automatically adjusted to fit the client's current physiological capacity.
 */

/**
 * Resolves precedence between cycle constraints and training focus.
 * 
 * @param {Object|null} cycle - Constraints from cycleConstraints.js
 * @param {Object|null} focus - Constraints from focusConstraintEngine.js
 * @returns {Object} { resolvedFocus, resolvedCycle, conflict, conflictReason, precedenceLog }
 */
export function resolveCycleAndFocusPrecedence(cycle, focus) {
    const result = {
        resolvedFocus: focus ? { ...focus } : null,
        resolvedCycle: cycle ? { ...cycle } : null,
        conflict: false,
        conflictReason: null,
        precedenceLog: []
    };

    // 1. Gate: If no cycle constraints (male or tracking disabled), pass through
    if (!cycle || !cycle.active) {
        result.precedenceLog.push('No active cycle constraints. Passing focus through.');
        return result;
    }

    // 2. Gate: If no focus requested, pass through
    if (!focus || !focus.active) {
        result.precedenceLog.push('No focus requested. Applying cycle constraints only.');
        return result;
    }

    const { intensity_cap, volume_modifier, phase } = cycle;
    const { biasLevel, target_muscle_multiplier } = focus;

    // ─── RULE 1: Safety Override (Recovery-Only) ───
    if (intensity_cap === 'recovery-only') {
        result.resolvedFocus = null;
        result.conflict = true;
        result.conflictReason = 'Clinical Safety Override: Reporting severe symptoms. Focus suppressed.';
        result.precedenceLog.push('Safety Override active. SUPPRESSING all focus constraints.');
        return result;
    }

    // ─── RULE 2: Menstrual Phase Protocol ───
    if (phase === 'menstrual') {
        // Hard cap: multipliers cannot exceed phase baseline significantly
        const cap = 0.65;
        if (target_muscle_multiplier > cap) {
            result.resolvedFocus.target_muscle_multiplier = cap;
            result.resolvedFocus.biasLevel = 'Capped (Menstrual)';
            result.conflict = true;
            result.conflictReason = `Menstrual phase cap (0.65x) applied. Downgrading ${biasLevel} focus.`;
            result.precedenceLog.push(`Capped focus multiplier from ${target_muscle_multiplier} to ${cap} due to Menstrual Phase.`);
        }
    }

    // ─── RULE 3: Luteal Phase Protocol (Heat/Fatigue) ───
    if (phase === 'luteal') {
        // Luteal caps: Moderate focus (1.5x) is the max allowed. Aggressive (2.0x) is too high.
        const maxLutealMult = 1.5;
        const volumeCap = 0.8; // Cycle baseline volume_modifier for luteal

        if (biasLevel === 'Aggressive') {
            result.resolvedFocus.biasLevel = 'Moderate (Capped by Luteal)';
            result.resolvedFocus.target_muscle_multiplier = maxLutealMult;
            result.conflict = true;
            result.conflictReason = 'Luteal phase detected. Downgrading Aggressive focus to Moderate for safety.';
            result.precedenceLog.push('Downgraded focus from Aggressive to Moderate due to Luteal phase.');
        } else if (target_muscle_multiplier > 1.5) {
            result.resolvedFocus.target_muscle_multiplier = 1.5;
            result.conflict = true;
            result.precedenceLog.push('Capping multiplier at 1.5x for Luteal phase.');
        }
    }

    // ─── RULE 4: Follicular/Ovulatory Window ───
    if (phase === 'follicular' || phase === 'ovulatory') {
        result.precedenceLog.push(`${phase.charAt(0).toUpperCase() + phase.slice(1)} window: Full focus bias allowed.`);
    }

    return result;
}
