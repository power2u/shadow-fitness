import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { clientService } from '../services/supabase';
import { geminiService } from '../services/gemini';
import { getRelevantKnowledge } from '../services/knowledgeStore';
import { exportMealPDF, exportMealDOCX } from '../services/exportPlan';
import { FOOD_DATABASE, computeMacroTotals, getFoodsByRegion } from '../services/foodDatabase';
import { tierGuard } from '../services/tierGuard';
import { UtensilsCrossed, Sparkles, ChevronDown, AlertTriangle, Brain, Zap, RefreshCw, Download, FileText, Scale, Activity, Pill, Plus, X, Search, Check, Lock } from 'lucide-react';
import UpgradeModal from '../components/ui/UpgradeModal';
import './BuilderPage.css';

export default function MealBuilderPage() {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [swappingMeal, setSwappingMeal] = useState(null);
    const [error, setError] = useState('');
    const [showReasoning, setShowReasoning] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [progress, setProgress] = useState({ currentWeight: '', digestion: '', energy: '', newSymptoms: '', medicationChanges: '' });
    // Ingredient selector state
    const [showIngredients, setShowIngredients] = useState(false);
    const [selectedFoods, setSelectedFoods] = useState([]);
    const [activeCategory, setActiveCategory] = useState('proteins');
    const [searchQuery, setSearchQuery] = useState('');
    const [mode, setMode] = useState('ai'); // 'ai' = full AI generation, 'ingredients' = coach picks
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState('');

    useEffect(() => { if (user) loadClients(); }, [user]);

    const loadClients = async () => {
        try { const data = await clientService.getAll(user.id); setClients(data || []); }
        catch (err) { console.error(err); }
    };

    const clientRegion = selectedClient?.questionnaire?.country || '';

    const filteredFoods = useMemo(() => {
        const cat = FOOD_DATABASE[activeCategory] || [];
        let items = cat;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            items = items.filter(f => f.name.toLowerCase().includes(q));
        }
        return items;
    }, [activeCategory, searchQuery]);

    const macroTotals = useMemo(() => computeMacroTotals(selectedFoods), [selectedFoods]);

    const addFood = (food) => {
        if (selectedFoods.find(sf => sf.food.id === food.id)) return;
        setSelectedFoods([...selectedFoods, { food, grams: 100 }]);
    };

    const removeFood = (id) => setSelectedFoods(selectedFoods.filter(sf => sf.food.id !== id));

    const updateGrams = (id, grams) => {
        setSelectedFoods(selectedFoods.map(sf => sf.food.id === id ? { ...sf, grams: Number(grams) || 0 } : sf));
    };

    const isSelected = (id) => selectedFoods.some(sf => sf.food.id === id);

    const updateProgress = (field, value) => setProgress({ ...progress, [field]: value });

    // Full AI generation (original flow)
    const generatePlan = async (existingPlan = null) => {
        if (!selectedClient) return;

        // Tier check
        const check = tierGuard.checkLimit('mealPlans');
        if (!check.allowed) {
            setUpgradeReason(check.reason);
            setShowUpgrade(true);
            return;
        }

        setLoading(true); setError(''); if (!existingPlan) setPlan(null);
        try {
            const relevant = getRelevantKnowledge(selectedClient, []);
            const progressData = showProgress ? { ...progress, originalWeight: selectedClient.questionnaire?.weight } : null;
            const result = await geminiService.generateMealPlan(selectedClient, relevant, existingPlan, progressData);
            setPlan(result);
            tierGuard.incrementUsage('mealPlans');
        } catch (err) { setError(err.message || 'Failed to generate plan.'); }
        finally { setLoading(false); }
    };

    // Ingredient-based AI assembly (token-efficient)
    const generateFromIngredients = async () => {
        if (!selectedClient || selectedFoods.length === 0) return;

        // Tier check
        const check = tierGuard.checkLimit('mealPlans');
        if (!check.allowed) {
            setUpgradeReason(check.reason);
            setShowUpgrade(true);
            return;
        }

        setLoading(true); setError(''); setPlan(null);
        try {
            const progressData = showProgress ? { ...progress, originalWeight: selectedClient.questionnaire?.weight } : null;
            const result = await geminiService.generateMealFromIngredients(selectedClient, selectedFoods, macroTotals, progressData);
            setPlan(result);
            tierGuard.incrementUsage('mealPlans');
        } catch (err) { setError(err.message || 'Failed to generate plan.'); }
        finally { setLoading(false); }
    };

    const swapMeal = async (mealIndex) => {
        if (!selectedClient || !plan) return;
        setSwappingMeal(mealIndex);
        try {
            const relevant = getRelevantKnowledge(selectedClient, []);
            const newMeal = await geminiService.regenerateSingleMeal(selectedClient, plan, mealIndex, relevant);
            if (newMeal) {
                const updated = { ...plan, meals: [...plan.meals] };
                updated.meals[mealIndex] = newMeal;
                setPlan(updated);
            }
        } catch (err) { console.error('Failed to swap meal:', err); }
        finally { setSwappingMeal(null); }
    };

    const categories = [
        { key: 'proteins', label: 'Proteins', emoji: '🥩' },
        { key: 'carbs', label: 'Carbs', emoji: '🍚' },
        { key: 'fats', label: 'Fats', emoji: '🥑' },
        { key: 'vegetables', label: 'Vegetables', emoji: '🥦' },
    ];

    return (
        <div className="page-enter">
            <div className="page-header">
                <div>
                    <h1><UtensilsCrossed size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} /> Meal Builder</h1>
                    <p>Build evidence-based meal plans with food mechanics & biochemistry</p>
                </div>
            </div>

            {/* Client Selector */}
            <div className="builder-controls glass-card">
                <div className="builder-select-group">
                    <label className="input-label">Select Client</label>
                    <select className="input-field select-field" value={selectedClient?.id || ''}
                        onChange={(e) => { setSelectedClient(clients.find(c => c.id === e.target.value) || null); setSelectedFoods([]); }}>
                        <option value="">Choose a client...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                    </select>
                </div>

                {selectedClient && (
                    <motion.div className="client-summary" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <div className="client-summary-tags">
                            {selectedClient.questionnaire?.primaryGoal && <span className="badge badge-accent">{selectedClient.questionnaire.primaryGoal}</span>}
                            {selectedClient.questionnaire?.dietType && <span className="badge badge-blue">{selectedClient.questionnaire.dietType}</span>}
                            {selectedClient.questionnaire?.country && <span className="badge badge-violet">{selectedClient.questionnaire.country}</span>}
                            {selectedClient.questionnaire?.cuisinePreference && <span className="badge badge-blue">{selectedClient.questionnaire.cuisinePreference}</span>}
                            {selectedClient.questionnaire?.conditions?.map(c => <span key={c} className="badge badge-pink">{c}</span>)}
                            {selectedClient.questionnaire?.medications && <span className="badge badge-pink">On Medications</span>}
                            {selectedClient.questionnaire?.allergies?.map(a => <span key={a} className="badge badge-pink">{a}</span>)}
                        </div>
                    </motion.div>
                )}

                {/* Mode Switcher */}
                {selectedClient && (
                    <div className="mode-switcher">
                        <button className={`mode-btn ${mode === 'ai' ? 'active' : ''}`} onClick={() => setMode('ai')}>
                            <Sparkles size={14} /> Full AI Generation
                        </button>
                        <button className={`mode-btn ${mode === 'ingredients' ? 'active' : ''}`} onClick={() => {
                            if (!tierGuard.isFeatureEnabled('ingredientSelector')) {
                                setUpgradeReason('Ingredient selector is a Pro feature.');
                                setShowUpgrade(true);
                                return;
                            }
                            setMode('ingredients');
                            setShowIngredients(true);
                        }}>
                            {tierGuard.isFeatureEnabled('ingredientSelector') ? <UtensilsCrossed size={14} /> : <Lock size={14} />} Pick Ingredients First
                        </button>
                    </div>
                )}

                {/* Progress Update Panel */}
                {selectedClient && (
                    <div className="progress-toggle-wrap">
                        <button className="btn btn-secondary btn-sm" onClick={() => setShowProgress(!showProgress)}>
                            <Scale size={14} /> {showProgress ? 'Hide' : 'Add'} Progress Update
                        </button>
                    </div>
                )}
                <AnimatePresence>
                    {showProgress && selectedClient && (
                        <motion.div className="progress-panel" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <h4><Activity size={16} /> Progress Update</h4>
                            <p className="progress-hint">Add progress so AI adjusts calories & food choices</p>
                            <div className="form-grid">
                                <div className="input-group">
                                    <label className="input-label">Current Weight</label>
                                    <input className="input-field" placeholder={`Was: ${selectedClient.questionnaire?.weight || 'N/A'}`}
                                        value={progress.currentWeight} onChange={(e) => updateProgress('currentWeight', e.target.value)} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Energy Levels</label>
                                    <select className="input-field select-field" value={progress.energy} onChange={(e) => updateProgress('energy', e.target.value)}>
                                        <option value="">Select</option>
                                        <option value="Very Low">Very Low</option><option value="Low">Low</option>
                                        <option value="Normal">Normal</option><option value="Good">Good</option><option value="Excellent">Excellent</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Digestion</label>
                                    <input className="input-field" placeholder="Bloating, gas..." value={progress.digestion} onChange={(e) => updateProgress('digestion', e.target.value)} />
                                </div>
                                <div className="input-group form-col-full">
                                    <label className="input-label">Medication Changes</label>
                                    <input className="input-field" placeholder="New meds or dosage changes..." value={progress.medicationChanges} onChange={(e) => updateProgress('medicationChanges', e.target.value)} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══════════ INGREDIENT SELECTOR ═══════════ */}
                <AnimatePresence>
                    {mode === 'ingredients' && showIngredients && selectedClient && (
                        <motion.div className="ingredient-selector" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <div className="ingredient-header">
                                <h3><UtensilsCrossed size={18} /> Pick Your Ingredients</h3>
                                <p className="progress-hint">Select foods, set quantities, then let AI assemble the plan</p>
                            </div>

                            {/* Category Tabs */}
                            <div className="category-tabs">
                                {categories.map(cat => (
                                    <button key={cat.key} className={`category-tab ${activeCategory === cat.key ? 'active' : ''}`}
                                        onClick={() => { setActiveCategory(cat.key); setSearchQuery(''); }}>
                                        <span className="cat-emoji">{cat.emoji}</span> {cat.label}
                                        <span className="cat-count">{FOOD_DATABASE[cat.key].length}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Search */}
                            <div className="ingredient-search">
                                <Search size={16} />
                                <input type="text" placeholder="Search foods..." value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)} className="ingredient-search-input" />
                            </div>

                            {/* Food Grid */}
                            <div className="food-grid">
                                {filteredFoods.map(food => (
                                    <button key={food.id} className={`food-chip ${isSelected(food.id) ? 'selected' : ''}`}
                                        onClick={() => isSelected(food.id) ? removeFood(food.id) : addFood(food)}>
                                        <span className="food-chip-name">{food.name}</span>
                                        <span className="food-chip-macros">P:{food.p}g C:{food.c}g F:{food.f}g</span>
                                        {isSelected(food.id) && <Check size={14} className="food-chip-check" />}
                                    </button>
                                ))}
                                {filteredFoods.length === 0 && <p className="no-results">No foods match your search</p>}
                            </div>

                            {/* Selected Foods with Quantities */}
                            {selectedFoods.length > 0 && (
                                <div className="selected-foods">
                                    <h4>Selected ({selectedFoods.length}) — Adjust Quantities</h4>
                                    <div className="selected-foods-list">
                                        {selectedFoods.map(sf => (
                                            <div key={sf.food.id} className="selected-food-item">
                                                <span className="sf-name">{sf.food.name}</span>
                                                <div className="sf-controls">
                                                    <input type="number" className="sf-grams" value={sf.grams} min={10} step={10}
                                                        onChange={(e) => updateGrams(sf.food.id, e.target.value)} />
                                                    <span className="sf-unit">g</span>
                                                    <span className="sf-cals">{Math.round(sf.food.cal * sf.grams / 100)} cal</span>
                                                    <button className="sf-remove" onClick={() => removeFood(sf.food.id)}><X size={14} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Live Macro Summary */}
                                    <div className="macro-summary-bar">
                                        <div className="msb-item"><span className="msb-val">{macroTotals.calories}</span><span className="msb-label">kcal</span></div>
                                        <div className="msb-item protein"><span className="msb-val">{macroTotals.protein}g</span><span className="msb-label">Protein</span></div>
                                        <div className="msb-item carbs"><span className="msb-val">{macroTotals.carbs}g</span><span className="msb-label">Carbs</span></div>
                                        <div className="msb-item fats"><span className="msb-val">{macroTotals.fat}g</span><span className="msb-label">Fat</span></div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Generate Button */}
                {mode === 'ai' ? (
                    <button className="btn btn-primary btn-lg generate-btn" onClick={() => generatePlan()} disabled={!selectedClient || loading}>
                        {loading ? <><div className="spinner" /> Generating with AI...</> : <><Sparkles size={18} /> Generate Meal Plan</>}
                    </button>
                ) : (
                    <button className="btn btn-primary btn-lg generate-btn" onClick={generateFromIngredients}
                        disabled={!selectedClient || loading || selectedFoods.length === 0}>
                        {loading ? <><div className="spinner" /> AI is assembling...</> : <><Brain size={18} /> Assemble Plan from {selectedFoods.length} Ingredients</>}
                    </button>
                )}
            </div>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div className="builder-error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <AlertTriangle size={18} /> {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading */}
            <AnimatePresence>
                {loading && (
                    <motion.div className="generation-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="loading-pulse"><Brain size={40} /></div>
                        <h3>{mode === 'ingredients' ? 'Assembling meals from your ingredients...' : 'Building your meal plan...'}</h3>
                        <p>{mode === 'ingredients' ? 'Optimizing timing, checking interactions, filling gaps' : 'Analyzing biochemistry, checking drug-food interactions'}</p>
                        <div className="loading-steps">
                            <div className="loading-step active"><Zap size={14} /> Analyzing profile</div>
                            <div className="loading-step"><Pill size={14} /> Drug-nutrient check</div>
                            <div className="loading-step"><UtensilsCrossed size={14} /> {mode === 'ingredients' ? 'Assembling meals' : 'Building meals'}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Generated Plan */}
            <AnimatePresence>
                {plan && !plan.parseError && (
                    <motion.div className="generated-plan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        {/* Header */}
                        <div className="plan-summary glass-card">
                            <div className="plan-summary-header">
                                <div>
                                    <h2>Meal Plan for {selectedClient.full_name}</h2>
                                    <p>{plan.summary}</p>
                                </div>
                                <div className="plan-actions">
                                    <button className="btn btn-secondary btn-sm" onClick={() => mode === 'ingredients' ? generateFromIngredients() : generatePlan(plan)} disabled={loading}>
                                        <RefreshCw size={14} /> Regenerate
                                    </button>
                                    {tierGuard.isFeatureEnabled('export') ? (
                                        <>
                                            <button className="btn btn-secondary btn-sm" onClick={() => exportMealPDF(plan, selectedClient.full_name)}>
                                                <Download size={14} /> PDF
                                            </button>
                                            <button className="btn btn-secondary btn-sm" onClick={() => exportMealDOCX(plan, selectedClient.full_name)}>
                                                <FileText size={14} /> DOC
                                            </button>
                                        </>
                                    ) : (
                                        <button className="btn btn-secondary btn-sm" onClick={() => { setUpgradeReason('PDF & DOCX export is a Pro feature.'); setShowUpgrade(true); }}>
                                            <Lock size={14} /> Export (Pro)
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Daily Targets */}
                        {plan.dailyTargets && (
                            <div className="macro-targets glass-card">
                                <h3>Daily Targets</h3>
                                <div className="macro-grid">
                                    <div className="macro-item"><span className="macro-value">{plan.dailyTargets.calories}</span><span className="macro-label">Calories</span></div>
                                    <div className="macro-item"><span className="macro-value">{plan.dailyTargets.protein}</span><span className="macro-label">Protein</span></div>
                                    <div className="macro-item"><span className="macro-value">{plan.dailyTargets.carbs}</span><span className="macro-label">Carbs</span></div>
                                    <div className="macro-item"><span className="macro-value">{plan.dailyTargets.fat}</span><span className="macro-label">Fat</span></div>
                                    <div className="macro-item"><span className="macro-value">{plan.dailyTargets.fiber || '-'}</span><span className="macro-label">Fiber</span></div>
                                </div>
                            </div>
                        )}

                        {/* Suggested Additions (from ingredient mode) */}
                        {plan.suggestedAdditions?.length > 0 && (
                            <div className="suggested-additions glass-card">
                                <h3><Plus size={18} /> AI Suggested Additions</h3>
                                <p className="progress-hint">These fill nutritional gaps in your selected ingredients</p>
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

                        {/* Warnings */}
                        {plan.warnings?.length > 0 && (
                            <div className="plan-warnings">
                                {plan.warnings.map((w, i) => <div key={i} className="plan-warning"><AlertTriangle size={16} /> {w}</div>)}
                            </div>
                        )}

                        {/* Meals */}
                        <div className="meals-list">
                            {plan.meals?.map((meal, i) => (
                                <motion.div key={i} className="meal-card glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                    <div className="meal-header">
                                        <div><h3>{meal.name}</h3><span className="meal-time">{meal.time}</span></div>
                                        <div className="meal-header-right">
                                            <span className="meal-calories">{meal.totalCalories} kcal</span>
                                            <button className="btn btn-ghost btn-sm" onClick={() => swapMeal(i)} disabled={swappingMeal !== null} title="Swap this meal">
                                                {swappingMeal === i ? <div className="spinner-sm" /> : <RefreshCw size={14} />} Swap
                                            </button>
                                        </div>
                                    </div>
                                    <table className="food-table">
                                        <thead><tr><th>Food Item</th><th>Amount</th><th>Cal</th><th>P</th><th>C</th><th>F</th></tr></thead>
                                        <tbody>
                                            {meal.foods?.map((f, j) => (
                                                <tr key={j}>
                                                    <td className="food-name">{f.item}</td><td>{f.amount}</td><td>{f.calories}</td>
                                                    <td>{f.protein}g</td><td>{f.carbs}g</td><td>{f.fat}g</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {meal.foodMechanics && <div className="food-mechanics"><strong>Food Mechanics:</strong> {meal.foodMechanics}</div>}
                                </motion.div>
                            ))}
                        </div>

                        {/* Supplements */}
                        {plan.supplements?.length > 0 && (
                            <div className="supplements-section glass-card">
                                <h3>Supplements</h3>
                                <table className="food-table">
                                    <thead><tr><th>Supplement</th><th>Dosage</th><th>Timing</th><th>Reason</th></tr></thead>
                                    <tbody>
                                        {plan.supplements.map((s, i) => (
                                            <tr key={i}><td className="food-name">{s.name}</td><td>{s.dosage}</td><td>{s.timing}</td><td>{s.reason}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Hydration */}
                        {plan.hydration && <div className="plan-progression glass-card"><h3>Hydration</h3><p>{plan.hydration}</p></div>}

                        {/* Reasoning */}
                        {plan.reasoning?.length > 0 && (
                            <div className="plan-reasoning glass-card">
                                <button className="reasoning-toggle" onClick={() => setShowReasoning(!showReasoning)}>
                                    <Brain size={18} /><span>AI Reasoning ({plan.reasoning.length} points)</span>
                                    <ChevronDown size={16} style={{ transform: showReasoning ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
                                </button>
                                <AnimatePresence>
                                    {showReasoning && (
                                        <motion.div className="reasoning-content" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                            {plan.reasoning.map((r, i) => (
                                                <div key={i} className="reasoning-item"><span className="reasoning-num">{i + 1}</span><p>{r}</p></div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.div>
                )}

                {plan?.parseError && (
                    <motion.div className="plan-raw glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h3>Generated Plan (raw)</h3>
                        <pre>{plan.raw}</pre>
                    </motion.div>
                )}
            </AnimatePresence>

            <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)}
                reason={upgradeReason} currentTier={tierGuard.getTier()} />
        </div>
    );
}
