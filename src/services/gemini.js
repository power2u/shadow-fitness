import { GoogleGenerativeAI } from '@google/generative-ai';
import { chunkService } from './supabase';
import { usageTracker } from './usageTracker';
import { tierGuard } from './tierGuard';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const MODELS = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.0-flash-lite'];

// Fetch relevant knowledge chunks for a client and build context string
async function buildBookContext(coachId, client) {
  const q = client.questionnaire || {};
  const searchTerms = [
    q.primaryGoal,
    ...(q.conditions || []),
    q.dietType,
    q.medications
  ].filter(Boolean);

  if (searchTerms.length === 0 || !coachId) return '';

  try {
    const allChunks = [];
    for (const term of searchTerms.slice(0, 3)) { // Max 3 searches to limit DB calls
      const chunks = await chunkService.searchChunks(coachId, term);
      chunks.forEach(c => {
        if (!allChunks.find(existing => existing.chunk_index === c.chunk_index && existing.document_title === c.document_title)) {
          allChunks.push(c);
        }
      });
    }

    if (allChunks.length === 0) return '';

    const refs = allChunks.slice(0, 5).map(c =>
      '[' + c.document_title + ', p.' + c.page_start + '-' + c.page_end + ']: ' + c.content.slice(0, 400)
    ).join('\n\n');

    return '\n\nREFERENCE MATERIAL (from coach\'s uploaded books — cite when relevant):\n' + refs;
  } catch {
    return '';
  }
}

async function callWithRetry(prompt, retries = 2) {
  for (const modelName of MODELS) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Extract token usage metadata
        const meta = result.response.usageMetadata || {};
        const usage = {
          model: modelName,
          inputTokens: meta.promptTokenCount || 0,
          outputTokens: meta.candidatesTokenCount || 0,
          totalTokens: meta.totalTokenCount || 0,
        };

        return { text, usage };
      } catch (err) {
        const msg = err?.message || '';
        const is429 = msg.includes('429') || msg.includes('quota') || msg.includes('rate');
        const is404 = msg.includes('404') || msg.includes('not found');
        if (is404) break;
        if (is429 && attempt < retries) {
          await new Promise(r => setTimeout(r, (attempt + 1) * 5000));
          continue;
        }
        if (is429) break;
        throw err;
      }
    }
  }
  throw new Error('All Gemini models are rate-limited. Please wait a minute and try again.');
}

const SYSTEM_PROMPT = `You are an elite sports scientist, exercise physiologist, and clinical nutritionist. You MUST follow these rules strictly:

EVIDENCE-BASED MANDATE:
1. ONLY recommend real, verifiable foods that are commonly available in the client's country/region
2. ONLY recommend real, established exercises with proper biomechanical basis
3. NEVER invent food items, supplements, or exercises
4. Every recommendation must be grounded in established exercise physiology, nutritional biochemistry, or peer-reviewed evidence
5. When citing a mechanism, name the specific pathway (e.g., "mTOR activation", "AMPK pathway", "insulin sensitivity via GLUT4 translocation")

DRUG-NUTRIENT INTERACTION RULES:
1. If medications are listed, you MUST check for:
   - Drug-food interactions (e.g., statins + grapefruit, warfarin + vitamin K foods, MAOIs + tyramine)
   - Drug-induced nutrient depletions (e.g., metformin depletes B12, PPIs deplete magnesium, diuretics deplete potassium)
   - Exercise contraindications with medications (e.g., beta-blockers and HR-based training, blood thinners and contact sports)
   - Timing conflicts (e.g., thyroid meds need 4hr gap from calcium/iron, bisphosphonates need empty stomach)
2. Flag ALL interactions clearly in the "warnings" array with severity level
3. Adjust meal timing and food choices to avoid interactions

REGIONAL FOOD MANDATE:
1. Use foods that are ACTUALLY available and commonly consumed in the client's country
2. Use local names where appropriate alongside standard names
3. Consider regional cooking methods and food preparation
4. Respect the client's cuisine preference for cultural appropriateness

FEMALE CYCLE-AWARE TRAINING:
1. For female clients with menstrual cycle data, workout programming MUST respect the provided cycle_constraints BEFORE applying general training science logic
2. Never exceed the specified intensity_cap or include excluded exercises
3. Volume modifiers are MANDATORY — if volume_modifier is 0.7, reduce total weekly volume by 30%
4. If recovery_bias is true, the session must be recovery-focused (mobility, stretching, light movement only)
5. Include cycle-phase-specific nutrition tips in the reasoning when applicable

BIOCHEMISTRY-FIRST APPROACH:
1. Consider hormonal status implications (cortisol from stress, thyroid function, insulin resistance)
2. Account for metabolic conditions affecting nutrient processing
3. Apply food mechanics: nutrient pairing for absorption (iron+C, fat-soluble vitamins+fat), anti-nutrient awareness (phytates, oxalates)
4. Consider gut microbiome impact of food choices
5. Factor in circadian nutrition timing`;

// Drug-nutrient check level varies by tier
function getDrugCheckPrompt() {
  const level = tierGuard.getLimits().drugNutrientLevel;
  if (level === 'full') {
    return `
DRUG-NUTRIENT CHECK LEVEL: FULL (Pro/Clinic)
- Check ALL possible drug-nutrient interactions including rare and emerging ones
- Include bioavailability interactions (e.g., quercetin affecting drug metabolism via CYP enzymes)
- Cross-reference with uploaded PDF knowledge base if available
- Include supplement-drug interactions
- Report severity as HIGH/MEDIUM/LOW with specific mechanism
- Suggest timing adjustments to minimize interactions`;
  }
  return `
DRUG-NUTRIENT CHECK LEVEL: BASIC (Free)
- Check only common, well-established drug-nutrient interactions:
  * Statins + CoQ10 depletion, grapefruit
  * Warfarin + Vitamin K foods
  * Metformin + B12 depletion
  * Thyroid meds + calcium/iron timing
  * MAOIs + tyramine-rich foods
  * PPIs + magnesium depletion
- Flag as HIGH/MEDIUM severity only`;
}

function buildClientContext(client) {
  const q = client.questionnaire || {};
  return `
CLIENT PROFILE:
- Name: ${client.full_name}
- Age: ${q.age || 'N/A'} | Sex: ${q.sex || 'N/A'}
- Height: ${q.height || 'N/A'} | Weight: ${q.weight || 'N/A'}
- Body Fat: ${q.bodyFat || 'N/A'}
- Country/Region: ${q.country || 'N/A'}
- Cuisine Preference: ${q.cuisinePreference || 'Standard for their region'}

GOALS:
- Primary: ${q.primaryGoal || 'N/A'}
- Secondary: ${q.secondaryGoals?.join(', ') || 'N/A'}
- Target Weight: ${q.targetWeight || 'N/A'}
- Timeline: ${q.timeline || 'N/A'}

MEDICAL (CRITICAL — check drug interactions):
- Conditions: ${q.conditions?.join(', ') || 'None reported'}
- Medications: ${q.medications || 'None'}
- Injuries: ${q.injuries || 'None'}
- Surgeries: ${q.surgeries || 'None'}

LIFESTYLE:
- Sleep: ${q.sleepHours || 'N/A'} hours
- Stress Level: ${q.stressLevel || 'N/A'}/10
- Occupation: ${q.occupation || 'N/A'}
- Daily Activity: ${q.activityLevel || 'N/A'}

NUTRITION:
- Diet Type: ${q.dietType || 'N/A'}
- Allergies: ${q.allergies?.join(', ') || 'None'}
- Intolerances: ${q.intolerances?.join(', ') || 'None'}
- Eating Schedule: ${q.eatingSchedule || 'N/A'}
- Digestion Issues: ${q.digestionIssues || 'None'}

TRAINING:
- Experience: ${q.experienceLevel || 'N/A'}
- Equipment: ${q.equipment?.join(', ') || 'N/A'}
- Days/Week: ${q.daysPerWeek || 'N/A'}
- Time/Session: ${q.timePerSession || 'N/A'}
- Preferred Styles: ${q.preferredStyles?.join(', ') || 'N/A'}
`;
}

function buildKnowledgeContext(knowledgeEntries) {
  if (!knowledgeEntries || knowledgeEntries.length === 0) return '';
  return `
RELEVANT KNOWLEDGE BASE ENTRIES (use these as priority references):
${knowledgeEntries.map(e => `
[${e.category}] ${e.topic}:
${e.content}
Sources: ${e.sources?.join(', ') || 'Internal knowledge'}
`).join('\n---\n')}
`;
}

function buildProgressContext(progress) {
  if (!progress) return '';
  return `
PROGRESS UPDATE (adjust plan based on these changes):
- Current Weight: ${progress.currentWeight || 'Not provided'} (original: ${progress.originalWeight || 'N/A'})
- Weight Change: ${progress.weightChange || 'N/A'}
- Digestion Feedback: ${progress.digestion || 'No issues reported'}
- Energy Levels: ${progress.energy || 'N/A'}
- New Symptoms: ${progress.newSymptoms || 'None'}
- Medication Changes: ${progress.medicationChanges || 'None'}
- Adherence Notes: ${progress.adherenceNotes || 'N/A'}

IMPORTANT: Adjust calories, macros, and food choices based on the above progress data. If weight loss has stalled, consider metabolic adaptation. If digestion issues exist, modify fiber sources and food choices.
`;
}

function buildCycleConstraintPrompt(cycleConstraints) {
  if (!cycleConstraints || !cycleConstraints.active) return '';
  return `
FEMALE CYCLE CONSTRAINTS (MANDATORY — override training defaults):
- Phase: ${cycleConstraints.phase} | Cycle Day: ${cycleConstraints.cycle_day}
- Intensity Cap: ${cycleConstraints.intensity_cap}
- Volume Modifier: ${cycleConstraints.volume_modifier}x (reduce total volume accordingly)
- Allowed Training Styles: [${cycleConstraints.allowed_training_styles.join(', ')}]
- Exercise Exclusions: [${cycleConstraints.exercise_exclusions.length > 0 ? cycleConstraints.exercise_exclusions.join(', ') : 'None'}]
- Recovery Bias: ${cycleConstraints.recovery_bias}
- Symptom Flags: [${cycleConstraints.symptom_flags.length > 0 ? cycleConstraints.symptom_flags.join(', ') : 'None'}]
- Adjustments Applied: [${cycleConstraints.adjustments_applied.length > 0 ? cycleConstraints.adjustments_applied.join(', ') : 'None'}]
- Reasoning: ${cycleConstraints.reasoning}

You MUST respect these constraints. Do NOT exceed the intensity cap. Do NOT include exercises from the exclusion list.
If recovery_bias is true, generate a RECOVERY-ONLY session (yoga, walking, stretching, breathing exercises).
Include a "cycleContext" object in your JSON output with the phase, symptom_flags, adjustments_applied, and a coach_note explaining the adaptations.`;
}

function buildFocusConstraintPrompt(focusConstraints) {
  if (!focusConstraints || !focusConstraints.active) return '';
  return `
FOCUS MUSCLE / PRIORITY GOAL (DETERMINISTIC CONSTRAINTS):
- Target Area: ${focusConstraints.focusArea}
- Bias Level: ${focusConstraints.biasLevel}
- Applied Rules:
${focusConstraints.constraints.map(c => `  * ${c}`).join('\n')}

MANDATORY EXECUTION:
1. Shift weekly volume/frequency toward ${focusConstraints.focusArea} as specified.
2. Ensure non-target muscle groups remain at ${focusConstraints.rules.othersVolumeModifier}x baseline (MAINTENANCE VOLUME).
3. Do NOT sacrifice scientific safety or antagonistic balance.
4. If ${focusConstraints.focusArea} is targeted, ensure it is trained at the peak of energy (beginning of sessions).`;
}

/**
 * Robust JSON extractor - finds the first complete JSON object in a string.
 * Handles Gemini responses that wrap JSON in markdown, text, or thinking tokens.
 */
function extractJSON(text) {
  // Try direct parse first (fastest path)
  try { return JSON.parse(text.trim()); } catch { }

  // Strip markdown code fences
  let cleaned = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
  try { return JSON.parse(cleaned); } catch { }

  // Find the first { and extract a balanced JSON object
  const start = cleaned.indexOf('{');
  if (start === -1) throw new Error('No JSON object found');
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') inString = !inString;
    if (!inString) {
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          return JSON.parse(cleaned.slice(start, i + 1));
        }
      }
    }
  }
  throw new Error('Incomplete JSON object');
}

export const geminiService = {
  async generateWorkoutPlan(client, knowledgeEntries = [], existingPlan = null, coachId = null, cycleConstraints = null, focusConstraints = null) {
    const avoidContext = existingPlan ? `
IMPORTANT: The client already has the following plan. Generate a COMPLETELY DIFFERENT alternative — different exercises, different rep schemes, different training splits. Do NOT repeat the same exercises:
${JSON.stringify(existingPlan.weeklySchedule?.map(d => ({ day: d.day, focus: d.focus, exercises: d.exercises?.map(e => e.name) })))}
` : '';

    const bookContext = coachId ? await buildBookContext(coachId, client) : '';
    const cyclePrompt = buildCycleConstraintPrompt(cycleConstraints);
    const focusPrompt = buildFocusConstraintPrompt(focusConstraints);

    const prompt = `${SYSTEM_PROMPT}
${getDrugCheckPrompt()}

${buildClientContext(client)}

${buildKnowledgeContext(knowledgeEntries)}
${bookContext}

${avoidContext}
${cyclePrompt}
${focusPrompt}

Generate a comprehensive, personalized WORKOUT PLAN for this client.

Return your response as valid JSON with this structure:
{
  "summary": "Brief overview of the training philosophy",
  "weeklySchedule": [
    {
      "day": "Day 1",
      "focus": "e.g., Upper Body Push",
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": 3,
          "reps": "8-10",
          "rest": "90s",
          "tempo": "3-1-2-0",
          "notes": "Form cue or modification"
        }
      ],
      "warmup": "Warmup protocol",
      "cooldown": "Cooldown protocol",
      "duration": "~45 min"
    }
  ],
  "cardioRecommendations": {
    "protocol": "LISS / HIIT / MISS or combination",
    "sessions": [
      {
        "type": "e.g., Incline Walking / Cycling / Rowing",
        "duration": "30 min",
        "intensity": "Zone 2 (60-70% MHR)",
        "frequency": "3x/week",
        "timing": "Post-weights or fasted AM",
        "caloriesBurned": "~200kcal estimated"
      }
    ],
    "weeklyTarget": "Total target cardio minutes/week",
    "fatLossRationale": "Why this cardio approach maximizes fat oxidation for this client",
    "warnings": ["Any cardio-related precautions given their medications/conditions"]
  },
  "reasoning": [
    "Reason 1: Why this split/frequency based on their profile",
    "Reason 2: How exercises accommodate conditions/injuries",
    "Reason 3: How this supports their goal timeline",
    "Reason 4: Drug-exercise interaction considerations if applicable"
  ],
  "progressionPlan": "How to progress over weeks",
  "warnings": ["Safety considerations, drug-exercise interactions"],
  "periodization": "Periodization approach overview"${cycleConstraints?.active ? `,
  "cycleContext": {
    "phase": "${cycleConstraints.phase}",
    "cycle_day": ${cycleConstraints.cycle_day},
    "symptom_flags": ${JSON.stringify(cycleConstraints.symptom_flags)},
    "adjustments_applied": ${JSON.stringify(cycleConstraints.adjustments_applied)},
    "coach_note": "Explain how the workout was adapted for the current cycle phase and symptoms"
  }` : ''}
}

ONLY return valid JSON, no markdown formatting.`;

    // Check quota before calling
    const quota = usageTracker.checkQuota();
    if (!quota.allowed) throw new Error(quota.reason);

    const { text, usage } = await callWithRetry(prompt);
    usageTracker.log('generateWorkoutPlan', usage);
    try {
      return extractJSON(text);
    } catch {
      return { raw: text, parseError: true };
    }
  },

  async regenerateWorkoutDay(client, fullPlan, dayIndex, knowledgeEntries = [], cycleConstraints = null, focusConstraints = null) {
    const targetDay = fullPlan.weeklySchedule[dayIndex];
    const cyclePrompt = buildCycleConstraintPrompt(cycleConstraints);
    const focusPrompt = buildFocusConstraintPrompt(focusConstraints);
    const prompt = `${SYSTEM_PROMPT}
${getDrugCheckPrompt()}

${buildClientContext(client)}
${cyclePrompt}
${focusPrompt}

The client wants ALTERNATIVE exercises for ${targetDay.day} (${targetDay.focus}).
Current exercises they want replaced: ${targetDay.exercises.map(e => e.name).join(', ')}

Generate COMPLETELY DIFFERENT exercises for the same muscle groups/focus. Keep the same day structure.
${cycleConstraints?.active ? 'IMPORTANT: You MUST respect the cycle constraints above when selecting alternative exercises.' : ''}
${focusConstraints?.active ? 'IMPORTANT: You MUST respect the focus constraints above when selecting alternative exercises.' : ''}

Return ONLY this single day as valid JSON:
{
  "day": "${targetDay.day}",
  "focus": "${targetDay.focus}",
  "exercises": [{ "name": "...", "sets": 3, "reps": "...", "rest": "...", "tempo": "...", "notes": "..." }],
  "warmup": "...",
  "cooldown": "...",
  "duration": "..."
}

ONLY return valid JSON, no markdown formatting.`;

    const quota = usageTracker.checkQuota();
    if (!quota.allowed) throw new Error(quota.reason);

    const { text, usage } = await callWithRetry(prompt);
    usageTracker.log('regenerateWorkoutDay', usage);
    try {
      return extractJSON(text);
    } catch {
      return null;
    }
  },

  async generateMealPlan(client, knowledgeEntries = [], existingPlan = null, progress = null, coachId = null) {
    const avoidContext = existingPlan ? `
IMPORTANT: The client already has the following meal plan. Generate a COMPLETELY DIFFERENT plan — different foods, different meal compositions. Do NOT repeat the same meals:
${JSON.stringify(existingPlan.meals?.map(m => ({ name: m.name, foods: m.foods?.map(f => f.item) })))}
` : '';

    const bookContext = coachId ? await buildBookContext(coachId, client) : '';

    const prompt = `${SYSTEM_PROMPT}
${getDrugCheckPrompt()}

${buildClientContext(client)}

${buildKnowledgeContext(knowledgeEntries)}
${bookContext}

${avoidContext}

${buildProgressContext(progress)}

Generate a comprehensive, personalized MEAL PLAN for this client.
CRITICAL: Use foods actually available in ${client.questionnaire?.country || 'their region'}. ${client.questionnaire?.cuisinePreference ? `The client prefers ${client.questionnaire.cuisinePreference} cuisine.` : ''}

Apply food mechanics principles:
- Nutrient pairing for optimal absorption (iron + vitamin C, fat-soluble vitamins with fats)
- Anti-nutrient awareness (phytates, oxalates, lectins)
- Meal timing relative to training
- Glycemic load management
- Gut health considerations
- Drug-food interaction avoidance (CHECK MEDICATIONS CAREFULLY)

Return your response as valid JSON with this structure:
{
  "summary": "Brief overview of the nutritional approach",
  "dailyTargets": { "calories": 2200, "protein": "160g", "carbs": "220g", "fat": "75g", "fiber": "30g" },
  "meals": [
    {
      "name": "Meal 1 - Pre-Workout Breakfast",
      "time": "7:00 AM",
      "foods": [
        { "item": "Food item (use regional names)", "amount": "200g", "calories": 250, "protein": 20, "carbs": 30, "fat": 5 }
      ],
      "foodMechanics": "Why these foods are paired (absorption, timing, drug interactions avoided)",
      "totalCalories": 450
    }
  ],
  "drugNutrientWarnings": [
    {
      "medication": "Drug name",
      "interaction": "What interacts",
      "action": "How the plan avoids this",
      "severity": "HIGH/MEDIUM/LOW"
    }
  ],
  "reasoning": [
    "Reason 1: Caloric target rationale based on goals and metabolism",
    "Reason 2: Macro distribution for their condition",
    "Reason 3: Regional food choices and why",
    "Reason 4: Drug-nutrient interaction management"
  ],
  "supplements": [
    { "name": "Supplement", "dosage": "Amount", "timing": "When", "reason": "Why — cite mechanism" }
  ],
  "warnings": ["Dietary considerations or allergen notes"],
  "hydration": "Daily water and hydration recommendations"
}

ONLY return valid JSON, no markdown formatting.`;

    const quota = usageTracker.checkQuota();
    if (!quota.allowed) throw new Error(quota.reason);

    const { text, usage } = await callWithRetry(prompt);
    usageTracker.log('generateMealPlan', usage);
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return { raw: text, parseError: true };
    }
  },

  async regenerateSingleMeal(client, fullPlan, mealIndex, knowledgeEntries = []) {
    const targetMeal = fullPlan.meals[mealIndex];
    const prompt = `${SYSTEM_PROMPT}
${getDrugCheckPrompt()}

${buildClientContext(client)}

The client wants an ALTERNATIVE for: ${targetMeal.name}
Current foods they want replaced: ${targetMeal.foods.map(f => f.item).join(', ')}
Daily targets: ${JSON.stringify(fullPlan.dailyTargets)}
This meal should be approximately ${targetMeal.totalCalories} calories.

CRITICAL: Use foods from ${client.questionnaire?.country || 'their region'}. Check drug interactions with medications: ${client.questionnaire?.medications || 'None'}.

Return ONLY this single meal as valid JSON:
{
  "name": "${targetMeal.name}",
  "time": "${targetMeal.time}",
  "foods": [{ "item": "...", "amount": "...", "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }],
  "foodMechanics": "...",
  "totalCalories": 0
}

ONLY return valid JSON, no markdown formatting.`;

    const quota = usageTracker.checkQuota();
    if (!quota.allowed) throw new Error(quota.reason);

    const { text, usage } = await callWithRetry(prompt);
    usageTracker.log('regenerateSingleMeal', usage);
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  },

  async generateMealFromIngredients(client, selectedFoods, macroTotals, progress) {
    const q = client.questionnaire || {};
    const foodList = selectedFoods.map(sf =>
      sf.food.name + ': ' + sf.grams + 'g (P:' + Math.round(sf.food.p * sf.grams / 100) + 'g C:' + Math.round(sf.food.c * sf.grams / 100) + 'g F:' + Math.round(sf.food.f * sf.grams / 100) + 'g)'
    ).join('\n');

    const progressLine = progress && progress.currentWeight
      ? '\nProgress: Now ' + progress.currentWeight + ' (was ' + (q.weight || 'N/A') + '). Digestion: ' + (progress.digestion || 'OK') + '. Energy: ' + (progress.energy || 'Normal') + '.'
      : '';

    const prompt = 'You are a clinical nutritionist. Be concise.\n\n' +
      'CLIENT: ' + client.full_name + ', ' + (q.age || '') + 'y ' + (q.sex || '') + ', ' + (q.weight || '') + ', Goal: ' + (q.primaryGoal || '') + '\n' +
      'Conditions: ' + (q.conditions?.join(', ') || 'None') + ' | Meds: ' + (q.medications || 'None') + '\n' +
      'Country: ' + (q.country || 'N/A') + ' | Diet: ' + (q.dietType || 'N/A') + progressLine + '\n\n' +
      'COACH-SELECTED INGREDIENTS:\n' + foodList + '\n\n' +
      'TOTALS: ' + macroTotals.calories + 'kcal | P:' + macroTotals.protein + 'g | C:' + macroTotals.carbs + 'g | F:' + macroTotals.fat + 'g\n\n' +
      'TASKS:\n1. Distribute into 3-5 meals with timing\n2. Flag drug-food interactions\n3. Suggest 2-3 additions for gaps\n4. Apply food pairing rules\n5. Note condition conflicts\n\n' +
      'Return valid JSON:\n{"meals":[{"name":"Meal 1","time":"7:00 AM","foods":[{"item":"...","amount":"...","calories":0,"protein":0,"carbs":0,"fat":0}],"foodMechanics":"...","totalCalories":0}],"dailyTargets":{"calories":0,"protein":"0g","carbs":"0g","fat":"0g","fiber":"0g"},"suggestedAdditions":[{"item":"Food","amount":"...","reason":"Why"}],"drugNutrientWarnings":[{"medication":"...","interaction":"...","action":"...","severity":"HIGH/MEDIUM/LOW"}],"warnings":["..."],"summary":"Brief summary"}\nONLY return valid JSON.';

    const quota = usageTracker.checkQuota();
    if (!quota.allowed) throw new Error(quota.reason);

    const { text, usage } = await callWithRetry(prompt);
    usageTracker.log('generateMealFromIngredients', usage);
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return { raw: text, parseError: true };
    }
  }
};
