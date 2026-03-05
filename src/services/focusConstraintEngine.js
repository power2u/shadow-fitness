/**
 * Deterministic Focus Constraint Engine
 * Generates structured rules and volume multipliers for targeted muscle biasing.
 */

const BIAS_MULTIPLIERS = {
    mild: { focus: 1.25, others: 0.9, freq: "maintenance+" },
    moderate: { focus: 1.5, others: 0.75, freq: "high" },
    aggressive: { focus: 2.0, others: 0.5, freq: "peak" }
};

export const getFocusConstraints = (focusArea, biasLevel) => {
    if (!focusArea || focusArea === 'None') {
        return {
            active: false,
            description: "Balanced full-body distribution following primary goal."
        };
    }

    const multipliers = BIAS_MULTIPLIERS[biasLevel.toLowerCase()] || BIAS_MULTIPLIERS.mild;

    return {
        active: true,
        focusArea,
        biasLevel,
        rules: {
            volumeMultiplier: multipliers.focus,
            othersVolumeModifier: multipliers.others,
            frequencyTarget: multipliers.freq,
            maintenanceLock: true,
            recoveryFocus: true
        },
        constraints: [
            `Weekly volume for ${focusArea} MUST be ${multipliers.focus}x normal baseline.`,
            `Other muscle groups MUST be kept at MINIMUM maintenance volume (${multipliers.others}x baseline) to avoid fatigue interference.`,
            `${focusArea} should be trained at least 2-3 times per week if the training split allows.`,
            `Ensure 48h recovery between high-intensity targeted ${focusArea} sessions.`,
            `Prioritize ${focusArea} exercises at the START of workouts for maximal CNS energy.`
        ]
    };
};
