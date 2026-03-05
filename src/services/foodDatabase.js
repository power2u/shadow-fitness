// ═══════════════════════════════════════════════════════
// ShadowFitness — Food Ingredient Database
// All values are per 100g, evidence-based (USDA/IFCT)
// ═══════════════════════════════════════════════════════

export const FOOD_DATABASE = {
    proteins: [
        // Poultry
        { id: 'chicken_breast', name: 'Chicken Breast (skinless)', cal: 165, p: 31, c: 0, f: 3.6, region: ['all'] },
        { id: 'chicken_thigh', name: 'Chicken Thigh', cal: 209, p: 26, c: 0, f: 10.9, region: ['all'] },
        { id: 'turkey_breast', name: 'Turkey Breast', cal: 135, p: 30, c: 0, f: 1, region: ['US', 'UK', 'EU'] },
        // Eggs
        { id: 'whole_egg', name: 'Whole Eggs', cal: 155, p: 13, c: 1.1, f: 11, region: ['all'] },
        { id: 'egg_whites', name: 'Egg Whites', cal: 52, p: 11, c: 0.7, f: 0.2, region: ['all'] },
        // Fish
        { id: 'salmon', name: 'Salmon (Atlantic)', cal: 208, p: 20, c: 0, f: 13, region: ['all'] },
        { id: 'tuna', name: 'Tuna (canned, water)', cal: 116, p: 26, c: 0, f: 0.8, region: ['all'] },
        { id: 'tilapia', name: 'Tilapia', cal: 96, p: 20, c: 0, f: 1.7, region: ['all'] },
        { id: 'sardines', name: 'Sardines', cal: 208, p: 25, c: 0, f: 11, region: ['all'] },
        { id: 'mackerel', name: 'Mackerel (Bangda)', cal: 205, p: 19, c: 0, f: 14, region: ['India', 'SEA'] },
        { id: 'prawns', name: 'Prawns / Shrimp', cal: 99, p: 24, c: 0.2, f: 0.3, region: ['all'] },
        { id: 'rohu', name: 'Rohu Fish', cal: 97, p: 17, c: 0, f: 3, region: ['India'] },
        { id: 'hilsa', name: 'Hilsa Fish', cal: 310, p: 22, c: 0, f: 25, region: ['India', 'Bangladesh'] },
        // Red meat
        { id: 'lean_beef', name: 'Lean Beef (90/10)', cal: 176, p: 26, c: 0, f: 8, region: ['US', 'UK', 'EU', 'ME'] },
        { id: 'lamb', name: 'Lamb (lean)', cal: 258, p: 25, c: 0, f: 17, region: ['India', 'ME', 'UK'] },
        { id: 'goat_meat', name: 'Goat Meat (Mutton)', cal: 143, p: 27, c: 0, f: 3, region: ['India', 'ME', 'Africa'] },
        // Dairy protein
        { id: 'paneer', name: 'Paneer (Cottage Cheese)', cal: 265, p: 18, c: 1.2, f: 20, region: ['India'] },
        { id: 'greek_yogurt', name: 'Greek Yogurt (plain)', cal: 59, p: 10, c: 3.6, f: 0.4, region: ['all'] },
        { id: 'curd_dahi', name: 'Curd / Dahi', cal: 60, p: 3.1, c: 4.7, f: 3.3, region: ['India'] },
        { id: 'cottage_cheese', name: 'Cottage Cheese', cal: 98, p: 11, c: 3.4, f: 4.3, region: ['US', 'UK', 'EU'] },
        { id: 'whey_protein', name: 'Whey Protein (scoop 30g)', cal: 120, p: 24, c: 3, f: 1.5, region: ['all'] },
        // Plant protein
        { id: 'tofu_firm', name: 'Tofu (firm)', cal: 144, p: 17, c: 3, f: 8, region: ['all'] },
        { id: 'tempeh', name: 'Tempeh', cal: 192, p: 20, c: 8, f: 11, region: ['SEA', 'US'] },
        { id: 'chana_dal', name: 'Chana Dal (cooked)', cal: 164, p: 9, c: 27, f: 2.7, region: ['India'] },
        { id: 'moong_dal', name: 'Moong Dal (cooked)', cal: 106, p: 7, c: 19, f: 0.4, region: ['India'] },
        { id: 'rajma', name: 'Rajma / Kidney Beans (cooked)', cal: 127, p: 9, c: 22, f: 0.5, region: ['India'] },
        { id: 'black_beans', name: 'Black Beans (cooked)', cal: 132, p: 9, c: 24, f: 0.5, region: ['US', 'MEX'] },
        { id: 'chickpeas', name: 'Chickpeas / Chhole (cooked)', cal: 164, p: 9, c: 27, f: 2.6, region: ['India', 'ME'] },
        { id: 'lentils', name: 'Lentils / Masoor (cooked)', cal: 116, p: 9, c: 20, f: 0.4, region: ['all'] },
        { id: 'soy_chunks', name: 'Soya Chunks (dry)', cal: 345, p: 52, c: 33, f: 0.5, region: ['India'] },
    ],

    carbs: [
        // Grains
        { id: 'white_rice', name: 'White Rice (cooked)', cal: 130, p: 2.7, c: 28, f: 0.3, region: ['all'] },
        { id: 'brown_rice', name: 'Brown Rice (cooked)', cal: 123, p: 2.7, c: 26, f: 1, region: ['all'] },
        { id: 'basmati_rice', name: 'Basmati Rice (cooked)', cal: 121, p: 3.5, c: 25, f: 0.4, region: ['India', 'ME'] },
        { id: 'oats', name: 'Oats (dry)', cal: 389, p: 17, c: 66, f: 7, region: ['all'] },
        { id: 'quinoa', name: 'Quinoa (cooked)', cal: 120, p: 4.4, c: 21, f: 1.9, region: ['US', 'EU'] },
        { id: 'whole_wheat_roti', name: 'Whole Wheat Roti (1 piece ~30g)', cal: 71, p: 2.7, c: 15, f: 0.4, region: ['India'] },
        { id: 'millet_bajra', name: 'Bajra / Pearl Millet (cooked)', cal: 119, p: 3.5, c: 23, f: 1.7, region: ['India'] },
        { id: 'jowar', name: 'Jowar / Sorghum (cooked)', cal: 120, p: 3.5, c: 25, f: 1, region: ['India'] },
        { id: 'ragi', name: 'Ragi / Finger Millet (flour)', cal: 328, p: 7, c: 72, f: 1.3, region: ['India'] },
        { id: 'wheat_bread', name: 'Whole Wheat Bread (1 slice)', cal: 81, p: 4, c: 14, f: 1, region: ['all'] },
        { id: 'sourdough', name: 'Sourdough Bread (1 slice)', cal: 93, p: 3.8, c: 18, f: 0.6, region: ['US', 'EU'] },
        // Starchy carbs
        { id: 'sweet_potato', name: 'Sweet Potato (cooked)', cal: 86, p: 1.6, c: 20, f: 0.1, region: ['all'] },
        { id: 'potato', name: 'Potato (boiled)', cal: 87, p: 1.9, c: 20, f: 0.1, region: ['all'] },
        { id: 'pasta', name: 'Pasta (whole wheat, cooked)', cal: 124, p: 5, c: 25, f: 0.5, region: ['US', 'EU'] },
        // Fruits
        { id: 'banana', name: 'Banana', cal: 89, p: 1.1, c: 23, f: 0.3, region: ['all'] },
        { id: 'apple', name: 'Apple', cal: 52, p: 0.3, c: 14, f: 0.2, region: ['all'] },
        { id: 'mango', name: 'Mango', cal: 60, p: 0.8, c: 15, f: 0.4, region: ['India', 'SEA'] },
        { id: 'dates', name: 'Dates (Medjool)', cal: 277, p: 1.8, c: 75, f: 0.2, region: ['ME', 'India'] },
        { id: 'papaya', name: 'Papaya', cal: 43, p: 0.5, c: 11, f: 0.3, region: ['India', 'SEA'] },
        { id: 'blueberries', name: 'Blueberries', cal: 57, p: 0.7, c: 14, f: 0.3, region: ['US', 'EU'] },
        { id: 'orange', name: 'Orange', cal: 47, p: 0.9, c: 12, f: 0.1, region: ['all'] },
        { id: 'pomegranate', name: 'Pomegranate', cal: 83, p: 1.7, c: 19, f: 1.2, region: ['India', 'ME'] },
    ],

    fats: [
        // Cooking oils
        { id: 'olive_oil', name: 'Olive Oil (extra virgin)', cal: 884, p: 0, c: 0, f: 100, region: ['all'] },
        { id: 'coconut_oil', name: 'Coconut Oil (virgin)', cal: 862, p: 0, c: 0, f: 100, region: ['India', 'SEA'] },
        { id: 'ghee', name: 'Ghee (clarified butter)', cal: 900, p: 0, c: 0, f: 100, region: ['India'] },
        { id: 'mustard_oil', name: 'Mustard Oil', cal: 884, p: 0, c: 0, f: 100, region: ['India'] },
        { id: 'butter', name: 'Butter (unsalted)', cal: 717, p: 0.9, c: 0.1, f: 81, region: ['all'] },
        // Nuts & seeds
        { id: 'almonds', name: 'Almonds (raw)', cal: 579, p: 21, c: 22, f: 50, region: ['all'] },
        { id: 'walnuts', name: 'Walnuts', cal: 654, p: 15, c: 14, f: 65, region: ['all'] },
        { id: 'cashews', name: 'Cashews', cal: 553, p: 18, c: 30, f: 44, region: ['India', 'all'] },
        { id: 'peanuts', name: 'Peanuts (roasted)', cal: 567, p: 26, c: 16, f: 49, region: ['all'] },
        { id: 'peanut_butter', name: 'Peanut Butter (natural)', cal: 588, p: 25, c: 20, f: 50, region: ['all'] },
        { id: 'flaxseeds', name: 'Flaxseeds (ground)', cal: 534, p: 18, c: 29, f: 42, region: ['all'] },
        { id: 'chia_seeds', name: 'Chia Seeds', cal: 486, p: 17, c: 42, f: 31, region: ['all'] },
        { id: 'pumpkin_seeds', name: 'Pumpkin Seeds', cal: 559, p: 30, c: 11, f: 49, region: ['all'] },
        { id: 'sunflower_seeds', name: 'Sunflower Seeds', cal: 584, p: 21, c: 20, f: 51, region: ['all'] },
        // Fatty fruits
        { id: 'avocado', name: 'Avocado', cal: 160, p: 2, c: 9, f: 15, region: ['US', 'MEX'] },
        { id: 'coconut_fresh', name: 'Coconut (fresh, grated)', cal: 354, p: 3.3, c: 15, f: 33, region: ['India', 'SEA'] },
    ],

    vegetables: [
        { id: 'spinach', name: 'Spinach (raw)', cal: 23, p: 2.9, c: 3.6, f: 0.4, region: ['all'] },
        { id: 'broccoli', name: 'Broccoli', cal: 34, p: 2.8, c: 7, f: 0.4, region: ['all'] },
        { id: 'cauliflower', name: 'Cauliflower', cal: 25, p: 1.9, c: 5, f: 0.3, region: ['all'] },
        { id: 'bell_peppers', name: 'Bell Peppers', cal: 31, p: 1, c: 6, f: 0.3, region: ['all'] },
        { id: 'tomato', name: 'Tomato', cal: 18, p: 0.9, c: 3.9, f: 0.2, region: ['all'] },
        { id: 'cucumber', name: 'Cucumber', cal: 15, p: 0.7, c: 3.6, f: 0.1, region: ['all'] },
        { id: 'onion', name: 'Onion', cal: 40, p: 1.1, c: 9.3, f: 0.1, region: ['all'] },
        { id: 'garlic', name: 'Garlic', cal: 149, p: 6.4, c: 33, f: 0.5, region: ['all'] },
        { id: 'carrot', name: 'Carrot', cal: 41, p: 0.9, c: 10, f: 0.2, region: ['all'] },
        { id: 'beetroot', name: 'Beetroot', cal: 43, p: 1.6, c: 10, f: 0.2, region: ['all'] },
        { id: 'kale', name: 'Kale', cal: 49, p: 4.3, c: 9, f: 0.9, region: ['US', 'EU'] },
        { id: 'methi_leaves', name: 'Fenugreek Leaves (Methi)', cal: 49, p: 4.4, c: 6, f: 0.9, region: ['India'] },
        { id: 'palak', name: 'Palak / Indian Spinach', cal: 23, p: 2, c: 4, f: 0.3, region: ['India'] },
        { id: 'lauki', name: 'Bottle Gourd (Lauki)', cal: 14, p: 0.6, c: 3.4, f: 0.0, region: ['India'] },
        { id: 'bhindi', name: 'Okra (Bhindi)', cal: 33, p: 1.9, c: 7, f: 0.2, region: ['India'] },
        { id: 'mushrooms', name: 'Mushrooms (white)', cal: 22, p: 3.1, c: 3.3, f: 0.3, region: ['all'] },
        { id: 'zucchini', name: 'Zucchini', cal: 17, p: 1.2, c: 3.1, f: 0.3, region: ['US', 'EU'] },
        { id: 'asparagus', name: 'Asparagus', cal: 20, p: 2.2, c: 3.9, f: 0.1, region: ['US', 'EU'] },
        { id: 'cabbage', name: 'Cabbage', cal: 25, p: 1.3, c: 5.8, f: 0.1, region: ['all'] },
        { id: 'drumstick', name: 'Drumstick / Moringa', cal: 37, p: 2.1, c: 8.5, f: 0.2, region: ['India'] },
    ]
};

// Compute total macros from selected ingredients
export function computeMacroTotals(selectedFoods) {
    let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;
    selectedFoods.forEach(({ food, grams }) => {
        const mult = grams / 100;
        totalCal += food.cal * mult;
        totalP += food.p * mult;
        totalC += food.c * mult;
        totalF += food.f * mult;
    });
    return {
        calories: Math.round(totalCal),
        protein: Math.round(totalP),
        carbs: Math.round(totalC),
        fat: Math.round(totalF),
    };
}

// Get all foods from all categories as a flat list
export function getAllFoods() {
    return [
        ...FOOD_DATABASE.proteins.map(f => ({ ...f, category: 'Protein' })),
        ...FOOD_DATABASE.carbs.map(f => ({ ...f, category: 'Carbs' })),
        ...FOOD_DATABASE.fats.map(f => ({ ...f, category: 'Fats' })),
        ...FOOD_DATABASE.vegetables.map(f => ({ ...f, category: 'Vegetables' })),
    ];
}

// Filter by region
export function getFoodsByRegion(region) {
    const all = getAllFoods();
    if (!region) return all;
    const regionLower = region.toLowerCase();
    return all.filter(f =>
        f.region.includes('all') ||
        f.region.some(r => r.toLowerCase().includes(regionLower) || regionLower.includes(r.toLowerCase()))
    );
}
