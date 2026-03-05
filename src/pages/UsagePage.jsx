import { useState, useEffect } from 'react';
import { usageTracker } from '../services/usageTracker';
import {
    Zap, DollarSign, Activity, TrendingUp,
    BarChart3, Settings, Calculator, Trash2, AlertTriangle
} from 'lucide-react';
import './UsagePage.css';

const OP_LABELS = {
    generateWorkoutPlan: 'Workout Plan',
    regenerateWorkoutDay: 'Regen Workout Day',
    generateMealPlan: 'Meal Plan',
    regenerateSingleMeal: 'Regen Single Meal',
    generateMealFromIngredients: 'Ingredient Meal',
};

export default function UsagePage() {
    const [stats, setStats] = useState(null);
    const [logs, setLogs] = useState([]);
    const [quotas, setQuotas] = useState(usageTracker.getQuotas());
    const [scaleUsers, setScaleUsers] = useState(50);
    const [scalePlans, setScalePlans] = useState(4);
    const [estimate, setEstimate] = useState(null);
    const [editingQuotas, setEditingQuotas] = useState(false);

    const refresh = () => {
        setStats(usageTracker.getStats());
        setLogs(usageTracker.getLogs(100));
    };

    useEffect(() => {
        refresh();
        const unsub = usageTracker.subscribe(() => refresh());
        return unsub;
    }, []);

    useEffect(() => {
        if (stats?.perOperation?.length > 0) {
            setEstimate(usageTracker.estimateAtScale(scaleUsers, scalePlans));
        }
    }, [scaleUsers, scalePlans, stats]);

    const handleSaveQuotas = () => {
        usageTracker.setQuotas(quotas);
        setEditingQuotas(false);
    };

    const handleClearLogs = () => {
        if (confirm('Clear all usage logs? This cannot be undone.')) {
            usageTracker.clearLogs();
            refresh();
        }
    };

    if (!stats) return null;

    const pricing = usageTracker.getPricing();
    const maxDayTokens = Math.max(...stats.last7.map(d => d.tokens), 1);

    return (
        <div className="page-enter usage-page">
            <div className="usage-header">
                <div>
                    <h1>API Usage & Costs</h1>
                    <p className="usage-subtitle">Track token consumption, costs, and set limits for production scaling.</p>
                </div>
                <button className="btn btn-secondary" onClick={handleClearLogs}>
                    <Trash2 size={16} /> Clear Logs
                </button>
            </div>

            {/* Summary Cards */}
            <div className="usage-cards">
                <div className="glass-card stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(6, 214, 160, 0.1)', color: 'var(--accent-cyan)' }}>
                        <Zap size={20} />
                    </div>
                    <div className="stat-value text-gradient">{stats.today.tokens.toLocaleString()}</div>
                    <div className="stat-label">Tokens Today</div>
                    <div className="stat-sub">↑{stats.today.inputTokens.toLocaleString()} ↓{stats.today.outputTokens.toLocaleString()}</div>
                </div>

                <div className="glass-card stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(67, 97, 238, 0.1)', color: 'var(--accent-blue)' }}>
                        <DollarSign size={20} />
                    </div>
                    <div className="stat-value text-gradient">${stats.today.cost.toFixed(4)}</div>
                    <div className="stat-label">Cost Today</div>
                    <div className="stat-sub">{stats.today.calls} API calls</div>
                </div>

                <div className="glass-card stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(123, 47, 247, 0.1)', color: 'var(--accent-violet)' }}>
                        <TrendingUp size={20} />
                    </div>
                    <div className="stat-value text-gradient">{stats.thisMonth.tokens.toLocaleString()}</div>
                    <div className="stat-label">Tokens This Month</div>
                    <div className="stat-sub">${stats.thisMonth.cost.toFixed(4)} total</div>
                </div>

                <div className="glass-card stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(247, 37, 133, 0.1)', color: 'var(--accent-pink)' }}>
                        <Activity size={20} />
                    </div>
                    <div className="stat-value text-gradient">{stats.allTime.calls}</div>
                    <div className="stat-label">All-Time Calls</div>
                    <div className="stat-sub">${stats.allTime.cost.toFixed(4)} total</div>
                </div>
            </div>

            <div className="usage-grid">
                {/* Left column */}
                <div className="usage-left">

                    {/* 7-Day Chart */}
                    <div className="glass-card usage-section">
                        <div className="usage-section-header">
                            <BarChart3 size={18} />
                            <h3>Last 7 Days</h3>
                        </div>
                        <div className="usage-chart">
                            {stats.last7.map((day, i) => (
                                <div key={i} className="chart-col">
                                    <div className="chart-bar-wrap">
                                        <div
                                            className="chart-bar"
                                            style={{ height: `${Math.max((day.tokens / maxDayTokens) * 100, 2)}%` }}
                                        >
                                            {day.tokens > 0 && (
                                                <span className="chart-bar-label">{(day.tokens / 1000).toFixed(1)}k</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="chart-day">{day.label}</span>
                                    <span className="chart-cost">${day.cost.toFixed(3)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Per-Operation Breakdown */}
                    <div className="glass-card usage-section">
                        <div className="usage-section-header">
                            <Zap size={18} />
                            <h3>Per-Operation Breakdown</h3>
                        </div>
                        {stats.perOperation.length === 0 ? (
                            <p className="usage-empty-text">No operations recorded yet. Generate a plan to see breakdown.</p>
                        ) : (
                            <div className="usage-table-wrap">
                                <table className="usage-table">
                                    <thead>
                                        <tr>
                                            <th>Operation</th>
                                            <th>Calls</th>
                                            <th>Avg Input</th>
                                            <th>Avg Output</th>
                                            <th>Avg Cost</th>
                                            <th>Total Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.perOperation.map((op, i) => (
                                            <tr key={i}>
                                                <td className="op-name">{OP_LABELS[op.operation] || op.operation}</td>
                                                <td>{op.calls}</td>
                                                <td>{op.avgInputTokens.toLocaleString()}</td>
                                                <td>{op.avgOutputTokens.toLocaleString()}</td>
                                                <td className="cost-cell">${op.avgCost.toFixed(4)}</td>
                                                <td className="cost-cell">${op.totalCost.toFixed(4)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pricing Reference */}
                    <div className="glass-card usage-section">
                        <div className="usage-section-header">
                            <DollarSign size={18} />
                            <h3>Gemini Pricing Reference</h3>
                        </div>
                        <div className="usage-table-wrap">
                            <table className="usage-table">
                                <thead>
                                    <tr>
                                        <th>Model</th>
                                        <th>Input $/1M</th>
                                        <th>Output $/1M</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(pricing).map(([model, rates]) => (
                                        <tr key={model}>
                                            <td className="op-name">{model}</td>
                                            <td>${rates.input.toFixed(3)}</td>
                                            <td>${rates.output.toFixed(3)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="usage-right">

                    {/* Scale Estimator */}
                    <div className="glass-card usage-section">
                        <div className="usage-section-header">
                            <Calculator size={18} />
                            <h3>Scale Estimator</h3>
                        </div>
                        <p className="usage-section-desc">
                            Project monthly API costs based on your actual per-operation averages.
                        </p>
                        <div className="estimator-inputs">
                            <div className="input-group">
                                <label className="input-label">Number of Users</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={scaleUsers}
                                    onChange={e => setScaleUsers(Math.max(1, parseInt(e.target.value) || 1))}
                                    min="1"
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Plans / User / Month</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={scalePlans}
                                    onChange={e => setScalePlans(Math.max(1, parseInt(e.target.value) || 1))}
                                    min="1"
                                />
                            </div>
                        </div>

                        {estimate && (
                            <div className="estimator-result">
                                <div className="estimator-row">
                                    <span>Total plans/month</span>
                                    <span className="estimator-val">{estimate.totalPlans.toLocaleString()}</span>
                                </div>
                                <div className="estimator-row">
                                    <span>Tokens/plan (avg)</span>
                                    <span className="estimator-val">{estimate.tokensPerPlan.toLocaleString()}</span>
                                </div>
                                <div className="estimator-row">
                                    <span>Cost/plan (avg)</span>
                                    <span className="estimator-val">${estimate.costPerPlan.toFixed(4)}</span>
                                </div>
                                <div className="estimator-divider" />
                                <div className="estimator-row estimator-total">
                                    <span>Est. Monthly Tokens</span>
                                    <span className="estimator-val">{estimate.monthlyTokens.toLocaleString()}</span>
                                </div>
                                <div className="estimator-row estimator-total">
                                    <span>Est. Monthly Cost</span>
                                    <span className="estimator-val text-gradient">${estimate.monthlyCost.toFixed(2)}</span>
                                </div>
                                {estimate.dataSource === 'estimated' && (
                                    <div className="estimator-note">
                                        <AlertTriangle size={12} /> Using estimated averages. Generate some plans for actual data.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quota Settings */}
                    <div className="glass-card usage-section">
                        <div className="usage-section-header">
                            <Settings size={18} />
                            <h3>Quota Limits</h3>
                            {!editingQuotas && (
                                <button className="btn btn-ghost btn-sm" onClick={() => setEditingQuotas(true)}>Edit</button>
                            )}
                        </div>
                        <p className="usage-section-desc">Set limits to prevent runaway costs. 0 = unlimited.</p>

                        <div className="quota-grid">
                            <div className="quota-item">
                                <label className="input-label">Daily Token Limit</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={quotas.dailyTokenLimit}
                                    onChange={e => setQuotas({ ...quotas, dailyTokenLimit: parseInt(e.target.value) || 0 })}
                                    disabled={!editingQuotas}
                                    min="0"
                                />
                            </div>
                            <div className="quota-item">
                                <label className="input-label">Daily Cost Limit ($)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={quotas.dailyCostLimit}
                                    onChange={e => setQuotas({ ...quotas, dailyCostLimit: parseFloat(e.target.value) || 0 })}
                                    disabled={!editingQuotas}
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                            <div className="quota-item">
                                <label className="input-label">Monthly Token Limit</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={quotas.monthlyTokenLimit}
                                    onChange={e => setQuotas({ ...quotas, monthlyTokenLimit: parseInt(e.target.value) || 0 })}
                                    disabled={!editingQuotas}
                                    min="0"
                                />
                            </div>
                            <div className="quota-item">
                                <label className="input-label">Monthly Cost Limit ($)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={quotas.monthlyCostLimit}
                                    onChange={e => setQuotas({ ...quotas, monthlyCostLimit: parseFloat(e.target.value) || 0 })}
                                    disabled={!editingQuotas}
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                        </div>

                        {editingQuotas && (
                            <div className="quota-actions">
                                <button className="btn btn-primary" onClick={handleSaveQuotas}>Save Limits</button>
                                <button className="btn btn-ghost" onClick={() => { setQuotas(usageTracker.getQuotas()); setEditingQuotas(false); }}>Cancel</button>
                            </div>
                        )}
                    </div>

                    {/* Activity Log */}
                    <div className="glass-card usage-section">
                        <div className="usage-section-header">
                            <Activity size={18} />
                            <h3>Activity Log</h3>
                        </div>
                        <div className="activity-log">
                            {logs.length === 0 ? (
                                <p className="usage-empty-text">No API calls recorded yet.</p>
                            ) : (
                                logs.slice(0, 30).map((log, i) => (
                                    <div key={log.id || i} className="activity-entry">
                                        <div className="activity-top">
                                            <span className="activity-op">{OP_LABELS[log.operation] || log.operation}</span>
                                            <span className="activity-cost">${log.costUSD.toFixed(4)}</span>
                                        </div>
                                        <div className="activity-bottom">
                                            <span className="activity-model">{log.model}</span>
                                            <span>↑{log.inputTokens.toLocaleString()} ↓{log.outputTokens.toLocaleString()}</span>
                                            <span className="activity-time">
                                                {new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
