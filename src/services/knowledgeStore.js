// Pre-built knowledge entries organized by category
// These serve as the default knowledge base, supplemented by coach uploads and live research

export const KNOWLEDGE_CATEGORIES = [
    { id: 'conditions', label: 'Health Conditions', icon: 'Heart', color: 'var(--accent-pink)' },
    { id: 'goals', label: 'Training Goals', icon: 'Target', color: 'var(--accent-cyan)' },
    { id: 'nutrition', label: 'Nutrition Science', icon: 'Apple', color: 'var(--accent-teal)' },
    { id: 'exercise', label: 'Exercise Science', icon: 'Dumbbell', color: 'var(--accent-blue)' },
    { id: 'food_mechanics', label: 'Food Mechanics', icon: 'FlaskConical', color: 'var(--accent-violet)' },
    { id: 'female_physiology', label: 'Female Physiology', icon: 'Heart', color: '#ec4899' },
];

export const DEFAULT_KNOWLEDGE = [
    // ── Conditions ──────────────────────────────────────
    {
        category: 'conditions',
        topic: 'Type 2 Diabetes — Training & Nutrition',
        content: `Exercise: Resistance training improves insulin sensitivity by 40-50%. Combined aerobic + resistance is superior to either alone. Time sessions when blood glucose is 100-250 mg/dL. Monitor for hypoglycemia risk with insulin/sulfonylureas.
Nutrition: Low glycemic index carbs (<55 GI). Pair carbs with protein/fat to blunt glucose spikes. Emphasize fiber (25-35g/day). Chromium and magnesium support glucose metabolism. Vinegar before meals can reduce postprandial glucose by 20%.
Food Mechanics: Resistant starch (cooled potatoes, rice) acts as prebiotic and reduces glycemic response. Cinnamon (1-6g/day) may improve fasting glucose. Alpha-lipoic acid enhances insulin sensitivity.`,
        sources: ['Colberg et al., 2016 - Exercise and Type 2 Diabetes (ACSM)', 'ADA Standards of Medical Care 2024'],
        tags: ['diabetes', 'insulin', 'blood-sugar', 'metabolic'],
        is_custom: false
    },
    {
        category: 'conditions',
        topic: 'Hypothyroidism — Training & Nutrition',
        content: `Exercise: Focus on resistance training to counter metabolic slowdown. Moderate intensity preferred over HIIT (excess cortisol worsens thyroid function). Avoid overtraining — recovery is impaired. Include flexibility work.
Nutrition: Adequate iodine (150mcg/day), selenium (55-200mcg), zinc (8-11mg). Avoid goitrogens raw (broccoli, kale, soy) — cooking deactivates them. Don't take thyroid meds with calcium, iron, or coffee (blocks absorption). Take levothyroxine on empty stomach, 30-60 min before food.
Considerations: Weight loss is slower — set realistic expectations. Cold intolerance affects outdoor training. Fatigue management is critical — program lighter weeks.`,
        sources: ['Chaker et al., 2017 - Hypothyroidism (The Lancet)', 'ATA Guidelines 2014'],
        tags: ['thyroid', 'hypothyroid', 'T4', 'metabolism', 'fatigue'],
        is_custom: false
    },
    {
        category: 'conditions',
        topic: 'PCOS — Training & Nutrition',
        content: `Exercise: Resistance training is first-line — improves insulin sensitivity and androgen levels. 3-4x/week. HIIT is effective but monitor cortisol. Avoid chronic cardio which can elevate cortisol and worsen hormonal imbalance.
Nutrition: Anti-inflammatory diet. Reduce refined carbs and sugar. Prioritize omega-3 (EPA/DHA), turmeric, ginger. Inositol (myo-inositol 4g + D-chiro 100mg) shown to improve ovulation and insulin sensitivity. Magnesium, vitamin D, and chromium often deficient.
Food Mechanics: Spearmint tea reduces androgens. Apple cider vinegar improves insulin sensitivity. Cinnamon regulates menstrual cycles in some studies. Avoid BPA exposure (plastics) — endocrine disruptor.`,
        sources: ['Teede et al., 2018 - PCOS Guidelines', 'Moran et al., 2011 - Exercise and PCOS'],
        tags: ['pcos', 'hormonal', 'insulin-resistance', 'androgen'],
        is_custom: false
    },
    {
        category: 'conditions',
        topic: 'Hypertension — Training & Nutrition',
        content: `Exercise: Aerobic exercise reduces BP by 5-7 mmHg. Resistance training (moderate loads, higher reps) is safe and beneficial. Avoid Valsalva maneuver and heavy isometrics. Isometric handgrip training shows promising BP reductions.
Nutrition: DASH diet approach — high in K, Mg, Ca, low Na (<2300mg). Increase potassium-rich foods (bananas, sweet potatoes, spinach). Beetroot juice (250ml) provides nitrates that lower BP acutely. Dark chocolate (70%+) in moderation. Limit alcohol and caffeine.
Cautions: Certain medications (beta-blockers) alter heart rate response — use RPE instead of HR zones. ACE inhibitors may cause elevated potassium — monitor intake.`,
        sources: ['Whelton et al., 2018 - ACC/AHA BP Guidelines', 'Pescatello et al., 2019 - ACSM Exercise & Hypertension'],
        tags: ['hypertension', 'blood-pressure', 'cardiovascular', 'DASH'],
        is_custom: false
    },

    // ── Goals ──────────────────────────────────────────
    {
        category: 'goals',
        topic: 'Fat Loss — Evidence-Based Approach',
        content: `Caloric Deficit: 300-500 kcal/day deficit for sustainable loss (0.5-1% bodyweight/week). Higher deficits risk muscle loss and metabolic adaptation.
Protein: 1.6-2.4 g/kg during deficit to preserve lean mass (Phillips & Van Loon, 2011). Distribute 30-40g per meal for optimal MPS.
Training: Resistance training is non-negotiable during fat loss — preserves muscle. Compound movements prioritized. Cardio is supplementary, not primary. LISS for recovery days, HIIT sparingly (2x/week max).
Metabolism: Diet breaks (1-2 weeks at maintenance every 8-12 weeks) prevent metabolic adaptation. Refeed days (high carb) restore leptin and thyroid hormones.
Sleep: <6 hours sleep increases ghrelin, decreases leptin — makes dietary adherence harder. Prioritize 7-9 hours.`,
        sources: ['Helms et al., 2014 - Evidence-Based Recommendations for Contest Prep', 'Trexler et al., 2014 - Metabolic Adaptation'],
        tags: ['fat-loss', 'weight-loss', 'deficit', 'cutting', 'body-composition'],
        is_custom: false
    },
    {
        category: 'goals',
        topic: 'Muscle Hypertrophy — Evidence-Based Approach',
        content: `Caloric Surplus: 200-350 kcal/day surplus (lean bulk). Larger surpluses don't accelerate muscle gain, just fat gain.
Protein: 1.6-2.2 g/kg bodyweight. Leucine threshold of ~2.5-3g per meal triggers MPS. 4-5 protein feedings/day optimal.
Training: 10-20+ sets per muscle group per week. Progressive overload is the primary driver. Rep ranges: 6-30 reps all effective if taken close to failure. Emphasis on mechanical tension.
Recovery: 48-72h between training same muscle group. Sleep 7-9 hours (GH release peaks in deep sleep). Manage stress (cortisol is catabolic).
Supplements: Creatine monohydrate (3-5g/day) — most evidence-backed supplement. Vitamin D if deficient. Caffeine for performance.`,
        sources: ['Schoenfeld et al., 2017 - Dose-Response of Resistance Training Volume', 'Morton et al., 2018 - Protein and Muscle Mass'],
        tags: ['muscle-gain', 'hypertrophy', 'bulking', 'strength', 'protein-synthesis'],
        is_custom: false
    },

    // ── Nutrition Science ──────────────────────────────
    {
        category: 'nutrition',
        topic: 'Protein Synthesis & Distribution',
        content: `Muscle Protein Synthesis (MPS) is maximally stimulated at ~20-40g protein per meal (depending on body size and training status). The leucine threshold (2.5-3g) must be met.
Distribution: 4-5 evenly spaced protein feedings (every 3-4 hours) optimizes 24-hour MPS vs. skewing intake to 1-2 meals.
Pre-sleep: 40g casein protein before bed enhances overnight MPS and recovery (Snijders et al., 2015).
Post-workout: The "anabolic window" is wider than previously thought (several hours), but consuming protein within 2 hours post-training is still optimal.
Animal vs Plant: Animal proteins have higher leucine content and digestibility (DIAAS score). Plant proteins can match if combined properly (rice + pea) and consumed in slightly higher amounts (+10-20%).`,
        sources: ['Moore et al., 2009 - Protein Dose-Response', 'Snijders et al., 2015 - Pre-Sleep Protein'],
        tags: ['protein', 'MPS', 'leucine', 'amino-acids', 'anabolic'],
        is_custom: false
    },
    {
        category: 'nutrition',
        topic: 'Micronutrient Interactions & Deficiencies',
        content: `Iron: Heme iron (animal) absorbed 15-35%, non-heme (plant) only 2-20%. Vitamin C enhances non-heme absorption 3-6x. Calcium, tannins (tea/coffee), and phytates inhibit absorption.
Vitamin D: Fat-soluble — take with meal containing fat. Synergistic with K2 (directs calcium to bones, not arteries). 40-60 ng/mL optimal for athletes.
Magnesium: Involved in 300+ enzymatic reactions. Glycinate form best for sleep/anxiety. Citrate for digestion. Avoid oxide (poor absorption). Depleted by stress, sweat, caffeine.
Zinc: Competes with copper — supplementing >40mg/day can cause copper deficiency. Best taken away from iron and calcium.
B12: Only from animal sources or supplements. Methylcobalamin preferred. Deficiency common in vegans, elderly, and those on metformin or PPIs.`,
        sources: ['Hurrell & Egli, 2010 - Iron Bioavailability', 'DiNicolantonio et al., 2018 - Magnesium Review'],
        tags: ['micronutrients', 'vitamins', 'minerals', 'deficiency', 'absorption'],
        is_custom: false
    },

    // ── Exercise Science ──────────────────────────────
    {
        category: 'exercise',
        topic: 'Progressive Overload Principles',
        content: `Progressive overload is the fundamental driver of adaptation. Methods:
1. Weight: Increase load by 2-5% when target reps are achieved
2. Volume: Add sets over mesocycles (start at MEV, progress toward MRV)
3. Frequency: Increase training frequency per muscle group if recovery allows
4. Density: Reduce rest periods (with same load/reps)
5. ROM: Increase range of motion for greater mechanical tension
6. Tempo: Manipulate eccentric tempo (3-4s eccentric) for hypertrophy

Double Progression: Use a rep range (e.g., 8-12). When you hit the top of the range for all sets, increase weight and drop to bottom of range.

Deload: Every 4-8 weeks, reduce volume 40-50% or intensity 10-15% for 1 week. Prevents accumulation of fatigue and joint stress.`,
        sources: ['Kraemer & Ratamess, 2004 - Fundamentals of Resistance Training', 'Zourdos et al., 2016 - Autoregulated Training'],
        tags: ['progressive-overload', 'periodization', 'strength', 'volume', 'deload'],
        is_custom: false
    },
    {
        category: 'exercise',
        topic: 'Recovery & Adaptation',
        content: `Sleep: Most critical recovery factor. 7-9 hours. GH peaks during deep sleep. Sleep debt impairs protein synthesis and increases cortisol. Blue light blocking 2h before bed.
Active Recovery: Light movement (walks, swimming) enhances blood flow without adding training stress. Better than complete rest for DOMS.
Stress Management: Chronic psychological stress (high cortisol) impairs recovery, reduces testosterone, and blunts hypertrophy. Include stress-reduction practices.
Cold Exposure: Cold water immersion (10-15°C, 10-15 min) reduces DOMS but may blunt hypertrophy adaptations if done immediately post-training. Use on non-training days or during intensive blocks only.
Stretching: Static stretching post-workout for flexibility. Dynamic stretching pre-workout. Foam rolling reduces perceived soreness but doesn't accelerate structural recovery.`,
        sources: ['Dattilo et al., 2011 - Sleep and Recovery', 'Roberts et al., 2015 - Cold Water Immersion and Muscle Adaptations'],
        tags: ['recovery', 'sleep', 'stress', 'cold-exposure', 'DOMS', 'adaptation'],
        is_custom: false
    },

    // ── Food Mechanics ────────────────────────────────
    {
        category: 'food_mechanics',
        topic: 'Nutrient Absorption & Food Pairing',
        content: `Synergistic Pairings:
- Iron + Vitamin C: Orange juice with spinach salad increases iron absorption 3-6x
- Fat + Fat-soluble vitamins (A, D, E, K): Always eat with a fat source (10g+ minimum)
- Turmeric + Black pepper: Piperine increases curcumin absorption by 2000%
- Calcium + Vitamin D: D enhances calcium absorption in the gut
- Zinc + Animal protein: Amino acids enhance zinc absorption

Antagonistic Interactions:
- Calcium blocks iron absorption — separate by 2+ hours
- Coffee/tea tannins reduce iron absorption by 60-80% — drink 1h away from meals
- Phytates (grains, legumes) bind minerals — soaking/sprouting reduces by 50-70%
- Oxalates (spinach, rhubarb) bind calcium — cooking reduces oxalate content
- High-dose zinc depletes copper — supplement separately

Timing: Protein before carbs at meals reduces glucose spike by 30% (Shukla et al., 2015).`,
        sources: ['Hurrell & Egli, 2010 - Iron Bioavailability', 'Shukla et al., 2015 - Food Order and Glucose'],
        tags: ['absorption', 'bioavailability', 'food-pairing', 'synergy', 'anti-nutrients'],
        is_custom: false
    },
    {
        category: 'food_mechanics',
        topic: 'Meal Timing & Nutrient Partitioning',
        content: `Pre-Workout (60-90 min before): Moderate protein (20-30g) + easily digestible carbs (30-50g). Avoid high fat/fiber (slows digestion). Examples: rice + chicken, banana + whey.
Intra-Workout: Only necessary for sessions >90 min or glycogen-depleting work. 30-60g fast carbs/hour + electrolytes.
Post-Workout (within 2h): Protein (30-40g) + carbs (0.5-1g/kg) for glycogen replenishment. Insulin from carbs enhances amino acid uptake.
Carb Timing: Placing majority of carbs around training (pre/post) optimizes performance and recovery while managing blood sugar.
Fasting Considerations: Morning fasted training is fine for fat oxidation, but not optimal for performance. If fasting, BCAAs/EAAs pre-workout can reduce muscle breakdown.

Circadian: Insulin sensitivity is higher in the morning. Larger meals earlier in the day may benefit metabolic health. Protein synthesis doesn't follow circadian rhythm — distribute evenly.`,
        sources: ['Aragon & Schoenfeld, 2013 - Nutrient Timing Revisited', 'Kerksick et al., 2017 - ISSN Position Stand on Nutrient Timing'],
        tags: ['meal-timing', 'pre-workout', 'post-workout', 'nutrient-partitioning', 'fasting'],
        is_custom: false
    },

    // ── Female Physiology ─────────────────────────────
    {
        category: 'female_physiology',
        topic: 'Female Training — Menstrual Phase',
        content: `Phase Duration: Days 1-5 (approximately). Estrogen and progesterone are at their lowest.
Exercise: Focus on light movement — yoga, walking, gentle stretching, light resistance (50-60% 1RM). Avoid heavy compound lifts, high-impact plyometrics, and intense HIIT. Low-intensity steady-state (LISS) cardio is acceptable.
Nutrition: Iron-rich foods are critical to offset menstrual iron loss (red meat, lentils, spinach + vitamin C for absorption). Anti-inflammatory foods: fatty fish (omega-3), turmeric, ginger, berries. Increase magnesium intake (dark chocolate, pumpkin seeds) to reduce cramps. Stay hydrated — water retention can mask weight changes.
Recovery: Prioritize sleep and stress reduction. NSAID use (ibuprofen) is common but can impair muscle adaptation if used chronically. Heat therapy (warm baths) can alleviate cramping.`,
        sources: ['Sung et al., 2014 - Exercise and Menstrual Cycle', 'Bruinvels et al., 2017 - Iron Deficiency in Female Athletes', 'McNulty et al., 2020 - Menstrual Cycle and Exercise Performance'],
        tags: ['female-physiology', 'menstrual', 'iron', 'recovery', 'anti-inflammatory'],
        is_custom: false
    },
    {
        category: 'female_physiology',
        topic: 'Female Training — Follicular Phase',
        content: `Phase Duration: Days 6-13 (post-menstruation to pre-ovulation). Estrogen rises steadily.
Exercise: This is the optimal training window. Rising estrogen improves strength, coordination, pain tolerance, and muscle recovery. Progressive overload is most effective in this phase. Introduce new exercises, increase training volume, and push for personal records. HIIT and high-intensity resistance training are well-tolerated.
Nutrition: Higher carbohydrate tolerance due to improved insulin sensitivity. Slightly higher protein needs to support muscle protein synthesis. Good phase for a slight caloric surplus if muscle gain is the goal.
Performance: Neuromuscular function is enhanced. Reaction time and coordination peak. Tendon and ligament laxity increases near ovulation — emphasize proper warm-up and joint stability work.`,
        sources: ['Wikström-Frisén et al., 2017 - Follicular Phase Training Adaptation', 'Sung et al., 2014 - Hormonal Fluctuations and Performance', 'Romero-Moraleda et al., 2019 - Resistance Training Across Menstrual Phases'],
        tags: ['female-physiology', 'follicular', 'progressive-overload', 'strength', 'estrogen'],
        is_custom: false
    },
    {
        category: 'female_physiology',
        topic: 'Female Training — Ovulatory Phase',
        content: `Phase Duration: Days 14-16 (approximately, ±1 day). Estrogen peaks and testosterone briefly spikes.
Exercise: Peak performance window — maximal strength, power output, and neuromuscular efficiency. Ideal for 1RM attempts, heavy compound lifts, power exercises, and competition preparation. Sprint and explosive training are most effective.
Nutrition: Maintain adequate fueling — this is not the time for caloric restriction. Emphasize anti-oxidant-rich foods to manage the minor inflammatory spike of ovulation.
Caution: Estrogen peak increases ligament laxity, particularly the ACL. Female athletes have 2-8x higher ACL injury risk during ovulation. Emphasize proprioceptive warm-ups, landing mechanics, and avoid fatigue-driven high-risk movements. Ensure proper hydration as body temperature may begin to rise.`,
        sources: ['Herzberg et al., 2017 - ACL Injury and Menstrual Cycle', 'Pallavi et al., 2017 - Testosterone and Ovulatory Phase', 'Wikström-Frisén et al., 2017 - Peak Strength Window'],
        tags: ['female-physiology', 'ovulatory', 'peak-performance', 'strength', 'ACL-risk'],
        is_custom: false
    },
    {
        category: 'female_physiology',
        topic: 'Female Training — Luteal Phase',
        content: `Phase Duration: Days 17-28 (post-ovulation to pre-menstruation). Progesterone dominates.
Exercise: Moderate intensity is optimal. Progesterone raises core body temperature by 0.3-0.5°C, impairs heat dissipation, and reduces glycolytic capacity. Shift from high-intensity glycolytic work to steady-state cardio and moderate strength training. Maintain training but reduce volume by ~20%. RPE-based training is recommended as performance may feel harder at the same absolute loads.
Nutrition: Basal metabolic rate increases by 5-10% (~100-300 extra kcal/day). Cravings for carbohydrates and fats increase — this is hormonally driven, not a lack of willpower. Increase complex carbs and healthy fats. Magnesium and B6 can help with PMS symptoms. Reduce sodium to manage bloating.
Recovery: Sleep quality may decline due to progesterone's effect on body temperature. Cool sleeping environment and magnesium glycinate before bed can help. Avoid caffeine after 2pm.`,
        sources: ['Janse de Jonge, 2003 - Progesterone and Exercise', 'Barba-Moreno et al., 2022 - Thermoregulation in Luteal Phase', 'McNulty et al., 2020 - Training Load Management Across Cycle'],
        tags: ['female-physiology', 'luteal', 'progesterone', 'thermoregulation', 'PMS'],
        is_custom: false
    },
    {
        category: 'female_physiology',
        topic: 'PMS Training Adjustments',
        content: `PMS (Premenstrual Syndrome) affects up to 90% of women and occurs in the late luteal phase (Days 24-28).
Symptom Management:
- Cramps: Light movement is better than rest. Yoga, walking, and gentle stretching increase blood flow and reduce prostaglandin-mediated pain. Magnesium (200-400mg/day) and omega-3 fatty acids reduce severity.
- Fatigue: Reduce training volume by 20-30%, not intensity. Short sessions (20-30 min) maintain habit without overloading. Prioritize compound movements for efficiency.
- Bloating: Avoid exercises with high intra-abdominal pressure (heavy Valsalva). Reduce sodium. Increase potassium-rich foods.
- Headache: Avoid Valsalva-heavy lifts and extreme positional changes. Stay hydrated. Magnesium may help.
- Mood Changes: Exercise is one of the most effective interventions — endorphin release via moderate-intensity work. Yoga and rhythmic activities (swimming, cycling) are particularly beneficial.
- Sleep Disruption: Avoid intense training within 3 hours of bedtime. Include relaxation-focused cool-downs. Magnesium glycinate before bed.

General Principle: Never stop training entirely due to PMS unless medically contraindicated. Modify volume and intensity, maintain consistency. The psychological benefits of movement during PMS are significant.`,
        sources: ['Daley, 2009 - Exercise and PMS', 'Vishnupriya & Rajarajeswaram, 2011 - PMS and Physical Activity', 'Pearce et al., 2020 - Menstrual Cycle Effects on Training'],
        tags: ['female-physiology', 'PMS', 'symptom-management', 'recovery', 'cramps', 'fatigue'],
        is_custom: false
    }
];

// Helper to get relevant knowledge for a client profile
export function getRelevantKnowledge(clientProfile, knowledgeEntries) {
    const q = clientProfile.questionnaire || {};
    const relevantTags = new Set();

    // Map conditions to tags
    if (q.conditions) {
        q.conditions.forEach(c => {
            const lower = c.toLowerCase();
            if (lower.includes('diabet')) relevantTags.add('diabetes');
            if (lower.includes('thyroid') || lower.includes('hypothyroid')) relevantTags.add('thyroid');
            if (lower.includes('pcos')) relevantTags.add('pcos');
            if (lower.includes('hypertension') || lower.includes('blood pressure')) relevantTags.add('hypertension');
            if (lower.includes('pms') || lower.includes('menstrual')) relevantTags.add('female-physiology');
            if (lower.includes('anemi') || lower.includes('iron')) relevantTags.add('iron');
        });
    }

    // Map goals to tags
    if (q.primaryGoal) {
        const goal = q.primaryGoal.toLowerCase();
        if (goal.includes('fat') || goal.includes('weight loss') || goal.includes('lean')) relevantTags.add('fat-loss');
        if (goal.includes('muscle') || goal.includes('hypertrophy') || goal.includes('bulk') || goal.includes('gain')) relevantTags.add('hypertrophy');
        if (goal.includes('endurance') || goal.includes('cardio') || goal.includes('stamina')) relevantTags.add('endurance');
        if (goal.includes('strength')) relevantTags.add('strength');
    }

    // Always relevant
    relevantTags.add('protein');
    relevantTags.add('progressive-overload');
    relevantTags.add('recovery');
    relevantTags.add('absorption');
    relevantTags.add('meal-timing');
    relevantTags.add('micronutrients');

    // Auto-inject female physiology knowledge for female clients
    if (q.sex && q.sex.toLowerCase() === 'female') {
        relevantTags.add('female-physiology');
    }

    // Filter entries
    const allEntries = [...(knowledgeEntries || []), ...DEFAULT_KNOWLEDGE];
    return allEntries.filter(entry => {
        if (!entry.tags) return false;
        return entry.tags.some(tag => relevantTags.has(tag));
    });
}
