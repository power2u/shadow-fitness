// ═══════════════════════════════════════════════════════
// ShadowFitness — API Usage Tracker
// Tracks token consumption, costs, and enforces quotas
// ═══════════════════════════════════════════════════════

const STORAGE_KEY = 'sf_api_usage';
const QUOTAS_KEY = 'sf_api_quotas';

// Pricing per 1M tokens (USD)
const PRICING = {
    'gemini-2.0-flash': { input: 0.10, output: 0.40 },
    'gemini-2.5-flash': { input: 0.15, output: 0.60 },
    'gemini-2.0-flash-lite': { input: 0.075, output: 0.30 },
};

const DEFAULT_QUOTAS = {
    dailyTokenLimit: 0,   // 0 = unlimited
    monthlyTokenLimit: 0,
    dailyCostLimit: 0,
    monthlyCostLimit: 0,
};

// ── Helpers ──

function today() {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function thisMonth() {
    return new Date().toISOString().slice(0, 7); // YYYY-MM
}

function loadLogs() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveLogs(logs) {
    // Keep max 500 entries to avoid localStorage overflow
    const trimmed = logs.slice(-500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

function loadQuotas() {
    try {
        return { ...DEFAULT_QUOTAS, ...JSON.parse(localStorage.getItem(QUOTAS_KEY) || '{}') };
    } catch {
        return { ...DEFAULT_QUOTAS };
    }
}

function computeCost(model, inputTokens, outputTokens) {
    const rates = PRICING[model] || PRICING['gemini-2.0-flash'];
    const inputCost = (inputTokens / 1_000_000) * rates.input;
    const outputCost = (outputTokens / 1_000_000) * rates.output;
    return parseFloat((inputCost + outputCost).toFixed(6));
}

// ── Event system for real-time overlay updates ──
const listeners = new Set();

function emit(entry) {
    listeners.forEach(fn => fn(entry));
}

// ── Public API ──

export const usageTracker = {

    /** Subscribe to new usage entries (for overlay) */
    subscribe(callback) {
        listeners.add(callback);
        return () => listeners.delete(callback);
    },

    /** Log a usage entry after an API call */
    log(operation, usage) {
        if (!usage) return;
        const { model, inputTokens, outputTokens, totalTokens } = usage;
        const costUSD = computeCost(model, inputTokens, outputTokens);

        const entry = {
            id: Date.now() + '-' + Math.random().toString(36).slice(2, 6),
            timestamp: new Date().toISOString(),
            date: today(),
            month: thisMonth(),
            operation,
            model,
            inputTokens,
            outputTokens,
            totalTokens,
            costUSD,
        };

        const logs = loadLogs();
        logs.push(entry);
        saveLogs(logs);

        // Notify overlay
        emit(entry);

        return entry;
    },

    /** Check if current usage is within quota limits */
    checkQuota() {
        const quotas = loadQuotas();
        const stats = this.getStats();

        if (quotas.dailyTokenLimit > 0 && stats.today.tokens >= quotas.dailyTokenLimit) {
            return { allowed: false, reason: `Daily token limit reached (${quotas.dailyTokenLimit.toLocaleString()} tokens)` };
        }
        if (quotas.monthlyTokenLimit > 0 && stats.thisMonth.tokens >= quotas.monthlyTokenLimit) {
            return { allowed: false, reason: `Monthly token limit reached (${quotas.monthlyTokenLimit.toLocaleString()} tokens)` };
        }
        if (quotas.dailyCostLimit > 0 && stats.today.cost >= quotas.dailyCostLimit) {
            return { allowed: false, reason: `Daily cost limit reached ($${quotas.dailyCostLimit.toFixed(2)})` };
        }
        if (quotas.monthlyCostLimit > 0 && stats.thisMonth.cost >= quotas.monthlyCostLimit) {
            return { allowed: false, reason: `Monthly cost limit reached ($${quotas.monthlyCostLimit.toFixed(2)})` };
        }
        return { allowed: true, reason: null };
    },

    /** Get aggregated stats */
    getStats() {
        const logs = loadLogs();
        const d = today();
        const m = thisMonth();

        const todayLogs = logs.filter(l => l.date === d);
        const monthLogs = logs.filter(l => l.month === m);

        const sum = (arr) => ({
            tokens: arr.reduce((s, l) => s + (l.totalTokens || 0), 0),
            inputTokens: arr.reduce((s, l) => s + (l.inputTokens || 0), 0),
            outputTokens: arr.reduce((s, l) => s + (l.outputTokens || 0), 0),
            cost: parseFloat(arr.reduce((s, l) => s + (l.costUSD || 0), 0).toFixed(6)),
            calls: arr.length,
        });

        // Per-operation breakdown
        const opMap = {};
        logs.forEach(l => {
            if (!opMap[l.operation]) opMap[l.operation] = [];
            opMap[l.operation].push(l);
        });
        const perOperation = Object.entries(opMap).map(([op, entries]) => ({
            operation: op,
            calls: entries.length,
            avgInputTokens: Math.round(entries.reduce((s, e) => s + e.inputTokens, 0) / entries.length),
            avgOutputTokens: Math.round(entries.reduce((s, e) => s + e.outputTokens, 0) / entries.length),
            avgTotalTokens: Math.round(entries.reduce((s, e) => s + e.totalTokens, 0) / entries.length),
            totalCost: parseFloat(entries.reduce((s, e) => s + e.costUSD, 0).toFixed(6)),
            avgCost: parseFloat((entries.reduce((s, e) => s + e.costUSD, 0) / entries.length).toFixed(6)),
        }));

        // Last 7 days for chart
        const last7 = [];
        for (let i = 6; i >= 0; i--) {
            const dt = new Date();
            dt.setDate(dt.getDate() - i);
            const dateStr = dt.toISOString().slice(0, 10);
            const dayLogs = logs.filter(l => l.date === dateStr);
            last7.push({
                date: dateStr,
                label: dt.toLocaleDateString('en', { weekday: 'short' }),
                tokens: dayLogs.reduce((s, l) => s + (l.totalTokens || 0), 0),
                cost: parseFloat(dayLogs.reduce((s, l) => s + (l.costUSD || 0), 0).toFixed(6)),
                calls: dayLogs.length,
            });
        }

        return {
            today: sum(todayLogs),
            thisMonth: sum(monthLogs),
            allTime: sum(logs),
            perOperation,
            last7,
            quotas: loadQuotas(),
        };
    },

    /** Get recent log entries */
    getLogs(limit = 50) {
        return loadLogs().slice(-limit).reverse();
    },

    /** Update quota settings */
    setQuotas(quotas) {
        const current = loadQuotas();
        const updated = { ...current, ...quotas };
        localStorage.setItem(QUOTAS_KEY, JSON.stringify(updated));
        return updated;
    },

    /** Get current quotas */
    getQuotas() {
        return loadQuotas();
    },

    /** Estimate cost at scale */
    estimateAtScale(numUsers, plansPerUserPerMonth) {
        const stats = this.getStats();
        const allOps = stats.perOperation;

        // Average cost per plan generation (workout + meal combined)
        const workoutOp = allOps.find(o => o.operation === 'generateWorkoutPlan');
        const mealOp = allOps.find(o => o.operation === 'generateMealPlan');

        const avgWorkoutCost = workoutOp?.avgCost || 0.003;
        const avgMealCost = mealOp?.avgCost || 0.004;
        const avgWorkoutTokens = workoutOp?.avgTotalTokens || 3000;
        const avgMealTokens = mealOp?.avgTotalTokens || 4000;

        const costPerPlan = avgWorkoutCost + avgMealCost;
        const tokensPerPlan = avgWorkoutTokens + avgMealTokens;

        const totalPlans = numUsers * plansPerUserPerMonth;
        const monthlyCost = totalPlans * costPerPlan;
        const monthlyTokens = totalPlans * tokensPerPlan;

        return {
            numUsers,
            plansPerUserPerMonth,
            totalPlans,
            costPerPlan: parseFloat(costPerPlan.toFixed(4)),
            tokensPerPlan,
            monthlyCost: parseFloat(monthlyCost.toFixed(2)),
            monthlyTokens,
            avgWorkoutCost,
            avgMealCost,
            dataSource: (workoutOp || mealOp) ? 'actual' : 'estimated',
        };
    },

    /** Clear all logs */
    clearLogs() {
        localStorage.removeItem(STORAGE_KEY);
    },

    /** Get pricing table */
    getPricing() {
        return PRICING;
    }
};
