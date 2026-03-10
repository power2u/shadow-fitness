/**
 * ═══════════════════════════════════════════════════════
 * ShadowFitness — Cycle-Aware Prompt Builder v1
 * ═══════════════════════════════════════════════════════
 * This builder consumes the output of resolveCycleAndFocusPrecedence
 * and generates the MANDATORY INSTRUCTION block for the Gemini LLM.
 * 
 * It makes the precedence logic EXPLICIT to the LLM to ensure
 * zero "guesswork" and high compliance.
 */

export function buildResolvedConstraintPrompt(resolvedData) {
    if (!resolvedData) return '';

    const { resolvedFocus, resolvedCycle, conflict, conflictReason, precedenceLog } = resolvedData;

    if (!resolvedCycle || !resolvedCycle.active) return '';

    const safetyOverride = resolvedCycle.intensity_cap === 'recovery-only';

    // 1. Build the Precedence Log for the LLM
    const logBlock = precedenceLog.map(line => `  [RESOLVED] ${line}`).join('\n');

    // 2. Build the Mandatory Constraints Block
    const safetyWarning = safetyOverride ? `
\u26d4 SAFETY OVERRIDE ACTIVE \u26d4
RECOVERY-ONLY MANDATE: The client has reported clinical contra-indications.
- NO resistance training.
- NO HIIT.
- NO high-impact.
- ONLY: Walking, Yoga, Gentle Stretching, Mobility.
` : '';

    const conflictWarning = conflict ? `
[WARNING] CONFLICT RESOLVED: Training focus was requested but has been DOWNGRADED or SUPPRESSED 
due to the client's current physiological state (${conflictReason}). 
You MUST prioritize the resolved multipliers below over any coach-requested bias.
` : '';

    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY PHYSIOLOGICAL CONSTRAINTS (Deterministic Precedence)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRECEDENCE CHAIN: 
Safety Override > Cycle Phase Caps > Focus Bias > Base Training

RESOLUTION LOG:
${logBlock}

resolvedCycle:
- Phase: ${resolvedCycle.phase}
- Intensity Cap: ${resolvedCycle.intensity_cap}
- Volume Modifier: ${resolvedCycle.volume_modifier}x
- Exclusions: [${resolvedCycle.exercise_exclusions.join(', ')}]
- Reasoning: ${resolvedCycle.reasoning}

${resolvedFocus ? `resolvedFocus (Post-Resolution):
- Target Muscle: ${resolvedFocus.focusArea}
- Target Multiplier: ${resolvedFocus.target_muscle_multiplier}x
- Bias Level: ${resolvedFocus.biasLevel}
- Antagonist Rules: ${JSON.stringify(resolvedFocus.antagonist_balance_minimums)}` : 'resolvedFocus: NONE (Focus suppressed for safety or not requested).'}

${safetyWarning}
${conflictWarning}

COMPLIANCE MANDATE:
1. You MUST follow the intensity_cap and volume_modifier.
2. If safety override is active, your weeklySchedule MUST be 100% recovery sessions.
3. Use the "resolvedFocus" multipliers provided above—do NOT attempt to guess higher values.
4. Include "cycleContext" and "focusMetadata" in your JSON response to record these resolved rules.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}
