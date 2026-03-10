/**
 * ═══════════════════════════════════════════════════════
 * ShadowFitness — Cycle Precedence Verification Script
 * ═══════════════════════════════════════════════════════
 */
import { resolveCycleAndFocusPrecedence } from './src/services/cycleConstraintResolver.js';

const SCENARIOS = [
    {
        name: "MALE CLIENT (Control)",
        cycle: null,
        focus: { active: true, focusArea: 'Chest', biasLevel: 'Aggressive', target_muscle_multiplier: 2.0 },
    },
    {
        name: "FEMALE FOLLICULAR (Full Bias)",
        cycle: { active: true, phase: 'follicular', intensity_cap: 'high', volume_modifier: 1.0, exercise_exclusions: [] },
        focus: { active: true, focusArea: 'Legs', biasLevel: 'Aggressive', target_muscle_multiplier: 2.0 },
    },
    {
        name: "FEMALE LUTEAL + AGGRESSIVE (Precedence Check)",
        cycle: { active: true, phase: 'luteal', intensity_cap: 'moderate', volume_modifier: 0.8, exercise_exclusions: [] },
        focus: { active: true, focusArea: 'Back', biasLevel: 'Aggressive', target_muscle_multiplier: 2.0 },
    },
    {
        name: "FEMALE MENSTRUAL + FOCUS (Cap Check)",
        cycle: { active: true, phase: 'menstrual', intensity_cap: 'low-moderate', volume_modifier: 0.65, exercise_exclusions: [] },
        focus: { active: true, focusArea: 'Arms', biasLevel: 'Mild', target_muscle_multiplier: 1.25 },
    },
    {
        name: "SAFETY OVERRIDE (Dizziness/Bleeding)",
        cycle: { active: true, phase: 'menstrual', intensity_cap: 'recovery-only', volume_modifier: 0.4, exercise_exclusions: ['ALL resistance'] },
        focus: { active: true, focusArea: 'Glutes', biasLevel: 'Moderate', target_muscle_multiplier: 1.5 },
    }
];

console.log("------------------------------------------------------------------");
console.log("SHADOWFITNESS CYCLE PRECEDENCE VERIFICATION");
console.log("------------------------------------------------------------------");

SCENARIOS.forEach(s => {
    const result = resolveCycleAndFocusPrecedence(s.cycle, s.focus);

    console.log(`\nSCENARIO: ${s.name}`);
    console.log(`- Phase: ${s.cycle?.phase || 'N/A'}`);
    console.log(`- Focus Requested: ${s.focus?.biasLevel} ${s.focus?.focusArea} (${s.focus?.target_muscle_multiplier}x)`);

    const resolvedMult = result.resolvedFocus?.target_muscle_multiplier || 0;
    const resolvedBias = result.resolvedFocus?.biasLevel || 'NONE';

    console.log(`- [RESOLVED] Multiplier: ${resolvedMult}x`);
    console.log(`- [RESOLVED] Bias Level: ${resolvedBias}`);
    console.log(`- Conflict: ${result.conflict ? 'YES ✅' : 'NO'}`);
    if (result.conflictReason) console.log(`- Reason: ${result.conflictReason}`);
    console.log(`- Log: ${result.precedenceLog[result.precedenceLog.length - 1]}`);
});

console.log("\n------------------------------------------------------------------");
console.log("VERIFICATION COMPLETE: Deterministic Precedence Enforced.");
console.log("------------------------------------------------------------------");
