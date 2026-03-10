import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = supabaseUrl && supabaseAnonKey &&
  !supabaseUrl.includes('your_') && !supabaseAnonKey.includes('your_');

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const getIsDemoMode = () => {
  if (!isConfigured) return true;
  return localStorage.getItem('shadow_fitness_demo_mode') === 'true';
};

// Demo mode storage (in-memory)
// Demo mode storage with localStorage persistence
const DEFAULT_DEMO_STORE = {
  clients: [
    {
      id: 'demo-client-male-1',
      coach_id: 'demo-coach-id',
      full_name: 'Arjun Mehta',
      questionnaire: {
        full_name: 'Arjun Mehta', age: '28', sex: 'Male', height: '5\'10"', weight: '78kg', bodyFat: '18%',
        country: 'India', cuisinePreference: 'North Indian',
        primaryGoal: 'Muscle Building', secondaryGoals: ['Strength', 'Endurance'], targetWeight: '82kg', timeline: '12 weeks',
        conditions: [], medications: 'Whey Protein, Creatine', injuries: '', surgeries: '',
        sleepHours: '7-8', stressLevel: '4', occupation: 'Sedentary (desk)', activityLevel: 'Intermediate',
        dietType: 'Non-Vegetarian', allergies: [], intolerances: [], eatingSchedule: '3 meals + 1 snack', digestionIssues: '',
        experienceLevel: 'Intermediate', equipment: ['Full Gym'], daysPerWeek: '5', timePerSession: '60 min', preferredStyles: ['Bodybuilding', 'Strength Training'],
      },
      created_at: '2026-02-15T10:00:00Z',
      updated_at: '2026-02-15T10:00:00Z',
    },
    {
      id: 'demo-client-female-1',
      coach_id: 'demo-coach-id',
      full_name: 'Priya Sharma',
      questionnaire: {
        full_name: 'Priya Sharma', age: '26', sex: 'Female', height: '5\'5"', weight: '58kg', bodyFat: '22%',
        country: 'India', cuisinePreference: 'South Indian',
        primaryGoal: 'Fat Loss', secondaryGoals: ['Toning', 'Flexibility'], targetWeight: '54kg', timeline: '8 weeks',
        conditions: ['PCOS'], medications: 'Metformin 500mg, Vitamin D', injuries: '', surgeries: '',
        cycle_tracking_enabled: true,
        last_period_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        period_duration: '5',
        cycle_length: '30',
        cycle_symptoms: { cramps: 2, fatigue: 2, bloating: 1, headache: 0, mood_changes: 1, sleep_disruption: 1 },
        cycle_contra_flags: { heavy_bleeding: false, severe_pelvic_pain: false, dizziness: false },
        sleepHours: '6-7', stressLevel: '6', occupation: 'Sedentary (desk)', activityLevel: 'Beginner',
        dietType: 'Vegetarian', allergies: ['Peanuts'], intolerances: ['Lactose'], eatingSchedule: '3 meals', digestionIssues: 'Occasional bloating',
        experienceLevel: 'Beginner', equipment: ['Dumbbells', 'Resistance Bands', 'Yoga Mat'], daysPerWeek: '4', timePerSession: '45 min', preferredStyles: ['Yoga', 'Strength Training'],
      },
      created_at: '2026-02-20T10:00:00Z',
      updated_at: '2026-02-20T10:00:00Z',
    },
    {
      id: 'demo-client-female-2',
      coach_id: 'demo-coach-id',
      full_name: 'Sara Khan',
      questionnaire: {
        full_name: 'Sara Khan', age: '31', sex: 'Female', height: '5\'7"', weight: '65kg', bodyFat: '20%',
        country: 'India', cuisinePreference: 'Mediterranean',
        primaryGoal: 'Strength', secondaryGoals: ['Muscle Building'], targetWeight: '63kg', timeline: '16 weeks',
        conditions: [], medications: 'Multivitamin, Fish Oil', injuries: 'Mild lower back pain', surgeries: '',
        cycle_tracking_enabled: true,
        last_period_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        period_duration: '4',
        cycle_length: '28',
        cycle_symptoms: { cramps: 0, fatigue: 0, bloating: 0, headache: 0, mood_changes: 0, sleep_disruption: 0 },
        cycle_contra_flags: { heavy_bleeding: false, severe_pelvic_pain: false, dizziness: false },
        sleepHours: '7-8', stressLevel: '3', occupation: 'Moderately Active', activityLevel: 'Intermediate',
        dietType: 'Non-Vegetarian', allergies: [], intolerances: [], eatingSchedule: '4 meals', digestionIssues: '',
        experienceLevel: 'Intermediate', equipment: ['Full Gym'], daysPerWeek: '5', timePerSession: '60 min', preferredStyles: ['Powerlifting', 'Strength Training'],
      },
      created_at: '2026-02-25T10:00:00Z',
      updated_at: '2026-02-25T10:00:00Z',
    },
    {
      id: 'demo-client-male-2',
      coach_id: 'demo-coach-id',
      full_name: 'Rahul Verma',
      questionnaire: {
        full_name: 'Rahul Verma', age: '42', sex: 'Male', height: '5\'8"', weight: '92kg', bodyFat: '28%',
        country: 'India', cuisinePreference: 'Punjabi',
        primaryGoal: 'Fat Loss', secondaryGoals: ['General Health'], targetWeight: '80kg', timeline: '6 months',
        conditions: ['Type 2 Diabetes', 'Hypertension'], medications: 'Metformin 1000mg, Amlodipine 5mg', injuries: 'Right knee pain', surgeries: 'Appendectomy 2015',
        sleepHours: '5-6', stressLevel: '7', occupation: 'Sedentary (desk)', activityLevel: 'Beginner',
        dietType: 'Non-Vegetarian', allergies: [], intolerances: [], eatingSchedule: '3 meals + 2 snacks', digestionIssues: 'Acid reflux',
        experienceLevel: 'Beginner', equipment: ['Dumbbells', 'Treadmill'], daysPerWeek: '3', timePerSession: '30 min', preferredStyles: ['Walking', 'Light Resistance'],
      },
      created_at: '2026-03-01T10:00:00Z',
      updated_at: '2026-03-01T10:00:00Z',
    },
  ],
  workoutPlans: [],
  mealPlans: [],
  documents: [],
  knowledgeEntries: []
};

const loadDemoStore = () => {
  try {
    const saved = localStorage.getItem('shadow_fitness_demo_store');
    if (saved) return JSON.parse(saved);
  } catch (e) { console.error('Error loading demo store', e); }
  return DEFAULT_DEMO_STORE;
};

const demoStore = loadDemoStore();

const saveDemoStore = () => {
  try {
    localStorage.setItem('shadow_fitness_demo_store', JSON.stringify(demoStore));
  } catch (e) { console.error('Error saving demo store', e); }
};

// Auth helpers
export const authService = {
  async signUp(email, password, fullName) {
    if (getIsDemoMode()) {
      const user = { id: 'demo-coach-id', email, user_metadata: { full_name: fullName } };
      return { user, session: { user } };
    }
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: fullName } }
    });
    if (error) throw error;
    if (data.user) {
      await supabase.from('coaches').upsert({ id: data.user.id, full_name: fullName });
    }
    return data;
  },

  async signIn(email, password) {
    if (getIsDemoMode()) {
      const user = { id: 'demo-coach-id', email, user_metadata: { full_name: 'Demo Coach' } };
      return { user, session: { user } };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (getIsDemoMode()) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    if (getIsDemoMode()) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  onAuthStateChange(callback) {
    if (getIsDemoMode()) return { data: { subscription: { unsubscribe: () => { } } } };
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Client CRUD
export const clientService = {
  async getAll(coachId) {
    if (getIsDemoMode()) return demoStore.clients;
    const { data, error } = await supabase.from('clients').select('*')
      .eq('coach_id', coachId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    if (getIsDemoMode()) return demoStore.clients.find(c => c.id === id);
    const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async create(coachId, clientData) {
    if (getIsDemoMode()) {
      const newClient = {
        id: 'client-' + Date.now(),
        coach_id: coachId,
        full_name: clientData.full_name,
        questionnaire: clientData.questionnaire,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      demoStore.clients.unshift(newClient);
      saveDemoStore();
      return newClient;
    }
    const { data, error } = await supabase.from('clients').insert({
      coach_id: coachId, full_name: clientData.full_name, questionnaire: clientData.questionnaire
    }).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    if (getIsDemoMode()) {
      const idx = demoStore.clients.findIndex(c => c.id === id);
      if (idx >= 0) {
        demoStore.clients[idx] = { ...demoStore.clients[idx], ...updates, updated_at: new Date().toISOString() };
        saveDemoStore();
      }
      return demoStore.clients[idx];
    }
    const { data, error } = await supabase.from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    if (getIsDemoMode()) {
      demoStore.clients = demoStore.clients.filter(c => c.id !== id);
      saveDemoStore();
      return;
    }
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
  }
};

// Knowledge entries
export const knowledgeService = {
  async getAll(coachId) {
    if (getIsDemoMode()) return demoStore.knowledgeEntries || [];
    const { data, error } = await supabase.from('knowledge_entries').select('*')
      .or(`coach_id.eq.${coachId},is_custom.eq.false`).order('category', { ascending: true });
    if (error) throw error;
    return data;
  },

  async search(coachId, query) {
    if (getIsDemoMode()) {
      const q = query.toLowerCase();
      return (demoStore.knowledgeEntries || []).filter(e =>
        e.topic.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q)
      );
    }
    const { data, error } = await supabase.from('knowledge_entries').select('*')
      .or(`coach_id.eq.${coachId},is_custom.eq.false`)
      .or(`topic.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`);
    if (error) throw error;
    return data;
  },

  async create(entry) {
    if (getIsDemoMode()) {
      const newEntry = { ...entry, id: 'ke-' + Date.now(), created_at: new Date().toISOString() };
      if (!demoStore.knowledgeEntries) demoStore.knowledgeEntries = [];
      demoStore.knowledgeEntries.push(newEntry);
      saveDemoStore();
      return newEntry;
    }
    const { data, error } = await supabase.from('knowledge_entries').insert(entry).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    if (getIsDemoMode()) return;
    const { error } = await supabase.from('knowledge_entries').delete().eq('id', id);
    if (error) throw error;
  }
};

// Workout plans
export const workoutService = {
  async getAll(coachId) {
    if (getIsDemoMode()) return demoStore.workoutPlans;
    const { data, error } = await supabase.from('workout_plans')
      .select('*, clients(full_name)').eq('coach_id', coachId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async save(plan) {
    if (getIsDemoMode()) {
      const newPlan = { ...plan, id: 'wp-' + Date.now(), created_at: new Date().toISOString() };
      demoStore.workoutPlans.push(newPlan);
      saveDemoStore();
      return newPlan;
    }
    const { data, error = null } = await supabase.from('workout_plans').insert(plan).select().single();
    if (error) throw error;
    return data;
  },
  async getByClientId(clientId) {
    if (getIsDemoMode()) return (demoStore.workoutPlans || []).filter(p => (p.client_id === clientId || p.clientId === clientId));
    const { data, error } = await supabase.from('workout_plans')
      .select('*').eq('client_id', clientId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async archive(planId) {
    if (getIsDemoMode()) {
      const idx = (demoStore.workoutPlans || []).findIndex(p => p.id === planId);
      if (idx >= 0) {
        demoStore.workoutPlans[idx] = { ...demoStore.workoutPlans[idx], status: 'archived' };
        saveDemoStore();
      }
      return;
    }
    const { error } = await supabase.from('workout_plans')
      .update({ status: 'archived' }).eq('id', planId);
    if (error) throw error;
  },

  duplicate(planRecord) {
    // Returns a plain plan_json object ready to be used as a Draft (no DB row created)
    const { plan_json } = planRecord;
    return plan_json || planRecord;
  }
};

// Meal plans
export const mealService = {
  async getAll(coachId) {
    if (getIsDemoMode()) return demoStore.mealPlans;
    const { data, error } = await supabase.from('meal_plans')
      .select('*, clients(full_name)').eq('coach_id', coachId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async save(plan) {
    if (getIsDemoMode()) {
      const newPlan = { ...plan, id: 'mp-' + Date.now(), created_at: new Date().toISOString() };
      demoStore.mealPlans.push(newPlan);
      saveDemoStore();
      return newPlan;
    }
    const { data, error } = await supabase.from('meal_plans').insert(plan).select().single();
    if (error) throw error;
    return data;
  },
  async getByClientId(clientId) {
    if (getIsDemoMode()) return (demoStore.mealPlans || []).filter(p => (p.client_id === clientId || p.clientId === clientId));
    const { data, error } = await supabase.from('meal_plans')
      .select('*').eq('client_id', clientId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async archive(planId) {
    if (getIsDemoMode()) {
      const idx = (demoStore.mealPlans || []).findIndex(p => p.id === planId);
      if (idx >= 0) {
        demoStore.mealPlans[idx] = { ...demoStore.mealPlans[idx], status: 'archived' };
        saveDemoStore();
      }
      return;
    }
    const { error } = await supabase.from('meal_plans')
      .update({ status: 'archived' }).eq('id', planId);
    if (error) throw error;
  },
  duplicate(planRecord) {
    const { plan_json } = planRecord;
    return plan_json || planRecord;
  }
};

// Documents
export const documentService = {
  async upload(coachId, file) {
    if (getIsDemoMode()) return URL.createObjectURL(file);
    const filePath = `${coachId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);
    return publicUrl;
  },
  async saveRecord(doc) {
    if (getIsDemoMode()) { demoStore.documents.push(doc); return doc; }
    const { data, error } = await supabase.from('uploaded_documents').insert(doc).select().single();
    if (error) throw error;
    return data;
  },
  async getAll(coachId) {
    if (getIsDemoMode()) return demoStore.documents;
    const { data, error } = await supabase.from('uploaded_documents').select('*')
      .eq('coach_id', coachId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};

// Knowledge chunks (from parsed PDFs)
const demoChunks = [];

export const chunkService = {
  async saveChunks(coachId, chunks) {
    if (getIsDemoMode()) {
      const withIds = chunks.map((c, i) => ({ ...c, id: 'chunk-' + Date.now() + '-' + i, coach_id: coachId, created_at: new Date().toISOString() }));
      demoChunks.push(...withIds);
      return withIds;
    }
    const rows = chunks.map(c => ({ ...c, coach_id: coachId }));
    // Insert in batches of 50
    const results = [];
    for (let i = 0; i < rows.length; i += 50) {
      const batch = rows.slice(i, i + 50);
      const { data, error } = await supabase.from('knowledge_chunks').insert(batch).select();
      if (error) throw error;
      results.push(...(data || []));
    }
    return results;
  },

  async searchChunks(coachId, query) {
    if (getIsDemoMode()) {
      const q = query.toLowerCase();
      return demoChunks.filter(c => c.coach_id === coachId && c.content.toLowerCase().includes(q)).slice(0, 5);
    }
    const { data, error } = await supabase.from('knowledge_chunks').select('*')
      .eq('coach_id', coachId).ilike('content', '%' + query + '%').limit(5);
    if (error) throw error;
    return data;
  },

  async getDocuments(coachId) {
    if (getIsDemoMode()) {
      const docs = {};
      demoChunks.filter(c => c.coach_id === coachId).forEach(c => {
        if (!docs[c.document_title]) docs[c.document_title] = { title: c.document_title, chunks: 0, created_at: c.created_at };
        docs[c.document_title].chunks++;
      });
      return Object.values(docs);
    }
    const { data, error } = await supabase.from('knowledge_chunks')
      .select('document_title, created_at').eq('coach_id', coachId);
    if (error) throw error;
    const docs = {};
    (data || []).forEach(c => {
      if (!docs[c.document_title]) docs[c.document_title] = { title: c.document_title, chunks: 0, created_at: c.created_at };
      docs[c.document_title].chunks++;
    });
    return Object.values(docs);
  },

  async getChunksByDocument(coachId, documentTitle) {
    if (getIsDemoMode()) return demoChunks.filter(c => c.coach_id === coachId && c.document_title === documentTitle);
    const { data, error } = await supabase.from('knowledge_chunks').select('*')
      .eq('coach_id', coachId).eq('document_title', documentTitle).order('chunk_index');
    if (error) throw error;
    return data;
  },

  async deleteDocument(coachId, documentTitle) {
    if (getIsDemoMode()) {
      const before = demoChunks.length;
      demoChunks.splice(0, demoChunks.length, ...demoChunks.filter(c => !(c.coach_id === coachId && c.document_title === documentTitle)));
      return before - demoChunks.length;
    }
    const { error } = await supabase.from('knowledge_chunks').delete()
      .eq('coach_id', coachId).eq('document_title', documentTitle);
    if (error) throw error;
  }
};

// Admin Service (System Metrics, User Tiers, Pricing Tiers)
export const adminService = {
  async getDashboardStats() {
    if (getIsDemoMode()) {
      return { totalUsers: 142, activeSubscriptions: 89, totalPlansGenerated: 1205, knowledgeBaseDocs: 45 };
    }

    // Total Users
    const { count: totalUsers } = await supabase.from('coaches').select('*', { count: 'exact', head: true });

    // Active Subs (Pro/Clinic)
    const { count: activeSubscriptions } = await supabase.from('user_tiers')
      .select('*', { count: 'exact', head: true })
      .neq('tier_id', 'free');

    // Content usage
    const { count: workouts } = await supabase.from('workout_plans').select('*', { count: 'exact', head: true });
    const { count: meals } = await supabase.from('meal_plans').select('*', { count: 'exact', head: true });

    // KB docs
    const { data: kbDocs } = await supabase.from('knowledge_chunks').select('document_title');
    const uniqueDocs = new Set((kbDocs || []).map(d => d.document_title)).size;

    return {
      totalUsers: totalUsers || 0,
      activeSubscriptions: activeSubscriptions || 0,
      totalPlansGenerated: (workouts || 0) + (meals || 0),
      knowledgeBaseDocs: uniqueDocs
    };
  },

  async getRecentSignups() {
    if (getIsDemoMode()) {
      return [
        { email: 'pro@example.com', tier: 'pro', date: '2 mins ago' },
        { email: 'clinic@example.com', tier: 'clinic', date: '1 hour ago' },
        { email: 'coach.mike@email.com', tier: 'free', date: '4 hours ago' }
      ];
    }

    // In Supabase Auth, we can't easily query auth.users directly from the client without admin rights or Edge Functions.
    // For this MVP, we query coaches and join with user_tiers.
    const { data, error } = await supabase
      .from('coaches')
      .select('id, full_name, user_tiers(tier_id, created_at)')
      .order('id', { ascending: false }) // Since we can't easily order by inserted_at without a field, we just simulate recent
      .limit(10);

    if (error) throw error;

    return data.map(c => ({
      id: c.id,
      email: c.full_name, // Typically email is stored in auth.using, using full_name as fallback identifier here
      tier: c.user_tiers?.tier_id || 'free',
      date: c.user_tiers?.created_at ? new Date(c.user_tiers.created_at).toLocaleDateString() : 'Unknown'
    }));
  },

  async getAllUsers() {
    if (getIsDemoMode()) {
      return [
        { id: 'demo-coach-id', name: 'Demo Coach', email: 'admin@example.com', tier: 'admin' },
        { id: 'coach-pro-1', name: 'Pro Trainer Mike', email: 'pro@example.com', tier: 'pro' },
        { id: 'coach-clinic-1', name: 'Dr. Sarah Smith', email: 'clinic@example.com', tier: 'clinic' },
        { id: 'coach-free-1', name: 'John Doe', email: 'free@email.com', tier: 'free' }
      ];
    }
    const { data, error } = await supabase
      .from('coaches')
      .select('id, full_name, user_tiers(tier_id)');
    if (error) throw error;
    return data.map(c => ({
      id: c.id,
      name: c.full_name,
      tier: c.user_tiers?.tier_id || 'free'
    }));
  },

  async updateUserTier(coachId, newTier) {
    if (getIsDemoMode()) return;
    const { error } = await supabase.from('user_tiers')
      .upsert({ coach_id: coachId, tier_id: newTier });
    if (error) throw error;
  },

  async createUser({ email, password, fullName, tier }) {
    if (getIsDemoMode()) {
      return { id: 'demo-' + Date.now(), name: fullName, email, tier };
    }

    // 1. Create the Auth user
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });

    if (authError) throw authError;
    if (!data.user) throw new Error('Failed to create user');

    // 2. The trigger handles 'free' tier, but if admin specified a different tier, update it
    if (tier && tier !== 'free') {
      await this.updateUserTier(data.user.id, tier);
    }

    return {
      id: data.user.id,
      name: fullName,
      email: email,
      tier: tier || 'free'
    };
  },

  async deleteUser(coachId) {
    if (getIsDemoMode()) return;

    // Cascading deletes usually handle this if setup in SQL, but we'll be explicit
    // Note: We cannot delete the Auth user from the client-side without service role
    // but we can remove their platform access records.
    const { error: tierError } = await supabase.from('user_tiers').delete().eq('coach_id', coachId);
    if (tierError) throw tierError;

    const { error: coachError } = await supabase.from('coaches').delete().eq('id', coachId);
    if (coachError) throw coachError;
  },

  async getPricingTiers() {
    if (getIsDemoMode()) return null;
    const { data, error } = await supabase.from('tier_pricing').select('*').order('max_clients', { ascending: true });
    if (error || !data || data.length === 0) return null;

    // Convert array of objects to keyed object
    const limits = {};
    data.forEach(t => {
      limits[t.id] = {
        label: t.label,
        color: t.color,
        maxClients: t.max_clients,
        workoutPlansPerMonth: t.workout_plans_per_month,
        mealPlansPerMonth: t.meal_plans_per_month,
        ingredientSelector: t.ingredient_selector,
        pdfUpload: t.pdf_upload,
        maxPdfBooks: t.max_pdf_books,
        drugNutrientLevel: t.drug_nutrient_level,
        exportEnabled: t.export_enabled,
        teamSeats: t.team_seats
      };
    });
    return limits;
  },

  async updatePricingTier(tierId, updates) {
    if (getIsDemoMode()) return;
    const payload = {
      label: updates.label,
      color: updates.color,
      max_clients: updates.maxClients,
      workout_plans_per_month: updates.workoutPlansPerMonth,
      meal_plans_per_month: updates.mealPlansPerMonth,
      ingredient_selector: updates.ingredientSelector,
      pdf_upload: updates.pdfUpload,
      max_pdf_books: updates.maxPdfBooks,
      drug_nutrient_level: updates.drugNutrientLevel,
      export_enabled: updates.exportEnabled,
      team_seats: updates.teamSeats,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('tier_pricing').update(payload).eq('id', tierId);
    if (error) throw error;
  },

  async getPlatformSettings(id) {
    if (getIsDemoMode()) return null;
    const { data, error } = await supabase.from('platform_settings').select('settings').eq('id', id).single();
    if (error) return null;
    return data.settings;
  },

  async updatePlatformSettings(id, settings) {
    if (getIsDemoMode()) return;
    const { error } = await supabase.from('platform_settings')
      .upsert({ id, settings, updated_at: new Date().toISOString() });
    if (error) throw error;
  },

  async ping() {
    const start = performance.now();
    await supabase.from('coaches').select('id').limit(1);
    return Math.round(performance.now() - start);
  }
};
