import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    AlertTriangle,
    Brain,
    RefreshCw,
    Pill,
    Plus,
    UtensilsCrossed,
    Scale,
    Activity,
    CheckCircle2
} from 'lucide-react';

export default function MealViewer({
    plan,
    onRegenerate,
    onSwapMeal,
    swappingMeal = null,
    showActions = true,
    customActions = null
}) {
    const [showReasoning, setShowReasoning] = useState(false);
    const [activeOptions, setActiveOptions] = useState({});

    if (!plan) return null;

    if (plan.parseError) {
        return (
            <div className="plan-raw glass-card">
                <div className="raw-header">
                    <h3><AlertTriangle size={18} className="text-warning" /> AI Generation Issue</h3>
                    <p>The AI response could not be automatically structured, but the content is preserved below:</p>
                </div>
                <pre className="raw-content">{plan.raw}</pre>
                {onRegenerate && (
                    <button className="btn btn-primary mt-4" onClick={onRegenerate}>
                        <RefreshCw size={16} /> Try Regenerating
                    </button>
                )}
            </div>
        );
    }

    return (
        <motion.div
            className="meal-plan-viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Summary Header */}
            <div className="plan-summary-box glass-card">
                <div className="summary-header">
                    <div className="summary-title">
                        <UtensilsCrossed size={20} className="text-accent" />
                        <h2>Meal Strategy</h2>
                    </div>
                    {showActions && (
                        <div className="plan-actions">
                            {customActions}
                            {onRegenerate && (
                                <button className="btn btn-secondary btn-sm" onClick={onRegenerate}>
                                    <RefreshCw size={14} /> Regenerate
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <p className="plan-description">{plan.summary}</p>
            </div>

            {/* AI Generation Analysis */}
            {plan.aiReasoning && (
                <div className="ai-reasoning-box glass-card mb-6 mt-6">
                    <h3 className="flex items-center gap-2 text-primary mb-4">
                        <Brain size={18} /> AI Generation Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="reasoning-item bg-base-200 p-4 rounded-xl">
                            <h4 className="flex items-center gap-2 font-semibold text-sm mb-2">
                                <Scale size={16} className="text-accent" /> Macro Calculations
                            </h4>
                            <p className="text-sm opacity-80 whitespace-pre-wrap">{plan.aiReasoning.macroCalculations}</p>
                        </div>
                        <div className="reasoning-item bg-base-200 p-4 rounded-xl">
                            <h4 className="flex items-center gap-2 font-semibold text-sm mb-2">
                                <Activity size={16} className="text-secondary" /> Knowledge Base Applied
                            </h4>
                            <p className="text-sm opacity-80 whitespace-pre-wrap">{plan.aiReasoning.knowledgeBaseUtilization}</p>
                        </div>
                        <div className="reasoning-item bg-base-200 p-4 rounded-xl">
                            <h4 className="flex items-center gap-2 font-semibold text-sm mb-2">
                                <Brain size={16} className="text-info" /> External Logic Used
                            </h4>
                            <p className="text-sm opacity-80 whitespace-pre-wrap">{plan.aiReasoning.externalKnowledgeUsed}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Daily Targets */}
            {plan.dailyTargets && (
                <div className="macro-targets glass-card">
                    <h3><Scale size={18} /> Daily Targets</h3>
                    <div className="macro-grid">
                        <div className="macro-item">
                            <span className="macro-value">{plan.dailyTargets.calories}</span>
                            <span className="macro-label">Calories</span>
                        </div>
                        <div className="macro-item">
                            <span className="macro-value">{plan.dailyTargets.protein}</span>
                            <span className="macro-label">Protein</span>
                        </div>
                        <div className="macro-item">
                            <span className="macro-value">{plan.dailyTargets.carbs}</span>
                            <span className="macro-label">Carbs</span>
                        </div>
                        <div className="macro-item">
                            <span className="macro-value">{plan.dailyTargets.fat}</span>
                            <span className="macro-label">Fat</span>
                        </div>
                        {plan.dailyTargets.fiber && (
                            <div className="macro-item">
                                <span className="macro-value">{plan.dailyTargets.fiber}</span>
                                <span className="macro-label">Fiber</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* AI Suggested Additions */}
            {plan.suggestedAdditions?.length > 0 && (
                <div className="suggested-additions glass-card">
                    <h3><Plus size={18} /> AI Suggested Additions</h3>
                    <p className="progress-hint">Filling nutritional gaps in your selection</p>
                    <div className="suggestion-list">
                        {plan.suggestedAdditions.map((s, i) => (
                            <div key={i} className="suggestion-item">
                                <div className="suggestion-food"><strong>{s.item}</strong> — {s.amount}</div>
                                <div className="suggestion-reason">{s.reason}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Drug Warnings */}
            {plan.drugNutrientWarnings?.length > 0 && (
                <div className="drug-warnings glass-card">
                    <h3><Pill size={18} /> Drug-Nutrient Interactions</h3>
                    <div className="drug-warning-list">
                        {plan.drugNutrientWarnings.map((w, i) => (
                            <div key={i} className={`drug-warning-item severity-${(w.severity || 'medium').toLowerCase()}`}>
                                <div className="drug-warning-header">
                                    <strong>{w.medication}</strong>
                                    <span className={`severity-badge ${(w.severity || 'MEDIUM').toLowerCase()}`}>{w.severity || 'MEDIUM'}</span>
                                </div>
                                <p className="drug-interaction">{w.interaction}</p>
                                <p className="drug-action">{w.action}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* General Warnings */}
            {plan.warnings?.length > 0 && (
                <div className="plan-warnings">
                    {plan.warnings.map((w, i) => (
                        <div key={i} className="plan-warning">
                            <AlertTriangle size={16} /> {w}
                        </div>
                    ))}
                </div>
            )}

            {/* Meals List */}
            <div className="meals-list">
                {plan.meals?.map((meal, i) => {
                    const hasOptions = meal.options && meal.options.length > 0;
                    const activeOptionIndex = activeOptions[i] || 0;
                    const activeData = hasOptions ? meal.options[activeOptionIndex] : meal;

                    return (
                        <motion.div
                            key={i}
                            className="meal-card glass-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="meal-header">
                                <div>
                                    <h3>{meal.name}</h3>
                                    <span className="meal-time">{meal.time}</span>
                                </div>
                                <div className="meal-header-right">
                                    <span className="meal-calories">{activeData.totalCalories || meal.totalCalories} kcal</span>
                                    {hasOptions && (
                                        <div className="meal-options-toggle" style={{ display: 'inline-flex', gap: '8px', marginLeft: '16px' }}>
                                            {meal.options.map((opt, oIdx) => (
                                                <button
                                                    key={oIdx}
                                                    className={`btn btn-sm ${activeOptionIndex === oIdx ? 'btn-primary' : 'btn-ghost'}`}
                                                    onClick={() => setActiveOptions(prev => ({ ...prev, [i]: oIdx }))}
                                                    style={{ padding: '4px 8px', fontSize: '12px' }}
                                                >
                                                    {opt.optionName || `Option ${oIdx + 1}`}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {onSwapMeal && (
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => onSwapMeal(i)}
                                            disabled={swappingMeal !== null}
                                        >
                                            {swappingMeal === i ? <div className="spinner-sm" /> : <RefreshCw size={14} />} Swap
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="table-container">
                                <table className="food-table">
                                    <thead>
                                        <tr>
                                            <th>Food Item</th>
                                            <th>Amount</th>
                                            <th>Cal</th>
                                            <th>P</th>
                                            <th>C</th>
                                            <th>F</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeData.foods?.map((f, j) => (
                                            <tr key={j}>
                                                <td className="food-name">{f.item}</td>
                                                <td>{f.amount}</td>
                                                <td>{f.calories}</td>
                                                <td>{f.protein}g</td>
                                                <td>{f.carbs}g</td>
                                                <td>{f.fat}g</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {activeData.foodMechanics && (
                                <div className="food-mechanics">
                                    <Activity size={14} />
                                    <span><strong>Mechanics:</strong> {activeData.foodMechanics}</span>
                                </div>
                            )}
                        </motion.div>
                    )
                })}
            </div>

            {/* Supplements */}
            {plan.supplements?.length > 0 && (
                <div className="supplements-section glass-card">
                    <h3><CheckCircle2 size={18} /> Targeted Supplementation</h3>
                    <div className="table-container">
                        <table className="food-table">
                            <thead>
                                <tr>
                                    <th>Supplement</th>
                                    <th>Dosage</th>
                                    <th>Timing</th>
                                    <th>Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {plan.supplements.map((s, i) => (
                                    <tr key={i}>
                                        <td className="food-name">{s.name}</td>
                                        <td>{s.dosage}</td>
                                        <td>{s.timing}</td>
                                        <td>{s.reason}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Hydration */}
            {plan.hydration && (
                <div className="plan-progression glass-card">
                    <h3>Hydration Protocol</h3>
                    <p>{plan.hydration}</p>
                </div>
            )}

            {/* AI Reasoning */}
            {plan.reasoning?.length > 0 && (
                <div className="plan-reasoning glass-card">
                    <button className="reasoning-toggle" onClick={() => setShowReasoning(!showReasoning)}>
                        <Brain size={18} />
                        <span>Clinical Reasoning ({plan.reasoning.length} nodes)</span>
                        <ChevronDown
                            size={16}
                            style={{
                                transform: showReasoning ? 'rotate(180deg)' : '',
                                transition: 'transform 0.2s'
                            }}
                        />
                    </button>
                    <AnimatePresence>
                        {showReasoning && (
                            <motion.div
                                className="reasoning-content"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                {plan.reasoning.map((r, i) => (
                                    <div key={i} className="reasoning-item">
                                        <span className="reasoning-num">{i + 1}</span>
                                        <p>{r}</p>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
}
