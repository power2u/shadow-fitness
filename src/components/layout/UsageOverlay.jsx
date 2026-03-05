import { useState, useEffect, useRef } from 'react';
import { usageTracker } from '../../services/usageTracker';
import {
    Activity, X, ChevronDown, ChevronUp,
    Zap, DollarSign, Clock
} from 'lucide-react';
import './UsageOverlay.css';

const OP_LABELS = {
    generateWorkoutPlan: 'Workout Plan',
    regenerateWorkoutDay: 'Regen Day',
    generateMealPlan: 'Meal Plan',
    regenerateSingleMeal: 'Regen Meal',
    generateMealFromIngredients: 'Ingredient Meal',
};

export default function UsageOverlay() {
    const [visible, setVisible] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const [entries, setEntries] = useState([]);
    const [stats, setStats] = useState(null);
    const [flash, setFlash] = useState(false);
    const listRef = useRef(null);

    useEffect(() => {
        // Load initial stats
        setStats(usageTracker.getStats());

        // Subscribe to new entries
        const unsub = usageTracker.subscribe((entry) => {
            setEntries(prev => [entry, ...prev].slice(0, 20));
            setStats(usageTracker.getStats());
            setVisible(true);
            setFlash(true);
            setTimeout(() => setFlash(false), 1200);
        });

        return unsub;
    }, []);

    if (!visible && entries.length === 0) {
        return (
            <button
                className="usage-overlay-trigger"
                onClick={() => { setVisible(true); setStats(usageTracker.getStats()); }}
                title="API Usage Monitor"
            >
                <Activity size={16} />
            </button>
        );
    }

    if (!visible) return null;

    const todayStats = stats?.today || { tokens: 0, cost: 0, calls: 0 };

    return (
        <div className={`usage-overlay ${flash ? 'usage-flash' : ''}`}>
            {/* Header */}
            <div className="usage-overlay-header">
                <div className="usage-overlay-title">
                    <Activity size={14} />
                    <span>API Monitor</span>
                    <span className="usage-live-dot" />
                </div>
                <div className="usage-overlay-actions">
                    <button onClick={() => setExpanded(!expanded)}>
                        {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>
                    <button onClick={() => setVisible(false)}>
                        <X size={14} />
                    </button>
                </div>
            </div>

            {expanded && (
                <>
                    {/* Today's summary */}
                    <div className="usage-overlay-stats">
                        <div className="usage-mini-stat">
                            <Zap size={12} />
                            <span>{todayStats.tokens.toLocaleString()}</span>
                            <span className="usage-mini-label">tokens</span>
                        </div>
                        <div className="usage-mini-stat">
                            <DollarSign size={12} />
                            <span>${todayStats.cost.toFixed(4)}</span>
                            <span className="usage-mini-label">today</span>
                        </div>
                        <div className="usage-mini-stat">
                            <Clock size={12} />
                            <span>{todayStats.calls}</span>
                            <span className="usage-mini-label">calls</span>
                        </div>
                    </div>

                    {/* Recent entries */}
                    <div className="usage-overlay-log" ref={listRef}>
                        {entries.length === 0 ? (
                            <div className="usage-overlay-empty">No API calls yet. Generate a plan to see usage.</div>
                        ) : (
                            entries.map((e, i) => (
                                <div key={e.id || i} className={`usage-log-entry ${i === 0 ? 'usage-entry-new' : ''}`}>
                                    <div className="usage-entry-top">
                                        <span className="usage-entry-op">{OP_LABELS[e.operation] || e.operation}</span>
                                        <span className="usage-entry-cost">${e.costUSD.toFixed(4)}</span>
                                    </div>
                                    <div className="usage-entry-bottom">
                                        <span className="usage-entry-model">{e.model}</span>
                                        <span className="usage-entry-tokens">
                                            ↑{e.inputTokens.toLocaleString()} ↓{e.outputTokens.toLocaleString()}
                                        </span>
                                        <span className="usage-entry-time">
                                            {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
