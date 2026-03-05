// ═══════════════════════════════════════════════════════
// ShadowFitness — Tier Guard System
// Enforces pricing tier restrictions across the platform
// ═══════════════════════════════════════════════════════

import { adminService } from './supabase';

const TIER_KEY = 'sf_user_tier';
const USAGE_KEY = 'sf_tier_usage';
const LIMITS_CACHE_KEY = 'sf_tier_limits_cache';

// ── Tier Definitions ──

// Fallback hardcoded limits just in case Supabase is down
const DEFAULT_LIMITS = {
    free: {
        label: 'Free',
        color: '#888',
        maxClients: 3,
        workoutPlansPerMonth: 5,
        mealPlansPerMonth: 5,
        ingredientSelector: false,
        pdfUpload: false,
        maxPdfBooks: 0,
        drugNutrientLevel: 'basic',    // basic | full
        cycleAnalysisLevel: 'basic',   // basic | full — female physiology module depth
        exportEnabled: false,
        teamSeats: 1,
    },
    pro: {
        label: 'Pro',
        color: '#06d6a0',
        maxClients: 50,
        workoutPlansPerMonth: 100,
        mealPlansPerMonth: 100,
        ingredientSelector: true,
        pdfUpload: true,
        maxPdfBooks: 5,
        drugNutrientLevel: 'full',
        cycleAnalysisLevel: 'full',
        exportEnabled: true,
        teamSeats: 1,
    },
    clinic: {
        label: 'Clinic',
        color: '#7b2ff7',
        maxClients: 999999,
        workoutPlansPerMonth: 999999,
        mealPlansPerMonth: 999999,
        ingredientSelector: true,
        pdfUpload: true,
        maxPdfBooks: 20,
        drugNutrientLevel: 'full',
        cycleAnalysisLevel: 'full',
        exportEnabled: true,
        teamSeats: 5,
    },
    admin: {
        label: 'Admin',
        color: '#ff2a5f',
        maxClients: 999999,
        workoutPlansPerMonth: 999999,
        mealPlansPerMonth: 999999,
        ingredientSelector: true,
        pdfUpload: true,
        maxPdfBooks: 999999,
        drugNutrientLevel: 'full',
        cycleAnalysisLevel: 'full',
        exportEnabled: true,
        teamSeats: 999999,
    },
};

// Start with cached or default limits so the UI renders instantly
export let TIER_LIMITS = JSON.parse(localStorage.getItem(LIMITS_CACHE_KEY) || JSON.stringify(DEFAULT_LIMITS));

// ── Usage Tracking (localStorage for demo, extendable to Supabase) ──

function currentPeriod() {
    return new Date().toISOString().slice(0, 7); // YYYY-MM
}

function loadUsage() {
    try {
        const data = JSON.parse(localStorage.getItem(USAGE_KEY) || '{}');
        const period = currentPeriod();
        // Reset if new month
        if (data.period !== period) {
            return { period, workoutPlans: 0, mealPlans: 0 };
        }
        return data;
    } catch {
        return { period: currentPeriod(), workoutPlans: 0, mealPlans: 0 };
    }
}

function saveUsage(usage) {
    localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
}

// ── Public API ──

export const tierGuard = {

    /** Initialize from database to keep tiers updated dynamically */
    async initTiers() {
        try {
            const dbLimits = await adminService.getPricingTiers();
            if (dbLimits) {
                TIER_LIMITS = dbLimits;
                localStorage.setItem(LIMITS_CACHE_KEY, JSON.stringify(dbLimits));
                return true;
            }
        } catch (err) {
            console.error('Failed to sync tier limits from Supabase:', err);
        }
        return false;
    },

    /** Force a refresh of the cached tiers */
    async refreshTiers() {
        await this.initTiers();
    },

    /** Get current user tier */
    getTier() {
        return localStorage.getItem(TIER_KEY) || 'free';
    },

    /** Set user tier (for testing / admin) */
    setTier(tier) {
        if (!TIER_LIMITS[tier]) throw new Error('Invalid tier: ' + tier);
        localStorage.setItem(TIER_KEY, tier);
        return tier;
    },

    /** Get tier limits object */
    getLimits() {
        return TIER_LIMITS[this.getTier()];
    },

    /** Get tier label and color */
    getTierInfo() {
        const tier = this.getTier();
        const limits = TIER_LIMITS[tier];
        return { tier, label: limits.label, color: limits.color, limits };
    },

    /** Get current month's usage counts */
    getUsage() {
        return loadUsage();
    },

    /** Increment usage counter after successful operation */
    incrementUsage(feature) {
        const usage = loadUsage();
        if (feature === 'workoutPlans' || feature === 'mealPlans') {
            usage[feature] = (usage[feature] || 0) + 1;
        }
        saveUsage(usage);
        return usage;
    },

    /**
     * Check if a feature action is allowed
     * @param {'clients'|'workoutPlans'|'mealPlans'|'ingredientSelector'|'pdfUpload'|'export'} feature
     * @param {number} currentCount - current count for limit-based features
     * @returns {{ allowed: boolean, reason: string|null, limit: number|boolean }}
     */
    checkLimit(feature, currentCount = 0) {
        const limits = this.getLimits();

        switch (feature) {
            case 'clients':
                if (currentCount >= limits.maxClients) {
                    return {
                        allowed: false,
                        reason: `${limits.label} plan allows max ${limits.maxClients} clients. Upgrade to add more.`,
                        limit: limits.maxClients,
                        current: currentCount,
                    };
                }
                return { allowed: true, limit: limits.maxClients, current: currentCount };

            case 'workoutPlans': {
                const usage = loadUsage();
                const count = usage.workoutPlans || 0;
                if (count >= limits.workoutPlansPerMonth) {
                    return {
                        allowed: false,
                        reason: `You've used all ${limits.workoutPlansPerMonth} workout plans this month. Upgrade for more.`,
                        limit: limits.workoutPlansPerMonth,
                        current: count,
                    };
                }
                return { allowed: true, limit: limits.workoutPlansPerMonth, current: count };
            }

            case 'mealPlans': {
                const usage = loadUsage();
                const count = usage.mealPlans || 0;
                if (count >= limits.mealPlansPerMonth) {
                    return {
                        allowed: false,
                        reason: `You've used all ${limits.mealPlansPerMonth} meal plans this month. Upgrade for more.`,
                        limit: limits.mealPlansPerMonth,
                        current: count,
                    };
                }
                return { allowed: true, limit: limits.mealPlansPerMonth, current: count };
            }

            case 'ingredientSelector':
                if (!limits.ingredientSelector) {
                    return { allowed: false, reason: 'Ingredient Selector is a Pro feature. Upgrade to unlock.', limit: false };
                }
                return { allowed: true, limit: true };

            case 'pdfUpload':
                if (!limits.pdfUpload) {
                    return { allowed: false, reason: 'PDF Knowledge Upload is a Pro feature. Upgrade to unlock.', limit: 0 };
                }
                if (currentCount >= limits.maxPdfBooks) {
                    return {
                        allowed: false,
                        reason: `${limits.label} plan allows max ${limits.maxPdfBooks} PDF books. Upgrade for more.`,
                        limit: limits.maxPdfBooks,
                        current: currentCount,
                    };
                }
                return { allowed: true, limit: limits.maxPdfBooks, current: currentCount };

            case 'export':
                if (!limits.exportEnabled) {
                    return { allowed: false, reason: 'PDF & DOCX export is a Pro feature. Upgrade to unlock.', limit: false };
                }
                return { allowed: true, limit: true };

            default:
                return { allowed: true };
        }
    },

    /** Check if a boolean feature is enabled for current tier */
    isFeatureEnabled(feature) {
        const limits = this.getLimits();
        switch (feature) {
            case 'ingredientSelector': return limits.ingredientSelector;
            case 'pdfUpload': return limits.pdfUpload;
            case 'export': return limits.exportEnabled;
            case 'fullDrugChecks': return limits.drugNutrientLevel === 'full';
            default: return true;
        }
    },

    /** Get dashboard usage summary for meters */
    getDashboardUsage(clientCount) {
        const limits = this.getLimits();
        const usage = loadUsage();
        return {
            clients: { current: clientCount, limit: limits.maxClients, label: 'Clients' },
            workoutPlans: { current: usage.workoutPlans || 0, limit: limits.workoutPlansPerMonth, label: 'Workout Plans' },
            mealPlans: { current: usage.mealPlans || 0, limit: limits.mealPlansPerMonth, label: 'Meal Plans' },
        };
    },

    /** Reset monthly usage (for testing) */
    resetUsage() {
        saveUsage({ period: currentPeriod(), workoutPlans: 0, mealPlans: 0 });
    },
};
